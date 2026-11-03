import { describe, it, expect } from 'vitest';
import { parseMoneyRange, scoreStartupForInvestor, rankStartupsForInvestor, rankInvestorsForStartup, calculateMatchScore } from '../matching';

const prefs = { preferred_sectors: ['AI'], preferred_stages: ['Seed'], min_check_size: 100_000, max_check_size: 500_000, geography: 'Global', thesis_description: 'agentic workflow tooling for developers' };
const good = { name: 'AgentOS', sector: 'AI', stage: 'Seed', raise_amount: 1_000_000, location: 'Remote', description: 'Agentic workflow tooling for developers', traction: '$12k MRR', deck_url: 'https://x/deck', completeness_pct: 90 };
const bad = { name: 'SlotsFi', sector: 'Gaming', stage: 'Series A', raise_amount: 20_000_000, location: 'US', description: 'casino game' };

describe('parseMoneyRange', () => {
  it('parses k/m suffixes and ranges', () => {
    expect(parseMoneyRange('$100k - $500k')).toEqual([100_000, 500_000]);
    expect(parseMoneyRange('$1.5M')).toEqual([1_500_000, 1_500_000]);
    expect(parseMoneyRange(250000)).toEqual([250000, 250000]);
    expect(parseMoneyRange('')).toBeNull();
    expect(parseMoneyRange(undefined)).toBeNull();
  });
});

describe('scoreStartupForInvestor', () => {
  it('strong fit scores high with reasons, weak fit scores low (no free mismatch points)', () => {
    const g = scoreStartupForInvestor(good, prefs);
    const b = scoreStartupForInvestor(bad, prefs);
    expect(g.score).toBeGreaterThanOrEqual(80);
    expect(g.reasons.join(' ')).toMatch(/Sector fit/);
    expect(b.score).toBeLessThan(35);
    expect(b.negatives.length).toBeGreaterThan(0);
    expect(b.breakdown.sector).toBe(0);
    expect(b.breakdown.checkSize).toBeLessThan(20);
  });
  it('sector aliases match (GameFi investor vs Gaming startup, Web3 Infrastructure)', () => {
    expect(scoreStartupForInvestor({ sector: 'Gaming', stage: 'Seed' }, { preferred_sectors: ['GameFi'] }).breakdown.sector).toBe(30);
    expect(scoreStartupForInvestor({ sector: 'Infrastructure', stage: 'Seed' }, { preferred_sectors: ['Web3 Infrastructure'] }).breakdown.sector).toBe(30);
  });
  it('string check sizes from directory investors work', () => {
    const s = scoreStartupForInvestor(good, { preferred_sectors: ['AI'], preferred_stages: ['Seed'], check_size: '$100k - $500k' } as any);
    expect(s.breakdown.checkSize).toBe(20);
  });
  it('incomplete preferences report low confidence', () => {
    expect(scoreStartupForInvestor(good, {}).confidence).toBeLessThan(0.5);
    expect(scoreStartupForInvestor(good, prefs).confidence).toBe(1);
  });
  it('unapproved listings are ineligible', () => {
    expect(scoreStartupForInvestor({ ...good, status: 'pending' }, prefs).eligible).toBe(false);
  });
});

describe('ranking', () => {
  it('rankStartupsForInvestor filters below threshold and sorts best-first', () => {
    const ranked = rankStartupsForInvestor([bad, good], prefs);
    expect(ranked).toHaveLength(1);
    expect(ranked[0].name).toBe('AgentOS');
  });
  it('rankInvestorsForStartup ranks directory investors for a founder', () => {
    const ranked = rankInvestorsForStartup(
      [{ name: 'Wrong', sectors: ['Gaming'], stage: 'Series A', check_size: '$5M' }, { name: 'Right', sectors: ['AI'], stage: 'Seed', check_size: '$250k' }],
      good,
    );
    expect(ranked[0].name).toBe('Right');
  });
  it('legacy calculateMatchScore no longer rewards mismatch', () => {
    const r = calculateMatchScore(
      { sector: 'AI', stage: 'Seed', raiseRange: '$1M' } as any,
      { sectors: ['Gaming'], stage: ['Series A'], ticketSize: '$10M' } as any,
    );
    expect(r.score).toBeLessThan(30);
  });
});
