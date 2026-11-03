import type { Project, Investor } from '../types';

/**
 * Explainable, deterministic matching engine (no AI / no randomness).
 *
 * Why this exists: the previous scorer gave 10pts for a ticket mismatch,
 * exact-string sector/stage matches only, and callers fed it hard-coded
 * default preferences — so almost every deal scored 40-70 regardless of fit.
 *
 * Scoring (100 max, hard mismatches earn 0 for that dimension):
 *  sector 30 · stage 20 · check-vs-raise 20 · geography 10
 *  thesis keywords 10 · quality/traction/completeness 10
 * `confidence` (0-1) reports how much input data existed; a high score on
 * thin data must not be presented as a strong recommendation.
 */

export interface MatchResult {
  score: number; // 0-100
  reasons: string[]; // positive reasons first
  negatives: string[];
  breakdown: Record<'sector' | 'stage' | 'checkSize' | 'geography' | 'thesis' | 'quality', number>;
  confidence: number; // 0-1
  eligible: boolean;
}

export interface StartupLike {
  name?: string;
  sector?: string | null;
  sectors?: string[] | null;
  industry?: string[] | string | null;
  stage?: string | null;
  raiseRange?: string | null;
  raise_amount?: number | string | null;
  funding_goal?: number | string | null;
  target_raise?: string | number | null;
  location?: string | null;
  geography?: string | null;
  traction?: string | null;
  traction_signal?: string | null;
  description?: string | null;
  tagline?: string | null;
  completeness_pct?: number | null;
  profile_complete?: boolean | null;
  verified?: boolean | null;
  status?: string | null;
  deck_url?: string | null;
  pitch_deck_url?: string | null;
  promotedUntil?: string | null;
  matchingData?: Project['matchingData'];
}

export interface InvestorPrefsLike {
  sectors?: string[] | null;
  preferred_sectors?: string[] | null;
  stage?: string[] | string | null;
  preferred_stages?: string[] | null;
  ticketSize?: string | null;
  check_size?: string | null;
  min_check_size?: number | string | null;
  max_check_size?: number | string | null;
  geography?: string | null;
  location?: string | null;
  thesis_description?: string | null;
  thesis?: string | null;
}

/** Parse "$100k", "$1.5M", "250000", "$100k - $500k" → [min,max] USD (single value → [v,v]). */
export function parseMoneyRange(input?: string | number | null): [number, number] | null {
  if (input == null || input === '') return null;
  if (typeof input === 'number') return Number.isFinite(input) && input > 0 ? [input, input] : null;
  const nums = [...input.replace(/,/g, '').matchAll(/(\d+(?:\.\d+)?)\s*([kmb])?/gi)]
    .map((m) => {
      const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] ?? 1;
      return parseFloat(m[1]) * mult;
    })
    .filter((n) => n > 0);
  if (!nums.length) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

const SECTOR_ALIASES: Record<string, string> = {
  'web3 infrastructure': 'infrastructure', infrastructure: 'infrastructure', infra: 'infrastructure',
  devtools: 'infrastructure', 'developer tools': 'infrastructure', cloud: 'infrastructure',
  defi: 'defi', 'decentralized finance': 'defi', gamefi: 'gaming', gaming: 'gaming', games: 'gaming',
  ai: 'ai', 'artificial intelligence': 'ai', 'machine learning': 'ai', deeptech: 'ai', 'ai x crypto': 'ai',
  nft: 'nft', nfts: 'nft',
  saas: 'saas', b2b: 'saas', 'b2b saas': 'saas', enterprise: 'saas',
  fintech: 'fintech', payments: 'fintech', banking: 'fintech',
  rwa: 'rwa', 'real world assets': 'rwa', socialfi: 'socialfi',
  consumer: 'consumer', marketplace: 'marketplace', 'e-commerce': 'consumer', ecommerce: 'consumer',
  desci: 'desci', biotech: 'desci', healthtech: 'healthtech', energy: 'energy', cleantech: 'energy',
  'real estate': 'real estate', 'layer 1': 'infrastructure', 'l1/l2': 'infrastructure', depin: 'infrastructure',
};
export const normSector = (s?: string | null) => {
  const k = (s || '').trim().toLowerCase();
  return SECTOR_ALIASES[k] ?? k;
};
export const normStage = (s?: string | null) =>
  (s || '').trim().toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');

const sectorsOf = (x: StartupLike): string[] =>
  [...(x.sectors ?? []), ...(Array.isArray(x.industry) ? x.industry : x.industry ? [x.industry] : []), ...(x.sector ? [x.sector] : [])]
    .map(normSector).filter(Boolean);
const prefsSectors = (p: InvestorPrefsLike): string[] =>
  [...(p.preferred_sectors ?? []), ...(p.sectors ?? [])].map(normSector).filter(Boolean);
const prefsStages = (p: InvestorPrefsLike): string[] =>
  [...(p.preferred_stages ?? []), ...(Array.isArray(p.stage) ? p.stage : p.stage ? [p.stage] : [])].map(normStage).filter(Boolean);

function startupRaise(s: StartupLike): [number, number] | null {
  return (
    parseMoneyRange(s.raise_amount) ?? parseMoneyRange(s.funding_goal) ??
    parseMoneyRange(s.target_raise) ?? parseMoneyRange(s.raiseRange) ??
    parseMoneyRange(s.matchingData?.raiseAmount)
  );
}
function investorCheck(p: InvestorPrefsLike): [number, number] | null {
  const min = parseMoneyRange(p.min_check_size)?.[0];
  const max = parseMoneyRange(p.max_check_size)?.[1];
  if (min != null || max != null) return [min ?? 0, max ?? Number.POSITIVE_INFINITY];
  return parseMoneyRange(p.ticketSize) ?? parseMoneyRange(p.check_size);
}

export function scoreStartupForInvestor(startup: StartupLike, prefs: InvestorPrefsLike): MatchResult {
  const breakdown = { sector: 0, stage: 0, checkSize: 0, geography: 0, thesis: 0, quality: 0 };
  const reasons: string[] = []; const negatives: string[] = [];
  let signals = 0; let signalsPresent = 0;
  const bump = (present: boolean) => { signals++; if (present) signalsPresent++; };

  // Sector (30): full on exact/alias match, partial on adjacent via shared token
  const sSecs = sectorsOf(startup); const pSecs = prefsSectors(prefs);
  bump(pSecs.length > 0 && sSecs.length > 0);
  if (pSecs.length && sSecs.length) {
    const hit = sSecs.find((s) => pSecs.includes(s));
    if (hit) { breakdown.sector = 30; reasons.push(`Sector fit: ${hit}`); }
    else negatives.push(`Sector outside thesis (${sSecs.join(', ')})`);
  }

  // Stage (20): exact 20, adjacent stage 8
  const ORDER = ['idea', 'pre-seed', 'seed', 'series-a', 'series-b', 'growth'];
  const sStage = normStage(startup.stage); const pStages = prefsStages(prefs);
  bump(pStages.length > 0 && !!sStage);
  if (pStages.length && sStage) {
    if (pStages.includes(sStage)) { breakdown.stage = 20; reasons.push(`Stage fit: ${startup.stage}`); }
    else if (pStages.some((p) => Math.abs(ORDER.indexOf(p) - ORDER.indexOf(sStage)) === 1)) {
      breakdown.stage = 8; negatives.push(`Adjacent stage (${startup.stage} vs ${pStages.join('/')})`);
    } else negatives.push(`Stage outside mandate: ${startup.stage}`);
  }

  // Check vs raise (20): investor check must plausibly fund part of the round.
  // Full: check range overlaps raise and max check >= 10% of raise. Partial: overlaps but tiny.
  const raise = startupRaise(startup); const check = investorCheck(prefs);
  bump(!!raise && !!check);
  if (raise && check) {
    // An investor funds part of a round, not all of it: their minimum check must
    // fit inside the raise, and their maximum should be a meaningful slice (>=5%).
    if (check[0] > raise[1]) negatives.push('Minimum check exceeds the whole raise');
    else if (check[1] >= raise[0] * 0.05) { breakdown.checkSize = 20; reasons.push('Check size can meaningfully join this round'); }
    else { breakdown.checkSize = 8; negatives.push('Check size is small relative to the raise'); }
  }

  // Geography (10): unspecified on either side = neutral 5 (not a mismatch)
  const sGeo = (startup.location || startup.geography || startup.matchingData?.geographies?.join(',') || '').toLowerCase();
  const pGeo = (prefs.geography || prefs.location || '').toLowerCase();
  bump(!!pGeo);
  if (!pGeo || /global|anywhere|remote|worldwide/.test(pGeo)) breakdown.geography = 10;
  else if (sGeo && (sGeo.includes(pGeo) || pGeo.includes(sGeo.split(',')[0].trim()))) { breakdown.geography = 10; reasons.push(`Geography fit: ${prefs.geography || prefs.location}`); }
  else if (!sGeo) breakdown.geography = 5;
  else negatives.push('Geography outside stated preference');

  // Thesis keywords (10): meaningful word overlap with startup text
  const thesis = (prefs.thesis_description || prefs.thesis || '').toLowerCase();
  bump(!!thesis);
  if (thesis) {
    const text = `${startup.tagline ?? ''} ${startup.description ?? ''} ${sSecs.join(' ')}`.toLowerCase();
    const words = [...new Set(thesis.split(/[^a-z0-9]+/).filter((w) => w.length > 4))];
    const hits = words.filter((w) => text.includes(w));
    if (hits.length) { breakdown.thesis = Math.min(10, 4 + hits.length * 2); reasons.push(`Thesis keywords: ${hits.slice(0, 3).join(', ')}`); }
  }

  // Quality (10): evidence the listing is investable, not a stub
  let q = 0;
  if (startup.traction || startup.traction_signal) q += 3;
  if (startup.description || startup.tagline) q += 2;
  if (startup.deck_url || startup.pitch_deck_url) q += 2;
  if (typeof startup.completeness_pct === 'number') q += startup.completeness_pct >= 80 ? 3 : startup.completeness_pct >= 50 ? 1 : 0;
  else if (startup.profile_complete) q += 3;
  breakdown.quality = Math.min(10, q);
  if (q >= 7) reasons.push('Complete profile with traction/deck evidence');

  const score = Math.round(Object.values(breakdown).reduce((a, b) => a + b, 0));
  const eligible = startup.status ? startup.status === 'approved' : true;
  if (!eligible) negatives.push('Listing not yet approved');
  return { score, reasons, negatives, breakdown, confidence: signals ? signalsPresent / signals : 0, eligible };
}

/** Rank startups for one investor: eligible only, best first, promoted is tie-break only (never buys rank). */
export function rankStartupsForInvestor<T extends StartupLike>(
  startups: T[], prefs: InvestorPrefsLike, opts: { minScore?: number; limit?: number } = {},
): (T & { match: MatchResult })[] {
  const { minScore = 35, limit = 10 } = opts;
  return startups
    .map((s) => ({ ...(s as any), match: scoreStartupForInvestor(s, prefs) }))
    .filter((s) => s.match.eligible && s.match.score >= minScore)
    .sort((a, b) => b.match.score - a.match.score || Number(!!b.promotedUntil) - Number(!!a.promotedUntil) || b.match.confidence - a.match.confidence)
    .slice(0, limit);
}

/** Rank investors (directory or platform) for one founder's startup — same engine, reversed. */
export function rankInvestorsForStartup<T extends InvestorPrefsLike & { name?: string; firm?: string }>(
  investors: T[], startup: StartupLike, opts: { minScore?: number; limit?: number } = {},
): (T & { match: MatchResult })[] {
  const { minScore = 35, limit = 10 } = opts;
  return investors
    .map((inv) => ({ ...(inv as any), match: scoreStartupForInvestor(startup, inv) }))
    .filter((i) => i.match.score >= minScore)
    .sort((a, b) => b.match.score - a.match.score || b.match.confidence - a.match.confidence)
    .slice(0, limit);
}

/** Back-compat wrapper used by legacy callers with Project/Investor types. */
export function calculateMatchScore(project: Project, investor: Investor): MatchResult {
  return scoreStartupForInvestor(
    { sector: project.sector, stage: project.stage, raiseRange: project.raiseRange, location: project.location, traction: project.traction, description: project.fullDescription, matchingData: project.matchingData },
    { sectors: investor.sectors, stage: investor.stage, ticketSize: investor.ticketSize, location: investor.location },
  );
}
