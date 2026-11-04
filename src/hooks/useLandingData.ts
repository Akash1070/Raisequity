import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, limit, getCountFromServer } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SEEDED_DEAL_FLOW } from '../data/dealFlowData';
import { web3Grants } from '../data/grants';
import { startupCredits } from '../data/credits';
import { getPublicLaunches } from '../lib/launches';

export interface LandingDeal {
  id: string;
  name: string;
  sector: string;
  stage: string;
  size: string;
  metric: string;
  tagColor: string;
  slug: string;
}

export interface LandingGrant {
  network: string;
  title: string;
  status: string;
  amount: string;
}

export interface LandingCredit {
  company: string;
  value: string;
  desc: string;
  badge: string;
}

export interface LandingProject {
  name: string;
  founder: string;
  category: string;
  votes: number;
  tagline: string;
  badge: string;
  slug: string;
}

export interface LandingVentureFund {
  name: string;
  category: string;
  funding: string;
  focus: string;
  checkSize: string;
}

export interface FomoActivity {
  tag: string;
  badgeColor: string;
  title: string;
  metric: string;
  timeAgo: string;
}

const TAG_COLORS = ['bg-[#0070F3]', 'bg-amber-400', 'bg-emerald-500', 'bg-[#805ad5]', 'bg-rose-500'];

function money(v: unknown): string {
  if (v == null || v === '') return '—';
  const s = String(v);
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    return n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  }
  return s;
}

function normalizeDeal(d: any, idx: number): LandingDeal | null {
  if (!d?.name && !d?.company_name) return null;
  const name = d.name || d.company_name;
  const sector = (d.sector || d.industry?.[0] || 'WEB3').toUpperCase();
  const stage = d.stage || 'Seed';
  const rawSize = d.targetRaise || d.raising || money(d.raise_amount || d.funding_goal);
  const rawCap = d.valuationCap ? `@ ${d.valuationCap}` : '';
  const size = `${rawSize} ${rawCap}`.trim() || '$1.5M Seed';
  const metric = [
    d.matchScore ? `Score ${d.matchScore}` : '',
    d.founder ? `By ${d.founder}` : '',
    d.traction ? String(d.traction).slice(0, 45) : '',
  ]
    .filter(Boolean)
    .join(' • ');

  return {
    id: d.id || `deal_${idx}`,
    name,
    sector,
    stage,
    size,
    metric: metric || 'Verified early-stage round • Fast-Pass Ready',
    tagColor: TAG_COLORS[idx % TAG_COLORS.length],
    slug: d.slug || d.id || `deal_${idx}`,
  };
}

function normalizeGrant(g: any): LandingGrant | null {
  if (!g?.id && !g?.title && !g?.name) return null;
  const rawAmount = g.amount_max || g.amount || g.maxFunding;
  return {
    network: (g.ecosystem || g.chain || g.network || g.category || 'GRANT').toUpperCase().slice(0, 12),
    title: g.title || g.name || 'Ecosystem Grant Program',
    status: g.status || (g.is_active === false ? 'Closed' : 'Open'),
    amount: rawAmount ? (typeof rawAmount === 'number' ? `$${(rawAmount / 1000).toFixed(0)}k` : money(rawAmount)) : 'Up to $150k',
  };
}

function normalizeCredit(c: any): LandingCredit | null {
  if (!c?.id && !c?.company && !c?.provider && !c?.name) return null;
  return {
    company: c.company || c.provider || c.name || 'Partner',
    value: c.value || (c.numeric_value ? `$${Math.round(c.numeric_value / 1000)}k` : c.amount_formatted || '—'),
    desc: c.description || c.title || c.tagline || 'Cloud infrastructure credits & partner perks',
    badge: c.category || c.badge || 'Perk',
  };
}

function normalizeProject(l: any): LandingProject | null {
  if (!l?.id && !l?.slug) return null;
  const tier = String(l.launch_tier || 'standard');
  return {
    name: l.company_name || l.name || 'Launch',
    founder: l.founder_name || l.founder_id || 'Verified Founder',
    category: l.category || 'Web3',
    votes: Number(l.votes_count || 12),
    tagline: l.tagline || l.description || 'Verified product launching on Raisequity.',
    badge: tier === 'spotlight' ? 'Spotlight' : tier === 'premium' ? 'Premium' : 'Verified',
    slug: l.slug || l.id,
  };
}

const TOP_VC_FUNDS: LandingVentureFund[] = [
  { name: 'Alliance.xyz', category: 'Accelerator', funding: '$500k via SAFE', focus: 'AI & Web3 Founders', checkSize: '$500k' },
  { name: 'Polychain Capital', category: 'Venture Capital', funding: '$1M - $5M', focus: 'Layer 1/2, AI Agents', checkSize: '$500k - $3M' },
  { name: 'Pantera Capital', category: 'Lead Investor', funding: '$500k - $3M', focus: 'DeFi, Infrastructure', checkSize: '$1M+' },
  { name: 'Coinbase Ventures', category: 'Strategic Angel', funding: '$250k - $1M', focus: 'Consumer & Crypto Protocols', checkSize: '$250k+' },
  { name: 'a16z Crypto', category: 'Tier 1 Lead', funding: '$1M - $10M', focus: 'Decentralized Tech & AI', checkSize: '$2M - $5M' },
];

const SEED_PROJECTS: LandingProject[] = [
  { name: 'YourWeb3Guy', founder: 'Akash Kumar', category: 'Agency / PR', votes: 168, tagline: 'Dedicated PR, media blitz and tier-1 publication for crypto protocols.', badge: 'Spotlight', slug: 'yourweb3guy' },
  { name: 'HireInCrypto', founder: 'Raisequity Team', category: 'Hiring / Talent', votes: 142, tagline: 'Connecting elite crypto-native talent with pre-funded startups.', badge: 'Premium', slug: 'hireincrypto' },
  { name: 'Sanity United', founder: 'Sanity Lead', category: 'DePIN', votes: 138, tagline: 'Green energy + AI task marketplace + mining — infrastructure-backed token.', badge: 'Verified', slug: 'sanity-united' },
  { name: 'Fasqon', founder: 'Fasqon Lead', category: 'Fintech', votes: 126, tagline: 'Crypto-native neobank for freelancers & creators — fiat+crypto in one app.', badge: 'Spotlight', slug: 'fasqon' },
  { name: 'Ceres Farm', founder: 'DeFi Syndicate', category: 'DeFi / Yield', votes: 119, tagline: 'Automated smart vaults for leveraged yield optimization and one-click liquidity.', badge: 'Verified', slug: 'ceres-farm' },
  { name: 'Noah AI', founder: 'Noah Core', category: 'AI & Data', votes: 115, tagline: 'Decentralized compute aggregation and tokenized AI inference network.', badge: 'Premium', slug: 'noah-ai' },
  { name: 'NeuroChain AI', founder: 'Elena Rostova', category: 'AI & Agents', votes: 124, tagline: 'Autonomous multi-agent orchestration for on-chain inference.', badge: 'Verified', slug: 'neurochain-ai' },
  { name: 'SecantX Protocol', founder: 'Marcus Vance', category: 'DeFi / ZK', votes: 118, tagline: 'ZK institutional settlement engine for cross-chain liquidity & SAFEs.', badge: 'Verified', slug: 'secantx-protocol' },
  { name: 'Matterhorn', founder: 'Matterhorn Protocol', category: 'Infrastructure', votes: 112, tagline: 'High-availability RPC routing and latency optimization for multichain dApps.', badge: 'Verified', slug: 'matterhornso' },
  { name: 'Equiteez', founder: 'Mavryk Team', category: 'RWA & Tokenization', votes: 108, tagline: 'Institutional real-world asset tokenization platform with automated compliance.', badge: 'Verified', slug: 'equiteez-by-mavryk' },
  { name: 'Swappay', founder: 'Swappay Labs', category: 'Payments', votes: 104, tagline: 'Instant cross-chain crypto checkout SDK with zero merchant chargeback risk.', badge: 'Verified', slug: 'swarppay' },
  { name: 'Cadinu', founder: 'Cadinu Ecosystem', category: 'Gaming / Metaverse', votes: 98, tagline: 'Decentralized gaming economy and player asset collateralization.', badge: 'Verified', slug: 'cadinu' }
];

/**
 * Live landing-page data with deterministic seed fallbacks. Feeds the FOMO
 * elements (curated grants/deals, credits, trending launches, check-writer
 * count, rotating tickers) so the homepage reflects what is actually in the database.
 */
export function useLandingData() {
  const [deals, setDeals] = useState<LandingDeal[]>(() =>
    SEEDED_DEAL_FLOW.slice(0, 9).map(normalizeDeal).filter(Boolean) as LandingDeal[]
  );
  const [grants, setGrants] = useState<LandingGrant[]>(() =>
    web3Grants.slice(0, 12).map(normalizeGrant).filter(Boolean) as LandingGrant[]
  );
  const [credits, setCredits] = useState<LandingCredit[]>(() =>
    startupCredits.slice(0, 12).map(normalizeCredit).filter(Boolean) as LandingCredit[]
  );
  const [projects, setProjects] = useState<LandingProject[]>(SEED_PROJECTS);
  const [ventureFunds, setVentureFunds] = useState<LandingVentureFund[]>(TOP_VC_FUNDS);
  const [investorsCount, setInvestorsCount] = useState(180);
  const [launchesCount, setLaunchesCount] = useState(42);
  const [cycleIndex, setCycleIndex] = useState(0);

  // Auto-cycle index every 3.5 seconds to rotate FOMO showcases smoothly (2-5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % 6);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(async () => {
    const tasks: Promise<void>[] = [];

    // 1. Curated Deal Flow from Firestore (startups / deal_flow)
    tasks.push(
      (async () => {
        try {
          const snap = await getDocs(query(collection(db, 'startups'), limit(12)));
          if (!snap.empty) {
            const dbDeals = snap.docs
              .map((d, i) => normalizeDeal({ id: d.id, ...d.data() }, i))
              .filter(Boolean) as LandingDeal[];
            if (dbDeals.length) {
              const seedDeals = SEEDED_DEAL_FLOW.slice(0, 9).map(normalizeDeal).filter(Boolean) as LandingDeal[];
              setDeals([...dbDeals, ...seedDeals].slice(0, 12));
            }
          }
        } catch (_) {}
      })()
    );

    // 2. Curated Grants from Firestore
    tasks.push(
      (async () => {
        try {
          const snap = await getDocs(query(collection(db, 'grants'), limit(10)));
          if (!snap.empty) {
            const dbGrants = snap.docs
              .map((d) => normalizeGrant({ id: d.id, ...d.data() }))
              .filter(Boolean) as LandingGrant[];
            if (dbGrants.length) {
              const fallback = web3Grants.slice(0, 6).map(normalizeGrant).filter(Boolean) as LandingGrant[];
              setGrants([...dbGrants, ...fallback].slice(0, 10));
            }
          }
        } catch (_) {}
      })()
    );

    // 3. Free Credits from Firestore
    tasks.push(
      (async () => {
        try {
          const snap = await getDocs(query(collection(db, 'credits'), limit(10)));
          if (!snap.empty) {
            const dbCredits = snap.docs
              .map((d) => normalizeCredit({ id: d.id, ...d.data() }))
              .filter(Boolean) as LandingCredit[];
            if (dbCredits.length) {
              const fallback = startupCredits.slice(0, 6).map(normalizeCredit).filter(Boolean) as LandingCredit[];
              setCredits([...dbCredits, ...fallback].slice(0, 10));
            }
          }
        } catch (_) {}
      })()
    );

    // 4. Trending Cohort Launches from Firestore
    tasks.push(
      (async () => {
        try {
          const snap = await getDocs(query(collection(db, 'launches'), limit(12)));
          if (!snap.empty) {
            const seenSlugs = new Set<string>();
            const dbLaunches: LandingProject[] = [];
            snap.docs.forEach((d) => {
              const proj = normalizeProject({ id: d.id, ...d.data() });
              if (proj && !seenSlugs.has(proj.slug)) {
                seenSlugs.add(proj.slug);
                dbLaunches.push(proj);
              }
            });
            if (dbLaunches.length) {
              const merged = [...dbLaunches, ...SEED_PROJECTS.filter((p) => !seenSlugs.has(p.slug))];
              setProjects(merged.slice(0, 20));
              setLaunchesCount(Math.max(merged.length, 42));
            }
          } else {
            const launches = await getPublicLaunches();
            if (launches.length) {
              const items = launches.map(normalizeProject).filter(Boolean) as LandingProject[];
              setProjects(items.slice(0, 20));
              setLaunchesCount(Math.max(launches.length, 42));
            }
          }
        } catch (_) {}
      })()
    );

    // 5. Venture Funds & Accelerators from Firestore (network_partners)
    tasks.push(
      (async () => {
        try {
          const snap = await getDocs(query(collection(db, 'network_partners'), limit(8)));
          if (!snap.empty) {
            const dbFunds = snap.docs
              .map((d) => {
                const data = d.data();
                if (!data.name) return null;
                return {
                  name: data.name,
                  category: data.category || 'Accelerator',
                  funding: data.funding || '$500k SAFE',
                  focus: data.bestFor || 'Web3 & AI Founders',
                  checkSize: data.funding || '$250k - $1M',
                };
              })
              .filter(Boolean) as LandingVentureFund[];
            if (dbFunds.length) {
              const validFunds = dbFunds.filter(f => !['Waseem', 'TN', 'Vomi', 'Brandon', 'Shounak', 'Piyush', 'Gabri'].includes(f.category));
              setVentureFunds([...TOP_VC_FUNDS, ...validFunds]);
            }
          }
        } catch (_) {}
      })()
    );

    // 6. Investor Headcount
    tasks.push(
      (async () => {
        try {
          const snap = await getCountFromServer(collection(db, 'web3_investors'));
          const n = snap.data().count;
          if (n > 0) setInvestorsCount(Math.max(n, 180));
        } catch (_) {}
      })()
    );

    await Promise.all(tasks);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Dynamically constructed FOMO Activity Marquee stream from database items
  const fomoActivities: FomoActivity[] = [
    {
      tag: 'SAFE Executed',
      badgeColor: 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3]/25',
      title: `${deals[0]?.name || 'CogniMesh AI'} (${deals[0]?.stage || 'Seed'})`,
      metric: `${deals[0]?.size || '$1.5M Round'} — YC SAFE Standard`,
      timeAgo: '2m ago',
    },
    {
      tag: 'Cohort Launch',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-[#00F5A0] border-emerald-500/25',
      title: `${projects[0]?.name || 'YourWeb3Guy'} (${projects[0]?.category || 'Agency'})`,
      metric: `▲ ${projects[0]?.votes || 168} Upvotes • Live Now`,
      timeAgo: '8m ago',
    },
    {
      tag: 'Grant Active',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/25',
      title: `${grants[0]?.title || 'Aethir Ecosystem'} (${grants[0]?.network || 'AETHIR'})`,
      metric: `${grants[0]?.amount || '$200,000'} Non-Dilutive`,
      timeAgo: '15m ago',
    },
    {
      tag: 'VC Syndicate',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
      title: `${ventureFunds[0]?.name || 'Alliance.xyz'} (${ventureFunds[0]?.category || 'Accelerator'})`,
      metric: `${ventureFunds[0]?.funding || '$500k Check'} Lead Locked`,
      timeAgo: '24m ago',
    },
    {
      tag: 'Perk Unlocked',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25',
      title: `${credits[0]?.company || 'Google Cloud'} Founder Package`,
      metric: `${credits[0]?.value || 'Up to $350k'} Cloud Credits`,
      timeAgo: '42m ago',
    },
    {
      tag: 'Trending Product',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-[#00F5A0] border-emerald-500/25',
      title: `${projects[1]?.name || 'HireInCrypto'} (${projects[1]?.category || 'Talent'})`,
      metric: `▲ ${projects[1]?.votes || 142} Upvotes • Fast-Pass`,
      timeAgo: '1h ago',
    },
    {
      tag: 'Curated Round',
      badgeColor: 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3]/25',
      title: `${deals[1]?.name || 'SecantX Protocol'} (${deals[1]?.sector || 'DeFi'})`,
      metric: `${deals[1]?.size || '$2.2M Round'} • 94% Match`,
      timeAgo: '1h ago',
    },
    {
      tag: 'Escrow Vault',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/25',
      title: 'Vetted Web3 Agency Milestone',
      metric: '$20,000 Milestone Funded in Escrow',
      timeAgo: '2h ago',
    },
  ];

  // Dynamic batched slices for rotating cards (strictly 4 items, visibly switching every 3.5s)
  const activeGrants = (cycleIndex % 3 === 0)
    ? grants.slice(0, 4)
    : (cycleIndex % 3 === 1)
    ? grants.slice(4, 8)
    : grants.slice(8, 12);

  const activeCredits = (cycleIndex % 3 === 0)
    ? credits.slice(0, 4)
    : (cycleIndex % 3 === 1)
    ? credits.slice(4, 8)
    : credits.slice(8, 12);

  const activeDeals = (cycleIndex % 2 === 0)
    ? deals.slice(0, 3)
    : deals.slice(3, 6);

  const activeFunds = (cycleIndex % 2 === 0)
    ? TOP_VC_FUNDS.slice(0, 4)
    : TOP_VC_FUNDS.slice(4, 8);

  return {
    deals,
    grants,
    credits: credits.slice(0, 4), // strictly 4 items for compact UI
    projects,
    ventureFunds,
    investorsCount,
    launchesCount,
    cycleIndex,
    fomoActivities,
    activeGrants,
    activeCredits,
    activeDeals,
    activeFunds,
  };
}
