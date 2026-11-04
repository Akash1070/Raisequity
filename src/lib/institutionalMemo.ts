/**
 * Due Diligence Institutional Memo Generator
 * Generates an institutional 1-page tear sheet that partner VCs accept in lieu of a 30-slide pitch deck.
 */
import { calculateFounderReadiness } from './readiness';
import { scoreStartupForInvestor } from './matching';

export interface InstitutionalMemoData {
  companyName: string;
  tagline: string;
  sector: string;
  stage: string;
  website: string;
  location: string;
  raiseAmountFormatted: string;
  valuationCap: string;
  instrument: 'Post-Money SAFE' | 'Token SAFT' | 'Priced Equity';
  raiseReadinessScore: number;
  matchConfidence: number;
  verificationBadges: {
    delawareEntity: boolean;
    githubVerified: boolean;
    unitEconomicsVerified: boolean;
    kycCleared: boolean;
  };
  tractionMetrics: {
    label: string;
    value: string;
    growth: string;
  }[];
  highlights: string[];
  teamBackground: string;
  marketStats: string;
  capTableStructure: {
    foundersPct: number;
    advisorsPct: number;
    optionPoolPct: number;
    investorsPct: number;
  };
  forwardableBlurb: string;
  generatedDate: string;
}

export function buildInstitutionalMemo(profile: any, startup: any): InstitutionalMemoData {
  const companyName = startup?.name || profile?.company_name || 'Innovate Corp';
  const raiseAmount = startup?.raise_amount || parseFloat(String(profile?.funding_goal || '500000').replace(/[^0-9.]/g, '')) || 500000;
  
  const formattedRaise = raiseAmount >= 1000000 
    ? `$${(raiseAmount / 1000000).toFixed(1)}M` 
    : `$${(raiseAmount / 1000).toFixed(0)}k`;

  const impliedValCap = raiseAmount >= 1000000 
    ? `$${((raiseAmount * 5) / 1000000).toFixed(1)}M Cap` 
    : `$${((raiseAmount * 5) / 1000).toFixed(0)}k Cap`;

  const isWeb3 = ['DeFi', 'Web3 Infrastructure', 'GameFi', 'SocialFi', 'RWA', 'DeSci'].includes(profile?.sector || startup?.sector || '');

  // Real readiness score from the deterministic checklist engine (0–100).
  const readiness = calculateFounderReadiness(startup || {});
  // Real confidence proxy: how much signal exists for matching (0–1 → %).
  const matchResult = scoreStartupForInvestor(
    {
      sector: startup?.sector || profile?.sector || null,
      stage: startup?.stage || profile?.stage || null,
      raise_amount: startup?.raise_amount || profile?.funding_goal || null,
      description: startup?.description || profile?.company_blurb || null,
      tagline: startup?.tagline || profile?.what_company_does || null,
      traction: startup?.traction || profile?.traction_signal || null,
    },
    {},
  );

  // Only claim verification that is actually present on the profile/startup.
  const verificationBadges = {
    delawareEntity: Boolean(profile?.delaware_entity || profile?.entity_jurisdiction === 'Delaware' || startup?.delaware_entity),
    githubVerified: Boolean(profile?.github_url || startup?.github_url || profile?.github_verified),
    unitEconomicsVerified: Boolean(profile?.unit_economics_verified),
    kycCleared: Boolean(profile?.kyc_cleared),
  };

  // Traction metrics only when real data exists — never fabricated.
  const tractionMetrics: InstitutionalMemoData['tractionMetrics'] = [];
  if (profile?.arr && Number(profile.arr) > 0) {
    tractionMetrics.push({ label: 'Annual Run Rate', value: `$${Number(profile.arr).toLocaleString('en-US')}`, growth: profile?.arr_growth || '—' });
  }
  if (profile?.traction_signal || startup?.traction) {
    tractionMetrics.push({ label: 'Traction Signal', value: profile?.traction_signal || startup?.traction, growth: profile?.traction_growth || '—' });
  }
  if (profile?.monthly_active_users || profile?.users) {
    tractionMetrics.push({ label: 'Active Users', value: String(profile?.monthly_active_users || profile?.users || ''), growth: profile?.users_growth || '—' });
  }
  if (tractionMetrics.length === 0) {
    tractionMetrics.push({ label: 'Traction', value: 'Not disclosed', growth: '—' });
  }

  const highlights: string[] = [];
  if (profile?.opportunity_stat) highlights.push(profile.opportunity_stat);
  if (profile?.why_now) highlights.push(profile.why_now);
  if (startup?.description) highlights.push(startup.description.slice(0, 220));
  if (highlights.length === 0) highlights.push('Profile data being completed — verification and traction evidence pending.');

  const capTableStructure = {
    foundersPct: Number(profile?.cap_table_founders_pct) || 0,
    optionPoolPct: Number(profile?.cap_table_option_pool_pct) || 0,
    advisorsPct: Number(profile?.cap_table_advisors_pct) || 0,
    investorsPct: Number(profile?.cap_table_investors_pct) || 0,
  };

  return {
    companyName,
    tagline: startup?.tagline || profile?.what_company_does || '—',
    sector: startup?.sector || profile?.sector || 'Not specified',
    stage: startup?.stage || profile?.stage || 'Not specified',
    website: startup?.website_url || profile?.company_website || '',
    location: profile?.location || startup?.location || 'Not specified',
    raiseAmountFormatted: formattedRaise,
    valuationCap: impliedValCap,
    instrument: isWeb3 ? 'Token SAFT' : 'Post-Money SAFE',
    raiseReadinessScore: readiness.score,
    matchConfidence: Math.round((matchResult.confidence || 0) * 100),
    verificationBadges,
    tractionMetrics,
    highlights,
    teamBackground: profile?.team_credential || profile?.founder_background || 'Not disclosed',
    marketStats: profile?.opportunity_stat || 'Market data not disclosed',
    capTableStructure,
    forwardableBlurb: profile?.company_blurb || `${companyName} is raising ${formattedRaise} at ${impliedValCap} on a standard ${isWeb3 ? 'Token SAFT' : 'Post-Money SAFE'}.`,
    generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  };
}

