import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Search, ChevronDown, Wallet, X, Gift, Sparkles, Clock, Layers, Award } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { web3Grants } from "../data/grants";
import { useAuth } from "../contexts/AuthContext";

function normalizeStaticGrant(g: (typeof web3Grants)[0]) {
  return {
    id: g.id,
    title: g.name,
    category: g.type,
    amount_max: g.fundingValue,
    description: g.description,
    eligibility: g.eligibility,
    deadline: g.timeline,
    apply_url: g.applyUrl,
    tips: g.tips,
    stages: g.stage,
    featured: g.featured ?? false,
    is_active: true,
  };
}

const staticGrants = web3Grants.map(normalizeStaticGrant);

export default function Grants() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grants, setGrants] = useState<any[]>(staticGrants);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [selectedSector, setSelectedSector] = useState<string>("All");
  const [selectedAmount, setSelectedAmount] = useState<string>("All");
  const [activeModalGrant, setActiveModalGrant] = useState<any | null>(null);

  const handleApply = (applyUrl?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      navigate("/login?redirect=/dashboard/grants");
      return;
    }
    if (applyUrl) {
      window.open(applyUrl, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    const fetchGrants = async () => {
      try {
        const ref = collection(db, "grants");
        const snap = await getDocs(ref);
        const firestoreData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const grantMap = new Map();
        staticGrants.forEach((sg) => grantMap.set(sg.id, sg));
        firestoreData.forEach((fg) => {
          grantMap.set(fg.id, { ...grantMap.get(fg.id), ...fg });
        });

        setGrants(Array.from(grantMap.values()));
      } catch (err) {
        console.warn("[Grants] Using static grant fallback:", err);
        setGrants(staticGrants);
      }
    };
    fetchGrants();
  }, []);

  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(new Set(grants.map((g) => g.category))).filter(Boolean).sort();
    return ["All", ...uniqueSectors];
  }, [grants]);

  const amountBuckets = [
    { label: "All Amounts", value: "All" },
    { label: "< $25k", value: "small" },
    { label: "$25k - $100k", value: "medium" },
    { label: "$100k - $500k", value: "large" },
    { label: "$500k+", value: "xlarge" },
  ];

  const filteredGrants = useMemo(() => {
    return grants.filter((grant) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        grant.title?.toLowerCase().includes(q) ||
        grant.category?.toLowerCase().includes(q) ||
        grant.eligibility?.toLowerCase().includes(q) ||
        grant.description?.toLowerCase().includes(q);

      const matchesStage =
        selectedStage === "All" ||
        (Array.isArray(grant.stages) && grant.stages.includes(selectedStage));

      const matchesSector =
        selectedSector === "All" || grant.category === selectedSector;

      let matchesAmount = true;
      if (selectedAmount !== "All") {
        const val = grant.amount_max || 0;
        if (selectedAmount === "small") matchesAmount = val < 25000;
        else if (selectedAmount === "medium") matchesAmount = val >= 25000 && val <= 100000;
        else if (selectedAmount === "large") matchesAmount = val > 100000 && val <= 500000;
        else if (selectedAmount === "xlarge") matchesAmount = val > 500000;
      }

      return matchesSearch && matchesStage && matchesSector && matchesAmount;
    });
  }, [grants, searchTerm, selectedStage, selectedSector, selectedAmount]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStage("All");
    setSelectedSector("All");
    setSelectedAmount("All");
  };

  const hasFilters =
    searchTerm !== "" ||
    selectedStage !== "All" ||
    selectedSector !== "All" ||
    selectedAmount !== "All";

  return (
    <div className="space-y-8 pb-20 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Dashboard Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#262626] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Web3 Grants Directory
            </h1>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-[#00F5A0] rounded-full text-xs font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
              <Wallet size={13} /> {filteredGrants.length} Active Grants
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-xs md:text-sm">
            Curated directory of non-dilutive Web3 grant programs filtered for founder relevance.
          </p>
        </div>
      </div>

      {/* Search & Filters Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="flex-1 bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] focus-within:border-[#0070F3] rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xs transition-all">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search grant name, ecosystem, eligibility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Stage Filter */}
        <div className="relative">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="appearance-none bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#383838] focus:border-[#0070F3] rounded-2xl px-4 py-2.5 pr-9 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 outline-none shadow-xs cursor-pointer transition-all"
          >
            <option value="All">All Stages</option>
            <option value="Idea / Pre-Seed">Idea / Pre-Seed</option>
            <option value="Seed / MVP">Seed / MVP</option>
            <option value="Growth / Scaling">Growth / Scaling</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Sector Filter */}
        <div className="relative">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="appearance-none bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#383838] focus:border-[#0070F3] rounded-2xl px-4 py-2.5 pr-9 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 outline-none shadow-xs cursor-pointer transition-all"
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Sectors" : s}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Amount Filter */}
        <div className="relative">
          <select
            value={selectedAmount}
            onChange={(e) => setSelectedAmount(e.target.value)}
            className="appearance-none bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#383838] focus:border-[#0070F3] rounded-2xl px-4 py-2.5 pr-9 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 outline-none shadow-xs cursor-pointer transition-all"
          >
            {amountBuckets.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 text-xs font-mono font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGrants.map((grant) => (
          <motion.div
            key={grant.id}
            whileHover={{ y: -3 }}
            onClick={() => setActiveModalGrant(grant)}
            className={`bg-white dark:bg-[#111111] rounded-2xl border p-6 space-y-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group relative text-slate-900 dark:text-slate-100 ${
              grant.featured ? "border-amber-500/40 ring-1 ring-amber-500/20" : "border-slate-200 dark:border-[#262626] hover:border-[#0070F3]/40"
            }`}
          >
            {grant.featured && (
              <span className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[9px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                🔥 Featured
              </span>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#171717] text-emerald-700 dark:text-[#00F5A0] rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
                  {grant.category || "Web3 Grant"}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#0070F3] transition-colors pr-16">
                {grant.title}
              </h3>

              {grant.amount_max > 0 && (
                <div className="mt-3 inline-block px-3 py-1 bg-slate-100 dark:bg-[#171717] text-emerald-700 dark:text-[#00F5A0] rounded-xl text-xs font-mono font-bold border border-slate-200 dark:border-[#262626]">
                  Up to ${grant.amount_max.toLocaleString()}
                </div>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-3 line-clamp-3">
                {grant.eligibility || grant.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-[#262626] space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-emerald-600 dark:text-[#00F5A0]" /> {grant.deadline || "Rolling"}
                </span>
                <span className="text-[#0070F3] font-bold group-hover:underline">Details →</span>
              </div>

              <button
                onClick={(e) => handleApply(grant.apply_url, e)}
                className="w-full py-2.5 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs font-mono"
              >
                Apply Now <ExternalLink size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredGrants.length === 0 && (
        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-[#262626] p-16 flex flex-col items-center justify-center text-center gap-3">
          <Gift size={36} className="text-slate-400" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">No grants found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs">
            Try adjusting your search query or clear stage/sector filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 px-5 py-2.5 bg-[#0070F3] hover:bg-[#0060DF] text-white font-bold rounded-xl text-xs cursor-pointer transition-colors font-mono"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Grant Detail Popup Modal */}
      <AnimatePresence>
        {activeModalGrant && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setActiveModalGrant(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#0A0A0A] rounded-3xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl space-y-6 border border-slate-200 dark:border-[#262626] text-slate-900 dark:text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModalGrant(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#171717] cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-[#171717] text-emerald-700 dark:text-[#00F5A0] rounded-xl text-xs font-mono font-bold uppercase border border-emerald-500/30">
                    {activeModalGrant.category}
                  </span>
                  {activeModalGrant.featured && (
                    <span className="px-3 py-1 bg-amber-400 text-black rounded-xl text-xs font-mono font-black uppercase">
                      🔥 Featured Grant
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{activeModalGrant.title}</h2>

                {activeModalGrant.amount_max > 0 && (
                  <div className="text-xl font-mono font-bold text-emerald-700 dark:text-[#00F5A0]">
                    Funding Amount: Up to ${activeModalGrant.amount_max.toLocaleString()}
                  </div>
                )}
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Description</h4>
                  <p>{activeModalGrant.description}</p>
                </div>

                {activeModalGrant.eligibility && (
                  <div>
                    <h4 className="font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Eligibility Criteria</h4>
                    <p>{activeModalGrant.eligibility}</p>
                  </div>
                )}

                {activeModalGrant.tips && (
                  <div className="p-4 bg-slate-50 dark:bg-[#171717] rounded-2xl border border-slate-200 dark:border-[#262626]">
                    <h4 className="font-mono font-bold uppercase text-amber-600 dark:text-amber-400 mb-1">Founder Application Tips</h4>
                    <p className="text-slate-600 dark:text-slate-300">{activeModalGrant.tips}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-[#262626] flex gap-3">
                <button
                  onClick={() => setActiveModalGrant(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-[#171717] hover:bg-slate-200 dark:hover:bg-[#222222] text-slate-700 dark:text-slate-300 rounded-xl font-mono font-bold text-xs uppercase cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleApply(activeModalGrant.apply_url)}
                  className="flex-1 py-3 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl font-bold text-xs uppercase shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 font-mono"
                >
                  Apply Directly <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

