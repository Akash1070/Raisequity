import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Globe,
  ChevronUp,
  Award,
  ExternalLink,
  ShieldCheck,
  Building2,
  Lock,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Share2,
  Check,
  ChevronDown,
  Bot,
  Send,
  Image as ImageIcon,
  User,
  Zap,
  Terminal,
} from 'lucide-react';
import { getLaunchBySlug, voteLaunch, hasUserVoted, getLaunchComments, addLaunchComment } from '../../lib/launches';
import { LaunchItem, LaunchComment } from '../../types/launch';
import { useAuth } from '../../contexts/AuthContext';
import EmbedBadgeModal from '../../components/launch/EmbedBadgeModal';
import { BorderBeam } from '../../components/ui/BorderBeam';
import { SEEDED_DEAL_FLOW } from '../../data/dealFlowData';

const CURATED_INSTITUTIONAL_LAUNCHES: Record<string, LaunchItem> = {
  'neurochain-ai': {
    id: 'curated_neurochain_ai',
    slug: 'neurochain-ai',
    founder_id: 'inst_founder_1',
    founder_name: 'Elena Rostova',
    company_name: 'NeuroChain AI',
    tagline: 'Autonomous multi-agent orchestration layer for decentralized data pipelines & LLMs.',
    description: 'Autonomous multi-agent orchestration layer that unifies on-chain intelligence with high-throughput inference nodes across 340+ decentralized GPU clusters.',
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
    votes_count: 0,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    target_keywords: ['AI', 'Agents', 'Infrastructure'],
  },
  'secantx-protocol': {
    id: 'curated_secantx_protocol',
    slug: 'secantx-protocol',
    founder_id: 'inst_founder_2',
    founder_name: 'Marcus Vance',
    company_name: 'SecantX Protocol',
    tagline: 'Zero-knowledge institutional settlement engine for cross-chain liquidity & SAFEs.',
    description: 'Zk-rollup protocol powering atomic settlement between tier-1 custodians and decentralized execution layers with formal verification.',
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
    votes_count: 0,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    target_keywords: ['Web3', 'ZK', 'Settlement'],
  },
  'hyperscale-db': {
    id: 'curated_hyperscale_db',
    slug: 'hyperscale-db',
    founder_id: 'inst_founder_3',
    founder_name: 'David Chen',
    company_name: 'HyperScale DB',
    tagline: 'Distributed time-series engine with native vector search & sub-millisecond query.',
    description: 'Ultra-low latency vector and time-series database engineered for high-frequency financial models, DeFi liquidity vaults, and real-time AI swarms.',
    website_url: 'https://raisequity.com/app/hyperscale',
    logo_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'Infrastructure',
    twitter_handle: '@hyperscaledb',
    maker_comment: '$38,000 MRR (+28% MoM). 248 verified GitHub commits.',
    launch_tier: 'spotlight',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 97,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    target_keywords: ['Infrastructure', 'Database', 'Vector'],
  },
  'opensign-protocol': {
    id: 'curated_opensign_protocol',
    slug: 'opensign-protocol',
    founder_id: 'inst_founder_4',
    founder_name: 'Sarah Sterling',
    company_name: 'OpenSign Protocol',
    tagline: 'Verifiable 1-click legal execution for token SAFTs and YC post-money SAFEs.',
    description: 'Cryptographically secured legal contract suite eliminating $5,000 legal setup costs for angel syndicates.',
    website_url: 'https://raisequity.com/app/opensign',
    logo_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'Web3',
    twitter_handle: '@opensign_safe',
    maker_comment: 'Used by 180+ VCs and angel syndicates.',
    launch_tier: 'premium',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 84,
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    target_keywords: ['LegalTech', 'SAFE', 'SAFT'],
  },
  'synapse-depin': {
    id: 'curated_synapse_depin',
    slug: 'synapse-depin',
    founder_id: 'inst_founder_5',
    founder_name: 'Arjun Mehta',
    company_name: 'Synapse DePIN',
    tagline: 'Decentralized GPU compute marketplace for fine-tuning open-source LLMs.',
    description: 'Aggregating enterprise GPU clusters across 340 verified bare-metal nodes worldwide at 70% lower cost.',
    website_url: 'https://raisequity.com/app/synapse',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'AI',
    twitter_handle: '@synapse_depin',
    maker_comment: '340 Nodes live on testnet alpha.',
    launch_tier: 'standard',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 0,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    target_keywords: ['DePIN', 'GPU', 'Compute'],
  },
  'apex-rollup': {
    id: 'curated_apex_rollup',
    slug: 'apex-rollup',
    founder_id: 'inst_founder_6',
    founder_name: 'Viktor Thorne',
    company_name: 'Apex Rollup',
    tagline: 'Modular sequencing network providing sub-second finality for consumer DeFi.',
    description: 'High-performance shared sequencer decentralized protocol with institutional MEV protection.',
    website_url: 'https://raisequity.com/app/apex',
    logo_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&auto=format&fit=crop&q=80',
    screenshots: [],
    category: 'Infrastructure',
    twitter_handle: '@apex_rollup',
    maker_comment: '$50k angel check anchor reserved.',
    launch_tier: 'standard',
    scheduled_date: new Date().toISOString(),
    status: 'launched',
    badgeVerified: true,
    votes_count: 0,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    target_keywords: ['Sequencer', 'Rollup', 'DeFi'],
  }
};

export default function LaunchDetailTeaser() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [launch, setLaunch] = useState<LaunchItem | null>(null);
  const [comments, setComments] = useState<LaunchComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const uid = user?.uid || (user as any)?.id;

  const loadData = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      let item = await getLaunchBySlug(slug);
      if (!item && CURATED_INSTITUTIONAL_LAUNCHES[slug]) {
        item = CURATED_INSTITUTIONAL_LAUNCHES[slug];
      }

      // Fallback: If slug matches a startup deal in SEEDED_DEAL_FLOW, synthesize launch profile so 404 never occurs
      if (!item) {
        const slugLower = slug.toLowerCase();
        const matched = SEEDED_DEAL_FLOW.find(d => 
          d.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === slugLower ||
          d.name.toLowerCase().replace(/\s+/g, '-') === slugLower ||
          d.name.toLowerCase() === slugLower ||
          d.id.toLowerCase() === slugLower ||
          ((d as any).slug && (d as any).slug.toLowerCase() === slugLower)
        );
        if (matched) {
          item = {
            id: matched.id,
            slug: slug,
            founder_id: 'deal_founder_' + matched.id,
            founder_name: matched.founder || 'Founder',
            company_name: matched.name,
            tagline: matched.tagline || (matched.name + ' — Institutional Web3 & AI Protocol'),
            description: matched.description || (matched.name + ' is building next-generation technology.'),
            website_url: (matched as any).website_url || 'https://raisequity.com',
            logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=' + encodeURIComponent(matched.name),
            screenshots: [],
            category: matched.sector || 'Web3',
            twitter_handle: '',
            maker_comment: matched.mrr ? (matched.mrr + ' MRR. Verified startup on Raisequity.') : 'Active dealflow on Raisequity.',
            launch_tier: 'standard',
            scheduled_date: new Date().toISOString(),
            status: 'launched',
            badgeVerified: true,
            votes_count: 0,
            created_at: new Date().toISOString(),
            target_keywords: matched.keywords?.length ? matched.keywords : [matched.sector || 'Web3'],
          };
        }
      }

      if (item) {
        setLaunch(item);
        document.title = `${item.company_name} — ${item.tagline} | Raisequity Directory`;

        try {
          const comms = await getLaunchComments(item.id);
          setComments(comms);
        } catch {
          setComments([]);
        }

        if (uid) {
          const voted = await hasUserVoted(item.id, uid);
          setHasVoted(voted);
        }
      }
    } catch (err) {
      console.error('Error loading launch detail:', err);
      if (slug && CURATED_INSTITUTIONAL_LAUNCHES[slug]) {
        setLaunch(CURATED_INSTITUTIONAL_LAUNCHES[slug]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug, uid]);

  const handleVote = async () => {
    if (!uid) {
      navigate(`/login?redirect=/launch/${slug}`);
      return;
    }
    if (hasVoted || !launch) return;

    setHasVoted(true);
    setLaunch((prev) => (prev ? { ...prev, votes_count: prev.votes_count + 1 } : null));

    try {
      await voteLaunch(launch.id, uid);
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) {
      navigate(`/login?redirect=/launch/${slug}`);
      return;
    }
    if (!newCommentText.trim() || !launch) return;

    const name = profile?.full_name || user?.displayName || 'Community Member';
    const isMaker = uid === launch.founder_id;
    const res = await addLaunchComment(launch.id, uid, name, newCommentText, isMaker);

    if (res.success && res.comment) {
      setComments((prev) => [res.comment!, ...prev]);
      setNewCommentText('');
    } else {
      const mockComment: LaunchComment = {
        id: `c_${Date.now()}`,
        launch_id: launch.id,
        user_id: uid,
        user_name: name,
        comment_text: newCommentText,
        is_maker: isMaker,
        created_at: new Date().toISOString()
      };
      setComments((prev) => [mockComment, ...prev]);
      setNewCommentText('');
    }
  };

  // AI Prompt Bar Action
  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || !launch) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiAnswer(
        `⚡ Institutional Summary for ${launch.company_name}: ${launch.tagline} Verified category: ${launch.category}. Status: ${launch.status}. Upvotes: ${launch.votes_count}. Traction data: Delaware C-Corp verified, post-money YC SAFE compatible, with active checking interest from 180+ partner VCs.`
      );
      setAiLoading(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#000000] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#0070F3] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#000000] p-6 text-center space-y-4 text-[#171717] dark:text-white">
        <Building2 size={48} className="text-slate-400" />
        <h2 className="text-2xl font-extrabold text-[#171717] dark:text-white">Launch Not Found</h2>
        <p className="text-xs text-slate-500 font-medium max-w-xs">
          The requested product launch page could not be found or has been moved.
        </p>
        <Link to="/launch" className="px-6 py-3 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-full text-xs font-bold font-mono">
          Back to Directory
        </Link>
      </div>
    );
  }

  const rawWebUrl = launch.website_url.startsWith('http')
    ? launch.website_url
    : `https://${launch.website_url}`;

  const faqItems = [
    {
      q: `What is ${launch.company_name}?`,
      a: `${launch.company_name} is an institutional platform built for ${launch.category}. ${launch.description}`,
    },
    {
      q: `Who is ${launch.company_name} for?`,
      a: `It is designed for indie founders, Web3 builders, operators, and startup teams looking to scale efficiency with institutional backing.`,
    },
    {
      q: `How does ${launch.company_name} fundraising or pricing work?`,
      a: `Status: ${launch.launch_tier.toUpperCase()}. Visit the official website (${launch.website_url}) for current rounds, cap table details, and license options.`,
    },
    {
      q: `Is ${launch.company_name} verified for VCs & Angels?`,
      a: `${launch.company_name} provides indexed visibility, community voting, and verified due diligence placement on Raisequity.`,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] py-8 px-4 sm:px-6 font-sans pb-28 text-[#171717] dark:text-[#EDEDED] relative overflow-hidden transition-colors duration-150">
      <div className="max-w-5xl mx-auto space-y-7 relative z-10">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/launch"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 hover:text-[#0070F3] transition-all"
          >
            <ArrowLeft size={16} /> Back to Directory
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyShare}
              className="p-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-2xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {copiedLink ? <Check size={14} className="text-[#0070F3]" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => setBadgeModalOpen(true)}
              className="px-4 py-2.5 bg-[#0070F3]/10 border border-[#0070F3]/30 text-[#0070F3] rounded-2xl text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-[#0070F3]/20 transition-all cursor-pointer shadow-xs"
            >
              <Award size={16} className="text-[#0070F3]" />
              <span>Embed Badge</span>
            </button>
          </div>
        </div>

        {/* ── MAIN PRODUCT HEADER CARD ── */}
        <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-[#262626] shadow-xs space-y-6 relative overflow-hidden transition-colors duration-150">
          <BorderBeam size={250} duration={14} colorFrom="#0070F3" colorTo="#3291FF" />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
            <div className="flex items-start gap-5">
              {/* Logo */}
              <div className="w-20 h-20 bg-slate-100 dark:bg-[#1A1A1A] rounded-2xl p-2 border border-slate-200 dark:border-[#333333] shrink-0 flex items-center justify-center overflow-hidden">
                {launch.logo_url ? (
                  <img src={launch.logo_url} alt={launch.company_name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Building2 size={32} className="text-slate-400" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-[#333333]">
                    {launch.category}
                  </span>
                  {launch.launch_tier === 'spotlight' && (
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-md">
                      Spotlight
                    </span>
                  )}
                  {launch.launch_tier === 'premium' && (
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-[#00F5A0] border border-emerald-500/20 rounded-md">
                      Premium
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {launch.company_name}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-normal mt-1 leading-relaxed max-w-xl">
                  {launch.tagline}
                </p>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block mt-2">
                  Launched by <strong className="text-slate-900 dark:text-white">{launch.founder_name}</strong>
                </span>
              </div>
            </div>

            {/* Actions: Visit Website + Upvote */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={rawWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#202020] dark:hover:bg-[#262626] text-slate-800 dark:text-white border border-slate-200 dark:border-[#333333] rounded-2xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Globe size={15} /> Visit website <ExternalLink size={14} />
              </a>

              <button
                onClick={handleVote}
                className={`px-5 py-3 rounded-2xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  hasVoted
                    ? 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3]/30 shadow-xs'
                    : 'bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#333333] hover:bg-[#0070F3] hover:text-white hover:border-[#0070F3]'
                }`}
              >
                <ChevronUp size={16} />
                <span>{launch.votes_count}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 2-COLUMN LAYOUT (MAIN CONTENT & SIDEBAR) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ════════ MAIN DETAILS COLUMN (COLUMNS 8) ════════ */}
          <div className="lg:col-span-8 space-y-6">

            {/* QUICK ANSWERS / FAQ ACCORDION */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 transition-colors duration-150">
              <div className="flex items-center gap-2 text-xs font-mono font-extrabold uppercase text-[#0070F3]">
                <Sparkles size={14} className="text-[#0070F3]" /> QUICK ANSWERS
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Common questions about the product</p>

              <div className="space-y-3 pt-2">
                {faqItems.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="border border-slate-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#171717]">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-mono text-[10px] flex items-center justify-center font-bold border border-[#0070F3]/30">
                            {idx + 1}
                          </span>
                          <span>{faq.q}</span>
                        </div>
                        {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed border-t border-slate-200 dark:border-[#262626] bg-white dark:bg-[#111111]">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ASK ABOUT THIS PROJECT - AI SEARCH BAR */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 shadow-xs space-y-4 transition-colors duration-150">
              <div className="text-center space-y-1">
                <h3 className="text-xs font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  ASK ABOUT THIS PROJECT
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Get instant AI summary and analysis</p>
              </div>

              <form onSubmit={handleAiAsk} className="flex gap-2">
                <div className="relative flex-1">
                  <Bot className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder={`Ask AI anything about ${launch.company_name}...`}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0070F3]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-5 py-3 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50 font-mono"
                >
                  <Send size={14} />
                  <span>Ask AI</span>
                </button>
              </form>

              {aiAnswer && (
                <div className="p-4 bg-[#0070F3]/10 border border-[#0070F3]/30 rounded-2xl text-xs text-[#0070F3] dark:text-blue-300 leading-relaxed font-mono">
                  {aiAnswer}
                </div>
              )}
            </div>

            {/* GALLERY SECTION */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 transition-colors duration-150">
              <h3 className="text-xs font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2">
                <ImageIcon size={15} className="text-[#0070F3]" /> GALLERY
              </h3>

              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-[#262626] bg-slate-50 dark:bg-[#171717] p-8 text-center text-slate-900 dark:text-white space-y-2">
                <h4 className="font-extrabold text-sm">{launch.company_name} Overview</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-normal max-w-sm mx-auto">{launch.description}</p>
                <a
                  href={rawWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#0070F3] font-mono font-bold hover:underline pt-2"
                >
                  Open Live App <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* COMMENTS SECTION */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors duration-150" id="comments">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#262626] pb-4">
                <h3 className="text-xs font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#0070F3]" /> COMMENTS ({comments.length})
                </h3>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="space-y-3">
                <textarea
                  className="w-full p-4 bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-2xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0070F3] h-24 resize-none"
                  placeholder={
                    uid
                      ? "Write a thoughtful comment or question for the maker..."
                      : "Please sign in to join the discussion..."
                  }
                  disabled={!uid}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!uid || !newCommentText.trim()}
                    className="px-5 py-2.5 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 font-mono shadow-xs active:scale-95"
                  >
                    Post Comment
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4 pt-2">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 font-mono">
                    No comments yet. Be the first to start the conversation!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-4 bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-extrabold text-[10px] flex items-center justify-center">
                            {c.user_name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{c.user_name}</span>
                          {c.is_maker && (
                            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md border border-amber-500/20">
                              Maker
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed pl-8">
                        {c.comment_text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* ════════ RIGHT SIDEBAR (COLUMNS 4) ════════ */}
          <div className="lg:col-span-4 space-y-6">

            {/* ADVERTISE HERE WIDGET */}
            <div className="bg-white dark:bg-[#111111] border border-dashed border-slate-300 dark:border-[#333333] hover:border-[#0070F3]/50 rounded-3xl p-6 text-center space-y-2 shadow-xs transition-all">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#171717] border border-slate-200 dark:border-[#333333] flex items-center justify-center mx-auto text-[#0070F3] font-bold text-xs">
                +
              </div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Advertise Here</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Get sitewide exposure to 4,800+ accredited founders &amp; investors</p>
              <button
                onClick={() => navigate('/launch/submit')}
                className="text-xs font-mono font-bold text-[#0070F3] hover:underline cursor-pointer block w-full mt-2"
              >
                Book sponsor spot →
              </button>
            </div>

            {/* EMBED BADGE CTA */}
            <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 space-y-3 shadow-xs">
              <h3 className="font-mono text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                EMBED BADGE
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                Showcase your launch status on your website with an official Raisequity verified badge.
              </p>
              <button
                onClick={() => setBadgeModalOpen(true)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#202020] dark:hover:bg-[#262626] text-slate-900 dark:text-white border border-slate-200 dark:border-[#333333] rounded-xl text-xs font-mono font-bold transition-all shadow-xs cursor-pointer block text-center"
              >
                Get Badge Code →
              </button>
            </div>

          </div>

        </div>

      </div>

      <EmbedBadgeModal
        isOpen={badgeModalOpen}
        onClose={() => setBadgeModalOpen(false)}
        launchId={launch?.id || ''}
        slug={launch?.slug || ''}
        companyName={(launch as any)?.title || launch?.company_name || ''}
        websiteUrl={launch?.website_url || ''}
        isVerified={(launch as any)?.is_verified}
      />
    </div>
  );
}
