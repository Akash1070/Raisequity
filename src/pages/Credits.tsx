import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Loader2, Gift, Sparkles, ExternalLink, X, Tag } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { startupCredits } from "../data/credits";
import { useAuth } from "../contexts/AuthContext";

const categoryLabels: Record<string, string> = {
  cloud: "Cloud Infrastructure",
  ai: "AI & ML",
  database: "Database",
  analytics: "Analytics",
  "dev-tools": "Dev Tools",
  email: "Email / Comms",
  design: "Design",
  other: "Other",
};

function normalizeStaticCredit(c: any) {
  return {
    id: c.id,
    company: c.company,
    name: c.name,
    category: c.category,
    value: c.value,
    numeric_value: c.numericValue || 0,
    description: c.description,
    eligibility: c.eligibility,
    apply_url: c.applyUrl,
    notes: c.notes,
    featured: c.featured ?? false,
  };
}

const staticCredits = startupCredits.map(normalizeStaticCredit);

export default function Credits() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<any[]>(staticCredits);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedAmount, setSelectedAmount] = useState<string>("All");
  const [activeModalCredit, setActiveModalCredit] = useState<any | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const ref = collection(db, "credits");
        const snap = await getDocs(ref);
        const firestoreData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const creditMap = new Map();
        staticCredits.forEach((sc) => creditMap.set(sc.id, sc));
        firestoreData.forEach((fc) => {
          creditMap.set(fc.id, { ...creditMap.get(fc.id), ...fc });
        });

        setCredits(Array.from(creditMap.values()));
      } catch (err) {
        console.error("[Credits] Error fetching perks:", err);
        setCredits(staticCredits);
      } finally {
        setLoading(false);
      }
    };
    fetchCredits();
  }, []);

  const handleClaim = (applyUrl?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      navigate("/login?redirect=/dashboard/credits");
      return;
    }
    if (applyUrl) {
      window.open(applyUrl, "_blank", "noopener,noreferrer");
    }
  };

  const amountBuckets = [
    { label: "All Values", value: "All" },
    { label: "< $5k", value: "small" },
    { label: "$5k - $25k", value: "medium" },
    { label: "$25k - $100k", value: "large" },
    { label: "$100k+", value: "xlarge" },
  ];

  const filteredCredits = useMemo(() => {
    return credits.filter((credit) => {
      const matchesSearch =
        credit.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === "All" || credit.category === selectedType;

      let matchesAmount = true;
      if (selectedAmount !== "All") {
        const val = credit.numeric_value || 0;
        if (selectedAmount === "small") matchesAmount = val < 5000;
        else if (selectedAmount === "medium") matchesAmount = val >= 5000 && val <= 25000;
        else if (selectedAmount === "large") matchesAmount = val > 25000 && val <= 100000;
        else if (selectedAmount === "xlarge") matchesAmount = val > 100000;
      }

      return matchesSearch && matchesType && matchesAmount;
    });
  }, [credits, searchTerm, selectedType, selectedAmount]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("All");
    setSelectedAmount("All");
  };

  const hasFilters = searchTerm !== "" || selectedType !== "All" || selectedAmount !== "All";

  return (
    <div className="space-y-8 pb-20 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Dashboard Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#262626] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Startup Credits &amp; Perks
            </h1>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-xs font-mono font-bold border border-amber-500/30 flex items-center gap-1.5 shadow-xs">
              <Gift size={13} /> {filteredCredits.length} Active Perks
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-xs md:text-sm">
            Exclusive cloud credits, AI platforms, and developer tooling to extend your runway.
          </p>
        </div>

        <button
          onClick={() => navigate('/checkout')}
          className="bg-[#0070F3] hover:bg-[#0060DF] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95 font-mono"
        >
          <Sparkles size={15} />
          <span>Upgrade to Premium / Get Credits</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="flex-1 bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] focus-within:border-[#0070F3] rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xs transition-all">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search provider, perk name, or tool..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="appearance-none bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] hover:border-slate-300 dark:hover:border-[#383838] focus:border-[#0070F3] rounded-2xl px-4 py-2.5 pr-9 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 outline-none shadow-xs cursor-pointer transition-all"
          >
            <option value="All">All Categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-900 dark:text-slate-100">
          <Loader2 size={28} className="animate-spin text-[#0070F3]" />
          <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">Loading perks directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCredits.map((credit) => (
            <motion.div
              key={credit.id}
              whileHover={{ y: -3 }}
              onClick={() => setActiveModalCredit(credit)}
              className={`bg-white dark:bg-[#111111] rounded-2xl border p-6 space-y-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group relative text-slate-900 dark:text-slate-100 ${
                credit.featured ? "border-amber-500/40 ring-1 ring-amber-500/20" : "border-slate-200 dark:border-[#262626] hover:border-[#0070F3]/40"
              }`}
            >
              {credit.featured && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[9px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles size={10} /> Featured
                </span>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#171717] text-amber-700 dark:text-amber-400 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border border-amber-500/30">
                    {categoryLabels[credit.category] || credit.category}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#0070F3] transition-colors pr-16">
                  {credit.company}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{credit.name}</p>

                <div className="mt-3 inline-block px-3 py-1.5 bg-slate-100 dark:bg-[#171717] text-emerald-700 dark:text-[#00F5A0] rounded-xl text-sm font-mono font-bold border border-slate-200 dark:border-[#262626]">
                  {credit.value}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-3 line-clamp-3">
                  {credit.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#262626] space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Tag size={12} className="text-amber-500" /> Free Claim
                  </span>
                  <span className="text-[#0070F3] font-bold group-hover:underline">Details →</span>
                </div>

                <button
                  onClick={(e) => handleClaim(credit.apply_url, e)}
                  className="w-full py-2.5 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs font-mono"
                >
                  Claim Perk <ExternalLink size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Credit Detail Popup Modal */}
      <AnimatePresence>
        {activeModalCredit && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setActiveModalCredit(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#0A0A0A] rounded-3xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl space-y-6 border border-slate-200 dark:border-[#262626] text-slate-900 dark:text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModalCredit(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#171717] cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-[#171717] text-amber-700 dark:text-amber-400 rounded-xl text-xs font-mono font-bold uppercase border border-amber-500/30">
                    {categoryLabels[activeModalCredit.category] || activeModalCredit.category}
                  </span>
                  {activeModalCredit.featured && (
                    <span className="px-3 py-1 bg-amber-400 text-black rounded-xl text-xs font-mono font-black uppercase">
                      🔥 Featured Perk
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{activeModalCredit.company}</h2>
                <div className="text-xl font-mono font-bold text-emerald-700 dark:text-[#00F5A0]">{activeModalCredit.value}</div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <h4 className="font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Perk Description</h4>
                  <p>{activeModalCredit.description}</p>
                </div>

                {activeModalCredit.eligibility && (
                  <div>
                    <h4 className="font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Eligibility Criteria</h4>
                    <p>{activeModalCredit.eligibility}</p>
                  </div>
                )}

                {activeModalCredit.notes && (
                  <div className="p-4 bg-slate-50 dark:bg-[#171717] rounded-2xl border border-slate-200 dark:border-[#262626]">
                    <h4 className="font-mono font-bold uppercase text-amber-600 dark:text-amber-400 mb-1">Redemption Notes</h4>
                    <p className="text-slate-600 dark:text-slate-300">{activeModalCredit.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-[#262626] flex gap-3">
                <button
                  onClick={() => setActiveModalCredit(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-[#171717] hover:bg-slate-200 dark:hover:bg-[#222222] text-slate-700 dark:text-slate-300 rounded-xl font-mono font-bold text-xs uppercase cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleClaim(activeModalCredit.apply_url)}
                  className="flex-1 py-3 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl font-bold text-xs uppercase shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 font-mono"
                >
                  Claim Perk <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

