import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Briefcase,
  Award,
  Sparkles,
  Building2,
  Lock,
  DollarSign,
  ChevronRight,
  Star,
  Megaphone,
  Share2,
  CheckCircle2,
  Clock,
  Layers
} from "lucide-react";
import { LiveActivityMarquee } from "../components/ui/LiveActivityMarquee";
import { NumberTicker } from "../components/ui/NumberTicker";

export default function ServiceProviders() {
  const categories = [
    { name: "Full-Stack Dev & Smart Contracts", count: "28 Partners", budget: "$25k - $120k", tags: ["dApp Engineering", "Solidity/Rust", "ZK Circuits", "Web3 UI/UX"] },
    { name: "Smart Contract Audits & Security", count: "18 Partners", budget: "$15k - $80k", tags: ["CertiK", "Halborn", "Trail of Bits", "Formal Verification"] },
    { name: "Tokenomics, Legal & Entity Setup", count: "15 Partners", budget: "$10k - $45k", tags: ["Delaware C-Corp", "Cayman Foundation", "SAFE/SAFT", "Compliance"] },
    { name: "Web3 Growth & KOL Marketing", count: "24 Partners", budget: "$12k - $60k", tags: ["Crypto PR", "KOL Campaigns", "Community", "AEO/SEO"] },
    { name: "Market Making & Liquidity Desks", count: "16 Partners", budget: "$30k - $150k", tags: ["DEX/CEX Spread", "Order Book Depth", "OTC Desk", "Treasury"] },
    { name: "Cloud & AI Compute Infrastructure", count: "14 Partners", budget: "$100k Credits", tags: ["AWS Activate", "Google Cloud", "Alchemy RPC", "QuickNode"] },
  ];

  const activeRfps = [
    {
      id: "rfp-fasqon",
      client: "Fasqon Fintech",
      title: "Full-Stack dApp MVP & Mobile SDK",
      budget: "$35,000 USDC",
      escrowLocked: true,
      deadline: "14 Days",
      category: "Development",
      deliverable: "Next.js 15 Web3 Wallet + React Native iOS/Android SDK"
    },
    {
      id: "rfp-secantx",
      client: "SecantX Protocol",
      title: "ZK Circuits & Settlement Formal Verification",
      budget: "$45,000 USDC",
      escrowLocked: true,
      deadline: "21 Days",
      category: "Security & ZK",
      deliverable: "Halo2 / Circom circuits mathematical proof validation"
    },
    {
      id: "rfp-neurochain",
      client: "NeuroChain AI",
      title: "Multi-Agent Python SDK & On-Chain RPC Connector",
      budget: "$20,000 USDC",
      escrowLocked: true,
      deadline: "10 Days",
      category: "AI & Infra",
      deliverable: "High-throughput RPC load-balancing package & docs"
    }
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

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#090a0d] text-black dark:text-white font-sans flex flex-col justify-start transition-colors duration-150 selection:bg-[#3bd3fd]">
      
      {/* ── LIVE ACTIVITY TICKER ── */}
      <LiveActivityMarquee />

      {/* ── MAIN BENTO CONTAINER (Spacious, Neo-Organic, Zero-Wasted Space) ── */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-start space-y-4 sm:space-y-5">
        
        {/* ══════════════════════════════════════════════════════════
            1. HERO BENTO CARD (Agency & Ecosystem Infrastructure)
           ══════════════════════════════════════════════════════════ */}
        <div className="relative rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-7 sm:p-10 md:p-12 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
          <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-bl from-emerald-200/50 via-teal-200/30 dark:from-emerald-900/20 dark:via-teal-900/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-100/60 dark:bg-amber-900/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-[1.5px] mb-6 shadow-xs">
                <span>AGENCY &amp; ECOSYSTEM PARTNER INFRASTRUCTURE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-[58px] font-heading font-black tracking-[-1.5px] leading-[1.05] text-black dark:text-white mb-4">
                Close Funded Startups. <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-[#3b82f6] bg-clip-text text-transparent inline-block">
                  Protected by Milestone Escrow.
                </span>
              </h1>

              <p className="text-neutral-500 dark:text-neutral-400 text-base sm:text-lg font-medium leading-relaxed max-w-xl mb-8">
                Stop pitching cold leads that never close. Connect directly with vetted Web2 &amp; Web3 startups that just closed seed rounds and have confirmed budgets for dev, audit, legal, and growth.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/login?role=agency"
                  className="px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Join Partner Directory (150 Credits Free)</span>
                  <ArrowRight size={15} />
                </Link>

                <a
                  href="#rfp-feed"
                  className="px-6 py-3 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
                >
                  Browse Client RFPs
                </a>
              </div>
            </div>

            {/* Right Telemetry Box */}
            <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#18191e] rounded-[24px] p-6 sm:p-7 border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-3.5">
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-200/80 dark:border-white/10">
                <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                  <ShieldCheck size={20} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-black dark:text-white">Escrow Guarantee</h3>
                  <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Zero Default Risk Standard</p>
                </div>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Milestone Vault:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">100% Pre-funded</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Disbursement Window:</span>
                  <span className="font-black text-black dark:text-white">48h Upon Approval</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Starter Bonus:</span>
                  <span className="text-[#0070F3] font-black">150 Free Credits</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Default Rate:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">0.0% Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            2. ROW 2: LIVE PRE-FUNDED CLIENT RFPS + ESCROW VAULT COCKPIT
           ══════════════════════════════════════════════════════════ */}
        <div id="rfp-feed" className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 scroll-mt-20">
          
          {/* CARD 2A: Active Pre-Funded RFPs (2 cols) */}
          <div className="lg:col-span-2 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-heading font-black text-lg text-black dark:text-white">
                    Pre-Funded Client RFPs
                  </span>
                  <span className="font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase">
                    100% Escrow Funded
                  </span>
                </div>
                <span className="font-mono text-xs text-neutral-400">
                  3 High-Intent Openings
                </span>
              </div>

              {/* 3 Real RFPs */}
              <div className="space-y-3 mb-4">
                {activeRfps.map((rfp) => (
                  <div
                    key={rfp.id}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase bg-white dark:bg-[#121316] px-2 py-0.5 rounded-md border border-neutral-200/80 dark:border-white/5">
                          {rfp.client}
                        </span>
                        <span className="font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          🔒 Pre-Funded
                        </span>
                      </div>
                      <div className="font-heading font-black text-sm text-black dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {rfp.title}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {rfp.deliverable}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm font-black text-black dark:text-white">{rfp.budget}</div>
                      <div className="font-mono text-[10px] text-neutral-400">Window: {rfp.deadline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-white/5">
              <span className="font-mono text-xs text-neutral-400">
                Agency Starter Bonus: <strong className="text-emerald-600 dark:text-emerald-400">150 Free Platform Credits</strong>
              </span>
              <Link
                to="/login?role=agency"
                className="px-4 py-2 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95"
              >
                Submit Proposal →
              </Link>
            </div>
          </div>

          {/* CARD 2B: Milestone Escrow Vault Cockpit */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-emerald-600 dark:text-emerald-400 mb-2 inline-block">
                ESCROW PROTECTION
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-black dark:text-white tracking-tight mb-2">
                Pre-Funded Vault
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed mb-5">
                Client funds are held in multi-sig institutional custody before milestone kickoff.
              </p>

              {/* Big Vault Stat */}
              <div className="p-4 sm:p-5 rounded-[20px] bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/10 text-center mb-5">
                <div className="text-3xl font-heading font-black text-black dark:text-white tracking-tight leading-none">
                  $<NumberTicker value={1840} />k
                </div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1.5">
                  LOCKED IN ESCROW VAULT
                </div>
              </div>
            </div>

            <Link
              to="/login?role=agency"
              className="w-full py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs text-center transition-all active:scale-95 block shadow-xs"
            >
              Verify Escrow &amp; Join →
            </Link>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════
            3. ROW 3: 6 SPECIALIZED SERVICE TRACKS (High-Density Bento)
           ══════════════════════════════════════════════════════════ */}
        <div className="rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-100 dark:border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-neutral-400">
                  SERVICES DIRECTORY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] font-bold text-neutral-500">6 Specialized Tracks</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight">
                Institutional Service Tracks
              </h2>
            </div>

            <Link
              to="/login?role=agency"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
            >
              <span>List Your Agency</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {categories.map((c, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[20px] bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 hover:border-black/30 dark:hover:border-white/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] font-bold uppercase text-neutral-400">
                      {c.count}
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-[#121316] text-black dark:text-white border border-neutral-200/80 dark:border-white/5">
                      {c.budget}
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-sm text-black dark:text-white mb-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {c.name}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {c.tags.map((t, ti) => (
                      <span key={ti} className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 text-neutral-600 dark:text-neutral-400 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200/60 dark:border-white/5 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                  <span>Pre-funded Escrow</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            4. ROW 4: DUAL BENTO - SOURCE & EARN (Image 7) + FREE CREDITS
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          
          {/* CARD 4A: Source & Earn (Image 7 Exact Match) */}
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
              <Link
                to="/login?role=agency"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95 shadow-xs"
              >
                <span>Become a Scout</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* CARD 4B: Free Credits ($500k Perks) */}
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

        </div>

        {/* ══════════════════════════════════════════════════════════
            5. ROW 5: TRIPLE BENTO (Market + Hire + Trending Cohort Launches)
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          
          {/* CARD 5A: Market your Web3 product */}
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
              to="/login?role=agency"
              className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
            >
              Sponsor Now ↗
            </Link>
          </div>

          {/* CARD 5B: Hire in Web3 */}
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
              to="/login?role=agency"
              className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
            >
              Explore Talent ↗
            </Link>
          </div>

          {/* CARD 5C: Active Cohort Quick Access */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-heading font-black text-black dark:text-white tracking-tight">
                  Trending Launches
                </h3>
                <span className="font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Cohort #42
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {trendingLaunches.slice(0, 2).map((p, idx) => (
                  <Link
                    key={idx}
                    to={`/launch/${p.slug}`}
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between block group"
                  >
                    <div>
                      <div className="font-heading font-black text-xs text-black dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400 truncate max-w-[140px]">
                        {p.category} • By {p.founder}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-black dark:text-white">▲ {p.votes}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/launch"
              className="w-full py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs text-center transition-all active:scale-95 block shadow-xs"
            >
              View All 42+ Startups →
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}
