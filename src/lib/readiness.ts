import type { StartupLike } from './matching';
import { parseMoneyRange } from './matching';

export interface ReadinessChecklistItem {
  id: string;
  category: 'profile' | 'economics' | 'deck' | 'proof';
  label: string;
  points: number;
  completed: boolean;
  recommendation: string;
}

export interface FounderReadinessReport {
  score: number; // 0-100
  tier: 'unranked' | 'emerging' | 'high_conviction' | 'institutional';
  tierLabel: string;
  matchMultiplier: number; // e.g. 1.25x
  checklist: ReadinessChecklistItem[];
  nextBestAction: string;
}

/**
 * Computes deterministic Founder Raise Readiness Score (0-100)
 * Evaluates 4 pillars (25 pts each):
 * 1. Profile Core
 * 2. Economic Clarity
 * 3. Pitch Deck Assets
 * 4. Social & Traction Proof
 */
export function calculateFounderReadiness(startup: StartupLike): FounderReadinessReport {
  const checklist: ReadinessChecklistItem[] = [
    // 1. Profile Core (25 pts)
    {
      id: 'core_name_tagline',
      category: 'profile',
      label: 'Startup Name & Tagline',
      points: 10,
      completed: Boolean(startup.name?.trim() && (startup.tagline?.trim() || startup.description?.trim())),
      recommendation: 'Add a clear 1-line elevator pitch summarizing your core value proposition.',
    },
    {
      id: 'core_sector',
      category: 'profile',
      label: 'Sector & Sub-industry Categorization',
      points: 10,
      completed: Boolean(startup.sector || (Array.isArray(startup.industry) && startup.industry.length > 0) || startup.industry),
      recommendation: 'Specify your primary sector (e.g., DeFi, AI, Infrastructure) to align with investor mandates.',
    },
    {
      id: 'core_stage',
      category: 'profile',
      label: 'Funding Stage Defined',
      points: 5,
      completed: Boolean(startup.stage?.trim()),
      recommendation: 'Define your current round stage (Pre-Seed, Seed, Series A).',
    },

    // 2. Economic Clarity (25 pts)
    {
      id: 'econ_target_raise',
      category: 'economics',
      label: 'Target Raise Amount Stated',
      points: 15,
      completed: Boolean(parseMoneyRange(startup.target_raise || startup.raise_amount || startup.funding_goal || startup.raiseRange)),
      recommendation: 'State your round target (e.g. $500,000) so investors can evaluate check-to-raise sizing.',
    },
    {
      id: 'econ_location',
      category: 'economics',
      label: 'Geographic Jurisdiction & Entity',
      points: 10,
      completed: Boolean(startup.geography?.trim() || startup.location?.trim()),
      recommendation: 'Specify your company jurisdiction or headquarters region for legal alignment.',
    },

    // 3. Pitch Deck Assets (25 pts)
    {
      id: 'deck_uploaded',
      category: 'deck',
      label: 'Pitch Deck PDF Attached',
      points: 25,
      completed: Boolean(startup.deck_url?.trim() || startup.pitch_deck_url?.trim()),
      recommendation: 'Upload a pitch deck PDF so investors can review your thesis and architecture in 30 seconds.',
    },

    // 4. Social & Traction Proof (25 pts)
    {
      id: 'proof_traction',
      category: 'proof',
      label: 'Traction Signal / Revenue / TVL',
      points: 15,
      completed: Boolean(startup.traction?.trim() || startup.traction_signal?.trim()),
      recommendation: 'Share quantifiable traction (e.g. ARR, waitlist size, active testnet users, TVL).',
    },
    {
      id: 'proof_verification',
      category: 'proof',
      label: 'Verified Profile or Website',
      points: 10,
      completed: Boolean(startup.verified || (startup as any).website || (startup as any).website_url),
      recommendation: 'Link your public product website or GitHub repository for verification.',
    },
  ];

  const score = checklist.reduce((acc, item) => (item.completed ? acc + item.points : acc), 0);

  let tier: FounderReadinessReport['tier'] = 'unranked';
  let tierLabel = 'Unranked (Incomplete Profile)';
  let matchMultiplier = 0.8;

  if (score >= 90) {
    tier = 'institutional';
    tierLabel = 'Institutional Grade (Featured)';
    matchMultiplier = 1.25;
  } else if (score >= 75) {
    tier = 'high_conviction';
    tierLabel = 'High Conviction (1.15x Boost)';
    matchMultiplier = 1.15;
  } else if (score >= 50) {
    tier = 'emerging';
    tierLabel = 'Emerging Startup';
    matchMultiplier = 1.0;
  }

  // Find next best incomplete item with highest points
  const incomplete = checklist.filter((i) => !i.completed).sort((a, b) => b.points - a.points);
  const nextBestAction = incomplete.length > 0 
    ? incomplete[0].recommendation 
    : 'Your profile is fully optimized for institutional deal flow!';

  return {
    score,
    tier,
    tierLabel,
    matchMultiplier,
    checklist,
    nextBestAction,
  };
}

