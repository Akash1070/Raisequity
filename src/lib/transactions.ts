import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';
import { Transaction, TransactionType, CollectionMethod } from '../types';
import { getGlobalConfig } from './config';
import { earnCredits, spendCredits, validateCreditSpend } from './credits';

export interface SuccessFeeCalculation {
  dealAmountUsd: number;
  platformFeePct: number;
  grossFeeUsd: number;
  isFirstDealWaived: boolean;
  maxCreditOffsetUsd: number;
  maxCreditOffsetCount: number;
  payableUsdtUsd: number;
}

/**
 * Calculate success fee breakdown for a deal outcome
 */
export async function calculateSuccessFee(
  userId: string,
  dealAmountUsd: number
): Promise<SuccessFeeCalculation> {
  const config = await getGlobalConfig();
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  
  const isFirstDealWaived = snap.exists() && !snap.data().first_deal_fee_waived;
  const platformFeePct = config.platform_fee_pct; // 5%
  const grossFeeUsd = (dealAmountUsd * platformFeePct) / 100;

  if (isFirstDealWaived) {
    return {
      dealAmountUsd,
      platformFeePct,
      grossFeeUsd,
      isFirstDealWaived: true,
      maxCreditOffsetUsd: 0,
      maxCreditOffsetCount: 0,
      payableUsdtUsd: 0,
    };
  }

  // Check available credit offset (capped at 30% of gross fee)
  const validation = await validateCreditSpend(userId, 'success_fee', grossFeeUsd);
  const maxCreditOffsetCount = validation.maxAllowedCredits || 0;
  const maxCreditOffsetUsd = validation.maxOffsetUsd || 0;
  const payableUsdtUsd = validation.remainingCashUsd ?? (grossFeeUsd - maxCreditOffsetUsd);

  return {
    dealAmountUsd,
    platformFeePct,
    grossFeeUsd,
    isFirstDealWaived: false,
    maxCreditOffsetUsd,
    maxCreditOffsetCount,
    payableUsdtUsd,
  };
}

/**
 * Record Dodo Payments fiat subscription payment ($20/mo)
 * Non-payable via credits. Earns 200 subscription reward credits.
 */
export async function recordSubscriptionPayment(
  userId: string,
  dodoPaymentId: string,
  amountUsd: number = 20
): Promise<Transaction> {
  const config = await getGlobalConfig();
  const txRef = collection(db, 'transactions');

  const newTx: Omit<Transaction, 'id'> = {
    userId,
    type: 'subscription',
    amount: amountUsd,
    currency: 'USD',
    platform_fee_pct: 0,
    status: 'completed',
    collectionMethod: 'dodo',
    dodoPaymentId,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(txRef, newTx);

  // Award subscription reward credits (e.g. 200 credits for $20)
  const rewardCredits = config.subscription_reward_credits;
  await earnCredits(userId, 'subscription_reward', rewardCredits, {
    transactionId: docRef.id,
    dodoPaymentId,
  });

  return {
    id: docRef.id,
    ...newTx,
  };
}

/**
 * Process and invoice success fee (5% on closed deal)
 * Applies first deal waiver OR applies credit offset (max 30%) and logs USDT invoice
 */
export async function recordSuccessFeeTransaction(
  userId: string,
  dealRef: string,
  dealAmountUsd: number,
  creditsToApplyCount: number = 0,
  usdtTxHash?: string
): Promise<Transaction> {
  const calculation = await calculateSuccessFee(userId, dealAmountUsd);
  const txRef = collection(db, 'transactions');
  const userRef = doc(db, 'users', userId);

  // Case 1: First deal fee waived
  if (calculation.isFirstDealWaived) {
    const waivedTx: Omit<Transaction, 'id'> = {
      userId,
      type: 'success_fee',
      amount: calculation.grossFeeUsd,
      currency: 'USD',
      platform_fee_pct: calculation.platformFeePct,
      status: 'waived',
      collectionMethod: 'usdt_manual',
      dealRef,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(txRef, waivedTx);
    // Mark first deal fee as used
    await updateDoc(userRef, { first_deal_fee_waived: true });

    return { id: docRef.id, ...waivedTx };
  }

  // Case 2: Standard deal fee with optional credit offset
  let actualCreditsSpent = 0;
  let creditOffsetUsd = 0;

  if (creditsToApplyCount > 0) {
    const validCount = Math.min(creditsToApplyCount, calculation.maxCreditOffsetCount);
    if (validCount > 0) {
      const result = await spendCredits(
        userId, 
        'success_fee_offset', 
        validCount, 
        'success_fee', 
        { dealRef, dealAmountUsd }
      );
      if (result.success) {
        actualCreditsSpent = validCount;
        creditOffsetUsd = actualCreditsSpent / 10;
      }
    }
  }

  const finalPayableUsdt = Math.max(0, calculation.grossFeeUsd - creditOffsetUsd);

  const successTx: Omit<Transaction, 'id'> = {
    userId,
    type: 'success_fee',
    amount: finalPayableUsdt,
    currency: 'USDT',
    platform_fee_pct: calculation.platformFeePct,
    status: usdtTxHash ? 'completed' : 'pending',
    collectionMethod: actualCreditsSpent > 0 && finalPayableUsdt === 0 ? 'credits' : 'usdt_manual',
    usdtTxHash,
    dealRef,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(txRef, successTx);

  return { id: docRef.id, ...successTx };
}

/**
 * Fetch all transaction records for a user
 */
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    const txRef = collection(db, 'transactions');
    const q = query(txRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Transaction[];
  } catch (err) {
    console.error('[Transactions] Error fetching user transactions:', err);
    return [];
  }
}
