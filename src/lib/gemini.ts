import { scoreStartupForInvestor as deterministicScore } from './matching';
import { callAI } from './geminiClient';

// AI runs server-side via /api/ai (GEMINI_API_KEY never reaches the browser;
// the @google/genai SDK is no longer bundled). Every function falls back to
// the deterministic matching engine — same input always gives same output.

export interface CheckFitResponse {
  score: number;
  reason_paragraph_1: string;
  reason_paragraph_2: string;
}

export interface ScanWebsiteResponse {
  what_company_does: string;
  traction_signal: string;
  opportunity_stat: string;
  why_now: string;
  team_credential: string;
}

export interface InvestorMatchScore {
  score: number;
  reason: string;
  sectors_aligned: string[];
  stage_aligned: boolean;
  check_size_aligned: boolean;
}

export async function checkInvestorFit(
  companyBlurb: string, sector: string, stage: string, raiseAmount: number,
  investorJson: any, investorPrefsJson: any,
): Promise<CheckFitResponse> {
  const ai = await callAI<CheckFitResponse>('check_fit', {
    companyBlurb, sector, stage, raiseAmount,
    investorJson: JSON.stringify(investorJson), investorPrefsJson: JSON.stringify(investorPrefsJson),
  });
  if (ai && typeof ai.score === 'number') return ai;
  const m = deterministicScore(
    { sector, stage, raise_amount: raiseAmount, description: companyBlurb },
    { preferred_sectors: investorPrefsJson.preferred_sectors || investorJson.sectors_invested_in || [], min_check_size: investorPrefsJson.check_size_min, max_check_size: investorPrefsJson.check_size_max },
  );
  return {
    score: Math.round((m.score / 20) * 10) / 10,
    reason_paragraph_1: m.reasons.length ? `Heuristic fit score: ${m.reasons.join('; ')}.` : 'Heuristic fit score: limited sector/stage/check overlap found.',
    reason_paragraph_2: m.negatives.length ? `Watch out: ${m.negatives.join('; ')}.` : 'No hard mismatches detected on sector, stage or check size.',
  };
}

export async function scanCompanyWebsite(websiteUrl: string): Promise<ScanWebsiteResponse> {
  const ai = await callAI<ScanWebsiteResponse>('scan_website', { websiteUrl });
  if (ai?.what_company_does) return ai;
  // No fabricated company data when AI is unavailable — return blanks for the
  // founder to fill in (previously this invented traction/team credentials).
  return { what_company_does: '', traction_signal: '', opportunity_stat: '', why_now: '', team_credential: '' };
}

export async function scoreStartupForInvestor(
  startup: { name: string; sector: string | null; stage: string | null; raise_amount: number | null; description: string | null; tagline: string | null; traction: string | null },
  investorPrefs: { preferred_sectors: string[] | null; preferred_stages: string[] | null; min_check_size: number | null; max_check_size: number | null; thesis_description: string | null },
): Promise<InvestorMatchScore> {
  const ai = await callAI<InvestorMatchScore>('score_startup', {
    startupJson: JSON.stringify(startup), prefsJson: JSON.stringify(investorPrefs),
  });
  if (ai && typeof ai.score === 'number') return ai;
  const m = deterministicScore(startup, investorPrefs);
  return {
    score: m.score,
    reason: m.reasons.join(' · ') || m.negatives[0] || 'Limited thesis fit.',
    sectors_aligned: m.breakdown.sector > 0 && startup.sector ? [startup.sector] : [],
    stage_aligned: m.breakdown.stage > 0,
    check_size_aligned: m.breakdown.checkSize > 0,
  };
}
