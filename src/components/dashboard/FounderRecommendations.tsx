import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Sparkles, ChevronRight, Zap, Gift } from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { useFounderCompany } from "../../hooks/useFounderCompany";

const GRANT_CATEGORY_MAP: Record<string, string[]> = {
  DeFi:           ["DeFi", "Layer-2", "Layer-1"],
  Infrastructure: ["Infra / Tooling", "Oracle / Infra", "DePIN / Infra", "Layer-1 / Infra"],
  AI:             ["AI / RWA / DeFi", "ZK / Infra"],
  Gaming:         ["Gaming / Metaverse", "Layer-2 / Gaming", "Layer-1"],
  RWA:            ["AI / RWA / DeFi", "Layer-1 / Payments"],
  Privacy:        ["Layer-1 / Privacy", "Horizen / Privacy"],
  Fintech:        ["Layer-1 / Payments", "dApp / Bitcoin", "L2 / Bitcoin"],
};

const STAGE_MAP: Record<string, string[]> = {
  idea:     ["Idea / Pre-Seed"],
  "pre-seed": ["Idea / Pre-Seed", "Seed / MVP"],
  seed:     ["Seed / MVP", "Growth / Scaling"],
  "series-a": ["Growth / Scaling"],
};

interface Grant {
  id: string;
  title: string;
  category: string;
  amount_max: number;
  description: string;
  apply_url: string;
  deadline: string;
  stages: string[];
  featured: boolean;
}

interface Credit {
  id: string;
  company: string;
  name: string;
  value: string;
  apply_url: string;
  category: string;
  description: string;
}

export default function FounderRecommendations() {
  const { company } = useFounderCompany();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"grants" | "credits">("grants");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // --- Fetch grants from Firestore ---
        const grantsRef = collection(db, "grants");
        const grantsSnap = await getDocs(grantsRef);
        let grantItems = grantsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Grant[];

        // Re-sort: featured + category-matching grants first
        if ((company as any)?.industry?.length) {
          const preferredCategories = (company as any).industry.flatMap(
            (ind: string) => GRANT_CATEGORY_MAP[ind] || []
          );
          grantItems = [...grantItems].sort((a, b) => {
            const aMatch = preferredCategories.some(cat => a.category?.includes(cat)) ? -1 : 0;
            const bMatch = preferredCategories.some(cat => b.category?.includes(cat)) ? -1 : 0;
            return aMatch - bMatch;
          });
        }
        setGrants(grantItems.slice(0, 4));

        // --- Fetch credits from Firestore ---
        const creditsRef = collection(db, "credits");
        const creditsSnap = await getDocs(creditsRef);
        const creditItems = creditsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Credit[];
        setCredits(creditItems.slice(0, 5));
      } catch (err) {
        console.error("[FounderRecommendations] Error loading:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [company]);

  const tabs = [
    { key: "grants", label: "Grants", icon: Zap, count: grants.length },
    { key: "credits", label: "Credits", icon: Gift, count: credits.length },
  ] as const;

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm animate-pulse space-y-4">
        <div className="h-5 bg-gray-100 rounded w-40" />
        <div className="h-4 bg-gray-100 rounded w-64" />
        <div className="space-y-3 mt-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const items = tab === "grants" ? grants : credits;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--color-clay-lemon-dark)]" />
          <h2 className="text-[16px] font-black text-black">Recommended for You</h2>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-clay-matcha)] bg-[var(--color-clay-matcha)]/10 px-3 py-1 rounded-full border border-[var(--color-clay-matcha)]/20">
          AI Matched
        </span>
      </div>
      <p className="text-[12px] text-gray-400 font-medium mb-6">
        {(company as any)?.stage
          ? `Based on your ${(company as any).stage} stage and ${(company as any)?.industry?.join(", ") || "industry"}`
          : "Top non-dilutive funding & perks for your startup"}
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-50 p-1 rounded-2xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-black transition-all cursor-pointer ${
              tab === t.key
                ? "bg-white shadow-sm text-black"
                : "text-gray-400 hover:text-black"
            }`}
          >
            <t.icon size={14} />
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              tab === t.key ? "bg-black text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Items */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.15 }}
          className="space-y-3"
        >
          {items.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm font-medium">
                Complete your company profile to get personalized recommendations.
              </p>
            </div>
          ) : (
            items.map((item: any) => {
              const isGrant = tab === "grants";
              return (
                <motion.a
                  key={item.id}
                  href={item.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-[var(--color-clay-matcha)] hover:bg-[var(--color-clay-matcha)]/5 transition-all group cursor-pointer"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isGrant ? "bg-purple-50" : "bg-yellow-50"
                  }`}>
                    {isGrant
                      ? <Zap size={18} className="text-[var(--color-clay-ube)]" />
                      : <Gift size={18} className="text-yellow-500" />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[13px] font-black text-black leading-tight">
                        {isGrant ? item.title : item.company}
                      </h3>
                      <span className="text-[10px] font-black text-[var(--color-clay-matcha)] shrink-0 bg-[var(--color-clay-matcha)]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {isGrant
                          ? (item.amount_max >= 1000000
                              ? `$${(item.amount_max / 1000000).toFixed(1)}M`
                              : `$${(item.amount_max / 1000).toFixed(0)}k`)
                          : item.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium mt-1 line-clamp-2">
                      {isGrant ? item.description : item.name}
                    </p>
                    {isGrant && item.deadline && (
                      <span className="text-[10px] font-bold text-gray-300 mt-1 block">
                        ⏱ {item.deadline}
                      </span>
                    )}
                  </div>

                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[var(--color-clay-matcha)] transition-colors shrink-0 mt-1" />
                </motion.a>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

      {/* View All Link */}
      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
        <span className="text-[11px] text-gray-300 font-medium">
          {tab === "grants" ? "Non-dilutive funding matched to your stage" : "Extend your runway with free tools"}
        </span>
        <a
          href={tab === "grants" ? "/grants" : "/credits"}
          className="text-[11px] font-black text-[var(--color-clay-ube)] flex items-center gap-1 hover:underline cursor-pointer"
        >
          View all <ExternalLink size={11} />
        </a>
      </div>
    </motion.div>
  );
}
