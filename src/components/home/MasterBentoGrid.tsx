import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Zap,
  Megaphone,
  Briefcase,
  Star,
  Users,
  Building2,
  DollarSign,
  Gift,
  ShieldCheck,
  Award,
  Layers,
  ChevronRight,
  Sparkles,
  Lock,
  Clock,
  Compass,
  CheckCircle2,
  Rocket,
  Flame,
  LayoutGrid
} from "lucide-react";
import { NumberTicker } from "../ui/NumberTicker";

interface MasterBentoGridProps {
  className?: string;
}

export function MasterBentoGrid({ className = "" }: MasterBentoGridProps) {
  // 3 Curated projects for Image 3 ("Curated Deal Flow" card)
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

  // Real Grants from product data
  const curatedGrants = [
    { network: "LAYER-1", title: "Solana Foundation Grants", status: "Open", amount: "Up to $100k" },
    { network: "LAYER-2", title: "Arbitrum Foundation Grants", status: "Active", amount: "Up to $150k" },
  ];

  // Real Startup Perks from product data
  const realCredits = [
    { company: "Google Cloud", value: "Up to $350k", desc: "Cloud & Gemini AI Credits", badge: "AI Cloud" },
    { company: "AWS Activate", value: "$100,000", desc: "Compute, Bedrock & Architecture", badge: "Compute" },
    { company: "Deel Global", value: "20% Off", desc: "International Payroll & Compliance", badge: "HR Ops" },
    { company: "Cloudflare", value: "Up to $250k", desc: "Workers, Pages & Enterprise Security", badge: "DevPlatform" },
  ];

  // Real Directory Projects (Launches) from product data
  const directoryProjects = [
    {
      name: "NeuroChain AI",
      founder: "Elena Rostova",
      category: "AI",
      votes: 142,
      tagline: "Autonomous multi-agent orchestration for on-chain data & inference.",
      badge: "Spotlight",
      slug: "neurochain-ai"
    },
    {
      name: "SecantX Protocol",
      founder: "Marcus Vance",
      category: "Web3",
      votes: 118,
      tagline: "ZK institutional settlement engine for cross-chain liquidity & SAFEs.",
      badge: "Premium",
      slug: "secantx-protocol"
    },
    {
      name: "HyperScale DB",
      founder: "David Chen",
      category: "Infra",
      votes: 96,
      tagline: "Distributed time-series engine with sub-millisecond vector query.",
      badge: "Spotlight",
      slug: "hyperscale-db"
    },
    {
      name: "Fasqon Fintech",
      founder: "Alexandre Silva",
      category: "Fintech",
      votes: 91,
      tagline: "Crypto-native neobank bridging Web3 liquidity and SEPA banking.",
      badge: "Verified",
      slug: "promptpilot-saas"
    },
  ];

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-4 sm:space-y-5 ${className}`}>

      {/* ══════════════════════════════════════════════════════════
          1. HERO BENTO CARD (Action Buttons: Founders, Investors, Agencies, Directory)
         ══════════════════════════════════════════════════════════ */}
      <div className="relative rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-7 sm:p-10 md:p-12 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
        {/* Soft atmospheric gradient glows */}
        <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-bl from-cyan-200/50 via-purple-200/30 dark:from-cyan-900/20 dark:via-purple-900/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-100/60 dark:bg-amber-900/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          {/* Black Pill Category Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-[1.5px] mb-6 shadow-xs">
            <span>THE PROTOCOL NETWORK</span>
          </div>

          {/* Large Bold Display Heading with Signature Gradient on "Funding Gap." */}
          <h1 className="text-4xl sm:text-5xl md:text-[62px] font-heading font-black tracking-[-1.5px] leading-[1.05] text-black dark:text-white mb-4">
            Bridging the Web3{" "}
            <span className="bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#3b82f6] bg-clip-text text-transparent inline-block">
              Funding Gap.
            </span>
          </h1>

          {/* High-Contrast Subheading */}
          <p className="text-neutral-500 dark:text-neutral-400 text-base sm:text-lg font-medium leading-relaxed max-w-xl mb-8">
            The highest-signal aggregator of pre-seed and seed resources. Matching high-potential founders with elite capital, credits, and agency partners.
          </p>

          {/* Action Buttons Row: Mirroring Image 1 navbar roles */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/founders"
              className="px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Founders Access</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/investors"
              className="px-6 py-3 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>Investors</span>
            </Link>

            <Link
              to="/service-providers"
              className="px-6 py-3 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>Agencies</span>
            </Link>

            <Link
              to="/launch"
              className="px-6 py-3 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>Directory</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. ROW 2: Curated Deal Flow (3 Projects) + Pre-Seed to Seed Support (2 Cols)
         ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* CARD 2A: Curated Deal Flow (3 real projects, zero empty space) */}
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

            {/* 3 Real Projects Stacked */}
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

        {/* CARD 2B: Founders - Pre-Seed to Seed Support with $125k Capital Deployed */}
        <div className="lg:col-span-2 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="max-w-md">
              <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-neutral-400 mb-2 inline-block">
                FOUNDERS
              </span>
              <h2 className="text-2xl sm:text-[26px] font-heading font-black text-black dark:text-white tracking-tight mb-2 leading-tight">
                Pre-Seed to Seed Support
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-5">
                Access our network of 50+ VCs and accelerators. We qualify your deck before the first intro.
              </p>
              <Link
                to="/founders"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs transition-all hover:bg-neutral-800 active:scale-95 cursor-pointer shadow-xs"
              >
                <span>Join as Founder</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right Callout Box: $125k Capital Deployed */}
            <div className="w-full sm:w-auto p-5 sm:p-6 rounded-[22px] bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/10 text-center shrink-0 min-w-[150px] shadow-xs">
              <div className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight leading-none">
                $<NumberTicker value={125} />k
              </div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 mt-1.5">
                CAPITAL DEPLOYED
              </div>
            </div>
          </div>

          {/* Sub-row inside 2B: Curated Grants & Partnerships */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6 pt-6 border-t border-neutral-100 dark:border-white/5">
            {/* Sub-card 1: Curated Grants */}
            <div className="p-4 rounded-[20px] bg-neutral-50/70 dark:bg-[#18191e]/60 border border-neutral-200/70 dark:border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-black text-sm text-black dark:text-white">Curated Grants</span>
                  <div className="w-6 h-6 rounded-full bg-[#0070F3]/10 text-[#0070F3] flex items-center justify-center">
                    <Zap size={12} />
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {curatedGrants.map((g, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-white/10 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#805ad5]" />
                          <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase">{g.network}</span>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">{g.status}</span>
                      </div>
                      <div className="font-bold text-black dark:text-white text-xs truncate">{g.title}</div>
                      <div className="text-[10px] font-mono text-neutral-400">{g.amount}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/founders"
                className="w-full py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-extrabold text-[11px] text-center transition-all active:scale-95 block"
              >
                View Directory
              </Link>
            </div>

            {/* Sub-card 2: Partnerships */}
            <div className="p-4 rounded-[20px] bg-neutral-50/70 dark:bg-[#18191e]/60 border border-neutral-200/70 dark:border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-black text-sm text-black dark:text-white">Partnerships</span>
                  <Building2 size={13} className="text-neutral-400" />
                </div>

                <div className="space-y-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-white/10 flex items-center gap-2.5 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                      <Award size={15} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-black dark:text-white text-xs truncate">Google Cloud</div>
                      <div className="text-[10px] font-mono text-neutral-400">$200k AI Credits</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-white/10 flex items-center gap-2.5 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <ShieldCheck size={15} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-black dark:text-white text-xs truncate">AWS Activate</div>
                      <div className="text-[10px] font-mono text-neutral-400">$100k Tier 1 Support</div>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/service-providers"
                className="w-full py-2 rounded-full bg-white dark:bg-[#1f2026] border border-neutral-300 dark:border-white/10 text-black dark:text-white font-extrabold text-[11px] text-center transition-all hover:border-black active:scale-95 block"
              >
                Explore Partners
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          3. ROW 3: INVESTOR SUITE + AGENCY SERVICE PROVIDERS (Direct from product info)
         ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

        {/* CARD 3A: INVESTOR SUITE */}
        <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-[#4f46e5] dark:text-[#805ad5]">
                INVESTORS &amp; CAPITAL ALLOCATORS
              </span>
              <span className="font-mono text-[10px] font-bold text-black dark:text-white bg-neutral-100 dark:bg-[#1e1f26] px-2.5 py-0.5 rounded-full border border-neutral-200/80 dark:border-white/5">
                180+ Check-Writers
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-heading font-black text-black dark:text-white tracking-tight mb-2 leading-tight">
              Curated Dealflow for Check-Writers
            </h3>

            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed mb-5">
              Front-run high-conviction AI, SaaS, and Web3 rounds with verified GitHub traction, automated 1-page Fast-Pass tear sheets, and direct partner calendars.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Front-Run Edge</span>
                <span className="font-black text-amber-600 dark:text-amber-400">7 Days Ahead</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Legal Setup</span>
                <span className="font-black text-black dark:text-white">$0 (YC SAFE Standard)</span>
              </div>
            </div>
          </div>

          <Link
            to="/investors"
            className="w-full py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs text-center transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-xs"
          >
            <span>Access Investor Dealflow</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* CARD 3B: AGENCY & SERVICE PROVIDERS */}
        <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-emerald-600 dark:text-emerald-400">
                SERVICE PROVIDERS &amp; AGENCIES
              </span>
              <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                100% Escrow Vault
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-heading font-black text-black dark:text-white tracking-tight mb-2 leading-tight">
              Pre-Funded Milestone Escrow
            </h3>

            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed mb-5">
              Connect directly with vetted startups with confirmed seed budgets ($500k–$3M). Clients deposit 100% funds into escrow prior to project kickoff, released in 48h.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Welcome Grant</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">150 Free Credits</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">Default Rate</span>
                <span className="font-black text-black dark:text-white">0.0% Guaranteed</span>
              </div>
            </div>
          </div>

          <Link
            to="/service-providers"
            className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-2xs"
          >
            <span>Explore Agency Directory</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          4. ROW 4: DIRECTORY PROJECT SHOWCASE (Weekly Cohort Launches from product)
         ══════════════════════════════════════════════════════════ */}
      <div className="rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-100 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-neutral-400">
                DIRECTORY SHOWCASE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] font-bold text-neutral-500">Weekly Cohort #42</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight">
              Trending Projects &amp; Startups
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

        {/* 4 Live Project Cards in a 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {directoryProjects.map((p, idx) => (
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
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-[#4f46e5]/10 text-[#4f46e5] dark:text-[#805ad5] rounded-md">
                    {p.badge}
                  </span>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-2 font-medium">
                  {p.tagline}
                </p>

                <div className="text-[10px] font-mono text-neutral-400">
                  By <strong className="text-black dark:text-white">{p.founder}</strong>
                </div>
              </div>

              {/* Upvote Pill */}
              <div className="flex flex-col items-center justify-center min-w-[48px] py-1.5 px-2.5 rounded-xl bg-white dark:bg-[#121316] border border-neutral-200 dark:border-white/10 text-xs font-mono font-black text-black dark:text-white shrink-0 shadow-2xs">
                <span className="text-emerald-500 text-[10px]">▲</span>
                <span>{p.votes}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          5. ROW 5: STARTUP CREDITS + COMMERCIAL SPONSOR / HIRING
         ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* CARD 5A: Free Credits ($500k Perks) */}
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

            {/* Real Perks Stack */}
            <div className="space-y-2 mb-4">
              {realCredits.map((c, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-heading font-black text-xs text-black dark:text-white">
                      {c.company}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 truncate max-w-[140px]">
                      {c.desc}
                    </div>
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

        {/* CARD 5B: Market your Web3 product */}
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

        {/* CARD 5C: Hire in Web3 */}
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

    </div>
  );
}

export default MasterBentoGrid;