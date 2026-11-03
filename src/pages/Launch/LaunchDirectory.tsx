import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Rocket,
  Search,
  Sparkles,
  ChevronUp,
  Award,
  ShieldCheck,
  Building2,
  Clock,
  LayoutGrid,
  BarChart3,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowRight,
  Star,
  Megaphone,
  Briefcase,
  Share2,
  Users
} from 'lucide-react';
import { getPublicLaunches, voteLaunch, hasUserVoted, getVerifiedLaunchCount, getLaunchComments } from '../../lib/launches';
import { LaunchItem } from '../../types/launch';
import { useAuth } from '../../contexts/AuthContext';
import { safeStorage } from '../../lib/storage';
import MyLaunch from '../Dashboard/MyLaunch';
import { LiveActivityMarquee } from '../../components/ui/LiveActivityMarquee';
import { NumberTicker } from '../../components/ui/NumberTicker';

const CORE_NARRATIVES = ['All', 'AI', 'Web3', 'SaaS', 'Infrastructure'];

const CURATED_INSTITUTIONAL_LAUNCHES: LaunchItem[] = [
  {
    id: 'curated_neurochain_ai',
    slug: 'neurochain-ai',
    founder_id: 'inst_founder_1',
    founder_name: 'Elena Rostova',
    company_name: 'NeuroChain AI',
    tagline: 'Autonomous multi-agent orchestration layer for decentralized data pipelines & LLMs.',
    description: 'Autonomous multi-agent orchestration layer that unifies on-chain intelligence with high-throughput inference nodes.',
    website_url: 'https://raisequity.com/app/neurochain',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'AI',
    twitter_handle: '@neurochain_ai',
    maker_comment: 'Ex-DeepMind research team building institutional decentralized intelligence.',
    launch_tier: 'spotlight',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 142,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    target_keywords: ['AI', 'Agents', 'Infrastructure'],
  },
  {
    id: 'curated_secantx_protocol',
    slug: 'secantx-protocol',
    founder_id: 'inst_founder_2',
    founder_name: 'Marcus Vance',
    company_name: 'SecantX Protocol',
    tagline: 'Zero-knowledge institutional settlement engine for cross-chain liquidity & SAFEs.',
    description: 'Zk-rollup protocol powering atomic settlement between tier-1 custodians and decentralized execution layers.',
    website_url: 'https://raisequity.com/app/secantx',
    logo_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'Web3',
    twitter_handle: '@secantx_zk',
    maker_comment: 'Audited by Trail of Bits. $2.2M Seed round active.',
    launch_tier: 'premium',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 118,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    target_keywords: ['Web3', 'ZK', 'Settlement'],
  },
  {
    id: 'curated_hyperscale_db',
    slug: 'hyperscale-db',
    founder_id: 'inst_founder_3',
    founder_name: 'David Chen',
    company_name: 'HyperScale DB',
    tagline: 'Distributed time-series engine with native vector search & sub-millisecond query.',
    description: 'Ultra-low latency vector and time-series database engineered for high-frequency financial models and AI agents.',
    website_url: 'https://raisequity.com/app/hyperscale',
    logo_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'Infrastructure',
    twitter_handle: '@hyperscale_db',
    maker_comment: 'Serving 400M daily RPC requests across Tier-1 crypto and fin-tech funds.',
    launch_tier: 'spotlight',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 96,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    target_keywords: ['Database', 'Vector', 'Latency'],
  },
  {
    id: 'curated_promptpilot_saas',
    slug: 'promptpilot-saas',
    founder_id: 'inst_founder_4',
    founder_name: 'Sarah Jenkins',
    company_name: 'PromptPilot AI',
    tagline: 'Automated CI/CD prompt regression testing & token-burn reduction platform.',
    description: 'Enterprise prompt validation suite ensuring zero hallucinations before production LLM deployments.',
    website_url: 'https://raisequity.com/app/promptpilot',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'SaaS',
    twitter_handle: '@promptpilot',
    maker_comment: '$42k MRR, +35% MoM, 100+ Enterprise clients.',
    launch_tier: 'standard',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 84,
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    target_keywords: ['SaaS', 'DevTools', 'Testing'],
  },
];

const REAL_CREDITS = [
  { company: "Google Cloud", value: "Up to $350k", desc: "Cloud & Gemini AI Credits" },
  { company: "AWS Activate", value: "$100,000", desc: "Compute, Bedrock & Architecture" },
  { company: "Deel Global", value: "20% Off", desc: "International Payroll & Compliance" },
  { company: "Cloudflare", value: "Up to $250k", desc: "Workers, Pages & Enterprise Security" },
];

export default function LaunchDirectory() {
  const { user } = useAuth();
  const uid = user?.uid || (user as any)?.id || '';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mainTab, setMainTab] = useState<'browse' | 'my-launch'>(
    searchParams.get('tab') === 'my-launch' ? 'my-launch' : 'browse'
  );
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [launches, setLaunches] = useState<LaunchItem[]>(CURATED_INSTITUTIONAL_LAUNCHES);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number; secs: number }>({
    days: 4,
    hours: 18,
    mins: 58,
    secs: 8,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentDay = now.getUTCDay();
      const daysUntilSunday = (7 - currentDay) % 7 || 7;
      const endOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilSunday, 23, 59, 59));
      const diff = Math.max(0, endOfWeek.getTime() - now.getTime());

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, mins, secs });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const publicItems = await getPublicLaunches();
      const combined = [...publicItems];

      for (const curated of CURATED_INSTITUTIONAL_LAUNCHES) {
        if (!combined.some((item) => item.id === curated.id || item.slug === curated.slug)) {
          combined.push(curated);
        }
      }

      if (sortBy === 'votes') {
        combined.sort((a, b) => b.votes_count - a.votes_count);
      } else {
        combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      setLaunches(combined);

      if (uid) {
        const vMap: Record<string, boolean> = {};
        for (const item of combined) {
          const hasV = await hasUserVoted(item.id, uid);
          vMap[item.id] = hasV;
        }
        setVotedMap(vMap);
      }
    } catch (err) {
      console.error('Error loading launches:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [sortBy, uid]);

  const handleProtectedAction = (destination: string) => {
    if (!uid) {
      navigate(`/login?redirect=${encodeURIComponent(destination)}`);
    } else {
      navigate(destination);
    }
  };

  const handleVote = async (e: React.MouseEvent, launchId: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!uid) {
      const guestKey = `rq_guest_voted_${launchId}`;
      const hasGuestVoted = safeStorage.getItem(guestKey) === 'true';
      if (hasGuestVoted) {
        safeStorage.removeItem(guestKey);
        setVotedMap((prev) => ({ ...prev, [launchId]: false }));
        setLaunches((prev) =>
          prev.map((l) => (l.id === launchId ? { ...l, votes_count: Math.max(0, l.votes_count - 1) } : l))
        );
      } else {
        safeStorage.setItem(guestKey, 'true');
        setVotedMap((prev) => ({ ...prev, [launchId]: true }));
        setLaunches((prev) =>
          prev.map((l) => (l.id === launchId ? { ...l, votes_count: l.votes_count + 1 } : l))
        );
      }
      return;
    }

    try {
      const currentVoted = votedMap[launchId];
      // Optimistic update
      setVotedMap((prev) => ({ ...prev, [launchId]: !currentVoted }));
      setLaunches((prev) =>
        prev.map((l) =>
          l.id === launchId
            ? { ...l, votes_count: currentVoted ? Math.max(0, l.votes_count - 1) : l.votes_count + 1 }
            : l
        )
      );

      const success = await voteLaunch(launchId, uid);
      if (!success) {
        // Rollback if failed
        setVotedMap((prev) => ({ ...prev, [launchId]: currentVoted }));
        setLaunches((prev) =>
          prev.map((l) =>
            l.id === launchId
              ? { ...l, votes_count: currentVoted ? l.votes_count + 1 : Math.max(0, l.votes_count - 1) }
              : l
          )
        );
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const hallOfFameLaunches = [...launches]
    .sort((a, b) => b.votes_count - a.votes_count)
    .slice(0, 4);

  const getCategoryCount = (narrative: string) => {
    if (narrative === 'All') return launches.length;
    return launches.filter((l) => l.category.toLowerCase().includes(narrative.toLowerCase())).length;
  };

  const filteredLaunches = launches.filter((l) => {
    if (activeTab !== 'All') {
      if (!l.category.toLowerCase().includes(activeTab.toLowerCase())) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.company_name.toLowerCase().includes(q) ||
      l.tagline.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#090a0d] text-black dark:text-white font-sans flex flex-col justify-start transition-colors duration-150 selection:bg-[#3bd3fd]">
      
      {/* ── LIVE ACTIVITY TICKER ── */}
      <LiveActivityMarquee />

      {/* ── MAIN BENTO CONTAINER (Spacious, Neo-Organic, Zero-Wasted Space) ── */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-start space-y-4 sm:space-y-5">
        
        {/* ── TOP VIEW SELECTOR BAR ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 rounded-full p-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setMainTab('browse'); setSearchParams({}); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-mono text-xs font-black transition-all cursor-pointer ${
                mainTab === 'browse'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <LayoutGrid size={14} /> Directory Showcase
            </button>
            <button
              onClick={() => { setMainTab('my-launch'); setSearchParams({ tab: 'my-launch' }); }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-mono text-xs font-black transition-all cursor-pointer ${
                mainTab === 'my-launch'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <BarChart3 size={14} /> My Launch &amp; Analytics
            </button>
          </div>

          <button
            onClick={() => handleProtectedAction('/launch/submit')}
            className="flex items-center justify-center gap-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-6 py-2.5 rounded-full font-extrabold text-xs transition-all cursor-pointer font-sans shadow-xs active:scale-95"
          >
            <Rocket size={14} /> Submit Startup →
          </button>
        </div>

        {mainTab === 'my-launch' ? (
          <MyLaunch />
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════
                1. HERO BENTO CARD (Weekly Product Launchpad Cohort #42)
               ══════════════════════════════════════════════════════════ */}
            <div className="relative rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-7 sm:p-10 md:p-12 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
              <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-bl from-purple-200/50 via-cyan-200/30 dark:from-purple-900/20 dark:via-cyan-900/15 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-100/60 dark:bg-amber-900/10 rounded-full blur-2xl pointer-events-none" />

              <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-7 flex flex-col items-start text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-[1.5px] mb-6 shadow-xs">
                    <span>WEEKLY PRODUCT LAUNCHPAD • COHORT #42</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl md:text-[58px] font-heading font-black tracking-[-1.5px] leading-[1.05] text-black dark:text-white mb-4">
                    Discover Top Startups. <br />
                    <span className="bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#3b82f6] bg-clip-text text-transparent inline-block">
                      Built by Vetted Founders.
                    </span>
                  </h1>

                  <p className="text-neutral-500 dark:text-neutral-400 text-base sm:text-lg font-medium leading-relaxed max-w-xl mb-8">
                    Vote for the top AI agents, SaaS tools, and Web3 protocols. Winning teams unlock guaranteed partner meetings, $50k angel syndication, and dofollow backlinks.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleProtectedAction('/launch/submit')}
                      className="px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>Submit Your Launch (+50 Credits)</span>
                      <ArrowRight size={15} />
                    </button>

                    <a
                      href="#directory-board"
                      className="px-6 py-3 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      Browse Leaderboard ↓
                    </a>
                  </div>
                </div>

                {/* Right Telemetry Box */}
                <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#18191e] rounded-[24px] p-6 sm:p-7 border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-200/80 dark:border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                      <Rocket size={20} className="text-[#38bdf8]" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-base text-black dark:text-white">Cohort Telemetry</h3>
                      <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Weekly Voting Window</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                      <span className="text-neutral-500">Weekly Active Launches:</span>
                      <span className="font-black text-black dark:text-white">42+ Startups</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                      <span className="text-neutral-500">Votes Cast:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">14,280+ Upvotes</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                      <span className="text-neutral-500">Guaranteed Prize:</span>
                      <span className="text-[#0070F3] font-black">3 Partner Meetings</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                      <span className="text-neutral-500">Backlink Power:</span>
                      <span className="font-black text-black dark:text-white">100% Dofollow (DR 37+)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                2. ROW 2: TOP 3 SPOTLIGHT PODIUM BENTO CARDS
               ══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hallOfFameLaunches.slice(0, 3).map((item, idx) => {
                const podiumColors = [
                  { rank: "#1 SPOTLIGHT", border: "border-amber-400/40", badge: "bg-amber-400/10 text-amber-500", medal: "🥇" },
                  { rank: "#2 RUNNER UP", border: "border-slate-300/40", badge: "bg-slate-200/20 text-slate-400", medal: "🥈" },
                  { rank: "#3 FINALIST", border: "border-amber-600/30", badge: "bg-amber-600/10 text-amber-600", medal: "🥉" },
                ][idx];

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/launch/${item.slug}`)}
                    className={`rounded-[28px] bg-white dark:bg-[#121316] border ${podiumColors.border} p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer group`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-mono text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${podiumColors.badge}`}>
                          {podiumColors.medal} {podiumColors.rank}
                        </span>
                        <span className="font-mono text-xs font-black text-black dark:text-white flex items-center gap-1">
                          <span className="text-emerald-500">▲</span> {item.votes_count}
                        </span>
                      </div>

                      <h3 className="text-xl font-heading font-black text-black dark:text-white mb-1 group-hover:text-[#4f46e5] dark:group-hover:text-[#38bdf8] transition-colors">
                        {item.company_name}
                      </h3>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                        {item.tagline}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>{item.category} • By {item.founder_name}</span>
                      <ChevronUp size={14} className="text-emerald-500" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ══════════════════════════════════════════════════════════
                3. ROW 3: CATEGORY FILTER PILLS & SEARCH BENTO BAR
               ══════════════════════════════════════════════════════════ */}
            <div id="directory-board" className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 rounded-[24px] p-3 shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {CORE_NARRATIVES.map((narrative) => {
                  const count = getCategoryCount(narrative);
                  const isSelected = activeTab === narrative;
                  return (
                    <button
                      key={narrative}
                      onClick={() => setActiveTab(narrative)}
                      className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-2 ${
                        isSelected
                          ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                          : 'bg-neutral-50 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-white/5 hover:border-black'
                      }`}
                    >
                      <span>{narrative === 'All' ? 'All Narratives' : narrative}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isSelected
                          ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                          : 'bg-neutral-200/70 dark:bg-[#25262e] text-neutral-600 dark:text-neutral-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-56">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={13} />
                  <input
                    type="text"
                    placeholder="Search launches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 rounded-full text-xs font-mono text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs font-mono"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 rounded-full p-1 shrink-0 text-xs font-mono">
                  <button
                    onClick={() => setSortBy('votes')}
                    className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      sortBy === 'votes'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'text-neutral-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Top
                  </button>
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                      sortBy === 'recent'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'text-neutral-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Recent
                  </button>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                4. ROW 4: DIRECTORY GRID (High-Density 2x2 Bento Cards)
               ══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredLaunches.map((item, idx) => {
                const hasVoted = votedMap[item.id];
                const rankNumber = idx + 1;

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/launch/${item.slug}`)}
                    className="p-4 rounded-[20px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 hover:border-black/30 dark:hover:border-white/20 transition-all flex items-start justify-between gap-3 group cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-heading font-black text-base text-black dark:text-white group-hover:text-[#4f46e5] dark:group-hover:text-[#38bdf8] transition-colors truncate">
                          {item.company_name}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-neutral-100 dark:bg-[#1f2026] text-neutral-600 dark:text-neutral-300 rounded-md">
                          {item.category}
                        </span>
                        {item.badgeVerified && (
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center gap-1">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-2 font-medium">
                        {item.tagline}
                      </p>

                      <div className="text-[10px] font-mono text-neutral-400">
                        By <strong className="text-black dark:text-white">{item.founder_name}</strong> • {item.maker_comment}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleVote(e, item.id)}
                      className={`flex flex-col items-center justify-center min-w-[50px] py-2 px-2.5 rounded-xl border font-mono transition-all cursor-pointer shrink-0 ${
                        hasVoted
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-neutral-50 dark:bg-[#18191e] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-neutral-200 dark:border-white/10 text-black dark:text-white'
                      }`}
                    >
                      <ChevronUp size={14} className={hasVoted ? 'text-emerald-400' : 'text-current'} />
                      <span className="text-xs font-black">{item.votes_count}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ══════════════════════════════════════════════════════════
                5. ROW 5: DUAL BENTO - SOURCE & EARN (Image 7) + FREE CREDITS
               ══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              
              {/* CARD 5A: Source & Earn (Image 7 Exact Match) */}
              <div className="lg:col-span-2 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="max-w-md">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-mono text-[9px] font-black uppercase tracking-wider mb-2">
                      DECENTRALIZED SCOUT ENGINE
                    </div>
                    <h2 className="text-2xl sm:text-[26px] font-heading font-black text-black dark:text-white tracking-tight mb-2 leading-tight">
                      Source &amp; Earn
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                      Earn reputation and carry by sourcing institutional-grade protocols. Over $14B in pipeline already managed by our scout decentralized engine.
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">AK</div>
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">DC</div>
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">ER</div>
                        <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-[#121316]">+120</div>
                      </div>
                      <span className="font-mono text-xs text-neutral-400">120+ Verified Scouts</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto p-5 sm:p-6 rounded-[22px] bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/10 text-center shrink-0 min-w-[150px] shadow-xs">
                    <div className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight leading-none">
                      $<NumberTicker value={14} />B+
                    </div>
                    <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 mt-1.5">
                      PIPELINE MANAGED
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
                  <span className="font-mono text-xs text-neutral-400">Carry Share: <strong className="text-black dark:text-white">Up to 20% Scout Carry</strong></span>
                  <button
                    onClick={() => handleProtectedAction('/launch/submit')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95 shadow-xs"
                  >
                    <span>Become a Scout</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* CARD 5B: Free Credits ($500k Perks) */}
              <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-xl font-heading font-black text-black dark:text-white tracking-tight">
                      Free Credits
                    </h3>
                    <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center">
                      <Star size={13} fill="currentColor" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {REAL_CREDITS.map((c, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between">
                        <div>
                          <div className="font-heading font-black text-xs text-black dark:text-white">{c.company}</div>
                          <div className="text-[10px] font-mono text-neutral-400 truncate max-w-[140px]">{c.desc}</div>
                        </div>
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[9px] font-bold">
                          {c.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to="/founders"
                  className="w-full py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
                >
                  Claim $500k+ Perks →
                </Link>
              </div>

            </div>

            {/* ══════════════════════════════════════════════════════════
                6. ROW 6: TRIPLE BENTO (Market + Hire + SEO Dofollow Boost)
               ══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              
              {/* CARD 6A: Market your Web3 product */}
              <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/5 flex items-center justify-center text-black dark:text-white mb-3">
                    <Megaphone size={18} />
                  </div>

                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[9px] font-black uppercase tracking-wider mb-2">
                    3,000+ READERS
                  </div>

                  <h3 className="text-lg font-heading font-black text-black dark:text-white tracking-tight mb-2">
                    Market your Web3 product
                  </h3>

                  <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-4">
                    Get in front of a highly targeted audience of builders, check-writers, and ecosystem scouts.
                  </p>
                </div>

                <Link
                  to="/service-providers"
                  className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
                >
                  Sponsor Now ↗
                </Link>
              </div>

              {/* CARD 6B: Hire in Web3 */}
              <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/5 flex items-center justify-center text-black dark:text-white mb-3">
                    <Briefcase size={18} />
                  </div>

                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1e1f26] text-neutral-600 dark:text-neutral-300 font-mono text-[9px] font-black uppercase tracking-wider mb-2">
                    TALENT RECRUITING
                  </div>

                  <h3 className="text-lg font-heading font-black text-black dark:text-white tracking-tight mb-2">
                    Hire in Web3
                  </h3>

                  <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-4">
                    Access vetted crypto engineers, token designers, and full-stack growth leads for your protocol.
                  </p>
                </div>

                <Link
                  to="/service-providers"
                  className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
                >
                  Explore Talent ↗
                </Link>
              </div>

              {/* CARD 6C: DR Booster SEO Dofollow Backlinks */}
              <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#4f46e5] dark:text-[#805ad5] font-black">
                      DR Booster
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1e1f26] text-black dark:text-white">
                      DR 37+
                    </span>
                  </div>

                  <h3 className="text-lg font-heading font-black text-black dark:text-white tracking-tight mb-2">
                    Dofollow Authority Backlinks
                  </h3>

                  <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-4">
                    Every approved project on Raisequity receives permanent dofollow authority backlinks, indexed directly by search engines.
                  </p>
                </div>

                <button
                  onClick={() => handleProtectedAction('/launch/submit')}
                  className="w-full py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block shadow-xs"
                >
                  Launch Now (+50 Credits) →
                </button>
              </div>

            </div>
          </>
        )}

      </main>
    </div>
  );
}
