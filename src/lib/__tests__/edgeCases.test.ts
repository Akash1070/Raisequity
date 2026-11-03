import { describe, it, expect } from 'vitest';
import {
  validateIntroQuotaAndCredits, validateCommunityPostCredit, calculateSuccessFeeOffset,
  validateServiceProviderPortfolio, filterQuietModeInvestors, sanitizeLaunchMetadata, evaluateUserAccessStatus,
} from '../edgeCases';

describe('edge cases (PRD rules)', () => {
  it('intro quota: first 5 free, 6th costs 5 credits, blocked when short', () => {
    expect(validateIntroQuotaAndCredits(10, 3)).toMatchObject({ allowed: true, cost: 0 });
    expect(validateIntroQuotaAndCredits(10, 5)).toMatchObject({ allowed: true, cost: 5, remainingCredits: 5 });
    expect(validateIntroQuotaAndCredits(3, 5).allowed).toBe(false);
  });
  it('community post costs 1 credit', () => {
    expect(validateCommunityPostCredit(0).allowed).toBe(false);
    expect(validateCommunityPostCredit(1)).toMatchObject({ allowed: true, remainingCredits: 0 });
  });
  it('success-fee credit offset caps at 30%', () => {
    const f = calculateSuccessFeeOffset(1000, 5000, 30);
    expect(f).toMatchObject({ maxCreditOffsetUsd: 300, actualCreditsUsed: 3000, remainingCashUsdDue: 700 });
  });
  it('service provider without portfolio cannot bid', () => {
    expect(validateServiceProviderPortfolio({ portfolio_links: [] }).canBid).toBe(false);
  });
  it('quiet-mode investors hidden from anonymous, visible to connected', () => {
    const invs = [{ id: 'inv1', quiet_mode: false }, { id: 'inv2', quiet_mode: true }];
    expect(filterQuietModeInvestors(invs, undefined, [])).toHaveLength(1);
    expect(filterQuietModeInvestors(invs, 'founder123', ['inv2'])).toHaveLength(2);
  });
  it('launch metadata sanitized to bounds', () => {
    const m = sanitizeLaunchMetadata('My Product.', 'Super Fast Trading Bot.', 'A'.repeat(700));
    expect(m.tagline).toBe('Super Fast Trading Bot');
    expect(m.description).toHaveLength(600);
  });
  it('15-day trial access evaluation', () => {
    expect(evaluateUserAccessStatus({ createdAt: new Date().toISOString(), hasActiveSubscription: false }).hasAccess).toBe(true);
    expect(evaluateUserAccessStatus({ createdAt: new Date(Date.now() - 20 * 864e5).toISOString(), hasActiveSubscription: false }).hasAccess).toBe(false);
  });
});
