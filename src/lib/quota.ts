import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { spendCredits } from './credits';
import { getGlobalConfig } from './config';

export interface MonthlyIntroQuotaStatus {
  usedCount: number;
  freeCap: number;
  remainingFree: number;
  isOverCap: boolean;
  extraIntroCreditCost: number;
}

/**
 * Get user's warm intro request count for the current calendar month
 */
export async function getMonthlyIntroRequestUsage(userId: string): Promise<MonthlyIntroQuotaStatus> {
  try {
    const config = await getGlobalConfig();
    const freeCap = config.free_monthly_intros || config.monthly_intro_free_cap || 5;
    const extraIntroCreditCost = config.credit_costs?.extra_intro || 5;

    // Calculate start of current UTC calendar month ISO string
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

    const introsRef = collection(db, 'intro_requests');
    const q = query(
      introsRef,
      where('requestingFounderId', '==', userId),
      where('createdAt', '>=', startOfMonth)
    );

    const snap = await getDocs(q);
    const usedCount = snap.size;
    const remainingFree = Math.max(0, freeCap - usedCount);
    const isOverCap = usedCount >= freeCap;

    return {
      usedCount,
      freeCap,
      remainingFree,
      isOverCap,
      extraIntroCreditCost,
    };
  } catch (err) {
    console.error('[Quota] Error checking monthly intro usage:', err);
    return {
      usedCount: 0,
      freeCap: 5,
      remainingFree: 5,
      isOverCap: false,
      extraIntroCreditCost: 5,
    };
  }
}

/**
 * Validate and deduct intro quota before allowing a warm intro request
 */
export async function validateAndDeductIntroQuota(userId: string): Promise<{
  canProceed: boolean;
  requiresCredits: boolean;
  creditsSpent?: number;
  error?: string;
}> {
  const status = await getMonthlyIntroRequestUsage(userId);

  // 1. Within free monthly quota (first 5 intros)
  if (!status.isOverCap) {
    return { canProceed: true, requiresCredits: false };
  }

  // 2. Beyond free monthly quota (6th+ intro requires 5 credits)
  console.log(`[Quota] Monthly free cap reached (${status.usedCount}/${status.freeCap}). Deducting ${status.extraIntroCreditCost} credits.`);

  const res = await spendCredits(
    userId,
    'extra_intro',
    status.extraIntroCreditCost,
    'discretionary_addon',
    { usedCountMonth: status.usedCount + 1 }
  );

  if (res.success) {
    return {
      canProceed: true,
      requiresCredits: true,
      creditsSpent: status.extraIntroCreditCost,
    };
  }

  return {
    canProceed: false,
    requiresCredits: true,
    error: `You have reached your free monthly limit of ${status.freeCap} warm intros. Additional intro requests cost ${status.extraIntroCreditCost} credits each. Please earn or top up credits.`,
  };
}
