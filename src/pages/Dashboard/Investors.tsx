import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, Loader2, AlertCircle, CheckCircle2, Plus, ShieldCheck, UserCheck, Lock, Unlock, Sparkles, Mail, Send, Copy, ExternalLink, Users, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useFounderProfile } from "../../hooks/useFounderProfile";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, getCountFromServer } from "firebase/firestore";
import { getInvestorConnections } from "../../lib/connections";
import { createIntroRequest } from "../../lib/intros";
import { getWeb3Investors, unlockInvestorContact, declarePersonalInvestorBridge, getInvestorAvatarUrl } from "../../lib/investors";
import { rankInvestorsForStartup } from "../../lib/matching";
import DeclareConnectionModal from "../../components/dashboard/DeclareConnectionModal";
import CreditPackageModal from "../../components/dashboard/CreditPackageModal";
import type { InvestorConnection } from "../../types";
import type { Web3Investor } from "../../types/investor";

const SECTOR_OPTIONS = [
  "All",
  "AI & Agents",
  "B2B SaaS & Enterprise",
  "FinTech & Payments",
  "Consumer Tech & Social",
  "DeepTech & Robotics",
  "BioTech & HealthTech",
  "ClimateTech & Clean Energy",
  "Web3 Infrastructure & DevTools",
  "DeFi & Digital Assets",
  "DePIN & Decentralized Compute",
  "Layer 1 / Layer 2 Networks",
  "GameFi & Metaverse",
  "RWA & Tokenization",
  "Cybersecurity & ZK Proofs"
];
const CATEGORY_OPTIONS = ["All", "VC Fund", "Angel Investor", "Accelerator", "Incubator", "Family Office", "Ecosystem Fund"];
const STAGE_OPTIONS = ["All", "Pre-seed", "Seed", "Series A", "Series B+", "Growth", "Non-Dilutive Grant"];
const CHECK_SIZE_OPTIONS = ["All", "<$50k", "$50k - $250k", "$250k - $1M", "$1M+"];

export default function Investors() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { founderProfile, refetch: refetchProfile } = useFounderProfile();

  const [activeTab, setActiveTab] = useState<"directory" | "graph">("directory");

  // Web3 Investor Directory State
  const [directoryInvestors, setDirectoryInvestors] = useState<Web3Investor[]>([]);
  const [totalServerCount, setTotalServerCount] = useState<number | null>(null);
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(30);
  const [hasMoreDirectory, setHasMoreDirectory] = useState(false);
  const [directoryCursor, setDirectoryCursor] = useState("");

  // Warm Intro Connections State
  const [declaredConnections, setDeclaredConnections] = useState<InvestorConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  // Global Filters & Modals
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [checkSizeFilter, setCheckSizeFilter] = useState("All");
  const [warmIntroOnly, setWarmIntroOnly] = useState(false);
  const [unlockedOnly, setUnlockedOnly] = useState(false);
  const [highConvictionOnly, setHighConvictionOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"fit" | "intros" | "name">("fit");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [introConnection, setIntroConnection] = useState<InvestorConnection | null>(null);
  const [introSending, setIntroSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [liveCredits, setLiveCredits] = useState<number | null>(null);

  useEffect(() => {
    const handleCreditUpdate = (e: any) => {
      if (e?.detail?.newBalance !== undefined) {
        setLiveCredits(e.detail.newBalance);
      }
    };
    window.addEventListener('rq_credits_updated', handleCreditUpdate);
    return () => window.removeEventListener('rq_credits_updated', handleCreditUpdate);
  }, []);

  const currentCredits = liveCredits ?? (profile?.credit_balance !== undefined && profile?.credit_balance !== null
    ? profile.credit_balance
    : (founderProfile?.credits !== undefined && founderProfile?.credits !== null
    ? founderProfile.credits
    : 50));

  // Fetch Web3 Investor Dataset & User Unlocked IDs (bounded pagination —
  // never pull thousands of docs into one request).
  const loadDirectory = async () => {
    setLoadingDirectory(true);
    try {
      let activeUnlockedIds: string[] = unlockedIds;

      // Fetch true count from server
      getCountFromServer(collection(db, "web3_investors"))
        .then((snapshot) => setTotalServerCount(snapshot.data().count))
        .catch(() => {});

      // Fetch unlocked array from user profile
      if (user?.uid) {
        const uSnap = await getDoc(doc(db, "users", user.uid));
        if (uSnap.exists()) {
          activeUnlockedIds = uSnap.data().unlocked_investors || [];
          setUnlockedIds(activeUnlockedIds);
        }
      }

      const list = await getWeb3Investors(activeUnlockedIds, false, { limit: 200 });
      setDirectoryInvestors(list);
      setHasMoreDirectory(list.length === 200);
      setDirectoryCursor(list.length > 0 ? list[list.length - 1].id : "");
    } catch (err: any) {
      console.error("Error loading investor directory:", err);
    } finally {
      setLoadingDirectory(false);
    }
  };

  const loadMoreDirectory = async () => {
    if (!hasMoreDirectory || !directoryCursor || loadingDirectory) return;
    setLoadingDirectory(true);
    try {
      let activeUnlockedIds = unlockedIds;
      if (user?.uid) {
        const uSnap = await getDoc(doc(db, "users", user.uid));
        if (uSnap.exists()) activeUnlockedIds = uSnap.data().unlocked_investors || [];
      }
      const more = await getWeb3Investors(activeUnlockedIds, false, { limit: 200, lastId: directoryCursor });
      if (!more.length) {
        setHasMoreDirectory(false);
        return;
      }
      setDirectoryInvestors((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const fresh = more.filter((m) => !seen.has(m.id));
        return [...prev, ...fresh];
      });
      setDirectoryCursor(more[more.length - 1].id);
      setHasMoreDirectory(more.length === 200);
    } catch (err: any) {
      console.error("Error loading more investors:", err);
    } finally {
      setLoadingDirectory(false);
    }
  };

  // Fetch Warm Intro Graph
  const loadConnections = async () => {
    setLoadingConnections(true);
    try {
      const firestoreConns = await getInvestorConnections(
        sectorFilter !== "All" ? sectorFilter : undefined
      );
      setDeclaredConnections(firestoreConns);
    } catch (err: any) {
      console.error("Error loading connections:", err);
    } finally {
      setLoadingConnections(false);
    }
  };

  useEffect(() => {
    loadDirectory();
    loadConnections();
  }, [user?.uid]);

  // Reset pagination slicing when filters change so UI is instantaneous
  useEffect(() => {
    setVisibleCount(30);
  }, [searchTerm, sectorFilter, categoryFilter, stageFilter, checkSizeFilter, warmIntroOnly, unlockedOnly, highConvictionOnly, sortBy]);

  // Handle Contact Unlock (1 Credit)
  const handleUnlockContact = async (investorId: string) => {
    if (!user) {
      setError("Please sign in to unlock contact details.");
      return;
    }

    if (currentCredits < 1) {
      setCreditModalOpen(true);
      return;
    }

    setUnlockingId(investorId);
    setError(null);

    const res = await unlockInvestorContact(user.uid, investorId, currentCredits);
    if (res.success) {
      if (res.remainingCredits !== undefined) {
        setLiveCredits(res.remainingCredits);
      }
      setUnlockedIds((prev) => [...prev, investorId]);
      if (res.unlockedData) {
        setDirectoryInvestors((prev) =>
          prev.map((inv) =>
            inv.id === investorId
              ? { ...inv, email: res.unlockedData!.email, telegram: res.unlockedData!.telegram }
              : inv
          )
        );
      }
      await refetchProfile();
      setSuccessMessage("Contact details unlocked successfully! (1 Credit used)");
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setError(res.error || "Failed to unlock contact details.");
    }
    setUnlockingId(null);
  };

  // Handle "I Know Them Personally"
  const handleDeclarePersonal = async (investor: Web3Investor) => {
    if (!user) return;
    try {
      const res = await declarePersonalInvestorBridge(
        user.uid,
        founderProfile?.full_name || user.email || "Founder",
        founderProfile?.company_name || "My Startup",
        investor
      );

      if (res.success) {
        setSuccessMessage(`You marked that you personally know ${investor.name}! Other founders can now request warm intros from you.`);
        loadDirectory();
        loadConnections();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError(res.error || "Error declaring connection.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to declare connection.");
    }
  };

  // Handle Warm Intro Request
  const handleRequestWarmIntro = async () => {
    if (!introConnection || !user) return;
    setIntroSending(true);
    setError(null);

    try {
      const res = await createIntroRequest(
        user.uid,
        founderProfile?.full_name || user.email || "Founder",
        user.email || "",
        introConnection.founderId,
        introConnection.founderName,
        "connector@raisequity.com",
        introConnection.id,
        introConnection.investorName,
        introConnection.investorFirm
      );

      if (res.success) {
        await refetchProfile();
        setSuccessMessage(`Successfully requested introduction to ${introConnection.investorName}!`);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError(res.error || "Failed to send intro request.");
      }
    } catch (err: any) {
      setError(err.message || "Error sending intro request.");
    } finally {
      setIntroSending(false);
      setIntroConnection(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Merge crowdsourced/founder declared connections into the directory view
  const allInvestors = useMemo(() => {
    const convertedConns: Web3Investor[] = declaredConnections.map((c) => ({
      id: `conn_${c.id}`,
      name: c.investorName,
      firm: c.investorFirm || "Angel Portfolio",
      category: "ANGEL",
      role: "Partner / Angel",
      sectors: (c.sectors && c.sectors.length > 0) ? (c.sectors as any) : ["AI", "Tech", "SaaS"],
      stage: Array.isArray(c.stage) ? c.stage.join(" / ") : (c.stage || "Pre-Seed / Seed"),
      check_size: c.ticketSize || "$50k - $250k",
      location: "Global / Remote",
      email: "f***@vc-fund.com",
      telegram: "@t***_handle",
      twitter: "",
      linkedin: "",
      website: "",
      verified: true,
      know_count: 1,
      warm_intro_founder: c.founderName,
      warm_intro_company: c.founderCompany,
    }));

    const seen = new Set<string>();
    const combined: Web3Investor[] = [];

    // Prioritize declared connections with warm intro at the top
    for (const c of convertedConns) {
      const key = `${c.name.toLowerCase()}_${c.firm.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(c);
      }
    }

    for (const inv of directoryInvestors) {
      const key = `${inv.name.toLowerCase()}_${inv.firm.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(inv);
      }
    }

    return combined;
  }, [directoryInvestors, declaredConnections]);

  // Memoize ranking against founder's startup profile
  const { rankedDirectory, matchById } = useMemo(() => {
    const myStartup = {
      sector: founderProfile?.sector || undefined,
      stage: founderProfile?.stage || undefined,
      funding_goal: founderProfile?.funding_goal || undefined,
      location: founderProfile?.location || undefined,
      description: founderProfile?.what_company_does || founderProfile?.company_blurb || undefined,
      traction: founderProfile?.traction_signal || undefined,
    };
    const ranked = rankInvestorsForStartup(
      allInvestors.map((inv) => ({
        ...inv,
        sectors: inv.sectors,
        stage: inv.stage,
        check_size: inv.check_size,
        location: inv.location
      })),
      myStartup,
      { minScore: 0, limit: allInvestors.length || 1 }
    ) as (Web3Investor & { match: import("../../lib/matching").MatchResult })[];

    const map = new Map(ranked.map((r) => [r.id, r.match]));
    return { rankedDirectory: ranked, matchById: map };
  }, [allInvestors, founderProfile]);

  // Memoize filtering so dropdown toggles are instantaneous (<5ms)
  const filteredDirectory = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();
    const filterSectorLower = sectorFilter.toLowerCase();
    const filterCategoryLower = categoryFilter.toLowerCase();
    const filterStageLower = stageFilter.toLowerCase();

    const list = rankedDirectory.filter((inv) => {
      if (searchLower) {
        const matchesSearch =
          inv.name.toLowerCase().includes(searchLower) ||
          inv.firm.toLowerCase().includes(searchLower) ||
          (inv.location && inv.location.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      if (categoryFilter !== "All") {
        if (!inv.category || !inv.category.toLowerCase().includes(filterCategoryLower)) return false;
      }

      if (sectorFilter !== "All") {
        const hasMatchingSector = inv.sectors && inv.sectors.some((s) => {
          const sLower = s.toLowerCase();
          if (sLower.includes(filterSectorLower) || filterSectorLower.includes(sLower)) return true;
          if (filterSectorLower.includes("ai") && (sLower.includes("ai") || sLower.includes("agent") || sLower.includes("machine learning"))) return true;
          if (filterSectorLower.includes("saas") && (sLower.includes("saas") || sLower.includes("b2b") || sLower.includes("enterprise") || sLower.includes("software"))) return true;
          if (filterSectorLower.includes("fintech") && (sLower.includes("fintech") || sLower.includes("payment") || sLower.includes("banking"))) return true;
          if (filterSectorLower.includes("consumer") && (sLower.includes("consumer") || sLower.includes("social") || sLower.includes("mobile") || sLower.includes("app"))) return true;
          if (filterSectorLower.includes("deeptech") && (sLower.includes("deeptech") || sLower.includes("hardware") || sLower.includes("robotics") || sLower.includes("semiconductor"))) return true;
          if (filterSectorLower.includes("climate") && (sLower.includes("climate") || sLower.includes("energy") || sLower.includes("sustainability") || sLower.includes("cleantech"))) return true;
          if (filterSectorLower.includes("web3") && (sLower.includes("web3") || sLower.includes("crypto") || sLower.includes("infrastructure") || sLower.includes("infra"))) return true;
          if (filterSectorLower.includes("defi") && (sLower.includes("defi") || sLower.includes("dex") || sLower.includes("lending") || sLower.includes("yield"))) return true;
          if (filterSectorLower.includes("depin") && (sLower.includes("depin") || sLower.includes("hardware") || sLower.includes("wireless") || sLower.includes("compute"))) return true;
          if (filterSectorLower.includes("layer") && (sLower.includes("layer") || sLower.includes("l1") || sLower.includes("l2") || sLower.includes("rollup"))) return true;
          if (filterSectorLower.includes("game") && (sLower.includes("game") || sLower.includes("gaming") || sLower.includes("gamefi") || sLower.includes("metaverse"))) return true;
          if (filterSectorLower.includes("rwa") && (sLower.includes("rwa") || sLower.includes("real world") || sLower.includes("asset") || sLower.includes("tokenization"))) return true;
          if (filterSectorLower.includes("security") && (sLower.includes("security") || sLower.includes("zk") || sLower.includes("audit") || sLower.includes("privacy"))) return true;
          return false;
        });
        if (!hasMatchingSector) return false;
      }

      if (stageFilter !== "All") {
        if (!inv.stage || !inv.stage.toLowerCase().includes(filterStageLower)) return false;
      }

      if (checkSizeFilter !== "All") {
        const cs = (inv.check_size || "").toLowerCase();
        let matchesCheck = true;
        if (checkSizeFilter === "<$50k") matchesCheck = cs.includes("25k") || cs.includes("50k") || cs.includes("10k") || cs.includes("15k") || cs.includes("30k");
        else if (checkSizeFilter === "$50k - $250k") matchesCheck = cs.includes("50k") || cs.includes("100k") || cs.includes("150k") || cs.includes("200k") || cs.includes("250k");
        else if (checkSizeFilter === "$250k - $1M") matchesCheck = cs.includes("250k") || cs.includes("300k") || cs.includes("500k") || cs.includes("750k") || cs.includes("1m");
        else if (checkSizeFilter === "$1M+") matchesCheck = cs.includes("1m") || cs.includes("2m") || cs.includes("3m") || cs.includes("5m") || cs.includes("10m");
        if (!matchesCheck) return false;
      }

      if (warmIntroOnly && !Boolean(inv.warm_intro_founder || (inv.know_count && inv.know_count > 0))) return false;
      if (unlockedOnly && !unlockedIds.includes(inv.id)) return false;
      if (highConvictionOnly) {
        const m = matchById.get(inv.id);
        if (!m || m.score < 70) return false;
      }

      return true;
    });

    if (sortBy === "intros") {
      list.sort((a, b) => (b.know_count || 0) - (a.know_count || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [
    rankedDirectory,
    searchTerm,
    categoryFilter,
    sectorFilter,
    stageFilter,
    checkSizeFilter,
    warmIntroOnly,
    unlockedOnly,
    highConvictionOnly,
    sortBy,
    unlockedIds,
    matchById
  ]);

  // Windowed slicing: Render top `visibleCount` investors to keep the DOM blazing fast
  const displayedInvestors = useMemo(() => {
    return filteredDirectory.slice(0, visibleCount);
  }, [filteredDirectory, visibleCount]);

  // Filtering Connections Graph
  const filteredConnections = declaredConnections.filter((conn) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return conn.investorName.toLowerCase().includes(term) || conn.investorFirm.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8 pb-24 text-slate-900 dark:text-slate-100 font-sans">
      {/* Header & Topbar Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-[#262626] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white font-heading">
              Investor Network &amp; Check-Writers Directory
            </h1>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-full text-xs font-black border border-amber-500/30 flex items-center gap-1.5 shadow-2xs">
              <Sparkles size={14} className="text-amber-500" /> {currentCredits} Credits Available
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm">
            Access direct verified check-writer emails, Telegram handles, and crowdsourced warm introduction networks for Tech, AI, SaaS, Web2 &amp; Web3 startups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/credits")}
            className="bg-slate-100 dark:bg-[#171717] hover:bg-slate-200 dark:hover:bg-[#222222] text-slate-800 dark:text-slate-200 font-extrabold text-xs px-4 py-3 rounded-2xl transition-all border border-slate-200 dark:border-[#262626] cursor-pointer flex items-center gap-2"
          >
            <Sparkles size={14} className="text-amber-500" /> Get More Credits
          </button>
          <button
            onClick={() => setShowDeclareModal(true)}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={16} /> Declare Connection
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 text-xs font-extrabold flex items-center gap-2 shadow-xs"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          {successMessage}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-800/50 text-xs font-extrabold flex items-center gap-2 shadow-xs"
        >
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#262626]">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "directory"
              ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Database size={16} /> Investor Directory ({totalServerCount ? totalServerCount.toLocaleString() : directoryInvestors.length})
        </button>
        <button
          onClick={() => setActiveTab("graph")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "graph"
              ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Users size={16} /> Founder Warm Intro Graph ({declaredConnections.length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xs">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={activeTab === "directory" ? "Search investor name, VC fund, location..." : "Search warm intro graph..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-semibold text-slate-900 dark:text-white focus:ring-0 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Sector Filter */}
        <div className="relative">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl px-5 py-3 pr-10 text-xs font-black cursor-pointer focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none shadow-2xs text-slate-900 dark:text-white"
          >
            {SECTOR_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">
                Sector: {s}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Category Filter (Directory Only) */}
        {activeTab === "directory" && (
          <>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl px-5 py-3 pr-10 text-xs font-black cursor-pointer focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none shadow-2xs text-slate-900 dark:text-white"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">
                    Type: {c}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl px-5 py-3 pr-10 text-xs font-black cursor-pointer focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none shadow-2xs text-slate-900 dark:text-white"
              >
                {STAGE_OPTIONS.map((st) => (
                  <option key={st} value={st} className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">
                    Stage: {st}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={checkSizeFilter}
                onChange={(e) => setCheckSizeFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl px-5 py-3 pr-10 text-xs font-black cursor-pointer focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none shadow-2xs text-slate-900 dark:text-white"
              >
                {CHECK_SIZE_OPTIONS.map((cs) => (
                  <option key={cs} value={cs} className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">
                    Check: {cs}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </>
        )}
      </div>

      {/* Advanced Quick-Filter Pills & Sort Bar */}
      {activeTab === "directory" && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setHighConvictionOnly(!highConvictionOnly)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                highConvictionOnly
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <span>🔥 70%+ Fit Only</span>
            </button>

            <button
              onClick={() => setWarmIntroOnly(!warmIntroOnly)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                warmIntroOnly
                  ? "bg-[#0070F3] text-white shadow-xs"
                  : "bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <span>🤝 Warm Bridges Only</span>
            </button>

            <button
              onClick={() => setUnlockedOnly(!unlockedOnly)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                unlockedOnly
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <span>🔓 Unlocked ({unlockedIds.length})</span>
            </button>

            {(highConvictionOnly || warmIntroOnly || unlockedOnly || stageFilter !== "All" || checkSizeFilter !== "All" || sectorFilter !== "All" || categoryFilter !== "All" || searchTerm) && (
              <button
                onClick={() => {
                  setHighConvictionOnly(false);
                  setWarmIntroOnly(false);
                  setUnlockedOnly(false);
                  setStageFilter("All");
                  setCheckSizeFilter("All");
                  setSectorFilter("All");
                  setCategoryFilter("All");
                  setSearchTerm("");
                }}
                className="text-[11px] font-mono font-bold text-slate-400 hover:text-rose-500 transition-colors ml-2 cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-xl px-3 py-1.5 font-bold text-xs outline-none cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value="fit">Highest Fit %</option>
              <option value="intros">Most Warm Bridges</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 1: WEB3 INVESTOR DATABASE */}
      {activeTab === "directory" && (
        <div>
          {loadingDirectory ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 size={32} className="animate-spin text-slate-900" />
              <p className="text-xs font-mono font-bold text-slate-400">Loading investor database...</p>
            </div>
          ) : filteredDirectory.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-xs">
              <Database size={32} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-black text-base text-slate-900">No Investors Found</h3>
              <p className="text-slate-500 font-medium text-xs max-w-sm mx-auto mt-1">
                Try adjusting your search query or filters to browse active funds and check-writers.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedInvestors.map((inv) => {
                  const isUnlocked = unlockedIds.includes(inv.id);
                  const avatarSrc = getInvestorAvatarUrl(inv);

                return (
                  <div
                    key={inv.id}
                    className="bg-white dark:bg-[#111111] rounded-[28px] border border-slate-200/80 dark:border-[#262626] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarSrc}
                            alt={inv.name}
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute('src', `https://ui-avatars.com/api/?name=${encodeURIComponent(inv.name)}&background=0F172A&color=fff&bold=true`);
                            }}
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-neutral-700 shrink-0 shadow-2xs"
                          />
                          <div>
                            <h3 className="font-black text-base text-slate-900 dark:text-white">{inv.name}</h3>
                            <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400">{inv.firm}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#1a1b20] text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200/80 dark:border-white/5">
                            {inv.category || "VC Fund"}
                          </span>
                          {(() => { const m = matchById.get(inv.id); return m && (founderProfile?.sector || founderProfile?.stage) ? (
                            <span title={[...m.reasons, ...m.negatives].join(' · ')} className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg ${m.score >= 70 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : m.score >= 35 ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : "bg-slate-50 text-slate-400 dark:bg-neutral-800"}`}>
                              {m.score >= 50 ? "Best for you · " : ""}{m.score}% fit
                            </span>) : null; })()}
                        </div>
                      </div>

                      {/* Details & Badges */}
                      <div className="space-y-2.5 mb-6">
                        {inv.warm_intro_founder && (
                          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-[#00F5A0] text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                            <Sparkles size={12} className="text-emerald-500" />
                            <span>Warm Intro Available via {inv.warm_intro_founder}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-400 font-medium">Check Size:</span>
                          <span className="font-black text-slate-900 dark:text-white">{inv.check_size || "$100k"}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-400 font-medium">Target Stage:</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{inv.stage || "Pre-seed / Seed"}</span>
                        </div>

                        {/* Sectors */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {inv.sectors?.map((sec) => (
                            <span
                              key={sec}
                              className="px-2.5 py-0.5 bg-slate-50 dark:bg-[#18191e] text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold border border-slate-200/60 dark:border-white/5"
                            >
                              {sec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Gated / Unlocked Contact Box */}
                      <div className="p-4 bg-slate-50 dark:bg-[#18191e] rounded-2xl border border-slate-200/80 dark:border-white/5 mb-6 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">
                            Direct Contact Details
                          </span>
                          {isUnlocked ? (
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Unlock size={12} /> UNLOCKED
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Lock size={12} /> GATED (1 CREDIT)
                            </span>
                          )}
                        </div>

                        {isUnlocked ? (
                          <div className="space-y-2 pt-1">
                            {inv.email && (
                              <div className="flex items-center justify-between bg-white dark:bg-[#121316] p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white font-bold">
                                <a
                                  href={`mailto:${inv.email}?subject=${encodeURIComponent(`Intro: ${founderProfile?.company_name || 'Startup'} (Raisequity Dealflow)`)}&body=${encodeURIComponent(`Hi ${inv.name.split(' ')[0]},\n\nI am building ${founderProfile?.company_name || 'our startup'} (${founderProfile?.what_company_does || 'Tech'}). We noticed ${inv.firm}'s investments in ${inv.sectors?.[0] || 'this sector'} and wanted to share our fast-pass tear sheet.\n\nWebsite: ${founderProfile?.company_website || ''}`)}`}
                                  className="truncate mr-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                                  title="Click to email direct pitch"
                                >
                                  ✉️ {inv.email}
                                </a>
                                <button
                                  onClick={() => copyToClipboard(inv.email!, `email-${inv.id}`)}
                                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer shrink-0"
                                >
                                  {copiedId === `email-${inv.id}` ? <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
                                </button>
                              </div>
                            )}

                            {inv.telegram && (
                              <a
                                href={inv.telegram.startsWith("http") ? inv.telegram : `https://t.me/${inv.telegram.replace("@", "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/40 p-2.5 rounded-xl border border-sky-200 dark:border-sky-800/40 text-xs font-mono text-sky-900 dark:text-sky-300 font-black transition-colors"
                              >
                                <span>✈️ {inv.telegram}</span>
                                <ExternalLink size={14} className="text-sky-600" />
                              </a>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              {inv.email && (
                                <a
                                  href={`mailto:${inv.email}?subject=${encodeURIComponent(`Intro: ${founderProfile?.company_name || 'Startup'}`)}`}
                                  className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-mono font-bold text-center transition-colors"
                                >
                                  ✉️ Send Pitch Email
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  const blurb = `Hi ${inv.name.split(' ')[0]},\n\nWe are building ${founderProfile?.company_name || 'our startup'}. ${founderProfile?.what_company_does || ''} Targeting ${inv.stage || 'Seed'} round (${inv.check_size || '$100k'}).\nWebsite: ${founderProfile?.company_website || ''}`;
                                  copyToClipboard(blurb, `blurb-${inv.id}`);
                                }}
                                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-mono font-bold text-center transition-colors cursor-pointer"
                              >
                                {copiedId === `blurb-${inv.id}` ? "✓ Blurb Copied" : "📋 Copy Blurb"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1 text-xs font-mono text-slate-400">
                            <div className="bg-white dark:bg-[#121316] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                              <span>✉️ e***@vc-fund.com</span>
                              <Lock size={12} />
                            </div>
                            <div className="bg-white dark:bg-[#121316] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/5 flex items-center justify-between">
                              <span>✈️ @t***_handle</span>
                              <Lock size={12} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="space-y-2 pt-2">
                      {inv.warm_intro_founder && (
                        <button
                          onClick={() => {
                            const connMatch = declaredConnections.find(
                              (c) => c.investorName.toLowerCase() === inv.name.toLowerCase()
                            ) || {
                              id: inv.id.replace('conn_', ''),
                              founderId: 'network',
                              founderName: inv.warm_intro_founder || 'Community Founder',
                              founderCompany: (inv as any).warm_intro_company || 'Portfolio Co',
                              investorName: inv.name,
                              investorFirm: inv.firm,
                              sectors: (inv.sectors || ['AI', 'Web3']) as any,
                              stage: [inv.stage || 'Seed'],
                              ticketSize: inv.check_size || '$100k',
                              createdAt: new Date().toISOString()
                            };
                            setIntroConnection(connMatch);
                          }}
                          className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] border border-emerald-500/30 rounded-2xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Sparkles size={14} className="text-emerald-500" />
                          <span>Request Warm Intro via {inv.warm_intro_founder}</span>
                        </button>
                      )}

                      {!isUnlocked ? (
                        <button
                          onClick={() => handleUnlockContact(inv.id)}
                          disabled={unlockingId === inv.id}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                        >
                          {unlockingId === inv.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              <Sparkles size={14} className="text-amber-400" />
                              <span>Unlock Contacts (1 Credit)</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeclarePersonal(inv)}
                          className="w-full py-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <ShieldCheck size={16} className="text-purple-600" />
                          <span>I Know Them Personally</span>
                        </button>
                      )}

                      {!isUnlocked && (
                        <button
                          onClick={() => handleDeclarePersonal(inv)}
                          className="w-full py-2.5 text-slate-500 hover:text-slate-900 text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>I know them personally (Bridge Intro)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Load More Slicing Control */}
            {(visibleCount < filteredDirectory.length || hasMoreDirectory) && (
              <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-2">
                <button
                  onClick={() => {
                    if (visibleCount >= filteredDirectory.length && hasMoreDirectory) {
                      loadMoreDirectory();
                    } else {
                      setVisibleCount((prev) => prev + 30);
                    }
                  }}
                  disabled={loadingDirectory}
                  className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingDirectory ? (
                    <Loader2 size={14} className="animate-spin text-amber-400" />
                  ) : (
                    <Sparkles size={14} className="text-amber-400" />
                  )}
                  <span>{loadingDirectory ? "Loading more..." : "Load More Check-Writers"}</span>
                  <span className="font-mono text-[11px] opacity-75">
                    (Showing {displayedInvestors.length} of {totalServerCount ?? filteredDirectory.length})
                  </span>
                </button>
                <p className="text-[11px] font-mono text-slate-400">
                  Browsing the full verified check-writer directory in batches — instant contact unlocking stays available.
                </p>
              </div>
            )}
          </>
          )}
        </div>
      )}

      {/* TAB 2: FOUNDER WARM INTRO GRAPH */}
      {activeTab === "graph" && (
        <div>
          {loadingConnections ? (
            <div className="flex justify-center py-24">
              <Loader2 size={32} className="animate-spin text-slate-900" />
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-xs">
              <Users size={32} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-black text-base text-slate-900">No Warm Connections Declared</h3>
              <p className="text-slate-500 font-medium text-xs max-w-sm mx-auto mt-1">
                Be the first to declare an investor connection or mark an investor you know to build our peer-to-peer network!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="bg-white rounded-[28px] border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-black text-lg text-slate-900">{conn.investorName}</h3>
                        <p className="text-xs font-extrabold text-slate-500">{conn.investorFirm}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 border border-purple-200/60">
                        <ShieldCheck size={12} /> Connected via {conn.founderName.split(" ")[0]}
                      </span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">Target Check:</span>
                        <span className="font-black text-slate-900">{conn.ticketSize}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {conn.sectors?.map((sec) => (
                          <span key={sec} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIntroConnection(conn)}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <UserCheck size={14} /> Request Warm Intro
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Declare Connection Modal */}
      <DeclareConnectionModal
        isOpen={showDeclareModal}
        onClose={() => setShowDeclareModal(false)}
        founderId={user?.uid || "guest"}
        founderName={founderProfile?.full_name || user?.email || "Founder"}
        founderCompany={founderProfile?.company_name || "My Startup"}
        onSuccess={() => {
          loadDirectory();
          loadConnections();
        }}
      />

      {/* Confirm Intro Request Modal */}
      <AnimatePresence>
        {introConnection && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setIntroConnection(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full relative overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-slate-900 mb-1">Request Warm Intro</h3>
              <p className="text-xs text-slate-500 leading-normal mb-6">
                Request <span className="font-bold text-slate-900">{introConnection.founderName}</span> for a warm intro to{" "}
                <span className="font-bold text-slate-900">{introConnection.investorName}</span> ({introConnection.investorFirm}).
              </p>

              <div className="flex justify-between items-center text-xs font-bold mb-6 bg-purple-50 text-purple-700 p-4 rounded-2xl border border-purple-200/60">
                <span>Monthly Quota:</span>
                <span>First 5 Intros Free / Month</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIntroConnection(null)}
                  className="py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestWarmIntro}
                  disabled={introSending}
                  className="py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  {introSending ? <Loader2 size={16} className="animate-spin" /> : "Send Request"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreditPackageModal
        isOpen={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        requiredCredits={1}
        actionTitle="Unlock Verified Investor Contact"
      />
    </div>
  );
}
