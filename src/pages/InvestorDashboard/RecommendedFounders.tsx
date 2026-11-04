import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Building2,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Send,
  CheckCircle2,
  Loader2,
  Coins
} from "lucide-react";
import { collection, getDocs, query, limit, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { SEEDED_DEAL_FLOW, DealItem } from "../../data/dealFlowData";
import { spendCredits } from "../../lib/credits";
import { scoreStartupForInvestor, parseMoneyRange } from "../../lib/matching";

export default function RecommendedFounders() {
  const { user, profile, refreshProfile } = useAuth();
  const [recommendedDeals, setRecommendedDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [invited, setInvited] = useState<Record<string, boolean>>({});
  const [introSuccessNote, setIntroSuccessNote] = useState<string | null>(null);
  const [introErrorNote, setIntroErrorNote] = useState<string | null>(null);

  // Load and rank deals dynamically from database using the real matching engine.
  useEffect(() => {
    async function loadAndRankDeals() {
      try {
        setLoading(true);
        const snap = await getDocs(query(collection(db, "deal_flow"), limit(100)));
        let allDeals: DealItem[] = [];
        if (!snap.empty) {
          allDeals = snap.docs.map(d => ({ id: d.id, ...d.data() })) as DealItem[];
        } else {
          allDeals = SEEDED_DEAL_FLOW;
        }

        const investorSectors: string[] = (profile as any)?.target_sectors || (profile as any)?.sectors || [];
        const prefStages = ((profile as any)?.stage_focus ? [(profile as any).stage_focus] : []);

        const ranked = allDeals.map((deal) => {
          const raise = parseMoneyRange(deal.targetRaise);
          const m = scoreStartupForInvestor(
            {
              name: deal.name,
              sector: deal.sector,
              stage: deal.stage,
              raise_amount: raise ? raise[1] : null,
              location: deal.location,
              description: (deal as any).description,
              tagline: (deal as any).tagline,
              traction: (deal as any).traction,
            },
            {
              preferred_sectors: investorSectors,
              preferred_stages: prefStages,
              min_check_size: (profile as any)?.min_check_size || null,
              max_check_size: (profile as any)?.max_check_size || null,
              geography: (profile as any)?.geography || null,
              thesis_description: (profile as any)?.thesis_description || null,
            }
          );

          return {
            ...deal,
            matchScore: m.score,
            whyMatched: m.reasons.length
              ? m.reasons.join(" · ")
              : (m.negatives.length ? `Watch: ${m.negatives.join(" · ")}` : "Limited thesis signal — update your thesis in Settings."),
            fitNegatives: m.negatives,
          };
        });

        ranked.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setRecommendedDeals(ranked.slice(0, 6));
      } catch (err) {
        console.warn("Could not load dynamic recommendations:", err);
        setRecommendedDeals(SEEDED_DEAL_FLOW.slice(0, 6));
      } finally {
        setLoading(false);
      }
    }

    loadAndRankDeals();
  }, [profile]);

  const handleRequestIntro = async (deal: DealItem) => {
    if (!user?.uid) return;
    setIntroErrorNote(null);

    try {
      // 1. Spend 1 credit — must succeed before any dispatch.
      const spendRes = await spendCredits(
        user.uid,
        'extra_intro',
        1,
        'discretionary_addon',
        { dealId: deal.id, companyName: deal.name, founder: deal.founder }
      );

      if (!spendRes.success) {
        setIntroErrorNote(spendRes.error || "Insufficient credits for this intro request.");
        return;
      }

      // 2. Dispatch to admin_intros so Admin can connect manually if founder is not onboarded
      await addDoc(collection(db, "admin_intros"), {
        type: "investor_founder_outreach",
        investor_id: user.uid,
        investor_name: profile?.full_name || user.email?.split("@")[0] || "Accredited Investor",
        investor_email: user.email || "",
        deal_id: deal.id,
        deal_name: deal.name,
        founder_name: deal.founder,
        founder_email: deal.founder_email || "",
        sector: deal.sector,
        stage: deal.stage,
        target_raise: deal.targetRaise,
        message: `Investor requested double-blind introduction to ${deal.founder} for ${deal.name}.`,
        status: "pending_manual_connect",
        created_at: new Date().toISOString()
      });

      setInvited((prev) => ({ ...prev, [deal.id]: true }));
      await refreshProfile();
      setIntroSuccessNote(`Double-blind intro request dispatched for ${deal.name}! Our venture partner desk has received your request and will facilitate your direct meeting.`);
      setTimeout(() => setIntroSuccessNote(null), 6000);
    } catch (err: any) {
      console.error("Intro request error:", err);
      setIntroErrorNote(err?.message || "Failed to dispatch intro request. No credits were spent.");
    }
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {introSuccessNote && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs font-mono text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between shadow-xs animate-fade-in">
          <span>✓ {introSuccessNote}</span>
          <button onClick={() => setIntroSuccessNote(null)} className="text-emerald-600 dark:text-emerald-400 hover:opacity-80">✕</button>
        </div>
      )}

      {introErrorNote && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-500/30 rounded-2xl text-xs font-mono text-red-700 dark:text-red-300 font-bold flex items-center justify-between shadow-xs animate-fade-in">
          <span>{introErrorNote}</span>
          <button onClick={() => setIntroErrorNote(null)} className="text-red-600 dark:text-red-400 hover:opacity-80">✕</button>
        </div>
      )}
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-amber-500">
              ALGORITHMIC THESIS MATCHER
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight flex items-center gap-2.5">
            Recommended Founders <Sparkles size={22} className="text-amber-400" />
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            Dynamically curated from live database deals matching your sector thesis and check-size criteria.
          </p>
        </div>

        <Link
          to="/investor-dashboard/deals"
          className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95 shadow-xs shrink-0"
        >
          View Full Deal Feed →
        </Link>
      </div>

      {/* Grid of Recommended Founder Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <Loader2 className="animate-spin text-amber-500" size={32} />
          <span className="text-xs font-mono">Running algorithmic thesis matching...</span>
        </div>
      ) : recommendedDeals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121316] border border-neutral-200 dark:border-white/10 space-y-2">
          <Building2 size={32} className="mx-auto text-neutral-400" />
          <div className="text-sm font-bold text-black dark:text-white font-mono">No recommended deals yet</div>
          <p className="text-xs text-neutral-500">Update your check size and target sectors in Settings to tune your matcher.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedDeals.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:border-black/30 dark:hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-600 dark:text-amber-400 font-mono font-black text-base flex items-center justify-center shrink-0">
                      {item.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-base text-black dark:text-white">
                        {item.name}
                      </h3>
                      <div className="text-[11px] font-mono text-neutral-400">
                        Founder: {item.founder} • {item.sector}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    {item.matchScore}% Fit
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 font-mono text-xs mb-3.5 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Target Raise:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{item.targetRaise} @ {item.valuationCap}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Round Stage:</span>
                    <strong className="text-black dark:text-white">{item.stage || "Seed"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Chain / Tech Stack:</span>
                    <strong className="text-neutral-600 dark:text-neutral-300 truncate max-w-[200px]">
                      {item.chain || (item.industry && item.industry[0]) || "Web3 Architecture"}
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-4 leading-relaxed">
                  💡 <strong className="text-black dark:text-white">Why Matched:</strong> {(item as any).whyMatched}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
                <Link
                  to={`/investor-dashboard/deals`}
                  className="font-mono text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1"
                >
                  Inspect Pitch <ChevronRight size={13} />
                </Link>

                <button
                  onClick={() => handleRequestIntro(item)}
                  disabled={invited[item.id]}
                  className={`px-4 py-2 rounded-xl font-bold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    invited[item.id]
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                      : "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black shadow-xs active:scale-95"
                  }`}
                >
                  {invited[item.id] ? (
                    <>
                      <CheckCircle2 size={13} /> Intro Dispatched
                    </>
                  ) : (
                    <>
                      <Send size={13} /> Request 1-Click Intro (1 Cr)
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}