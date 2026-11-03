import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  runTransaction 
} from 'firebase/firestore';
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
 * Earn credits and log to credit_transactions ledger (Atomic)
 */
export async function earnCredits(
  userId: string,
  source: CreditTxSource,
  amountCredits: number,
  metadata: Record<string, any> = {}
): Promise<number> {
  if (!userId || amountCredits <= 0) return 0;

  const userRef = doc(db, 'users', userId);
  const ledgerRef = collection(db, 'credit_transactions');

  return await runTransaction(db, async (tx) => {
    const userDoc = await tx.get(userRef);
    const currentBalance = userDoc.exists() ? (userDoc.data().credit_balance || 0) : 0;
    const newBalance = currentBalance + amountCredits;

    // Update user profile credit balance
    tx.set(userRef, { credit_balance: newBalance }, { merge: true });

    // Append to credit_transactions ledger
    const ledgerEntry: Omit<CreditTransaction, 'id'> = {
      userId,
      type: 'earn',
      source,
      amount: amountCredits,
      balanceAfter: newBalance,
      timestamp: new Date().toISOString(),
      metadata,
    };
    const newTxRef = doc(ledgerRef);
    tx.set(newTxRef, ledgerEntry);

    return newBalance;
  });
}

/**
 * Spend credits according to rule validation (Atomic)
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

  // Pre-validate hard rules
  const validation = await validateCreditSpend(userId, targetType, amountCredits);
  if (!validation.allowed && targetType !== 'success_fee') {
    return { success: false, newBalance: await getCreditBalance(userId), error: validation.reason };
  }

  const userRef = doc(db, 'users', userId);
  const ledgerRef = collection(db, 'credit_transactions');

  try {
    const newBalance = await runTransaction(db, async (tx) => {
      const userDoc = await tx.get(userRef);
      if (!userDoc.exists()) {
        throw new Error('User profile does not exist.');
      }

      const currentBalance = userDoc.data().credit_balance || 0;
      if (currentBalance < amountCredits) {
        throw new Error(`Insufficient credit balance. Required: ${amountCredits}, Current: ${currentBalance}`);
      }

      const updatedBalance = currentBalance - amountCredits;

      // Deduct balance on user profile
      tx.update(userRef, { credit_balance: updatedBalance });

      // Append ledger entry
      const ledgerEntry: Omit<CreditTransaction, 'id'> = {
        userId,
        type: 'spend',
        source,
        amount: amountCredits,
        balanceAfter: updatedBalance,
        timestamp: new Date().toISOString(),
        metadata,
      };
      const newTxRef = doc(ledgerRef);
      tx.set(newTxRef, ledgerEntry);

      return updatedBalance;
    });

    return { success: true, newBalance };
  } catch (err: any) {
    console.error('[Credits] Spend credits transaction failed:', err);
    return { 
      success: false, 
      newBalance: await getCreditBalance(userId), 
      error: err.message || 'Failed to process credit transaction.' 
    };
  }
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

