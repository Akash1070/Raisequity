import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Gift,
  Building2,
  DollarSign,
  Star,
  Sparkles,
  Award,
  Zap,
  Megaphone,
  Briefcase,
  Share2,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
  Flame,
  LayoutGrid,
  Rocket,
  Newspaper,
  Loader2,
  AlertCircle
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, query, getDocs, limit } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { getWeb3Investors } from "../lib/investors";
import { getPublicLaunches } from "../lib/launches";
import { useLandingData } from "../hooks/useLandingData";
import { LiveActivityMarquee } from "../components/ui/LiveActivityMarquee";
import { NumberTicker } from "../components/ui/NumberTicker";
import { usePageMeta } from "../hooks/usePageMeta";

const SUBSTACK_URL = "https://akashkumarjha.substack.com/";
const HIRE_INC_URL = "https://www.hireincrypto.com";
const PR_URL = "https://www.yourweb3guy.com";

const DEFAULT_MATCHES = [
  {
    firm: "Polychain Capital",
    type: "Venture Capital",
    focus: "Layer 1/2, Infrastructure, DeFi",
    checkSize: "$500K - $3M",
    stage: "Seed to Series A",
    responseRate: "94%",
    status: "Active Lead Check",
    tags: ["Crypto Native", "US/Global", "Deep Technical"]
  },
  {
    firm: "Alliance DAO",
    type: "Accelerator / Fund",
    focus: "Web3 Products, Consumer Apps, AI",
    checkSize: "$250K - $500K",
    stage: "Pre-Seed to Seed",
    responseRate: "98%",
    status: "Direct Fast-Track",
    tags: ["Mentorship", "Founder Network", "Y-Combinator Model"]
  },
  {
    firm: "Framework Ventures",
    type: "Venture Capital",
    focus: "Gaming, DeFi, Tokenomics",
    checkSize: "$1M - $5M",
    stage: "Seed to Series A",
    responseRate: "89%",
    status: "Thesis Matched",
    tags: ["Hands-on", "Token Advisory", "Governance"]
  },
  {
    firm: "Dragonfly Capital",
    type: "Global VC Fund",
    focus: "Cross-border Tech, Infrastructure",
    checkSize: "$500K - $4M",
    stage: "Seed to Growth",
    responseRate: "91%",
    status: "Active Allocator",
    tags: ["Global Reach", "Asia/US", "Institutional Grade"]
  }
];

const CURATED_GRANTS = [
  { network: "LAYER-1", title: "Solana Foundation Grants", status: "Open", amount: "Up to $100k" },
  { network: "LAYER-2", title: "Arbitrum Foundation Grants", status: "Active", amount: "Up to $150k" },
  { network: "CROSS-CHAIN", title: "Polygon Ecosystem Fund", status: "Open", amount: "Up to $100k" },
  { network: "BASE L2", title: "Base Ecosystem Grants", status: "Active", amount: "Up to $50k" },
];

const REAL_CREDITS = [
  { company: "Google Cloud", value: "Up to $350k", desc: "Cloud & Gemini AI Credits" },
  { company: "AWS Activate", value: "$100,000", desc: "Compute, Bedrock & Architecture" },
  { company: "Deel Global", value: "20% Off", desc: "International Payroll & Compliance" },
  { company: "Cloudflare", value: "Up to $250k", desc: "Workers, Pages & Enterprise Security" },
];

const TRENDING_LAUNCHES = [
  { name: "NeuroChain AI", category: "AI", votes: 142, founder: "Elena Rostova", tagline: "Autonomous multi-agent orchestration for on-chain data & inference.", slug: "neurochain-ai" },
  { name: "SecantX Protocol", category: "Web3", votes: 118, founder: "Marcus Vance", tagline: "ZK institutional settlement engine for cross-chain liquidity & SAFEs.", slug: "secantx-protocol" },
  { name: "HyperScale DB", category: "Infra", votes: 96, founder: "David Chen", tagline: "Distributed time-series engine with sub-millisecond vector query.", slug: "hyperscale-db" },
  { name: "Fasqon Fintech", category: "Fintech", votes: 91, founder: "Alexandre Silva", tagline: "Crypto-native neobank bridging Web3 liquidity and SEPA banking.", slug: "promptpilot-saas" },
];

export default function Founders() {
  usePageMeta({
    title: "Founders - Raisequity | 3 Guaranteed VC Meetings in 30 Days",
    description: "Skip 1,000 cold DMs. Get matched directly with check-size and thesis-aligned VCs backed by our 100% money-back SLA guarantee.",
    canonicalPath: "/founders",
    mdAlternate: "/founders.md",
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const { grants, credits, activeGrants, activeCredits, activeFunds, cycleIndex } = useLandingData();
  const [matches, setMatches] = useState(DEFAULT_MATCHES);
  const [activeFilter, setActiveFilter] = useState("All");
  const [launches, setLaunches] = useState(TRENDING_LAUNCHES);
  const [votedMap, setVotedMap] = useState<Record<number, boolean>>({});
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleDirectoryCheckout = async () => {
    if (!user) {
      navigate("/login?redirect=/launch");
      return;
    }
    setCheckoutBusy(true);
    setCheckoutError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packageId: "directory_listing", amountUsd: 20, credits: 0 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkout_url) throw new Error(data?.error || "Checkout unavailable");
      window.location.href = data.checkout_url;
    } catch (err: any) {
      setCheckoutError(err?.message || "Payment processing is unavailable right now.");
    } finally {
      setCheckoutBusy(false);
    }
  };

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

  useEffect(() => {
    async function fetchContributedContacts() {
      try {
        const q = query(collection(db, "contributed_contacts"), limit(6));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const dynamicMatches = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              firm: data.fundName || data.name || "Ecosystem VC",
              type: data.type || "Venture Fund",
              focus: data.sectors ? (Array.isArray(data.sectors) ? data.sectors.join(", ") : data.sectors) : "Web2 & Web3 Generalist",
              checkSize: data.checkSize || "$100K - $1M",
              stage: data.stage || "Pre-Seed to Seed",
              responseRate: "92%",
              status: "Verified Inbound",
              tags: Array.isArray(data.sectors) ? data.sectors.slice(0, 3) : ["Venture", "Seed"]
            };
          });
          setMatches([...dynamicMatches, ...DEFAULT_MATCHES]);
        }
      } catch (err) {
        console.error("Error fetching contributed matches for Founders page:", err);
      }
    }
    fetchContributedContacts();

    // Real check-writers from the investor directory (seeded DB data).
    getWeb3Investors([], false, { limit: 4 }).then((investors) => {
      if (!investors.length) return;
      const liveMatches = investors.map((inv) => ({
        firm: inv.firm || inv.name,
        type: inv.category || "Venture Fund",
        focus: (inv.sectors || []).slice(0, 3).join(", ") || "Web3 Generalist",
        checkSize: inv.check_size || "$100K - $1M",
        stage: inv.stage || "Pre-Seed to Seed",
        responseRate: "Verified",
        status: inv.verified ? "Active Check-Writer" : "In Review",
        tags: (inv.sectors || []).slice(0, 3).concat([inv.location || "Global"]),
      }));
      setMatches((prev) => [...liveMatches, ...prev]);
    }).catch(() => {});

    // Real trending launches from the launch directory.
    getPublicLaunches().then((items) => {
      if (!items.length) return;
      const trending = items
        .map((l) => ({
          name: l.company_name || (l as any).name || "Launch",
          category: l.category || "Web3",
          votes: Number(l.votes_count || 0),
          founder: l.founder_name || l.founder_id || "Founder",
          tagline: l.tagline || "",
          slug: l.slug || l.id,
        }))
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 4);
      if (trending.length) setLaunches(trending);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#090a0d] text-black dark:text-white font-sans flex flex-col justify-start transition-colors duration-150 selection:bg-[#3bd3fd]">
      
      {/* ── LIVE ACTIVITY TICKER ── */}
      <LiveActivityMarquee />

      {/* ── MAIN BENTO CONTAINER (Spacious, Neo-Organic, Zero-Wasted Space) ── */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-start space-y-4 sm:space-y-5">
        
        {/* ══════════════════════════════════════════════════════════
            1. HERO BENTO CARD (Founder Venture Infrastructure)
           ══════════════════════════════════════════════════════════ */}
        <div className="relative rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-7 sm:p-10 md:p-12 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
          <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-bl from-cyan-200/50 via-purple-200/30 dark:from-cyan-900/20 dark:via-purple-900/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-100/60 dark:bg-amber-900/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-[1.5px] mb-6 shadow-xs">
                <span>FOUNDER VENTURE INFRASTRUCTURE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-[58px] font-heading font-black tracking-[-1.5px] leading-[1.05] text-black dark:text-white mb-4">
                Raise Smarter. <br />
                <span className="bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#3b82f6] bg-clip-text text-transparent inline-block">
                  3 Guaranteed VC Meetings
                </span>{" "}
                in 30 Days.
              </h1>

              <p className="text-neutral-500 dark:text-neutral-400 text-base sm:text-lg font-medium leading-relaxed max-w-xl mb-8">
                Skip 1,000 cold DMs. Get matched directly with check-size and thesis-aligned VCs backed by our 100% money-back SLA guarantee.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/login?role=founder"
                  className="px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Activate 30-Day SLA</span>
                  <ArrowRight size={15} />
                </Link>

                <Link
                  to="/service-providers"
                  className="px-6 py-3 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs flex items-center gap-2"
                >
                  <Gift size={15} className="text-[#4f46e5]" />
                  <span>Claim $500k+ Perks</span>
                </Link>
              </div>
            </div>

            {/* Right Telemetry Box */}
            <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#18191e] rounded-[24px] p-6 sm:p-7 border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-3.5">
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-200/80 dark:border-white/10">
                <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-black dark:text-white">Matching Engine</h3>
                  <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Algorithmic Fit &amp; SLA Guarantee</p>
                </div>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Active VC Check-Writers:</span>
                  <span className="font-black text-black dark:text-white">180+ Funds</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Guaranteed Meeting SLA:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">3 Calls / 30 Days</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Syndicate Angel Anchor:</span>
                  <span className="text-[#0070F3] font-black">$50,000 Reserved</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
                  <span className="text-neutral-500">Legal Drag:</span>
                  <span className="font-black text-black dark:text-white">$0 (YC SAFE Standard)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            2. ROW 2: GUARANTEED SLA COCKPIT + PRE-SEED SUPPORT ($125k)
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          
          {/* CARD 2A: Guaranteed Partner Meeting SLA (Interactive Cockpit) */}
          <div className="lg:col-span-2 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-heading font-black text-lg text-black dark:text-white">
                    Guaranteed Partner Meeting SLA
                  </span>
                  <span className="font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase">
                    Active Guarantee
                  </span>
                </div>
                <span className="font-mono text-xs text-neutral-400">
                  ⏱ 24 Days Remaining
                </span>
              </div>

              {/* 3 Calls Milestone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase">Partner Call #1</span>
                    <CheckCircle2 size={13} className="text-emerald-500" />
                  </div>
                  <div className="font-bold text-xs text-black dark:text-white">Completed &amp; Confirmed</div>
                  <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">Polychain Capital</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-amber-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase">Partner Call #2</span>
                    <Clock size={13} className="text-amber-500 animate-spin" />
                  </div>
                  <div className="font-bold text-xs text-black dark:text-white">Matching in Thesis Queue</div>
                  <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-1">Alliance DAO Track</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 opacity-80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase">Partner Call #3</span>
                    <span className="font-mono text-[10px] text-neutral-400">Step 3</span>
                  </div>
                  <div className="font-bold text-xs text-neutral-500 dark:text-neutral-400">Pending Scheduling</div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-1">Within 30-Day Window</div>
                </div>
              </div>

              {/* The SLA Promise */}
              <div className="p-3.5 rounded-2xl bg-[#faf9f7] dark:bg-[#15161b] border border-neutral-200/70 dark:border-white/5 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-bold text-black dark:text-white">The Raisequity Promise:</span> Unlike directories that sell outdated email lists, Raisequity commits to real, qualified outcomes: 3 confirmed partner meetings with thesis-matched check-writers. If fewer than 3 meetings are delivered within your 30-day window, you are entitled to a 100% full refund with 1 click.
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-100 dark:border-white/5">
              <span className="font-mono text-xs text-neutral-400">
                SLA Status: <strong className="text-emerald-500">1/3 Partner Calls Locked</strong>
              </span>
              <Link
                to="/login?role=founder"
                className="px-4 py-2 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95"
              >
                Claim SLA Protection →
              </Link>
            </div>
          </div>

          {/* CARD 2B: Pre-Seed to Seed Support ($125k Capital Deployed) */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-neutral-400 mb-2 inline-block">
                FOUNDERS
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-black dark:text-white tracking-tight mb-2">
                Pre-Seed to Seed Support
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed mb-5">
                Access our network of 50+ VCs and accelerators. We qualify your deck before the first intro.
              </p>

              {/* Big Capital Deployed Stat */}
              <div className="p-4 sm:p-5 rounded-[20px] bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/10 text-center mb-5">
                <div className="text-3xl font-heading font-black text-black dark:text-white tracking-tight leading-none">
                  $<NumberTicker value={125} />k
                </div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 mt-1.5">
                  CAPITAL DEPLOYED
                </div>
              </div>
            </div>

            <Link
              to="/login?role=founder"
              className="w-full py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs text-center transition-all active:scale-95 block shadow-xs"
            >
              Join as Founder →
            </Link>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════
            3. ROW 3: CURATED GRANTS ($500k) + PARTNERSHIPS & CREDITS
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          
          {/* CARD 3A: Curated Grants */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-heading font-black text-black dark:text-white tracking-tight">
                    Curated Grants
                  </h3>
                  <div className="w-5 h-5 rounded-full bg-[#0070F3]/10 text-[#0070F3] flex items-center justify-center">
                    <Zap size={11} />
                  </div>
                </div>
                <span className="font-mono text-[10px] font-bold text-neutral-400">Non-Dilutive Capital</span>
              </div>

              <div className="space-y-2.5 mb-5">
                {activeGrants.map((g, i) => (
                  <div key={`${i}-${g.title}`} className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between text-xs transition-all duration-300">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#805ad5] animate-pulse" />
                        <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase">{g.network}</span>
                      </div>
                      <div className="font-bold text-black dark:text-white truncate">{g.title}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-black text-black dark:text-white block">{g.amount}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">{g.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/login?role=founder"
              className="w-full py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs text-center transition-all active:scale-95 block shadow-xs"
            >
              Apply to All Grants with 1 Click →
            </Link>
          </div>

          {/* CARD 3B: Partnerships & Free Cloud Credits */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-heading font-black text-black dark:text-white tracking-tight">
                    Free Credits ($500k Perks)
                  </h3>
                  <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center">
                    <Star size={11} fill="currentColor" />
                  </div>
                </div>
                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Pre-Approved</span>
              </div>

              <div className="space-y-2.5 mb-5">
                {activeCredits.map((c, i) => (
                  <div key={`${i}-${c.company}`} className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between gap-3 text-xs transition-all duration-300">
                    <div className="min-w-0 flex-1">
                      <div className="font-heading font-black text-black dark:text-white truncate">{c.company}</div>
                      <div className="text-[10px] font-mono text-neutral-400 truncate">{c.desc}</div>
                    </div>
                    <span className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-bold text-center">
                      {c.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/login?role=founder"
              className="w-full py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs text-center transition-all active:scale-95 block shadow-xs"
            >
              Claim $500k+ Perks Package →
            </Link>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════
            4. ROW 4: ACTIVE VC CHECK-WRITERS SHOWCASE (High Density)
           ══════════════════════════════════════════════════════════ */}
        <div className="rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-100 dark:border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-neutral-400">
                  INSTITUTIONAL DIRECTORY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] font-bold text-neutral-500">180+ Active Check-Writers</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight">
                Venture Funds &amp; Accelerators
              </h2>
            </div>

            <Link
              to="/login?role=founder"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
            >
              <span>Get Matched with Check-Writers</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* 4 VC Cards in a 2x2 Grid (Dynamic FOMO Rotation every 3.5s) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeFunds.map((m, idx) => (
              <div
                key={`${idx}-${m.name}`}
                className="p-4 rounded-[20px] bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 hover:border-black/30 dark:hover:border-white/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-black text-base text-black dark:text-white group-hover:text-[#4f46e5] dark:group-hover:text-[#38bdf8] transition-colors">
                      {m.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-neutral-200/70 dark:bg-[#25262e] text-neutral-700 dark:text-neutral-300 rounded-md">
                      {m.checkSize || m.funding}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-2 font-medium">
                    {m.focus}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 text-neutral-600 dark:text-neutral-400 rounded-md">
                      {m.category}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 text-neutral-600 dark:text-neutral-400 rounded-md">
                      Verified Lead
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-200/60 dark:border-white/5 text-[10px] font-mono">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ 94% Response Rate
                  </span>
                  <Link
                    to="/login?role=founder"
                    className="text-black dark:text-white font-bold hover:underline flex items-center gap-1"
                  >
                    Request Intro <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            5. ROW 5: TRIPLE BENTO (Source & Earn + Market + Hire)
           ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* CARD 5A: Submit Your Deal */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xl font-heading font-black text-black dark:text-white tracking-tight">
                    Submit Your Deal
                  </h3>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-mono text-[9px] font-black uppercase tracking-wider mt-1">
                    $14B PIPELINE MANAGED
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/5 flex items-center justify-center text-black dark:text-white shrink-0">
                  <Rocket size={18} />
                </div>
              </div>

              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-4">
                Launch your startup in our curated weekly cohort. Connect with 180+ verified venture check-writers and unlock automated Fast-Pass introductions.
              </p>

              {/* Avatar Cluster */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-[#121316]">AK</div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-[#121316]">DC</div>
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-[#121316]">ER</div>
                  <div className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-[9px] flex items-center justify-center border-2 border-white dark:border-[#121316]">+99</div>
                </div>
                <span className="font-mono text-[10px] text-neutral-400">99+ Cohort Startups</span>
              </div>
            </div>

            <Link
              to="/login?role=founder"
              className="w-full py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block shadow-xs"
            >
              Submit Your Deal →
            </Link>
          </div>

          {/* CARD 5B: Substack / Market your Web3 product */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/5 flex items-center justify-center text-black dark:text-white mb-3">
                <Megaphone size={18} />
              </div>

              <a
                href={SUBSTACK_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[9px] font-black uppercase tracking-wider mb-2 hover:opacity-80 transition-opacity"
              >
                6,000+ READERS ↗
              </a>

              <h3 className="text-lg font-heading font-black text-black dark:text-white tracking-tight mb-2">
                Market your Web3 product
              </h3>

              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-4">
                Get listed in our Substack + directory audience of builders, check-writers, and ecosystem scouts for a one-time $20 listing fee.
              </p>

              {checkoutError && (
                <div className="mb-3 flex items-start gap-1.5 text-[10px] font-mono text-red-600 dark:text-red-400">
                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDirectoryCheckout}
                disabled={checkoutBusy}
                className="w-full py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {checkoutBusy ? <Loader2 size={13} className="animate-spin" /> : <DollarSign size={13} />}
                <span>{checkoutBusy ? "Opening secure checkout..." : "List your launch — $20"}</span>
              </button>
              <a
                href={SUBSTACK_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
              >
                Read on Substack ↗
              </a>
            </div>
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

            <a
              href={HIRE_INC_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
            >
              Hire in Web3 ↗
            </a>
          </div>

          {/* CARD 5D: PR & News */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/5 flex items-center justify-center text-black dark:text-white mb-3">
                <Newspaper size={18} />
              </div>

              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1e1f26] text-neutral-600 dark:text-neutral-300 font-mono text-[9px] font-black uppercase tracking-wider mb-2">
                PR &amp; PRESS
              </div>

              <h3 className="text-lg font-heading font-black text-black dark:text-white tracking-tight mb-2">
                Get your product in news
              </h3>

              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-4">
                Launch PR campaigns, guest features, and press outreach to get your Web3 product covered by tier-1 outlets.
              </p>
            </div>

            <a
              href={PR_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
            >
              Get PR ↗
            </a>
          </div>

        </div>

        {/* ══════════════════════════════════════════════════════════
            6. ROW 6: TRENDING STARTUP LAUNCHES (Image 10 Exact Bento Architecture)
           ══════════════════════════════════════════════════════════ */}
        <div className="rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-100 dark:border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-neutral-400">
                  WEEKLY SPOTLIGHT
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] font-bold text-neutral-500">Cohort #42 Live</span>
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

      </main>
    </div>
  );
}
