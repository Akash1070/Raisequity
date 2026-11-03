/**
 * Raisequity Edge-Case Testing & Business Logic Validation Suite
 * Contains pure functions enforcing exact PRD rules & edge-case safety.
 */

export interface QuotaCheckResult {
  allowed: boolean;
  cost: number;
  remainingCredits: number;
  reason?: string;
}

/**
 * 1. Intro Request Quota & Credit Enforcer:
 * - First 5 requests/month are free.
 * - 6th+ request costs 5 credits each.
 */
export function validateIntroQuotaAndCredits(
  creditBalance: number,
  monthlyUsageCount: number
): QuotaCheckResult {
  const FREE_CAP = 5;
  const EXTRA_COST = 5;

  if (monthlyUsageCount < FREE_CAP) {
    return {
      allowed: true,
      cost: 0,
      remainingCredits: creditBalance,
    };
  }

  // 6th+ request requires 5 credits
  if (creditBalance < EXTRA_COST) {
    return {
      allowed: false,
      cost: EXTRA_COST,
      remainingCredits: creditBalance,
      reason: `You have reached your free monthly limit of ${FREE_CAP} intro requests. Requesting additional intros requires ${EXTRA_COST} credits (current balance: ${creditBalance}).`,
    };
  }

  return {
    allowed: true,
    cost: EXTRA_COST,
    remainingCredits: creditBalance - EXTRA_COST,
  };
}

/**
 * 2. Community Feed Post Credit Enforcer:
 * - Posting costs 1 credit to prevent low-effort spam.
 */
export function validateCommunityPostCredit(creditBalance: number): QuotaCheckResult {
  const POST_COST = 1;
  if (creditBalance < POST_COST) {
    return {
      allowed: false,
      cost: POST_COST,
      remainingCredits: creditBalance,
      reason: 'Posting to the community feed costs 1 credit. Your balance is 0 credits.',
    };
  }

  return {
    allowed: true,
    cost: POST_COST,
    remainingCredits: creditBalance - POST_COST,
  };
}

/**
 * 3. Success Fee Credit Offset Cap (Max 30% Offset):
 * - 10 credits = $1 (1 credit = $0.10)
 * - Up to 30% of success fee can be offset with credits.
 * - Minimum 70% must be paid in cash/USDT.
 */
export interface FeeOffsetResult {
  totalFeeUsd: number;
  maxCreditOffsetUsd: number;
  maxCreditsUsable: number;
  actualCreditsUsed: number;
  actualCreditOffsetUsd: number;
  remainingCashUsdDue: number;
}

export function calculateSuccessFeeOffset(
  totalFeeUsd: number,
  userCreditBalance: number,
  maxOffsetPct: number = 30
): FeeOffsetResult {
  // 10 credits = $1.00 USD
  const CREDITS_PER_USD = 10;
  const maxCreditOffsetUsd = (totalFeeUsd * maxOffsetPct) / 100;
  const maxCreditsAllowed = Math.floor(maxCreditOffsetUsd * CREDITS_PER_USD);

  const actualCreditsUsed = Math.min(userCreditBalance, maxCreditsAllowed);
  const actualCreditOffsetUsd = actualCreditsUsed / CREDITS_PER_USD;
  const remainingCashUsdDue = totalFeeUsd - actualCreditOffsetUsd;

  return {
    totalFeeUsd,
    maxCreditOffsetUsd,
    maxCreditsUsable: maxCreditsAllowed,
    actualCreditsUsed,
    actualCreditOffsetUsd,
    remainingCashUsdDue,
  };
}

/**
 * 4. Service Provider Bidding Portfolio Gate:
 * - Provider must have portfolio links and outcome metrics filled in to submit a bid.
 */
export function validateServiceProviderPortfolio(providerProfile: any): {
  canBid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];
  if (!providerProfile) {
    return { canBid: false, missingFields: ['Provider Profile'] };
  }

  if (!providerProfile.portfolio_links || providerProfile.portfolio_links.length === 0) {
    missingFields.push('Portfolio Case Studies/Links');
  }

  if (!providerProfile.outcome_metrics || providerProfile.outcome_metrics.length === 0) {
    missingFields.push('Portfolio Outcome Metrics');
  }

  return {
    canBid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * 5. Investor Quiet Mode Hiding Rules:
 * - If quiet_mode is true, investor is hidden from public directory/search
 *   UNLESS current founder has a declared connection with them.
 */
export function filterQuietModeInvestors(
  investors: any[],
  currentFounderId?: string,
  declaredInvestorIds: string[] = []
): any[] {
  return investors.filter((inv) => {
    if (!inv.quiet_mode) return true; // Publicly visible
    if (!currentFounderId) return false; // Anonymous visitor cannot see quiet mode investor
    return declaredInvestorIds.includes(inv.id); // Visible only to connected founders
  });
}

/**
 * 6. Launch Metadata Sanitizer & Bounds Enforcer:
 * - Tagline <= 70 chars, no trailing period.
 * - Description <= 600 chars.
 */
export function sanitizeLaunchMetadata(
  title: string,
  tagline: string,
  description: string
): { title: string; tagline: string; description: string } {
  let cleanTitle = (title || '').trim();
  let cleanTagline = (tagline || '').trim();
  if (cleanTagline.endsWith('.')) {
    cleanTagline = cleanTagline.slice(0, -1);
  }
  if (cleanTagline.length > 70) {
    cleanTagline = cleanTagline.substring(0, 70).trim();
  }

  let cleanDesc = (description || '').trim();
  if (cleanDesc.length > 600) {
    cleanDesc = cleanDesc.substring(0, 600).trim();
  }

  return {
    title: cleanTitle,
    tagline: cleanTagline,
    description: cleanDesc,
  };
}

/**
 * 7. 15-Day Free Trial Expiry Status:
 * - Checks if user is within the 15-day free trial or has an active subscription.
 */
export function evaluateUserAccessStatus(userProfile: any): {
  hasAccess: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  reason?: string;
} {
  if (!userProfile) {
    return { hasAccess: false, isTrialActive: false, trialDaysRemaining: 0, reason: 'Unauthenticated' };
  }

  if (userProfile.hasActiveSubscription) {
    return { hasAccess: true, isTrialActive: false, trialDaysRemaining: 0 };
  }

  const createdAtMs = new Date(userProfile.createdAt || Date.now()).getTime();
  const trialEndsAtMs = userProfile.trialEndsAt
    ? new Date(userProfile.trialEndsAt).getTime()
    : createdAtMs + 15 * 24 * 60 * 60 * 1000;

  const nowMs = Date.now();
  const msRemaining = trialEndsAtMs - nowMs;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

  if (msRemaining > 0) {
    return {
      hasAccess: true,
      isTrialActive: true,
      trialDaysRemaining: daysRemaining,
    };
  }

  return {
    hasAccess: false,
    isTrialActive: false,
    trialDaysRemaining: 0,
    reason: 'Your 15-day free trial has expired. Subscribe to reactivate full dashboard access.',
  };
}
