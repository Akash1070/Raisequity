import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, Coins, Users, Gift, MessageSquare, AlertCircle, 
  ArrowUpRight, Plus, ThumbsUp, FileText, Send, Sparkles, Filter, 
  CheckCircle2, Search, Calendar, ChevronRight, ShieldCheck, Flame, 
  ExternalLink, Building2, Clock, Check, Share2, DollarSign, Trophy
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useFounderProfile } from "../../hooks/useFounderProfile";
import { useNotifications } from "../../hooks/useNotifications";
import GuaranteeSLAWidget from "../../components/dashboard/GuaranteeSLAWidget";
import DueDiligenceMemoModal from "../../components/dashboard/DueDiligenceMemoModal";
import CreatePostModal from "../../components/dashboard/CreatePostModal";
import { buildInstitutionalMemo } from "../../lib/institutionalMemo";
import { useFounderStartups } from "../../hooks/useFounderStartups";
import { 
  getFeedPosts, 
  toggleLikePost, 
  addPostComment, 
  getPostComments, 
  FeedPost 
} from "../../lib/posts";
import { getMonthlyIntroRequestUsage, MonthlyIntroQuotaStatus } from "../../lib/quota";

interface OpportunityItem {
  id: string;
  name: string;
  firm: string;
  type: "VC Fund" | "Angel Syndicate" | "Ecosystem Grant" | "Double-Blind Match";
  sectors: string[];
  stage: string;
  checkSize: string;
  matchScore: number;
  matchLevel: string;
  location: string;
  partnerName: string;
  partnerRole: string;
  responseSla: string;
  thesisSummary: string;
  warmIntroAvailable: boolean;
  warmIntroFounder?: string;
  verified: boolean;
}

const CURATED_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: "opp_decasonic",
    name: "Decasonic Ventures",
    firm: "Decasonic",
    type: "VC Fund",
    sectors: ["AI & Agents", "Web3 Infra", "SaaS"],
    stage: "Pre-Seed / Seed",
    checkSize: "$100k - $500k",
    matchScore: 96,
    matchLevel: "TIER-1 CONVICTION",
    location: "Chicago & San Francisco",
    partnerName: "Dr. Sarah Chen",
    partnerRole: "General Partner",
    responseSla: "< 48 Hours",
    thesisSummary: "Focuses on tech-native infrastructure, agentic workflows, and high-throughput data layers. Strong appetite for founders with Delaware C-Corps and early traction signals.",
    warmIntroAvailable: true,
    warmIntroFounder: "Elena Rostova",
    verified: true
  },
  {
    id: "opp_framework",
    name: "Framework Ventures",
    firm: "Framework",
    type: "VC Fund",
    sectors: ["Fintech", "ZK Protocols", "DeFi"],
    stage: "Seed",
    checkSize: "$250k - $1.5M",
    matchScore: 94,
    matchLevel: "HIGH CONVICTION",
    location: "San Francisco, CA",
    partnerName: "Michael Anderson",
    partnerRole: "Co-Founder & Partner",
    responseSla: "< 72 Hours",
    thesisSummary: "Known for hands-on network participation, deep tokenomics audit, and liquidity support. Co-leads rounds with tier-1 syndicates.",
    warmIntroAvailable: true,
    warmIntroFounder: "Marcus Vance",
    verified: true
  },
  {
    id: "opp_solana_grant",
    name: "Solana Foundation Ecosystem Grant",
    firm: "Solana Foundation",
    type: "Ecosystem Grant",
    sectors: ["Infrastructure", "Consumer Tech", "DevTools"],
    stage: "Non-Dilutive",
    checkSize: "Up to $100,000",
    matchScore: 92,
    matchLevel: "ACTIVE GRANT",
    location: "Global / Remote",
    partnerName: "Grants Committee",
    partnerRole: "Lead Reviewer",
    responseSla: "5 Business Days",
    thesisSummary: "Direct non-dilutive capital grants for open-source toolkits, SDKs, high-TPS consumer applications, and developer primitives.",
    warmIntroAvailable: false,
    verified: true
  },
  {
    id: "opp_delphi",
    name: "Delphi Digital Syndicate",
    firm: "Delphi Ventures",
    type: "Angel Syndicate",
    sectors: ["AI", "Gaming", "DeFi"],
    stage: "Pre-Seed / Seed",
    checkSize: "$100k - $350k",
    matchScore: 91,
    matchLevel: "HIGH CONVICTION",
    location: "New York, NY",
    partnerName: "Marcus Vance",
    partnerRole: "Managing Director",
    responseSla: "< 24 Hours",
    thesisSummary: "Fast-moving syndicate backed by research analysts. Delivers instant fast-pass feedback and active marketing advisory post-investment.",
    warmIntroAvailable: true,
    warmIntroFounder: "Akash Kumar",
    verified: true
  },
  {
    id: "opp_arbitrum_grant",
    name: "Arbitrum Foundation Grant Pool",
    firm: "Arbitrum Foundation",
    type: "Ecosystem Grant",
    sectors: ["Layer-2", "DeFi", "Smart Contracts"],
    stage: "Non-Dilutive",
    checkSize: "Up to $150,000",
    matchScore: 89,
    matchLevel: "ACTIVE GRANT",
    location: "Global / Remote",
    partnerName: "Ecosystem Council",
    partnerRole: "Grant Allocator",
    responseSla: "7 Business Days",
    thesisSummary: "Grant initiative providing milestones-based capital, co-marketing support, and technical audit credits for protocols deploying on Arbitrum Nitro.",
    warmIntroAvailable: false,
    verified: true
  },
  {
    id: "opp_pantera",
    name: "Pantera Capital",
    firm: "Pantera Capital",
    type: "VC Fund",
    sectors: ["Fintech", "Institutional Tech", "Web3"],
    stage: "Seed to Series A",
    checkSize: "$250k - $2.0M",
    matchScore: 88,
    matchLevel: "TOP TIER ALLOCATOR",
    location: "Menlo Park, CA",
    partnerName: "Paul Veradittakit",
    partnerRole: "Managing Partner",
    responseSla: "< 5 Days",
    thesisSummary: "One of the earliest and most respected institutional funds. Looks for mission-driven teams with deep technical domain expertise.",
    warmIntroAvailable: true,
    warmIntroFounder: "David Chen",
    verified: true
  }
];

export default function Feed() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { founderProfile, loading: profileLoading, refetch: refetchProfile } = useFounderProfile();
  const { unreadCount } = useNotifications();

  const [activeCategoryPill, setActiveCategoryPill] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityItem>(CURATED_OPPORTUNITIES[0]);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [introRequested, setIntroRequested] = useState<Record<string, boolean>>({});
  const [introNotice, setIntroNotice] = useState<string | null>(null);

  const { startups } = useFounderStartups();
  const activeStartup = startups[0] || null;
  const memoData = buildInstitutionalMemo(founderProfile, activeStartup);

  // Intro Quota State
  const [quotaStatus, setQuotaStatus] = useState<MonthlyIntroQuotaStatus>({
    usedCount: 0,
    freeCap: 5,
    remainingFree: 5,
    isOverCap: false,
    extraIntroCreditCost: 5,
  });

  useEffect(() => {
    if (user?.uid) {
      getMonthlyIntroRequestUsage(user.uid).then(setQuotaStatus);
    }
  }, [user?.uid]);

  const userCredits = founderProfile?.credits ?? profile?.credit_balance ?? 50;

  const handleRequestIntro = (opp: OpportunityItem) => {
    setIntroRequested((prev) => ({ ...prev, [opp.id]: true }));
    setIntroNotice(`Warm intro requested to ${opp.partnerName} (${opp.name})! Fast-Pass memo submitted to thesis queue.`);
    setTimeout(() => setIntroNotice(null), 5000);
  };

  const filteredOpportunities = CURATED_OPPORTUNITIES.filter((opp) => {
    if (activeCategoryPill === "vcs" && opp.type !== "VC Fund") return false;
    if (activeCategoryPill === "matches" && !opp.warmIntroAvailable) return false;
    if (activeCategoryPill === "grants" && opp.type !== "Ecosystem Grant") return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      opp.name.toLowerCase().includes(q) ||
      opp.partnerName.toLowerCase().includes(q) ||
      opp.sectors.some((s) => s.toLowerCase().includes(q)) ||
      opp.stage.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 pb-24 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Warm Intro Confirmation Notification Banner */}
      {introNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{introNotice}</span>
          </div>
          <button onClick={() => setIntroNotice(null)} className="text-emerald-600 hover:text-emerald-800 ml-4">✕</button>
        </div>
      )}
      
      {/* ══════════════════════════════════════════════════════════
          1. HIREINCRYPTO TOP HORIZONTAL CATEGORY PILL BAR
         ══════════════════════════════════════════════════════════ */}
      <div className="border border-slate-200 dark:border-[#262626] rounded-2xl bg-white dark:bg-[#111111] px-4 py-2 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {[
            { id: "all", label: "All Opportunities", count: "180+" },
            { id: "matches", label: "Double-Blind Matches", count: 3 },
            { id: "vcs", label: "Check-Writers", count: "180+" },
            { id: "grants", label: "Ecosystem Grants", count: 35 },
            { id: "vetted", label: "Vetted Agencies", count: 109, path: "/dashboard/services" },
            { id: "sla", label: "30-Day SLA Window", count: "24d left", path: "/dashboard/bookings" },
          ].map((pill) => {
            const isSelected = activeCategoryPill === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => {
                  if (pill.path) {
                    navigate(pill.path);
                  } else {
                    setActiveCategoryPill(pill.id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "bg-slate-100 dark:bg-[#18191e] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <span>{pill.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                    : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-300"
                }`}>
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsMemoOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#18191e] hover:bg-slate-200 dark:hover:bg-[#202127] text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-white/5 cursor-pointer"
          >
            <FileText size={13} className="text-[#0070F3]" />
            <span>Fast-Pass Memo</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/credits')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-xs font-mono font-bold cursor-pointer"
          >
            <Coins size={12} />
            <span>{userCredits} Credits</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. SUMMARY & SLA TELEMETRY STRIP
         ══════════════════════════════════════════════════════════ */}
      <div className="border border-slate-200 dark:border-[#262626] rounded-2xl bg-white dark:bg-[#111111] px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-[#00F5A0] shrink-0 font-mono font-black text-xs">
            SLA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Guaranteed Partner Meeting SLA: Active Window
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-[#00F5A0] text-[9px] font-mono font-black uppercase border border-emerald-500/25">
                100% Refundable
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              1 of 3 partner calls completed • 24 days remaining in delivery window • 5 free monthly intro quota active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/dashboard/bookings')}
            className="px-4 py-2 rounded-xl bg-[#0070F3] hover:bg-[#0060DF] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar size={13} />
            <span>Manage Partner Calls (1/3)</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          3. MASTER-DETAIL SPLIT WORKSPACE (HireInCrypto Layout)
         ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ── LEFT MASTER LIST: OPPORTUNITY CARDS (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Quick Search & Sub-Filter Bar */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#111111] p-2.5 rounded-2xl border border-slate-200 dark:border-[#262626] shadow-xs">
            <Search size={15} className="text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Search check-writers, partner names, thesis keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-medium text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
            />
            <span className="text-[11px] font-mono text-slate-400 px-2 shrink-0">
              {filteredOpportunities.length} matches
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredOpportunities.map((opp) => {
              const isSelected = selectedOpportunity.id === opp.id;
              const hasRequested = introRequested[opp.id];

              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpportunity(opp)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-slate-50 dark:bg-[#16171b] border-[#0070F3] dark:border-[#0070F3] shadow-md ring-1 ring-[#0070F3]/30"
                      : "bg-white dark:bg-[#111111] border-slate-200 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#383838] shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1c1d22] border border-slate-200 dark:border-white/10 flex items-center justify-center font-mono font-black text-sm text-[#0070F3] shrink-0">
                        {opp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                            {opp.name}
                          </h3>
                          {opp.verified && (
                            <CheckCircle2 size={13} className="text-[#0070F3] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {opp.partnerName} • <span className="font-bold text-slate-700 dark:text-slate-300">{opp.partnerRole}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                        opp.matchScore >= 92
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-[#00F5A0] border border-emerald-500/25"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25"
                      }`}>
                        {opp.matchScore}% FIT
                      </span>
                    </div>
                  </div>

                  {/* Badges / Metrics Row */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                      Check: {opp.checkSize}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                      {opp.stage}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                      SLA: {opp.responseSla}
                    </span>
                  </div>

                  {/* Sectors */}
                  <div className="flex flex-wrap items-center gap-1">
                    {opp.sectors.map((sec) => (
                      <span
                        key={sec}
                        className="px-2 py-0.2 rounded text-[9px] font-mono font-medium bg-slate-50 dark:bg-[#1a1b20] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/5"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>

                  {opp.warmIntroAvailable && opp.warmIntroFounder && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-[#00F5A0] font-bold">
                      <span className="flex items-center gap-1">
                        <Sparkles size={11} /> Warm intro available via {opp.warmIntroFounder}
                      </span>
                      <span className="text-[10px] uppercase text-slate-400 font-bold">Double-Blind ✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT DETAIL COLUMN: INSPECTION PANE (5 Cols - Sticky) ── */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="rounded-3xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] p-6 shadow-sm space-y-5">
            
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-[#262626] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center text-[#0070F3] font-mono font-black text-lg shadow-xs">
                  {selectedOpportunity.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedOpportunity.name}
                    </h2>
                    <CheckCircle2 size={14} className="text-[#0070F3]" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {selectedOpportunity.partnerName} • {selectedOpportunity.partnerRole}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-[#00F5A0] font-mono text-[10px] font-black uppercase border border-emerald-500/30">
                {selectedOpportunity.matchLevel}
              </span>
            </div>

            {/* Match Diagnosis Metric Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#16171b] border border-slate-200 dark:border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 font-bold">Algorithmic Thesis Match</span>
                <span className="text-emerald-600 dark:text-[#00F5A0] font-black text-sm">
                  {selectedOpportunity.matchScore}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#0070F3] h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedOpportunity.matchScore}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                <div>Response SLA: <strong className="text-slate-800 dark:text-white">{selectedOpportunity.responseSla}</strong></div>
                <div>Location: <strong className="text-slate-800 dark:text-white">{selectedOpportunity.location}</strong></div>
              </div>
            </div>

            {/* Investment Focus & Thesis */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                Partner Investment Focus
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {selectedOpportunity.thesisSummary}
              </p>
            </div>

            {/* Key Term Specs */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#16171b] border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Typical Check</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedOpportunity.checkSize}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#16171b] border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Target Stage</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedOpportunity.stage}</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#262626]">
              <button
                onClick={() => handleRequestIntro(selectedOpportunity)}
                disabled={introRequested[selectedOpportunity.id]}
                className="w-full py-3 px-4 bg-[#0070F3] hover:bg-[#0060DF] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                {introRequested[selectedOpportunity.id] ? (
                  <>
                    <CheckCircle2 size={15} /> Intro Request Dispatched
                  </>
                ) : (
                  <>
                    <Share2 size={15} /> Request Warm Intro (1 Credit / Quota)
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/dashboard/bookings')}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-900 dark:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar size={15} /> Book Partner Pitch Call (30-Day SLA)
              </button>

              <button
                onClick={() => setIsMemoOpen(true)}
                className="w-full py-2.5 px-4 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-mono font-bold transition-all text-center cursor-pointer"
              >
                Generate 1-Page Fast-Pass Memo →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Due Diligence Memo Modal */}
      {isMemoOpen && (
        <DueDiligenceMemoModal
          isOpen={isMemoOpen}
          onClose={() => setIsMemoOpen(false)}
          memo={memoData}
        />
      )}

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
          }}
          authorId={user?.uid || "founder"}
          authorName={founderProfile?.full_name || profile?.full_name || "Founder"}
          authorEmail={user?.email || "founder@raisequity.com"}
          authorRole={profile?.role || "founder"}
          userCredits={userCredits}
        />
      )}
    </div>
  );
}
