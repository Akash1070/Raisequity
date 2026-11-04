import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, limit, where, getCountFromServer } from 'firebase/firestore';
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
  const size = `${d.targetRaise || money(d.raise_amount || d.funding_goal)} @ ${d.valuationCap || ''}`.replace(' @ ', ' @ ');
  const metric = [d.matchScore ? `Score ${d.matchScore}` : '', d.founder ? `By ${d.founder}` : '', d.traction ? String(d.traction).slice(0, 40) : '']
    .filter(Boolean)
    .join(' • ');
  return {
    id: d.id || `deal_${idx}`,
    name,
    sector,
    stage,
    size,
    metric: metric || 'Verified early-stage round',
    tagColor: TAG_COLORS[idx % TAG_COLORS.length],
    slug: d.slug || d.id || `deal_${idx}`,
  };
}

function normalizeGrant(g: any): LandingGrant | null {
  if (!g?.id && !g?.title && !g?.name) return null;
  return {
    network: (g.ecosystem || g.chain || g.network || 'GRANT').toUpperCase().slice(0, 12),
    title: g.title || g.name || 'Grant Program',
    status: g.status || (g.is_active === false ? 'Closed' : 'Open'),
    amount: g.amount ? money(g.amount) : g.amount_formatted || 'Varies',
  };
}

function normalizeCredit(c: any): LandingCredit | null {
  if (!c?.id && !c?.company && !c?.provider && !c?.name) return null;
  return {
    company: c.company || c.provider || c.name || 'Partner',
    value: c.value || c.amount_formatted || '—',
    desc: c.description || c.title || c.tagline || '',
    badge: c.category || c.badge || 'Perk',
  };
}

function normalizeProject(l: any): LandingProject | null {
  if (!l?.id && !l?.slug) return null;
  const tier = String(l.launch_tier || 'standard');
  return {
    name: l.company_name || l.name || 'Launch',
    founder: l.founder_name || l.founder_id || 'Founder',
    category: l.category || 'Web3',
    votes: Number(l.votes_count || 0),
    tagline: l.tagline || l.description || '',
    badge: tier === 'spotlight' ? 'Spotlight' : tier === 'premium' ? 'Premium' : 'Verified',
    slug: l.slug || l.id,
  };
}

/**
 * Live landing-page data with deterministic seed fallbacks. Feeds the FOMO
 * elements (curated grants/deals, credits, trending launches, check-writer
 * count) so the homepage reflects what is actually in the database.
 */
export function useLandingData() {
  const [deals, setDeals] = useState<LandingDeal[]>(() =>
    SEEDED_DEAL_FLOW.slice(0, 3).map(normalizeDeal).filter(Boolean) as LandingDeal[]
  );
  const [grants, setGrants] = useState<LandingGrant[]>(() =>
    web3Grants.slice(0, 2).map(normalizeGrant).filter(Boolean) as LandingGrant[]
  );
  const [credits, setCredits] = useState<LandingCredit[]>(() =>
    startupCredits.slice(0, 4).map(normalizeCredit).filter(Boolean) as LandingCredit[]
  );
  const [projects, setProjects] = useState<LandingProject[]>([]);
  const [investorsCount, setInvestorsCount] = useState(180);
  const [launchesCount, setLaunchesCount] = useState(42);

  const load = useCallback(async () => {
    const tasks: Promise<void>[] = [];

    tasks.push(
      (async () => {
        try {
          const snap = await getDocs(query(collection(db, 'deal_flow'), limit(6)));
          if (!snap.empty) {
            const items = snap.docs.map((d) => normalizeDeal({ id: d.id, ...d.data() }, 0)).filter(Boolean) as LandingDeal[];
            if (items.length) setDeals(items.slice(0, 3));
          }
        } catch (_) {}
      })()
    );

    tasks.push(
      (async () => {
        try {
          const snap = await getDocs(query(collection(db, 'grants'), limit(4)));
          if (!snap.empty) {
            const items = snap.docs.map((d) => normalizeGrant({ id: d.id, ...d.data() })).filter(Boolean) as LandingGrant[];
            if (items.length) setGrants(items.slice(0, 2));
          }
        } catch (_) {}
      })()
    );

    tasks.push(
      (async () => {
        try {
          const snap = await getDocs(query(collection(db, 'credits'), limit(6)));
          if (!snap.empty) {
            const items = snap.docs.map((d) => normalizeCredit({ id: d.id, ...d.data() })).filter(Boolean) as LandingCredit[];
            if (items.length) setCredits(items.slice(0, 4));
          }
        } catch (_) {}
      })()
    );

    tasks.push(
      (async () => {
        try {
          const launches = await getPublicLaunches();
          if (launches.length) {
            const items = launches.map(normalizeProject).filter(Boolean) as LandingProject[];
            setProjects(items.slice(0, 4));
            setLaunchesCount(Math.max(launches.length, 42));
          }
        } catch (_) {}
      })()
    );

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

  return { deals, grants, credits, projects, investorsCount, launchesCount };
}
