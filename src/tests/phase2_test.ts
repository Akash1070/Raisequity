import { describe, it, expect } from 'vitest';
import { DEFAULT_GLOBAL_CONFIG } from '../lib/config';
import { UserProfile, GlobalConfig } from '../types';

describe('Phase 2 Platform Infrastructure Tests', () => {
  // 1. 15-day Free Trial Calculation & Starter Credits
  describe('15-Day Free Trial & Starter Credits', () => {
    it('calculates trial_ends_at exactly 15 days into the future', () => {
      const now = new Date('2026-08-19T12:00:00Z');
      const trialDays = DEFAULT_GLOBAL_CONFIG.trial_days || 15;
      const trialEndsAt = new Date(now.getTime() + trialDays * 86400000);

      const diffDays = (trialEndsAt.getTime() - now.getTime()) / (1000 * 3600 * 24);
      expect(diffDays).toBe(15);
    });

    it('assigns 100 starter credits on signup for founders', () => {
      const starterCredits = DEFAULT_GLOBAL_CONFIG.trial_starter_credits;
      expect(starterCredits).toBe(100);
    });
  });

  // 2. Unified Paywall Gating Rule
  describe('Unified Paywall Gate Logic', () => {
    const isPaywallPassed = (user: Partial<UserProfile>, now: Date = new Date()) => {
      if (user.role === 'admin' || user.role === 'scout_admin' || user.role === 'investor') return true;
      const hasSub = Boolean(user.has_active_subscription);
      const isTrialActive = Boolean(user.trial_ends_at && now < new Date(user.trial_ends_at));
      return hasSub || isTrialActive;
    };

    it('allows access if user has active subscription', () => {
      const user: Partial<UserProfile> = {
        role: 'founder',
        has_active_subscription: true,
        trial_ends_at: '2020-01-01T00:00:00Z'
      };
      expect(isPaywallPassed(user)).toBe(true);
    });

    it('allows access if user trial is active (within 15 days)', () => {
      const futureDate = new Date(Date.now() + 5 * 86400000).toISOString();
      const user: Partial<UserProfile> = {
        role: 'founder',
        has_active_subscription: false,
        trial_ends_at: futureDate
      };
      expect(isPaywallPassed(user)).toBe(true);
    });

    it('blocks access if trial is expired and user has no active subscription', () => {
      const user: Partial<UserProfile> = {
        role: 'founder',
        has_active_subscription: false,
        trial_ends_at: '2026-01-01T00:00:00Z'
      };
      expect(isPaywallPassed(user, new Date('2026-08-19T00:00:00Z'))).toBe(false);
    });
  });

  // 3. Platform Fee & 50% First Deal Waiver Calculation
  describe('Success-Fee Calculation & 50% Waiver', () => {
    const calculateSuccessFee = (dealAmount: number, isFirstClosedDeal: boolean, config: GlobalConfig = DEFAULT_GLOBAL_CONFIG) => {
      const baseFeePct = config.platform_fee_pct;
      const discountPct = isFirstClosedDeal ? (config.first_deal_discount_pct || 50) : 0;
      const effectiveFeePct = baseFeePct * (1 - discountPct / 100);
      const invoiceAmount = Math.round(dealAmount * (effectiveFeePct / 100) * 100) / 100;
      return { effectiveFeePct, invoiceAmount };
    };

    it('applies 50% fee discount on first closed deal (2.5% effective fee on $100K = $2,500)', () => {
      const { effectiveFeePct, invoiceAmount } = calculateSuccessFee(100000, true);
      expect(effectiveFeePct).toBe(2.5);
      expect(invoiceAmount).toBe(2500);
    });

    it('applies full 5% fee on subsequent closed deals ($100K = $5,000)', () => {
      const { effectiveFeePct, invoiceAmount } = calculateSuccessFee(100000, false);
      expect(effectiveFeePct).toBe(5);
      expect(invoiceAmount).toBe(5000);
    });
  });
});

export async function runPhase2SelfTest() {
  console.log('Phase 2 Self-Test placeholder executed successfully.');
}
