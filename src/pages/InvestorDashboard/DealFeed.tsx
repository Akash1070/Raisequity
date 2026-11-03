import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  Zap,
  Star,
  Flame,
  Clock,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Lock,
  Share2,
  Compass,
  ArrowRight,
  Bot,
  Filter,
  Check,
  Copy,
  Terminal,
  Activity,
  MessageSquare
} from "lucide-react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import OneClickSafeModal from "../../components/investor/OneClickSafeModal";
import CalBookingEmbed from "../../components/investor/CalBookingEmbed";
import TelegramThesisAlertModal from "../../components/investor/TelegramThesisAlertModal";

interface DealItem {
  id: string;
  founder_id?: string;
  founder_email?: string;
  name: string;
  founder: string;
  sector: string;
  industry: string[];
  stage: string;
  targetRaise: string;
  valuationCap: string;
  location: string;
  matchScore: number;
  matchLevel: string;
  roundType: string;
  isPreLaunch: boolean;
  preLaunchDaysRemaining: number;
  githubCommits?: number;
  mrr?: string;
  leadAnchor: string;
  tagline: string;
  description: string;
  keywords: string[];
  authenticityScore: number;
}

const CURATED_HIRE_DEALS: DealItem[] = [
  {
    id: "deal_neurochain",
    name: "NeuroChain AI",
    founder: "Elena Rostova",
    sector: "AI & Agents",
    industry: ["AI", "Infrastructure", "Multi-Agent"],
    stage: "Seed Round",
    targetRaise: "$1,500,000",
    valuationCap: "$7.5M Cap",
    location: "San Francisco, CA",
    matchScore: 96,
    matchLevel: "HIGH CONVICTION",
    roundType: "Seed Lead",
    isPreLaunch: true,
    preLaunchDaysRemaining: 6,
    githubCommits: 248,
    mrr: "$42k MRR (+28% MoM)",
    leadAnchor: "$80,000 Reserved by Apex Syndicate",
    tagline: "Autonomous multi-agent orchestration for on-chain data & inference.",
    description: "Built by ex-DeepMind researchers. Autonomous multi-agent orchestration layer that unifies on-chain intelligence with high-throughput inference nodes.",
    keywords: ["ai_agents", "distributed_inference", "delaware_c_corp"],
    authenticityScore: 99
  },
  {
    id: "deal_secantx",
    name: "SecantX Protocol",
    founder: "Marcus Vance",
    sector: "Web3 & ZK",
    industry: ["Web3", "ZK Circuits", "Settlement"],
    stage: "Seed Round",
    targetRaise: "$2,200,000",
    valuationCap: "$11.0M Cap",
    location: "New York, NY",
    matchScore: 92,
    matchLevel: "HIGH CONVICTION",
    roundType: "Strategic",
    isPreLaunch: true,
    preLaunchDaysRemaining: 5,
    githubCommits: 194,
    mrr: "$28k MRR (+35% MoM)",
    leadAnchor: "$50,000 Reserved by Alliance DAO",
    tagline: "Zero-knowledge institutional settlement engine for cross-chain liquidity & SAFEs.",
    description: "Audited by Trail of Bits. Atomic settlement engine powering institution-grade cross-chain liquidity pools with zero front-running.",
    keywords: ["zk_circuits", "atomic_settlement", "trail_of_bits"],
    authenticityScore: 98
  },
  {
    id: "deal_hyperscale",
    name: "HyperScale DB",
    founder: "David Chen",
    sector: "Infrastructure",
    industry: ["Database", "Time-Series", "AI"],
    stage: "Series A",
    targetRaise: "$3,000,000",
    valuationCap: "$15.0M Cap",
    location: "Austin, TX",
    matchScore: 88,
    matchLevel: "MODERATE",
    roundType: "Series A",
    isPreLaunch: false,
    preLaunchDaysRemaining: 0,
    githubCommits: 312,
    mrr: "$68k MRR (+22% MoM)",
    leadAnchor: "$120,000 Reserved by Pantera Scout",
    tagline: "Distributed time-series engine with native vector search & sub-millisecond query.",
    description: "Ultra-low latency vector and time-series database engineered for high-frequency algorithmic models and autonomous agent memory.",
    keywords: ["vector_db", "timeseries", "sub_millisecond"],
    authenticityScore: 96
  },
  {
    id: "deal_fasqon",
    name: "Fasqon Fintech",
    founder: "Alexandre Silva",
    sector: "Fintech & RWA",
    industry: ["Fintech", "RWA", "Neobank"],
    stage: "Pre-Seed",
    targetRaise: "$800,000",
    valuationCap: "$4.0M Cap",
    location: "London, UK",
    matchScore: 85,
    matchLevel: "MODERATE",
    roundType: "Pre-Seed",
    isPreLaunch: true,
    preLaunchDaysRemaining: 4,
    githubCommits: 156,
    mrr: "$19k MRR (+40% MoM)",
    leadAnchor: "$40,000 Reserved by SeedCamp",
    tagline: "Crypto-native neobank bridging Web3 liquidity and SEPA instant settlement.",
    description: "FCA-registered EMI partner rails for corporate treasury, institutional on-ramp, and tokenized commercial credit lines.",
    keywords: ["fintech_rails", "sepa_instant", "fca_registered"],
    authenticityScore: 95
  },
  {
    id: "deal_opensign",
    name: "OpenSign SAFE",
    founder: "Sarah Jenkins",
    sector: "LegalTech",
    industry: ["Web3", "LegalTech", "SAFT"],
    stage: "Seed Round",
    targetRaise: "$1,200,000",
    valuationCap: "$6.0M Cap",
    location: "Zurich, Switzerland",
    matchScore: 82,
    matchLevel: "MODERATE",
    roundType: "Seed",
    isPreLaunch: false,
    preLaunchDaysRemaining: 0,
    githubCommits: 118,
    mrr: "$24k MRR (+18% MoM)",
    leadAnchor: "$30,000 Reserved by Outlier",
    tagline: "1-Click standardized SAFE & SAFT smart agreements with cryptographic signatures.",
    description: "Replaces $5k legal friction per angel check with automated Delaware C-Corp post-money valuation smart contracts.",
    keywords: ["yc_safe", "smart_contracts", "delaware_law"],
    authenticityScore: 94
  },
  {
    id: "deal_aura",
    name: "Aura Compute",
    founder: "Liam Vance",
    sector: "AI Compute",
    industry: ["Compute", "GPU", "AI Infra"],
    stage: "Seed Round",
    targetRaise: "$2,500,000",
    valuationCap: "$12.5M Cap",
    location: "Singapore",
    matchScore: 79,
    matchLevel: "MODERATE",
    roundType: "Strategic",
    isPreLaunch: true,
    preLaunchDaysRemaining: 7,
    githubCommits: 220,
    mrr: "$35k MRR (+30% MoM)",
    leadAnchor: "$75,000 Reserved by NGC Ventures",
    tagline: "Decentralized GPU cluster network optimizing H100 inference cost by 65%.",
    description: "Peer-to-peer compute orchestration reducing training and inference latency across tier-1 AI modeling labs.",
    keywords: ["gpu_cluster", "h100_compute", "decentralized"],
    authenticityScore: 93
  }
];

export default function DealFeed() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<DealItem[]>(CURATED_HIRE_DEALS);
  const [selectedDealId, setSelectedDealId] = useState<string>("deal_neurochain");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [subFilter, setSubFilter] = useState<"all" | "recommended" | "livesync">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [safeModalOpen, setSafeModalOpen] = useState(false);
  const [calModalOpen, setCalModalOpen] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);

  // Fetch live startups from Firestore
  useEffect(() => {
    async function loadLiveStartups() {
      try {
        const startupsSnap = await getDocs(query(collection(db, "startups"), limit(25)));
        if (!startupsSnap.empty) {
          const liveItems: DealItem[] = startupsSnap.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              founder_id: data.founder_id || '',
              founder_email: data.founder_email || '',
              name: data.name || 'Stealth Startup',
              founder: data.founder_name || 'Founder',
              sector: data.sector || 'AI & SaaS',
              industry: [data.sector || 'SaaS'],
              stage: data.stage || 'Seed Round',
              targetRaise: data.raise_amount ? `$${Number(data.raise_amount).toLocaleString()}` : '$750,000',
              valuationCap: data.valuation_cap ? `$${(Number(data.valuation_cap) / 1000000).toFixed(1)}M Cap` : '$6.0M Cap',
              location: data.location || 'San Francisco, CA',
              matchScore: 95,
              matchLevel: 'HIGH CONVICTION',
              roundType: 'Seed Lead',
              isPreLaunch: true,
              preLaunchDaysRemaining: 7,
              leadAnchor: '$50,000 Reserved by Network Angels',
              tagline: data.tagline || data.description || 'Verified early-stage startup.',
              description: data.description || data.problem || 'Institutional seed round candidate on Raisequity.',
              keywords: [data.sector?.toLowerCase() || 'ai', 'seed_round', 'delaware_c_corp'],
              authenticityScore: 98,
            };
          });

          setDeals([...liveItems, ...CURATED_HIRE_DEALS]);
        }
      } catch (err) {
        console.warn("[DealFeed] Error loading startups:", err);
      }
    }

    loadLiveStartups();
  }, []);

  const selectedDeal = deals.find((d) => d.id === selectedDealId) || deals[0];

  // Filter deals
  const filteredDeals = deals.filter((deal) => {
    if (activeTab === "AI & Agents" && !deal.sector.includes("AI")) return false;
    if (activeTab === "Infrastructure & ZK" && !deal.sector.includes("Infrastructure") && !deal.sector.includes("ZK")) return false;
    if (activeTab === "RWA & FinTech" && !deal.sector.includes("Fintech") && !deal.sector.includes("RWA")) return false;
    if (activeTab === "Pre-Seed Cohort #42" && !deal.isPreLaunch) return false;

    if (subFilter === "recommended" && deal.matchScore < 90) return false;
    if (subFilter === "livesync" && !deal.isPreLaunch) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      deal.name.toLowerCase().includes(q) ||
      deal.founder.toLowerCase().includes(q) ||
      deal.sector.toLowerCase().includes(q) ||
      deal.tagline.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] dark:bg-[#0c0d10] text-black dark:text-white font-sans overflow-hidden">
      
      {/* ══════════════════════════════════════════════════════════
          1. TOP HORIZONTAL PILL NAV BAR (Exact HireInCrypto Image 3 Style)
         ══════════════════════════════════════════════════════════ */}
      <div className="border-b border-[#e8e6df] dark:border-white/10 bg-white dark:bg-[#121316] px-5 py-2.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { label: "Deals", count: "180+" },
            { label: "AI & Agents", count: "42" },
            { label: "Infrastructure & ZK", count: "38" },
            { label: "RWA & FinTech", count: "24" },
            { label: "Pre-Seed Cohort #42", count: "12" },
            { label: "Grants", count: "18" },
          ].map((item) => {
            const isSelected = activeTab === item.label || (item.label === "Deals" && activeTab === "All");
            return (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label === "Deals" ? "All" : item.label)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "bg-neutral-100 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-white/20 text-white dark:bg-black/20 dark:text-black" : "bg-neutral-200/70 dark:bg-white/10 text-neutral-500 dark:text-neutral-300"
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side status pills */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Unlimited Deal Flow Active</span>
          </div>

          <button
            onClick={() => setTelegramModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-[#8b5cf6] text-white hover:bg-[#7c3aed] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Fast-Pass Memo</span>
          </button>

          <button
            onClick={() => setSafeModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer"
          >
            Pipeline (0)
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. TOP STATUS BANNER (Exact HireInCrypto Image 3 Style)
         ══════════════════════════════════════════════════════════ */}
      <div className="border-b border-[#e8e6df] dark:border-white/10 bg-white dark:bg-[#121316] px-5 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500/40 text-purple-600 dark:text-purple-400 font-mono text-[10px] font-black flex items-center justify-center shrink-0">
            15%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xs text-black dark:text-white">
                AI Dealflow Intelligence Suite
              </span>
              <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Active Tracking
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 truncate max-w-xl">
              1 of 5 diligence milestones completed • Zero-cold outreach active • 7-day front-run calibrated
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSafeModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Fast-Pass Memo Tailor</span>
          </button>
          <button
            onClick={() => setCalModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/10 text-black dark:text-white font-bold text-xs hover:border-black transition-all cursor-pointer"
          >
            Diligence Dossier
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          3. MASTER-DETAIL TWO-COLUMN SPLIT PANE WORKSPACE
         ══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        
        {/* ── LEFT COLUMN: MASTER DEAL LIST (Exact Image 3 Style) ── */}
        <div className="w-full md:w-[420px] lg:w-[460px] border-r border-[#e8e6df] dark:border-white/10 bg-white dark:bg-[#121316] flex flex-col shrink-0">
          
          {/* Sub-Filter Controls */}
          <div className="p-3.5 border-b border-[#e8e6df] dark:border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSubFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  subFilter === "all"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
              >
                All Deals ({filteredDeals.length})
              </button>
              <button
                onClick={() => setSubFilter("recommended")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  subFilter === "recommended"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <Sparkles size={11} className="text-amber-400" /> Recommended
              </button>
              <button
                onClick={() => setSubFilter("livesync")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  subFilter === "livesync"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Sync
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="p-3 border-b border-[#e8e6df] dark:border-white/10">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search in deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 rounded-xl text-xs font-mono text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>

          {/* Scrollable Deal Items List (Exact Image 3 Layout) */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-white/5">
            {filteredDeals.map((deal) => {
              const isSelected = deal.id === selectedDealId;
              return (
                <div
                  key={deal.id}
                  onClick={() => setSelectedDealId(deal.id)}
                  className={`p-4 transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? "bg-neutral-50 dark:bg-[#18191e] border-l-4 border-l-purple-600 shadow-2xs"
                      : "hover:bg-neutral-50/70 dark:hover:bg-[#15161b]"
                  }`}
                >
                  {/* Left Token / Company Circular Icon */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/10 flex items-center justify-center shrink-0 text-black dark:text-white font-bold font-mono text-xs">
                      {deal.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-heading font-black text-sm text-black dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {deal.name}
                        </span>
                        <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400 truncate">
                        {deal.founder} • {deal.sector} • {deal.targetRaise}
                      </div>
                    </div>
                  </div>

                  {/* Right Tags & Chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      {deal.matchScore}% Match
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#1c1d22] text-neutral-600 dark:text-neutral-400">
                      {deal.roundType}
                    </span>
                    <ChevronRight size={14} className="text-neutral-300 dark:text-neutral-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT COLUMN: DETAILED INSPECTION COCKPIT (Exact Image 3 Style) ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] dark:bg-[#0c0d10] overflow-y-auto p-5 sm:p-7 space-y-5">
          
          {/* Header Card (Image 3 Exact) */}
          <div className="p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-mono font-black text-lg shrink-0">
                  {selectedDeal.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-black text-black dark:text-white leading-tight">
                    {selectedDeal.name}
                  </h2>
                  <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-1">
                    {selectedDeal.founder} • {selectedDeal.sector} • <strong className="text-emerald-600 dark:text-emerald-400">{selectedDeal.targetRaise} @ {selectedDeal.valuationCap}</strong> • {selectedDeal.location}
                  </p>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">
                  {selectedDeal.matchScore}% Fit Score
                </span>
                <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-400">
                  {selectedDeal.roundType}
                </span>

                {/* Direct Message Founder Button */}
                <button
                  onClick={() => {
                    const targetId = selectedDeal.founder_id || 'lead_founder_elena';
                    navigate(`/investor-dashboard/messages?to=${targetId}&name=${encodeURIComponent(selectedDeal.founder)}&company=${encodeURIComponent(selectedDeal.name)}&deal=${encodeURIComponent(selectedDeal.name)}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0070F3] hover:bg-[#0060DF] text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <MessageSquare size={13} />
                  <span>Message Founder</span>
                </button>

                <button
                  onClick={() => setCalModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1b20] border border-purple-500/30 text-purple-600 dark:text-purple-400 font-extrabold text-xs hover:border-purple-600 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={13} />
                  <span>Interview Q&amp;A</span>
                </button>

                <button
                  onClick={() => setSafeModalOpen(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Apply on Official SAFE ↗</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: EXECUTIVE SUMMARY & VENTURE ROUND STRUCTURE */}
          <div className="p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#0070F3]" />
                <h3 className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white">
                  EXECUTIVE SUMMARY &amp; ROUND STRUCTURE
                </h3>
              </div>
              <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                {selectedDeal.matchScore}% Thesis Conviction
              </span>
            </div>

            {/* 4 Clean Institutional Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Target Raise</span>
                <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">{selectedDeal.targetRaise}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Valuation Cap</span>
                <span className="font-black text-xs text-black dark:text-white">{selectedDeal.valuationCap}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Legal Structure</span>
                <span className="font-black text-xs text-black dark:text-white">Delaware C-Corp</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-[#0070F3]/30 bg-[#0070F3]/5">
                <span className="text-[10px] text-[#0070F3] uppercase font-bold block mb-1">Round Status</span>
                <span className="font-black text-xs text-[#0070F3]">{selectedDeal.roundType}</span>
              </div>
            </div>

            {/* Description & Problem-Solution */}
            <div className="space-y-2 pt-2 font-mono text-xs">
              <p className="text-black dark:text-neutral-200 font-bold leading-relaxed">
                "{selectedDeal.tagline}"
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                {selectedDeal.description}
              </p>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <span className="text-neutral-400">
                Execute standardized SAFE or message founder directly for cap table access.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const targetId = selectedDeal.founder_id || 'lead_founder_elena';
                    navigate(`/investor-dashboard/messages?to=${targetId}&name=${encodeURIComponent(selectedDeal.founder)}&company=${encodeURIComponent(selectedDeal.name)}`);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Direct Chat →
                </button>
                <button
                  onClick={() => setSafeModalOpen(true)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  Issue SAFE Terms →
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: INSTITUTIONAL SYNDICATE & VERIFIED ALLOCATION */}
          <div className="p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-500" />
                <h3 className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white">
                  INSTITUTIONAL SYNDICATE &amp; DUE DILIGENCE
                </h3>
              </div>
              <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                {selectedDeal.authenticityScore}% Verified Data Room
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Allocation Window • Delaware 83(b) verified • 0% platform fee on primary check</span>
            </div>

            {/* 3 Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Lead Syndicate Anchor</span>
                <span className="font-black text-xs text-black dark:text-white">{selectedDeal.leadAnchor}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-emerald-500/30">
                <span className="text-[10px] text-emerald-500 uppercase font-bold block mb-1">Cap Table Audit</span>
                <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">100% Verified Founders</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">Legal Instrument</span>
                <span className="font-black text-xs text-black dark:text-white">Standard Post-Money SAFE</span>
              </div>
            </div>
          </div>

          {/* Section 3: RECOMMENDATION FIT ANALYSIS */}
          <div className="p-5 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-500" />
              <span className="font-bold text-neutral-600 dark:text-neutral-300">
                RECOMMENDATION FIT ANALYSIS: Verified fit with your sector &amp; check-size parameters.
              </span>
            </div>
            <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              {selectedDeal.matchScore}% Fit Score
            </span>
          </div>

        </div>

      </div>

      {/* Modals */}
      {safeModalOpen && (
        <OneClickSafeModal
          isOpen={safeModalOpen}
          onClose={() => setSafeModalOpen(false)}
          company={selectedDeal}
          investor={{
            id: user?.uid || "investor_partner",
            name: profile?.full_name || user?.email?.split("@")[0] || "Verified Partner",
            email: user?.email || "investor@raisequity.com",
          }}
        />
      )}

      {calModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121316] border border-neutral-200 dark:border-white/10 rounded-[28px] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-lg text-black dark:text-white">
                Schedule Diligence Call with {selectedDeal.name}
              </h3>
              <button onClick={() => setCalModalOpen(false)} className="text-neutral-400 hover:text-black dark:hover:text-white">✕</button>
            </div>
            <p className="text-xs text-neutral-500 font-mono">
              Confirmed 30-min partner diligence meeting with founder {selectedDeal.founder}.
            </p>
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200 dark:border-white/5 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Stage:</span>
                <strong className="text-black dark:text-white">{selectedDeal.stage}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Target Raise:</span>
                <strong className="text-emerald-500">{selectedDeal.targetRaise}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Valuation Cap:</span>
                <strong className="text-black dark:text-white">{selectedDeal.valuationCap}</strong>
              </div>
            </div>
            <button
              onClick={() => {
                alert(`Diligence call request sent to ${selectedDeal.founder}. You will receive a calendar invitation shortly.`);
                setCalModalOpen(false);
              }}
              className="w-full py-3 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all cursor-pointer"
            >
              Confirm 30-Min Call Request →
            </button>
          </div>
        </div>
      )}

      {telegramModalOpen && (
        <TelegramThesisAlertModal
          isOpen={telegramModalOpen}
          onClose={() => setTelegramModalOpen(false)}
        />
      )}

    </div>
  );
}
