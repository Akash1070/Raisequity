import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc,
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { CreditTransaction, CreditTxSource, CreditCostsConfig } from '../types';
import { getGlobalConfig } from './config';

export interface CreditValidationResult {
  allowed: boolean;
  reason?: string;
  maxAllowedCredits?: number;
  maxOffsetUsd?: number;
  remainingCashUsd?: number;
}

/**
 * Fetch current credit balance for a user
 */
export async function getCreditBalance(userId: string): Promise<number> {
  if (!userId) return 0;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data().credit_balance || 0;
    }
    return 0;
  } catch (err) {
    console.error('[Credits] Error reading balance for user:', userId, err);
    return 0;
  }
}

/**
 * Validate credit spend request according to the 4 Hard Rules:
 * Rule 1: Subscription fee is strictly cash-only via Dodo. Credits cannot be spent on subscriptions.
 * Rule 2: Success fee offset is capped at success_fee_credit_cap_pct (default 30%).
 * Rule 3: Discretionary add-ons can be 100% paid by credits up to available balance.
 * Rule 4: Credits cannot be transferred, redeemed for cash, or applied toward payments owed to another user.
 */
export async function validateCreditSpend(
  userId: string,
  targetType: 'subscription' | 'success_fee' | 'peer_payment' | 'discretionary_addon',
  amountUsdOrActionCost: number | keyof CreditCostsConfig
): Promise<CreditValidationResult> {
  const config = await getGlobalConfig();
  const balance = await getCreditBalance(userId);

  // RULE 1: Credits CANNOT be spent on subscriptions (Cash-only via Dodo)
  if (targetType === 'subscription') {
    return {
      allowed: false,
      reason: 'Hard Rule 1: Subscription fee ($20/mo) must be paid in cash via Dodo. Credits cannot be applied to subscriptions.',
    };
  }

  // RULE 4: Credits CANNOT be applied toward payments owed to another user (Peer-to-peer / Mentorship / External invoice)
  if (targetType === 'peer_payment') {
    return {
      allowed: false,
      reason: 'Hard Rule 4: Credits can only be spent on Raisequity platform services, never transferred to or applied toward payments owed to other users.',
    };
  }

  // RULE 2: Success fee credit offset (max offset capped at 30% of total fee)
  if (targetType === 'success_fee') {
    const totalSuccessFeeUsd = typeof amountUsdOrActionCost === 'number' ? amountUsdOrActionCost : 0;
    const maxOffsetPct = config.success_fee_credit_cap_pct; // Default: 30%
    const maxOffsetUsd = totalSuccessFeeUsd * (maxOffsetPct / 100);

    // 1 credit = $0.10 (10 credits per $1) or 1 credit = ₹1 / $1 equivalent
    // Standard conversion: 10 credits = $1.00 USD -> 1 credit = $0.10 USD
    const maxAllowedCredits = Math.floor(maxOffsetUsd * 10);
    const usableCredits = Math.min(balance, maxAllowedCredits);
    const actualOffsetUsd = usableCredits / 10;
    const remainingCashUsd = Math.max(0, totalSuccessFeeUsd - actualOffsetUsd);

    if (balance <= 0) {
      return {
        allowed: false,
        reason: 'Insufficient credit balance for success fee offset.',
        maxAllowedCredits,
        maxOffsetUsd,
        remainingCashUsd: totalSuccessFeeUsd,
      };
    }

    return {
      allowed: true,
      maxAllowedCredits: usableCredits,
      maxOffsetUsd: actualOffsetUsd,
      remainingCashUsd,
    };
  }

  // RULE 3: Discretionary Add-ons (Look up cost from config/fees.credit_costs)
  if (targetType === 'discretionary_addon') {
    let costCredits = 0;
    if (typeof amountUsdOrActionCost === 'string') {
      costCredits = config.credit_costs[amountUsdOrActionCost] || 0;
    } else {
      costCredits = amountUsdOrActionCost;
    }

    if (balance < costCredits) {
      return {
        allowed: false,
        reason: `Insufficient credits. Required: ${costCredits} credits, Available: ${balance} credits.`,
        maxAllowedCredits: costCredits,
      };
    }

    return {
      allowed: true,
      maxAllowedCredits: costCredits,
    };
  }

  return { allowed: false, reason: 'Unknown credit spend request type.' };
}

/**
 * Server-authorized credit mutation. All balance changes for a user now flow
 * through /api/credits (Firebase ID token required), which runs an atomic
 * Firestore transaction and enforces earn-proofs and spend caps. The browser
 * can no longer modify balances directly — closing the self-mint vector.
 */
async function creditApiCall(
  action: 'earn' | 'spend',
  source: CreditTxSource | string,
  amountCredits: number,
  metadata: Record<string, any>
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const auth = getAuth();
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
    const res = await fetch('/api/credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ action, source, amount: Math.floor(amountCredits), metadata }),
    });
    const data = await res.json().catch(() => ({}));
    return data as { success: boolean; newBalance?: number; error?: string };
  } catch (err: any) {
    console.warn('[Credits] API call failed:', err);
    return { success: false, error: err?.message || 'Credits service unreachable.' };
  }
}

/**
 * Earn credits via the server-authoritative API. Earn sources are verified
 * server-side (e.g. referral claims require a real, unrewarded contact id).
 */
export async function earnCredits(
  userId: string,
  source: CreditTxSource,
  amountCredits: number,
  metadata: Record<string, any> = {}
): Promise<number> {
  if (!userId || amountCredits <= 0) return 0;

  const data = await creditApiCall('earn', source, amountCredits, metadata);
  if (!data.success) {
    console.warn('[Credits] earn declined:', data?.error);
    return 0;
  }
  const newBalance = Number(data.newBalance ?? 0);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rq_credits_updated', {
      detail: { userId, newBalance, diff: amountCredits, type: 'earn' }
    }));
  }
  return newBalance;
}

/**
 * Spend credits via the server-authoritative API (atomic, capped per action).
 */
export async function spendCredits(
  userId: string,
  source: CreditTxSource,
  amountCredits: number,
  targetType: 'subscription' | 'success_fee' | 'peer_payment' | 'discretionary_addon' = 'discretionary_addon',
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (!userId || amountCredits <= 0) {
    return { success: false, newBalance: 0, error: 'Invalid parameters.' };
  }

  // Client-side pre-validation mirrors the server rules (best-effort UX).
  const validation = await validateCreditSpend(userId, targetType, amountCredits);
  if (!validation.allowed && targetType !== 'success_fee') {
    return { success: false, newBalance: await getCreditBalance(userId), error: validation.reason };
  }

  const data = await creditApiCall('spend', source, amountCredits, { ...metadata, targetType });
  if (!data.success) {
    return {
      success: false,
      newBalance: Number(data.newBalance ?? (await getCreditBalance(userId))),
      error: data?.error || 'Failed to process credit transaction.',
    };
  }

  const newBalance = Number(data.newBalance ?? 0);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rq_credits_updated', {
      detail: { userId, newBalance, diff: -amountCredits, type: 'spend' }
    }));
  }

  return { success: true, newBalance };
}

/**
 * Fetch credit transaction ledger for a user
 */
export async function getCreditLedger(userId: string): Promise<CreditTransaction[]> {
  try {
    const ledgerRef = collection(db, 'credit_transactions');
    const q = query(
      ledgerRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as CreditTransaction[];
  } catch (err) {
    console.error('[Credits] Failed to fetch credit ledger:', err);
    return [];
  }
}

/**
 * Spend 20 credits to promote a founder profile / startup deal in investor feeds for 7 days
 */
export async function promoteStartupDeal(
  userId: string,
  startupId?: string
): Promise<{ success: boolean; promotedUntil?: string; error?: string }> {
  const PROMOTION_CREDIT_COST = 20;

  // Process 20 credit deduction
  const res = await spendCredits(
    userId,
    'warm_intro_request' as any,
    PROMOTION_CREDIT_COST,
    'discretionary_addon',
    { action: 'deal_feed_promotion', startupId }
  );

  if (!res.success) {
    return { success: false, error: res.error || 'Failed to spend credits for promotion.' };
  }

  // Calculate 7 days expiry
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // 1. Update founder profile
    const founderRef = doc(db, 'founder_profiles', userId);
    await setDoc(founderRef, { promotedUntil: expiresAt }, { merge: true });

    // 2. Update startup document if startupId provided
    if (startupId) {
      const startupRef = doc(db, 'startups', startupId);
      await setDoc(startupRef, { promotedUntil: expiresAt }, { merge: true });
    }

    return { success: true, promotedUntil: expiresAt };
  } catch (err: any) {
    console.error('[Credits] Error setting promotedUntil flag:', err);
    return { success: false, error: err.message || 'Failed to apply promotion timestamp.' };
  }
}

