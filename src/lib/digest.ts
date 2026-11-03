import { getInvestorProfile, getInvestorPreferences } from './investors';
import { db } from './firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { scoreStartupForInvestor } from './matching';

export interface DigestItem {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  stage: string;
  raise_amount: number;
  matchScore: number;
  matchReason: string;
}

export interface DigestResult {
  investorName: string;
  investorEmail: string;
  fundName: string;
  thesisSectors: string[];
  deals: DigestItem[];
  generatedAt: string;
  status: 'sent' | 'simulated';
}

/**
 * Generates a weekly dealflow digest for an investor based on their thesis preferences
 */
export async function generateWeeklyDigest(investorId: string): Promise<DigestResult> {
  const { data: profile } = await getInvestorProfile(investorId);
  const { data: prefs } = await getInvestorPreferences(investorId);

  const investorName = profile?.full_name || 'Investor';
  const investorEmail = profile?.email || 'investor@raisequity.com';
  const fundName = profile?.fund_name || 'Venture Partner';
  const thesisSectors = prefs?.preferred_sectors || ['Web3', 'AI', 'DeFi'];

  // Query founder profiles / startups from Firestore
  let startups: any[] = [];
  try {
    const q = query(collection(db, 'founder_profiles'));
    const snap = await getDocs(q);
    startups = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[Digest] Error reading startups:', err);
  }

  // Filter startups by thesis or recent addition
  const matchedDeals: DigestItem[] = [];

  for (const s of startups) {
    // Deterministic scorer (previously Gemini-with-Math.random fallback, so the
    // same digest re-scored differently on every run and padded to 3 deals).
    const matchResult = scoreStartupForInvestor(
      {
        sector: s.sector || 'Tech', stage: s.stage || 'Pre-Seed',
        raise_amount: parseFloat(s.funding_goal) || undefined,
        description: s.company_blurb || s.what_company_does || '',
        tagline: s.what_company_does || '', traction: s.traction_signal || '',
        location: s.location || undefined,
      },
      {
        preferred_sectors: prefs?.preferred_sectors || [],
        preferred_stages: prefs?.preferred_stages || [],
        min_check_size: prefs?.min_check_size || undefined,
        max_check_size: prefs?.max_check_size || undefined,
        geography: prefs?.geography || undefined,
        thesis_description: prefs?.thesis_description || '',
      }
    );
    if (matchResult.score < 35) continue; // no padding with weak fits
    matchedDeals.push({
      id: s.id,
      name: s.company_name || s.full_name || 'Startup Project',
      tagline: s.what_company_does || s.company_blurb || '',
      sector: s.sector || 'Web3',
      stage: s.stage || 'Pre-Seed',
      raise_amount: parseFloat(s.funding_goal) || 0,
      matchScore: matchResult.score,
      matchReason: matchResult.reasons.join(' · ') || matchResult.negatives[0] || 'Thesis fit',
    });
  }

  // Sort by highest match score
  matchedDeals.sort((a, b) => b.matchScore - a.matchScore);

  return {
    investorName,
    investorEmail,
    fundName,
    thesisSectors,
    deals: matchedDeals.slice(0, 5),
    generatedAt: new Date().toISOString(),
    status: 'simulated',
  };
}

/**
 * Triggers a weekly dealflow digest dispatch preview for testing
 */
export async function triggerWeeklyDigestTest(investorId: string): Promise<DigestResult> {
  const result = await generateWeeklyDigest(investorId);
  result.status = 'sent';
  return result;
}
