import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getGlobalConfig } from './config';
import { earnCredits } from './credits';
import { ReferralRecord, UserRole } from '../types';

/**
 * Link a new signup to a referral code and create a referral record (status: 'joined')
 */
export async function processReferral(inviteeUid: string, refCode: string): Promise<boolean> {
  try {
    if (!refCode || !inviteeUid) return false;

    // 1. Find referrer in users collection matching referral_code
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referral_code', '==', refCode));
    const snap = await getDocs(q);

    if (snap.empty) {
      console.warn('[Referrals] Referral code not found:', refCode);
      return false;
    }

    const referrerDoc = snap.docs[0];
    const referrerData = referrerDoc.data();
    const referrerUid = referrerDoc.id;

    if (referrerUid === inviteeUid) {
      console.warn('[Referrals] Users cannot refer themselves.');
      return false;
    }

    // 2. Fetch invitee user details
    const inviteeRef = doc(db, 'users', inviteeUid);
    const inviteeSnap = await getDoc(inviteeRef);
    if (!inviteeSnap.exists()) return false;
    const inviteeData = inviteeSnap.data();

    // 3. Create referral record in referrals collection
    const refRecordDoc = doc(db, 'referrals', `ref_${inviteeUid}`);
    const now = new Date().toISOString();

    const referralRecord: ReferralRecord = {
      id: `ref_${inviteeUid}`,
      referrerUid,
      referrerName: referrerData.full_name || referrerData.company_name || 'Founder',
      inviteeEmail: inviteeData.email || '',
      inviteeRole: inviteeData.role || 'founder',
      status: inviteeData.role === 'investor' && inviteeData.is_approved ? 'verified' : 'joined',
      createdAt: now,
      joinedAt: now,
      verifiedAt: inviteeData.is_approved ? now : undefined
    };

    await setDoc(refRecordDoc, referralRecord);

    // Update invitee profile referred_by
    await updateDoc(inviteeRef, { referred_by: refCode });

    // If invitee is a founder or auto-verified user, process reward immediately if applicable
    if (referralRecord.status === 'verified') {
      await awardReferralCredits(referralRecord.id);
    }

    return true;
  } catch (err) {
    console.error('[Referrals] Exception processing referral:', err);
    return false;
  }
}

/**
 * Award 30 referral credits to the referrer when invitee is verified
 */
export async function awardReferralCredits(referralId: string): Promise<boolean> {
  try {
    const refDoc = doc(db, 'referrals', referralId);
    const snap = await getDoc(refDoc);
    if (!snap.exists()) return false;

    const data = snap.data() as ReferralRecord;
    if (data.status === 'rewarded') return true; // Already rewarded

    const config = await getGlobalConfig();
    const rewardAmount = config.investor_referral_credits || 30;

    // Award credits to referrer
    await earnCredits(data.referrerUid, 'referral', rewardAmount, {
      note: `Earned ${rewardAmount} credits for verified ${data.inviteeRole} referral (${data.inviteeEmail})`,
      referralId: data.id
    });

    const now = new Date().toISOString();
    await updateDoc(refDoc, {
      status: 'rewarded',
      verifiedAt: data.verifiedAt || now,
      rewardedAt: now
    });

    return true;
  } catch (err) {
    console.error('[Referrals] Failed to award referral credits:', err);
    return false;
  }
}

/**
 * Triggered on Admin Investor Verification to move referral status from 'joined' -> 'verified' -> 'rewarded'
 */
export async function processInvestorVerificationReferral(investorUid: string): Promise<void> {
  try {
    const refDoc = doc(db, 'referrals', `ref_${investorUid}`);
    const snap = await getDoc(refDoc);

    if (snap.exists()) {
      const data = snap.data() as ReferralRecord;
      if (data.status === 'joined') {
        const now = new Date().toISOString();
        await updateDoc(refDoc, {
          status: 'verified',
          verifiedAt: now
        });
        await awardReferralCredits(data.id);
      }
    }
  } catch (err) {
    console.error('[Referrals] Error in processInvestorVerificationReferral:', err);
  }
}

/**
 * Fetch all referrals for admin referral analytics dashboard
 */
export async function getAllReferrals(): Promise<ReferralRecord[]> {
  try {
    const refCol = collection(db, 'referrals');
    const snap = await getDocs(refCol);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReferralRecord));
  } catch (err) {
    console.error('[Referrals] Error fetching referrals:', err);
    return [];
  }
}
