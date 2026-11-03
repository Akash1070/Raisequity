import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { DealOutcome, DealReview } from '../types';

import { getGlobalConfig } from './config';

/**
 * Report a closed deal outcome linked to an accepted intro_request
 */
export async function reportDealOutcome(
  introRequestId: string,
  founderId: string,
  investorName: string,
  raiseClosed: boolean,
  amount: number
): Promise<{ success: boolean; outcome?: DealOutcome; error?: string }> {
  try {
    const outcomesRef = collection(db, 'deal_outcomes');
    const outcomeData = {
      introRequestId,
      founderId,
      investorName,
      raiseClosed,
      amount,
      reportedBy: founderId,
      confirmedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(outcomesRef, outcomeData);
    const outcome: DealOutcome = { id: docRef.id, ...outcomeData };

    // Auto-generate success fee transaction if deal is closed
    if (raiseClosed && amount > 0) {
      try {
        const config = await getGlobalConfig();
        const existingQ = query(outcomesRef, where('founderId', '==', founderId), where('raiseClosed', '==', true));
        const existingSnap = await getDocs(existingQ);
        const closedCount = existingSnap.size;

        const isFirstDeal = closedCount === 1;
        const discountPct = isFirstDeal ? (config.first_deal_discount_pct || 50) : 0;
        const baseFeePct = config.platform_fee_pct || 5;
        const effectiveFeePct = baseFeePct * (1 - discountPct / 100);
        const feeAmount = Math.round((amount * (effectiveFeePct / 100)) * 100) / 100;

        const txsRef = collection(db, 'transactions');
        await addDoc(txsRef, {
          userId: founderId,
          type: 'success_fee',
          amount: feeAmount,
          currency: 'USD',
          platform_fee_pct: effectiveFeePct,
          status: 'pending_invoice',
          collectionMethod: 'usdt_manual',
          dealRef: outcome.id,
          createdAt: new Date().toISOString(),
          metadata: {
            investorName,
            dealAmount: amount,
            isFirstDeal,
            discountAppliedPct: discountPct,
            note: isFirstDeal ? `50% first closed deal fee waiver applied (${effectiveFeePct}% effective)` : `Standard 5% success fee invoice`
          }
        });
      } catch (txErr) {
        console.error('[DealReviews] Failed to auto-generate success fee transaction:', txErr);
      }
    }

    return { success: true, outcome };
  } catch (err: any) {
    console.error('[DealReviews] Error reporting deal outcome:', err);
    return { success: false, error: err.message || 'Failed to report deal outcome.' };
  }
}

/**
 * Leave a 1-time deal review for a closed deal outcome
 * Enforces one review per raterUid per dealOutcomeId
 */
export async function addDealReview(
  dealOutcomeId: string,
  raterUid: string,
  raterName: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; review?: DealReview; error?: string }> {
  try {
    const reviewsRef = collection(db, `deal_outcomes/${dealOutcomeId}/reviews`);

    // Check if user has already reviewed this deal
    const q = query(reviewsRef, where('raterUid', '==', raterUid));
    const snap = await getDocs(q);

    if (!snap.empty) {
      return { success: false, error: 'You have already submitted a review for this deal outcome.' };
    }

    const reviewData = {
      dealOutcomeId,
      raterUid,
      raterName,
      rating: Math.max(1, Math.min(5, rating)),
      comment,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(reviewsRef, reviewData);
    const review: DealReview = { id: docRef.id, ...reviewData };

    return { success: true, review };
  } catch (err: any) {
    console.error('[DealReviews] Error adding deal review:', err);
    return { success: false, error: err.message || 'Failed to submit deal review.' };
  }
}

/**
 * Fetch all deal reviews for a deal outcome
 */
export async function getDealReviews(dealOutcomeId: string): Promise<DealReview[]> {
  try {
    const reviewsRef = collection(db, `deal_outcomes/${dealOutcomeId}/reviews`);
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as DealReview[];
  } catch (err) {
    console.error('[DealReviews] Error fetching deal reviews:', err);
    return [];
  }
}
