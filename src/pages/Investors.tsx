import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Building,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Award,
  Star,
  Users,
  Share2,
  Megaphone,
  Briefcase,
  ChevronRight,
  FileText,
  Lock,
  Flame
} from "lucide-react";
import { LiveActivityMarquee } from "../components/ui/LiveActivityMarquee";
import { NumberTicker } from "../components/ui/NumberTicker";
import { usePageMeta } from "../hooks/usePageMeta";

export default function Investors() {
  usePageMeta({
    title: "Investors - Raisequity | Curated Dealflow & Syndication",
    description: "Front-run high-conviction AI, SaaS, FinTech, and Web3 rounds with verified GitHub traction, automated 1-page Fast-Pass tear sheets, and direct partner calendars.",
    canonicalPath: "/investors",
    mdAlternate: "/investors.md",
  });
  const [launches, setLaunches] = useState([
    { name: "NeuroChain AI", category: "AI", votes: 142, founder: "Elena Rostova", tagline: "Autonomous multi-agent orchestration for on-chain data & inference.", slug: "neurochain-ai" },
    { name: "SecantX Protocol", category: "Web3", votes: 118, founder: "Marcus Vance", tagline: "ZK institutional settlement engine for cross-chain liquidity & SAFEs.", slug: "secantx-protocol" },
    { name: "HyperScale DB", category: "Infra", votes: 96, founder: "David Chen", tagline: "Distributed time-series engine with sub-millisecond vector query.", slug: "hyperscale-db" },
    { name: "Fasqon Fintech", category: "Fintech", votes: 91, founder: "Alexandre Silva", tagline: "Crypto-native neobank bridging Web3 liquidity and SEPA banking.", slug: "promptpilot-saas" },
  ]);
  const [votedMap, setVotedMap] = useState<Record<number, boolean>>({});

  const handleUpvote = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setVotedMap((prev) => {
      const isVoted = Boolean(prev[idx]);
      setLaunches((lList) =>
        lList.map((item, i) =>
          i === idx ? { ...item, votes: isVoted ? item.votes - 1 : item.votes + 1 } : item
        )
      );
      return { ...prev, [idx]: !isVoted };
    });
  };
  const curatedDeals = [
    {
      id: "neurochain-ai",
      name: "NeuroChain AI",
      sector: "AI & AGENTS",
      stage: "Seed Lead",
      size: "$1.5M @ $7.5M Cap",
      metric: "Score 96 • Ex-DeepMind Team",
      tagColor: "bg-[#0070F3]",
      slug: "neurochain-ai"
    },
    {
      id: "go-protocol",
      name: "Go! Protocol",
      sector: "RWA & ASSETS",
      stage: "Strategic",
      size: "$5M Cap",
      metric: "Delaware C-Corp • Tier-1 Custody",
      tagColor: "bg-amber-400",
      slug: "secantx-protocol"
    },
    {
      id: "hyperscale-db",
      name: "HyperScale DB",
      sector: "INFRASTRUCTURE",
      stage: "Seed Round",
      size: "$2.0M @ $10M Cap",
      metric: "YC W24 • $42k MRR (+28% MoM)",
      tagColor: "bg-emerald-500",
      slug: "hyperscale-db"
    },
  ];

  const capitalTypes = [
    {
      title: "VC Funds & Family Offices",
      desc: "Lead or co-invest in high-conviction Pre-Seed, Seed, and Series A Web2 & Web3 deals with automated 1-page institutional tear sheets.",
      badge: "Venture Capital",
      checkSize: "$100k - $3M Checks",
      accent: "text-[#4f46e5]"
    },
    {
      title: "Foundation & Ecosystem Grants",
      desc: "Deploy non-dilutive grant capital to pre-screened developers building open-source AI, DevTools, and layer-1/layer-2 protocols.",
      badge: "Grants & Foundations",
      checkSize: "$25k - $250k Grants",
      accent: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Incubators & Accelerators",
      desc: "Scout top 1% early-stage startups and provide cohort founders with direct follow-on syndication channels and mentorship.",
      badge: "Accelerators",
      checkSize: "Cohort Allocation",
      accent: "text-amber-500"
    },
    {
      title: "Angel Investors & Syndicates",
      desc: "Participate in early community rounds, standardized YC SAFEs, and syndicate tickets from $5K to $100K with zero broker friction.",
      badge: "Angels & Syndicates",
      checkSize: "$5k - $100k Tickets",
      accent: "text-[#805ad5]"
    },
  ];

  const realCredits = [
    { company: "Google Cloud", value: "Up to $350k", desc: "Cloud & Gemini AI Credits" },
    { company: "AWS Activate", value: "$100,000", desc: "Compute, Bedrock & Architecture" },
    { company: "Deel Global", value: "20% Off", desc: "International Payroll & Compliance" },
    { company: "Cloudflare", value: "Up to $250k", desc: "Workers, Pages & Enterprise Security" },
  ];

  const trendingLaunches = [
    { name: "NeuroChain AI", category: "AI", votes: 142, founder: "Elena Rostova", tagline: "Autonomous multi-agent orchestration for on-chain data & inference.", slug: "neurochain-ai" },
    { name: "SecantX Protocol", category: "Web3", votes: 118, founder: "Marcus Vance", tagline: "ZK institutional settlement engine for cross-chain liquidity & SAFEs.", slug: "secantx-protocol" },
    { name: "HyperScale DB", category: "Infra", votes: 96, founder: "David Chen", tagline: "Distributed time-series engine with sub-millisecond vector query.", slug: "hyperscale-db" },
    { name: "Fasqon Fintech", category: "Fintech", votes: 91, founder: "Alexandre Silva", tagline: "Crypto-native neobank bridging Web3 liquidity and SEPA banking.", slug: "promptpilot-saas" },
  ];

  const syndicatePartners = [
    "Pantera", "a16z Scouts", "YC Alumni", "Sequoia Scouts", "Coinbase V.", "Polygon Wild", "OpenZeppelin", "Delaware Inc."
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#090a0d] text-black dark:text-white font-sans flex flex-col justify-start transition-colors duration-150 selection:bg-[#3bd3fd]">
      
      {/* ── LIVE ACTIVITY TICKER ── */}
      <LiveActivityMarquee />

      {/* ── MAIN BENTO CONTAINER (Spacious, Neo-Organic, Zero-Wasted Space) ── */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-start space-y-4 sm:space-y-5">
        
        {/* ══════════════════════════════════════════════════════════
            1. HERO BENTO CARD (Proprietary Dealflow for VCs & Angels)
           ══════════════════════════════════════════════════════════ */}
        <div className="relative rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-7 sm:p-10 md:p-12 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
          <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-bl from-cyan-200/50 via-purple-200/30 dark:from-cyan-900/20 dark:via-purple-900/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-100/60 dark:bg-amber-900/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-[1.5px] mb-6 shadow-xs">
                <span>PROPRIETARY DEALFLOW FOR VCS, ANGELS &amp; GRANTS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-[58px] font-heading font-black tracking-[-1.5px] leading-[1.05] text-black dark:text-white mb-4">
                Curated Dealflow. <br />
                <span className="bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#3b82f6] bg-clip-text text-transparent inline-block">
                  Zero Signal-to-Noise
                </span>{" "}
                Loss.
              </h1>

              <p className="text-neutral-500 dark:text-neutral-400 text-base sm:text-lg font-medium leading-relaxed max-w-xl mb-8">
                Front-run high-conviction AI, SaaS, FinTech, and Web3 rounds with verified GitHub traction, automated 1-page Fast-Pass tear sheets, and direct partner calendars.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/login?role=investor"
                  className="px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Access Investor Dealflow</span>
                  <ArrowRight size={15} />
                </Link>

                <a
                  href="mailto:investors@raisequity.com?subject=Investor Partner Application"
                  className="px-6 py-3 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
                >
                  Partner as Fund / Accelerator
                </a>
              </div>
            </div>

            {/* Right Telemetry Box */}
            <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#18191e] rounded-[24px] p-6 sm:p-7 border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-3.5">
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-200/80 dark:border-white/10">
                <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-black dark:text-white">Dealflow Pipeline</h3>
                  <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">7-Day Front-Run Advantage</p>
                </div>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Front-Run Edge:</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">7 Days Ahead of Public</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Code Diligence Score:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">96/100 Avg Readiness</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Legal Standard:</span>
                  <span className="text-black dark:text-white font-black">$0 YC Post-Money SAFE</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Syndicate Anchor:</span>
                  <span className="text-[#0070F3] font-black">$50k - $250k Co-Invest</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            2. ROW 2: CURATED DEAL FLOW (Image 9) + 7-DAY FRONT-RUN TERMINAL
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          
          {/* CARD 2A: Curated Deal Flow (Exact Image 9 Card) */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-heading font-black text-black dark:text-white tracking-tight">
                  Curated Deal Flow
                </h3>
                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Active Cohort
                </span>
              </div>

              <div className="space-y-3">
                {curatedDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    to={`/launch/${deal.slug}`}
                    className="p-3.5 rounded-[18px] bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 shadow-2xs hover:border-black/30 dark:hover:border-white/20 transition-all block group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${deal.tagColor} animate-pulse`} />
                        <span className="text-[9px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          {deal.sector}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#121316] text-black dark:text-white border border-neutral-200/80 dark:border-white/5">
                        {deal.size}
                      </span>
                    </div>

                    <div className="font-heading font-black text-base text-black dark:text-white group-hover:text-[#4f46e5] dark:group-hover:text-[#38bdf8] transition-colors">
                      {deal.name}
                    </div>

                    <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {deal.metric}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/launch"
              className="inline-flex items-center justify-between text-xs font-extrabold text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-colors mt-5 pt-3 border-t border-neutral-100 dark:border-white/5 cursor-pointer"
            >
              <span>View all active deals</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* CARD 2B: 7-Day Pre-Public Front-Run Terminal */}
          <div className="lg:col-span-2 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-heading font-black text-lg text-black dark:text-white">
                    Private Allocation Window
                  </span>
                  <span className="font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full uppercase">
                    Cohort #42 Private
                  </span>
                </div>
                <span className="font-mono text-xs text-neutral-400">
                  ⏱ 6 Days 14h Left
                </span>
              </div>

              {/* 3 Diligence Signal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase">GitHub Traction</span>
                    <CheckCircle2 size={13} className="text-emerald-500" />
                  </div>
                  <div className="font-bold text-xs text-black dark:text-white">Verified Commit Velocity</div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-1">248 commits / 30 days</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase">Legal Structure</span>
                    <ShieldCheck size={13} className="text-[#0070F3]" />
                  </div>
                  <div className="font-bold text-xs text-black dark:text-white">Delaware C-Corp Verified</div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-1">Standard YC SAFE</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase">Financials</span>
                    <DollarSign size={13} className="text-emerald-500" />
                  </div>
                  <div className="font-bold text-xs text-black dark:text-white">Audited Stripe MRR</div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-1">$42k MRR (+28% MoM)</div>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-2xl bg-[#faf9f7] dark:bg-[#15161b] border border-neutral-200/70 dark:border-white/5 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-bold text-black dark:text-white">Deterministic Inbound Matching:</span> Qualified check-writers review structured 1-page Fast-Pass tear sheets before rounds become public. No unsolicited cold outreach, no broker fees, and no legal friction.
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100 dark:border-white/5">
              <span className="font-mono text-xs text-neutral-400">
                Front-Run Allocation: <strong className="text-amber-500">$80k Lead Reserved</strong>
              </span>
              <Link
                to="/login?role=investor"
                className="px-4 py-2 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95"
              >
                Access Allocation →
              </Link>
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════
            3. ROW 3: CAPITAL ALLOCATOR TRACKS (4-Grid Bento)
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capitalTypes.map((cat, i) => (
            <div
              key={i}
              className="p-5 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20"
            >
              <div>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1c1d22] font-mono text-[9px] font-black uppercase tracking-wider mb-2.5 text-neutral-600 dark:text-neutral-400">
                  {cat.badge}
                </div>
                <h3 className="font-heading font-black text-base text-black dark:text-white mb-2 leading-tight">
                  {cat.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-4">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-white/5 font-mono text-[10px] font-bold text-neutral-400 flex items-center justify-between">
                <span>{cat.checkSize}</span>
                <ChevronRight size={12} />
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            4. ROW 4: DUAL BENTO - SOURCE & EARN (Image 7) + INSTITUTIONAL BACKERS
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          
          {/* CARD 4A: Access Verified Dealflow */}
          <div className="lg:col-span-2 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="max-w-md">
                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-mono text-[9px] font-black uppercase tracking-wider mb-2">
                  INSTITUTIONAL DEAL PIPELINE
                </div>
                <h2 className="text-2xl sm:text-[26px] font-heading font-black text-black dark:text-white tracking-tight mb-2 leading-tight">
                  Access 99+ Curated Deals
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                  Front-run public rounds with institutional access to AI, DeFi, and RWA protocols. Verified code traction, automated thesis matching, and 1-click standardized SAFEs.
                </p>

                {/* Avatar Cluster */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">AK</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">DC</div>
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">ER</div>
                    <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-[#121316]">+99</div>
                  </div>
                  <span className="font-mono text-xs text-neutral-400">99+ Pre-Screened Deals</span>
                </div>
              </div>

              {/* Big Stat Box */}
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
              <span className="font-mono text-xs text-neutral-400">Diligence SLA: <strong className="text-black dark:text-white">Zero Cold Outreach Lag</strong></span>
              <Link
                to="/login?role=investor"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95 shadow-xs"
              >
                <span>Access Dealflow Pipeline</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* CARD 4B: Institutional Backers */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-heading font-black text-black dark:text-white tracking-tight">
                  Syndicate Backers
                </h3>
                <span className="font-mono text-[10px] font-bold text-neutral-400">180+ Funds</span>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed">
                Co-invest with active check-writers from tier-1 crypto venture funds and family offices.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[11px]">
                {syndicatePartners.map((p, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 font-bold text-center text-black dark:text-white truncate">
                    {p}
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/login?role=investor"
              className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 block"
            >
              Join Syndicate Pool →
            </Link>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════
            5. ROW 5: TRENDING COHORT LAUNCHES (Image 10)
           ══════════════════════════════════════════════════════════ */}
        <div className="rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-100 dark:border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-neutral-400">
                  DEALFLOW DIRECTORY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] font-bold text-neutral-500">Live Rounds</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight">
                Trending Cohort Launches
              </h2>
            </div>

            <Link
              to="/launch"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
            >
              <span>Explore All 42+ Launches</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {launches.map((p, idx) => {
              const isVoted = Boolean(votedMap[idx]);
              return (
                <Link
                  key={idx}
                  to={`/launch/${p.slug}`}
                  className="p-4 rounded-[20px] bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 hover:border-black/30 dark:hover:border-white/20 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-heading font-black text-base text-black dark:text-white group-hover:text-[#4f46e5] dark:group-hover:text-[#38bdf8] transition-colors truncate">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-neutral-200/70 dark:bg-[#25262e] text-neutral-700 dark:text-neutral-300 rounded-md">
                        {p.category}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-2 font-medium">
                      {p.tagline}
                    </p>

                    <div className="text-[10px] font-mono text-neutral-400">
                      By <strong className="text-black dark:text-white">{p.founder}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleUpvote(e, idx)}
                    className={`flex flex-col items-center justify-center min-w-[50px] py-1.5 px-2.5 rounded-xl border transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95 ${
                      isVoted
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-[#121316] border-neutral-200 dark:border-white/10 text-black dark:text-white hover:border-emerald-500/50'
                    }`}
                    title={isVoted ? 'Upvoted! Click to remove' : 'Upvote startup'}
                  >
                    <span className={`text-[10px] transition-transform ${isVoted ? 'text-white' : 'text-emerald-500'}`}>▲</span>
                    <span className="text-xs font-mono font-black">{p.votes}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            6. ROW 6: TRIPLE BENTO (Free Credits + Market + Hire)
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          
          {/* CARD 6A: Free Credits ($500k Perks) */}
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
                {realCredits.map((c, i) => (
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

          {/* CARD 6B: Market your Web3 product */}
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

          {/* CARD 6C: Hire in Web3 */}
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

        </div>

      </main>
    </div>
  );
}
