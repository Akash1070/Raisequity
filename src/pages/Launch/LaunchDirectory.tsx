import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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
  Users,
  Check,
  MessageSquare,
  Flame,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  ExternalLink,
  ChevronDown,
  X
} from 'lucide-react';
import { getPublicLaunches, voteLaunch, hasUserVoted, getVerifiedLaunchCount, getLaunchComments } from '../../lib/launches';
import { LaunchItem } from '../../types/launch';
import { useAuth } from '../../contexts/AuthContext';
import { safeStorage } from '../../lib/storage';
import MyLaunch from '../Dashboard/MyLaunch';
import { LiveActivityMarquee } from '../../components/ui/LiveActivityMarquee';
import { NumberTicker } from '../../components/ui/NumberTicker';
import { usePageMeta } from '../../hooks/usePageMeta';

export interface ExtendedLaunchItem extends LaunchItem {
  rating?: number;
  review_count?: number;
  comments_count?: number;
  icon_symbol?: string;
  icon_bg?: string;
}

const EXTENDED_NARRATIVES = [
  'All',
  'AI',
  'Web3',
  'SaaS',
  'Infrastructure',
  'DeFi',
  'DevTools',
  'Fintech',
  'Consumer',
  'Security',
  'Open Source'
];

const PRODUCT_STAGES = [
  'All Stages',
  'Mainnet Live',
  'Public Beta',
  'Raising Seed',
  'Pre-Seed'
];

const ECOSYSTEM_CHAINS = [
  'All Chains',
  'Ethereum',
  'Solana',
  'Base',
  'Arbitrum',
  'Cross-Chain'
];

const CURATED_LAUNCHES: ExtendedLaunchItem[] = [
  {
    id: 'curated_notelify',
    slug: 'notelify',
    founder_id: 'maker_notelify',
    founder_name: 'David K.',
    company_name: 'Notelify',
    tagline: 'Your complete AI study workspace for PDFs, videos & lectures',
    description: 'Your Complete AI study workspace for PDFs, videos & lectures. Summarize, transcribe, and chat with all your research materials in one unified canvas.',
    website_url: 'https://notelify.ai',
    logo_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'AI',
    twitter_handle: '@notelify_ai',
    maker_comment: 'Built for students, researchers and analysts who read hundreds of pages daily.',
    launch_tier: 'spotlight',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 28,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    target_keywords: ['Productivity', 'AI', 'Other'],
    product_stage: 'Public Beta',
    rating: 5.0,
    review_count: 4,
    comments_count: 1,
    icon_symbol: '📖',
    icon_bg: 'bg-neutral-900 text-white'
  },
  {
    id: 'curated_witness',
    slug: 'witness-deepfake-detect',
    founder_id: 'maker_witness',
    founder_name: 'Alex Rivera',
    company_name: 'Witness',
    tagline: 'Detect AI-generated images, videos and deepfakes in seconds',
    description: 'Forensic deepfake and AI-generated image verification engine. Integrates directly into browser extensions and enterprise trust & safety workflows.',
    website_url: 'https://witness.ai',
    logo_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'AI',
    twitter_handle: '@witness_ai',
    maker_comment: 'Trained on 40M+ synthetic artifacts with sub-second browser verification.',
    launch_tier: 'spotlight',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 23,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    target_keywords: ['AI', 'Chrome Extension', 'Security'],
    product_stage: 'Mainnet Live',
    rating: 5.0,
    review_count: 0,
    comments_count: 0,
    icon_symbol: '[ • ]',
    icon_bg: 'bg-white text-black border border-neutral-300'
  },
  {
    id: 'curated_creditbar',
    slug: 'creditbar-mac',
    founder_id: 'maker_creditbar',
    founder_name: 'Liam Vance',
    company_name: 'CreditBar',
    tagline: 'What came in. What went out. One menu bar.',
    description: 'Lightweight Mac menubar utility tracking cash flow, runway burn, and corporate card balances with zero-latency notifications.',
    website_url: 'https://creditbar.app',
    logo_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'SaaS',
    twitter_handle: '@creditbar_app',
    maker_comment: 'Never log into 5 different banking dashboards again.',
    launch_tier: 'premium',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 15,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    target_keywords: ['Productivity', 'Finance', 'SaaS'],
    product_stage: 'Public Beta',
    rating: 5.0,
    review_count: 0,
    comments_count: 0,
    icon_symbol: '📊',
    icon_bg: 'bg-slate-900 text-cyan-400'
  },
  {
    id: 'curated_the_launch_directory',
    slug: 'the-launch-directory',
    founder_id: 'maker_tld',
    founder_name: 'Sophie Martin',
    company_name: 'The Launch Directory',
    tagline: 'Submit your startup to the launch directory that keeps the record',
    description: 'The permanent record for indie hackers and early stage startups. Indexed dofollow authority backlinks and automated discovery syndication.',
    website_url: 'https://thelaunchdirectory.com',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'SaaS',
    twitter_handle: '@launchdirectory',
    maker_comment: 'Guaranteed permanent indexing and fast-pass review within 24 hours.',
    launch_tier: 'standard',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 12,
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    target_keywords: ['Other', 'Advertising', 'Marketing'],
    product_stage: 'Mainnet Live',
    rating: 5.0,
    review_count: 0,
    comments_count: 0,
    icon_symbol: 'L',
    icon_bg: 'bg-neutral-900 text-white'
  },
  {
    id: 'curated_voxoria',
    slug: 'voxoria-ai',
    founder_id: 'maker_voxoria',
    founder_name: 'Chloe Zhang',
    company_name: 'Voxoria',
    tagline: 'Marketing data for AI agents',
    description: 'Real-time telemetry and programmatic analytics engine enabling autonomous marketing and sales agents to self-optimize campaigns.',
    website_url: 'https://voxoria.ai',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'AI',
    twitter_handle: '@voxoria_ai',
    maker_comment: 'Serving 45k agent queries per minute across 12 programmatic networks.',
    launch_tier: 'standard',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 12,
    created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    target_keywords: ['AI', 'Analytics Tool', 'Other'],
    product_stage: 'Raising Seed',
    rating: 5.0,
    review_count: 0,
    comments_count: 1,
    icon_symbol: 'V',
    icon_bg: 'bg-neutral-900 text-[#a3e635]'
  },
  {
    id: 'curated_chmonitor',
    slug: 'chmonitor',
    founder_id: 'maker_chm',
    founder_name: 'Roman K.',
    company_name: 'chmonitor',
    tagline: 'Monitor ClickHouse with ease',
    description: 'Sub-second real-time observability and query profiling dashboard engineered specifically for high-throughput ClickHouse clusters.',
    website_url: 'https://chmonitor.io',
    logo_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'Infrastructure',
    twitter_handle: '@chmonitor',
    maker_comment: 'Zero agent footprint, connects via native ClickHouse HTTP interface.',
    launch_tier: 'standard',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 11,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    target_keywords: ['Analytics Tool', 'AI', 'DevTool'],
    product_stage: 'Mainnet Live',
    rating: 5.0,
    review_count: 0,
    comments_count: 0,
    icon_symbol: '📶',
    icon_bg: 'bg-orange-50 text-orange-600'
  },
  {
    id: 'curated_tapmap',
    slug: 'tapmap',
    founder_id: 'maker_tapmap',
    founder_name: 'Maya Lin',
    company_name: 'TapMap',
    tagline: 'A social network built on maps: where to go and with whom',
    description: 'Hyperlocal social map platform connecting IRL friends, spontaneous meetups, and real-time venue recommendations.',
    website_url: 'https://tapmap.app',
    logo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'Consumer',
    twitter_handle: '@tapmap_app',
    maker_comment: '12k weekly active university students across NYC and SF.',
    launch_tier: 'standard',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 9,
    created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    target_keywords: ['Social Networking', 'Mobile App'],
    product_stage: 'Public Beta',
    rating: 5.0,
    review_count: 0,
    comments_count: 0,
    icon_symbol: '🗺️',
    icon_bg: 'bg-sky-500 text-white'
  },
  {
    id: 'curated_trackmynetworth',
    slug: 'trackmynetworth',
    founder_id: 'maker_tmnw',
    founder_name: 'Arjun Verma',
    company_name: 'TrackMyNetWorth',
    tagline: 'Family net worth tracker for India',
    description: 'Unified multi-asset portfolio tracker supporting bank accounts, equities, real estate, and crypto with privacy-first encryption.',
    website_url: 'https://trackmynetworth.in',
    logo_url: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'Fintech',
    twitter_handle: '@trackmynetworth',
    maker_comment: 'End-to-end encrypted, zero data selling, automated bank sync via Account Aggregator.',
    launch_tier: 'standard',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 7,
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
    target_keywords: ['Finance', 'Productivity', 'Other'],
    product_stage: 'Public Beta',
    rating: 5.0,
    review_count: 2,
    comments_count: 0,
    icon_symbol: '▲',
    icon_bg: 'bg-indigo-950 text-indigo-300'
  },
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
    votes_count: 6,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    target_keywords: ['AI', 'Agents', 'Infrastructure'],
    product_stage: 'Raising Seed',
    rating: 5.0,
    review_count: 1,
    comments_count: 2,
    icon_symbol: '⚡',
    icon_bg: 'bg-purple-900 text-cyan-300'
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
    votes_count: 5,
    created_at: new Date(Date.now() - 3600000 * 34).toISOString(),
    target_keywords: ['Web3', 'ZK', 'Settlement', 'DeFi'],
    product_stage: 'Mainnet Live',
    rating: 5.0,
    review_count: 0,
    comments_count: 1,
    icon_symbol: '⬡',
    icon_bg: 'bg-emerald-950 text-emerald-400'
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
    votes_count: 4,
    created_at: new Date(Date.now() - 3600000 * 38).toISOString(),
    target_keywords: ['Database', 'Vector', 'Latency'],
    product_stage: 'Public Beta',
    rating: 5.0,
    review_count: 0,
    comments_count: 0,
    icon_symbol: '⚡',
    icon_bg: 'bg-blue-950 text-blue-400'
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
    votes_count: 3,
    created_at: new Date(Date.now() - 3600000 * 42).toISOString(),
    target_keywords: ['SaaS', 'DevTools', 'Testing'],
    product_stage: 'Pre-Seed',
    rating: 5.0,
    review_count: 0,
    comments_count: 0,
    icon_symbol: '✈',
    icon_bg: 'bg-amber-950 text-amber-400'
  }
];

const LAST_WEEKS_BEST = [
  {
    name: 'TicTravelDesk',
    medal: '🥇',
    tagline: 'Plan your next adventure effortlessly',
    votes: 40,
    icon: '✈️',
    bg: 'bg-blue-50 dark:bg-[#1a2230] text-blue-600'
  },
  {
    name: 'Tilemode',
    medal: '🥈',
    tagline: 'The keyboard cockpit for your Mac.',
    votes: 34,
    icon: '⊞',
    bg: 'bg-neutral-100 dark:bg-[#1e1f24] text-neutral-800 dark:text-neutral-200'
  },
  {
    name: 'ZelNum',
    medal: '🥉',
    tagline: 'Bulk WhatsApp, Phone & Email...',
    votes: 32,
    icon: '⚡',
    bg: 'bg-purple-50 dark:bg-[#251733] text-purple-600'
  }
];

const REAL_CREDITS = [
  { company: "Google Cloud", value: "Up to $350k", desc: "Cloud & Gemini AI Credits" },
  { company: "AWS Activate", value: "$100,000", desc: "Compute, Bedrock & Architecture" },
  { company: "Deel Global", value: "20% Off", desc: "International Payroll & Compliance" },
  { company: "Cloudflare", value: "Up to $250k", desc: "Workers, Pages & Enterprise Security" },
];

export default function LaunchDirectory() {
  usePageMeta({
    title: 'Launch Directory - Raisequity | Discover Top Startups',
    description: 'Vote for the top AI agents, SaaS tools, and Web3 protocols. Winning teams unlock guaranteed partner meetings, $50k angel syndication, and dofollow backlinks.',
    canonicalPath: '/launch',
    mdAlternate: '/launch.md',
  });
  const { user } = useAuth();
  const uid = user?.uid || (user as any)?.id || '';
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const [searchParams, setSearchParams] = useSearchParams();

  const [mainTab, setMainTab] = useState<'browse' | 'my-launch'>(
    searchParams.get('tab') === 'my-launch' ? 'my-launch' : 'browse'
  );
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'votes' | 'trending' | 'recent'>('votes');
  const [selectedStage, setSelectedStage] = useState<string>('All Stages');
  const [selectedChain, setSelectedChain] = useState<string>('All Chains');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [launches, setLaunches] = useState<ExtendedLaunchItem[]>(CURATED_LAUNCHES);
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
      const combined: ExtendedLaunchItem[] = [...publicItems];

      for (const curated of CURATED_LAUNCHES) {
        if (!combined.some((item) => item.id === curated.id || item.slug === curated.slug)) {
          combined.push(curated);
        }
      }

      if (sortBy === 'votes') {
        combined.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
      } else if (sortBy === 'trending') {
        combined.sort((a, b) => ((b.votes_count || 0) * 1.5 + (b.review_count || 0)) - ((a.votes_count || 0) * 1.5 + (a.review_count || 0)));
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
          prev.map((l) => (l.id === launchId ? { ...l, votes_count: Math.max(0, (l.votes_count || 0) - 1) } : l))
        );
      } else {
        safeStorage.setItem(guestKey, 'true');
        setVotedMap((prev) => ({ ...prev, [launchId]: true }));
        setLaunches((prev) =>
          prev.map((l) => (l.id === launchId ? { ...l, votes_count: (l.votes_count || 0) + 1 } : l))
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
            ? { ...l, votes_count: currentVoted ? Math.max(0, (l.votes_count || 0) - 1) : (l.votes_count || 0) + 1 }
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
              ? { ...l, votes_count: currentVoted ? (l.votes_count || 0) + 1 : Math.max(0, (l.votes_count || 0) - 1) }
              : l
          )
        );
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const getCategoryCount = (narrative: string) => {
    if (narrative === 'All') return launches.length;
    return launches.filter((l) => {
      const catMatch = l.category.toLowerCase().includes(narrative.toLowerCase());
      const kwMatch = l.target_keywords?.some((k) => k.toLowerCase().includes(narrative.toLowerCase()));
      return catMatch || kwMatch;
    }).length;
  };

  const activeFiltersCount = (selectedStage !== 'All Stages' ? 1 : 0) + (selectedChain !== 'All Chains' ? 1 : 0);

  const resetAllFilters = () => {
    setActiveTab('All');
    setSelectedStage('All Stages');
    setSelectedChain('All Chains');
    setSearchQuery('');
  };

  const filteredLaunches = launches.filter((l) => {
    // Narrative Category filter
    if (activeTab !== 'All') {
      const catMatch = l.category.toLowerCase().includes(activeTab.toLowerCase());
      const kwMatch = l.target_keywords?.some((k) => k.toLowerCase().includes(activeTab.toLowerCase()));
      if (!catMatch && !kwMatch) return false;
    }

    // Product Stage filter
    if (selectedStage !== 'All Stages') {
      if (l.product_stage !== selectedStage) return false;
    }

    // Ecosystem / Chain filter
    if (selectedChain !== 'All Chains') {
      const kw = l.target_keywords || [];
      const desc = `${l.tagline} ${l.description}`.toLowerCase();
      const chainQuery = selectedChain.toLowerCase();
      const match = kw.some((k) => k.toLowerCase().includes(chainQuery)) || desc.includes(chainQuery);
      if (!match) return false;
    }

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.company_name.toLowerCase().includes(q) ||
      l.tagline.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.target_keywords?.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#090a0d] text-black dark:text-white font-sans flex flex-col justify-start transition-colors duration-150 selection:bg-[#3bd3fd]">
      
      {/* ── LIVE ACTIVITY TICKER ── */}
      {!isDashboard && <LiveActivityMarquee />}

      {/* ── MAIN CONTAINER ── */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-start space-y-6">
        
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
            onClick={() => handleProtectedAction('/dashboard/launch/submit')}
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
                1. HEADER / HERO (DASHBOARD COMPACT VS PUBLIC HERO)
               ══════════════════════════════════════════════════════════ */}
            {isDashboard ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e8e6df] dark:border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-black uppercase tracking-wider mb-2">
                    <Rocket size={12} className="text-[#0070F3]" />
                    <span>VETTED PRODUCT LAUNCHES &amp; LEADERBOARD</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-black dark:text-white">
                    Product Launches &amp; Leaderboard
                  </h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                    Explore live product launches built by vetted founders. Vote on top products or launch your own to get discoverable by 180+ partner VCs and earn 50 credits.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleProtectedAction('/dashboard/launch/submit')}
                    className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Rocket size={14} />
                    <span>Submit Launch (+50 Credits)</span>
                  </button>
                </div>
              </div>
            ) : (
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
                        onClick={() => handleProtectedAction('/dashboard/launch/submit')}
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
                        <span className="text-neutral-500">Active Startups:</span>
                        <span className="font-black text-black dark:text-white">{launches.length} Startups</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                        <span className="text-neutral-500">Votes Cast:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">
                          {launches.reduce((sum, item) => sum + (item.votes_count || 0), 0)} Upvotes
                        </span>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                        <span className="text-neutral-500">Guaranteed Prize:</span>
                        <span className="text-[#0070F3] font-black">3 Partner Meetings</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                        <span className="text-neutral-500">Backlink Power:</span>
                        <span className="font-black text-black dark:text-white">100% Dofollow Authority Backlink</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                2. MAIN DUAL-COLUMN DIRECTORY BOARD (IMAGE 1 + IMAGE 3 + IMAGE 5)
               ══════════════════════════════════════════════════════════ */}
            <div id="directory-board" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* ── LEFT COLUMN (8 cols): FILTER BAR + RANKED LEADERBOARD ── */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* ── IMAGE 5: OVERHAULED ADVANCED FILTER BAR ── */}
                <div className="bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 rounded-[24px] p-3.5 shadow-xs space-y-3">
                  
                  {/* Row A: Category Pills Carousel (Completely Scrollbar-Free) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {EXTENDED_NARRATIVES.map((narrative) => {
                      const count = getCategoryCount(narrative);
                      const isSelected = activeTab === narrative;
                      return (
                        <button
                          key={narrative}
                          onClick={() => setActiveTab(narrative)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                            isSelected
                              ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                              : 'bg-neutral-50 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-white/5 hover:border-black/50 dark:hover:border-white/30'
                          }`}
                        >
                          <span>{narrative === 'All' ? 'All Narratives' : narrative}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
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

                  {/* Row B: Search Bar, Sort Toggles & Advanced Filter Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-neutral-100 dark:border-white/5">
                    
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={13} />
                      <input
                        type="text"
                        placeholder="Search by name, tagline, or keyword..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 rounded-full text-xs font-mono text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white text-xs font-mono p-1 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Controls: Sort Buttons + Advanced Filter Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      
                      {/* Sort Pill Group */}
                      <div className="flex items-center bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 rounded-full p-1 text-xs font-mono">
                        <button
                          onClick={() => setSortBy('votes')}
                          className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                            sortBy === 'votes'
                              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                              : 'text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          Top
                        </button>
                        <button
                          onClick={() => setSortBy('trending')}
                          className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                            sortBy === 'trending'
                              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                              : 'text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          Trending
                        </button>
                        <button
                          onClick={() => setSortBy('recent')}
                          className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                            sortBy === 'recent'
                              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                              : 'text-neutral-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          Recent
                        </button>
                      </div>

                      {/* Advanced Filters Dropdown Button */}
                      <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer ${
                          showAdvancedFilters || activeFiltersCount > 0
                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                            : 'bg-neutral-50 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-white/5 hover:border-black/50'
                        }`}
                        title="Toggle Stage & Ecosystem Filters"
                      >
                        <SlidersHorizontal size={13} />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFiltersCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                            {activeFiltersCount}
                          </span>
                        )}
                        <ChevronDown size={12} className={`transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                      </button>

                    </div>

                  </div>

                  {/* Row C: Collapsible Advanced Filters Drawer */}
                  {showAdvancedFilters && (
                    <div className="pt-3 border-t border-neutral-100 dark:border-white/5 space-y-3 font-mono text-xs">
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        {/* Stage Selector */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-neutral-400 font-bold uppercase text-[10px]">Stage:</span>
                          {PRODUCT_STAGES.map((st) => (
                            <button
                              key={st}
                              onClick={() => setSelectedStage(st)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                                selectedStage === st
                                  ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                                  : 'bg-neutral-50 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-white/5 hover:border-black/40'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>

                        {/* Reset button */}
                        {activeFiltersCount > 0 && (
                          <button
                            onClick={resetAllFilters}
                            className="text-red-500 hover:text-red-600 font-bold text-[11px] underline cursor-pointer shrink-0"
                          >
                            Reset filters
                          </button>
                        )}
                      </div>

                      {/* Ecosystem / Chain Selector */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-neutral-400 font-bold uppercase text-[10px]">Chain:</span>
                        {ECOSYSTEM_CHAINS.map((chain) => (
                          <button
                            key={chain}
                            onClick={() => setSelectedChain(chain)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                              selectedChain === chain
                                ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                                : 'bg-neutral-50 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-white/5 hover:border-black/40'
                            }`}
                          >
                            {chain}
                          </button>
                        ))}
                      </div>

                    </div>
                  )}

                </div>

                {/* ── IMAGE 1: HIGH-DENSITY RANKED LEADERBOARD LIST ── */}
                <div className="space-y-3">
                  {filteredLaunches.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#121316] rounded-2xl border border-neutral-200/80 dark:border-white/5 p-6">
                      <p className="text-neutral-500 dark:text-neutral-400 font-mono text-sm mb-3">
                        No launches match your current filters.
                      </p>
                      <button
                        onClick={resetAllFilters}
                        className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    filteredLaunches.map((item, idx) => {
                      const hasVoted = votedMap[item.id];
                      const rankNumber = idx + 1;
                      const isTop1 = rankNumber === 1;
                      const isTop2 = rankNumber === 2;
                      const isTop3 = rankNumber === 3;

                      return (
                        <React.Fragment key={item.id}>
                          
                          {/* ── IMAGE 1: INLINE SPONSORED BANNER (BETWEEN RANK #3 AND #4) ── */}
                          {rankNumber === 4 && (
                            <a
                              href="https://t.me/akash_kumar107"
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-2xl bg-gradient-to-r from-[#fff7f0] via-[#fef4ea] to-[#fffaf5] dark:from-[#1e1915] dark:via-[#261f1a] dark:to-[#1a1714] border border-[#f5d7b5] dark:border-amber-500/20 p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:border-[#ea580c] hover:shadow-md cursor-pointer group"
                            >
                              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                {/* SPONSORED vertical label */}
                                <span className="font-mono text-[9px] font-black uppercase tracking-[2px] text-amber-700/80 dark:text-amber-400 [writing-mode:vertical-lr] rotate-180 hidden sm:block border-r border-amber-300/40 dark:border-amber-500/20 pr-2 select-none">
                                  SPONSORED
                                </span>

                                <div className="min-w-0">
                                  <div className="sm:hidden mb-1">
                                    <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                                      SPONSORED
                                    </span>
                                  </div>
                                  <h3 className="font-heading font-black text-sm sm:text-base text-black dark:text-white leading-tight mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                    Launch once. Rank on Google with AI SEO on autopilot.
                                  </h3>
                                  <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                                    — LAUNCHRANKED <span className="hidden sm:inline">• Book sponsor spot → 4,800+ founders &amp; angels</span>
                                  </p>
                                </div>
                              </div>

                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#ff6b4a] to-[#ff3b20] text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0 group-hover:scale-105 transition-transform">
                                <TrendingUp size={24} strokeWidth={2.5} />
                              </div>
                            </a>
                          )}

                          {/* ── IMAGE 1: RANKED STARTUP ROW ── */}
                          <div
                            onClick={() => navigate(`/launch/${item.slug}`)}
                            className="rounded-2xl bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 hover:border-black/30 dark:hover:border-white/20 p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] group cursor-pointer"
                          >
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                              
                              {/* Rank Badge */}
                              <div className="shrink-0 w-7 sm:w-8 flex items-center justify-center">
                                {isTop1 ? (
                                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/40 flex items-center justify-center font-mono font-black text-xs" title="#1 Weekly Leader">
                                    👑 1
                                  </span>
                                ) : isTop2 ? (
                                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200/80 text-slate-500 border border-slate-300 flex items-center justify-center font-mono font-black text-xs" title="#2 Runner Up">
                                    🥈 2
                                  </span>
                                ) : isTop3 ? (
                                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-600/15 text-amber-600 border border-amber-600/30 flex items-center justify-center font-mono font-black text-xs" title="#3 Finalist">
                                    🥉 3
                                  </span>
                                ) : (
                                  <span className="font-mono text-xs font-bold text-neutral-400">
                                    #{rankNumber}
                                  </span>
                                )}
                              </div>

                              {/* App Logo Avatar */}
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.icon_bg || 'bg-neutral-100 dark:bg-[#1c1d22] text-black dark:text-white'} border border-neutral-200/80 dark:border-white/5 overflow-hidden shrink-0 flex items-center justify-center font-heading font-black text-base shadow-2xs`}>
                                {item.logo_url && !item.logo_url.includes('unsplash') ? (
                                  <img src={item.logo_url} alt={item.company_name} className="w-full h-full object-cover" />
                                ) : item.icon_symbol ? (
                                  <span className="text-lg font-black">{item.icon_symbol}</span>
                                ) : (
                                  <span>{item.company_name.slice(0, 2).toUpperCase()}</span>
                                )}
                              </div>

                              {/* Product Information */}
                              <div className="min-w-0 flex-1">
                                
                                {/* Title Line + Yellow Checkmark Badge */}
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  <span className="font-heading font-black text-sm sm:text-base text-black dark:text-white group-hover:text-[#4f46e5] dark:group-hover:text-[#38bdf8] transition-colors truncate">
                                    {item.company_name}
                                  </span>
                                  {item.badgeVerified && (
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-black shrink-0" title="Verified Product">
                                      <Check size={10} strokeWidth={3.5} />
                                    </span>
                                  )}
                                  {item.product_stage && (
                                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-md bg-neutral-100 dark:bg-[#1e1f26] text-neutral-500 hidden sm:inline">
                                      {item.product_stage}
                                    </span>
                                  )}
                                </div>

                                {/* One-line Tagline */}
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 font-medium leading-relaxed mb-1.5">
                                  {item.tagline}
                                </p>

                                {/* Meta Line: Stars, Comments, Tags */}
                                <div className="flex items-center gap-2.5 text-[11px] font-mono text-neutral-400 flex-wrap">
                                  {/* Star Rating */}
                                  <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                                    <Star size={11} className="text-amber-400 fill-amber-400" />
                                    <span>{item.rating ? item.rating.toFixed(1) : '5.0'}</span>
                                    {item.review_count && item.review_count > 0 ? (
                                      <>
                                        <span>·</span>
                                        <span>{item.review_count}</span>
                                      </>
                                    ) : (
                                      <span className="text-neutral-400">· Review</span>
                                    )}
                                  </span>

                                  {/* Comments */}
                                  <span className="flex items-center gap-1">
                                    <MessageSquare size={11} />
                                    <span>{item.comments_count || 0}</span>
                                  </span>

                                  {/* Tags */}
                                  <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">|</span>
                                  <span className="text-[10px] text-neutral-400 truncate max-w-[200px]">
                                    {item.target_keywords?.slice(0, 3).join(', ') || item.category}
                                  </span>
                                </div>

                              </div>

                            </div>

                            {/* Upvote Button on Right */}
                            <button
                              onClick={(e) => handleVote(e, item.id)}
                              className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[54px] py-2 sm:py-2.5 px-3 rounded-2xl border font-mono transition-all cursor-pointer shrink-0 ${
                                hasVoted
                                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                                  : 'bg-white dark:bg-[#18191e] hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200/90 dark:border-white/10 text-neutral-700 dark:text-neutral-200'
                              }`}
                            >
                              <ChevronUp size={16} strokeWidth={2.5} className={hasVoted ? 'text-emerald-400' : 'text-current'} />
                              <span className="text-xs sm:text-sm font-black">{item.votes_count}</span>
                            </button>

                          </div>

                        </React.Fragment>
                      );
                    })
                  )}
                </div>

              </div>

              {/* ── RIGHT COLUMN (4 cols): IMAGE 3 SIDEBAR WIDGETS ── */}
              <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
                
                {/* ── IMAGE 3 TOP CARD: YOUR AD HERE ── */}
                <div className="rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-[#1a1b20] border border-neutral-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3 text-neutral-800 dark:text-neutral-200 shadow-2xs">
                    <Megaphone size={20} />
                  </div>
                  <h3 className="font-heading font-black text-base text-black dark:text-white mb-1">
                    Your ad here
                  </h3>
                  <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-4">
                    From $29 per ISO week
                  </p>
                  <a
                    href="https://t.me/akash_kumar107"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-xs transition-all active:scale-95 shadow-xs"
                  >
                    <span>Book Sponsor Spot</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>

                {/* ── IMAGE 3 BOTTOM CARD: LAST WEEK'S BEST ── */}
                <div className="rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-neutral-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏆</span>
                      <h3 className="font-heading font-black text-sm text-black dark:text-white">
                        Last week's best
                      </h3>
                    </div>
                    <a
                      href="#directory-board"
                      className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer text-sm"
                    >
                      →
                    </a>
                  </div>

                  <div className="space-y-3.5">
                    {LAST_WEEKS_BEST.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 group cursor-pointer">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-xl ${item.bg} border border-neutral-200/80 dark:border-white/5 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs`}>
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-heading font-black text-xs text-black dark:text-white group-hover:text-[#4f46e5] dark:group-hover:text-[#38bdf8] transition-colors truncate">
                                {item.name}
                              </span>
                              <span className="text-[11px]">{item.medal}</span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                              {item.tagline}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400 shrink-0">
                          <Flame size={13} className="text-orange-500 fill-orange-500" />
                          <span>{item.votes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── COHORT PRIZE & TELEMETRY QUICK CARD ── */}
                <div className="rounded-[24px] bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/10 p-5 shadow-xs space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80 dark:border-white/5">
                    <span className="font-bold text-neutral-500">Weekly Voting Prize</span>
                    <span className="text-emerald-500 font-black">Live</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">#1 Winner:</span>
                      <span className="font-black text-black dark:text-white">3 VC Partner Meetings</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">SEO Value:</span>
                      <span className="font-black text-black dark:text-white">100% Dofollow Backlink</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Fast-Pass SLA:</span>
                      <span className="text-[#0070F3] font-black">Under 24 Hours</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleProtectedAction('/dashboard/launch/submit')}
                    className="w-full mt-2 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-xs transition-all active:scale-95 cursor-pointer block text-center"
                  >
                    Submit Your Launch (+50 Credits)
                  </button>
                </div>

              </div>

            </div>

            {/* ══════════════════════════════════════════════════════════
                3. ROW 5: DUAL BENTO - SOURCE & EARN + FREE CREDITS
               ══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              
              {/* CARD 5A: Verified Dealflow Submission */}
              <div className="lg:col-span-2 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="max-w-md">
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-mono text-[9px] font-black uppercase tracking-wider mb-2">
                      VERIFIED DEALFLOW ENGINE
                    </div>
                    <h2 className="text-2xl sm:text-[26px] font-heading font-black text-black dark:text-white tracking-tight mb-2 leading-tight">
                      Submit Your Startup Deal
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                      Get your project directly in front of 180+ verified check-writers. Earn guaranteed dofollow backlinks, community upvotes, and automated Fast-Pass investor syndication.
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">AK</div>
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">DC</div>
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">ER</div>
                        <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-[#121316]">+99</div>
                      </div>
                      <span className="font-mono text-xs text-neutral-400">99+ Live Deals in Active Cohort</span>
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
                  <span className="font-mono text-xs text-neutral-400">Fast-Pass SLA: <strong className="text-black dark:text-white">3 Partner Calls in 30 Days</strong></span>
                  <button
                    onClick={() => handleProtectedAction('/dashboard/launch/submit')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95 shadow-xs cursor-pointer"
                  >
                    <span>Submit Startup Deal</span>
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
                      <div key={i} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0 flex-1">
                          <div className="font-heading font-black text-xs text-black dark:text-white truncate">{c.company}</div>
                          <div className="text-[10px] font-mono text-neutral-400 truncate">{c.desc}</div>
                        </div>
                        <span className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[9px] font-bold text-center">
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
                4. ROW 6: TRIPLE BENTO (Market + Hire + SEO Dofollow Boost)
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

                <a
                  href="https://akashkumarjha.substack.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
                >
                  Sponsor Now ↗
                </a>
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

                <a
                  href="https://www.hireincrypto.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
                >
                  Hire in Web3 ↗
                </a>
              </div>

              {/* CARD 6C: SEO Dofollow Authority Backlinks */}
              <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#4f46e5] dark:text-[#805ad5] font-black">
                      SEO Indexing
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1e1f26] text-black dark:text-white">
                      Permanent Dofollow
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
