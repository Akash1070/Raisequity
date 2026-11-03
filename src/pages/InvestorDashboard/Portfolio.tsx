import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Building2,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  MessageSquare,
  Loader2,
  ArrowRight
} from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { NumberTicker } from "../../components/ui/NumberTicker";

interface PortfolioDeal {
  id: string;
  founder_id?: string;
  name: string;
  sector: string;
  stage: string;
  investedAmount: string;
  investedAmountNum: number;
  valuationCap: string;
  sharesOrTokens: string;
  currentMultiple: string;
  status: "Active" | "Follow-on" | "Exited";
  founder: string;
  dateClosed: string;
}

export default function Portfolio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioDeal[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe live to real investor portfolio in Firestore
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "investor_portfolio"),
      where("investor_id", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const liveDeals: PortfolioDeal[] = snap.docs.map(docSnap => {
          const data = docSnap.data();
          const amt = Number(data.invested_amount || 50000);
          const cap = Number(data.valuation_cap || 6000000);
          const ownershipPct = ((amt / cap) * 100).toFixed(2);

          return {
            id: docSnap.id,
            founder_id: data.founder_id || '',
            name: data.company_name || 'Portfolio Startup',
            sector: data.sector || 'AI & SaaS',
            stage: data.stage || 'Seed Round',
            investedAmount: `$${amt.toLocaleString()}`,
            investedAmountNum: amt,
            valuationCap: `$${cap.toLocaleString()}`,
            sharesOrTokens: `${ownershipPct}% ${data.instrument_type || 'SAFE'}`,
            currentMultiple: '1.0x',
            status: data.status || 'Active',
            founder: data.founder_name || 'Founder',
            dateClosed: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Recent',
          };
        });
        setPortfolio(liveDeals);
      } else {
        setPortfolio([]);
      }
      setLoading(false);
    }, (err) => {
      console.warn("[Portfolio] Snapshot listener error:", err);
      setPortfolio([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const totalCapitalDeployed = portfolio.reduce((acc, curr) => acc + (curr.investedAmountNum || 0), 0);

  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-emerald-600 dark:text-emerald-400">
              ALLOCATION COCKPIT
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight">
            Investor Portfolio &amp; SAFEs
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            Track deployed checks, standardized YC post-money SAFEs, and portfolio valuation multiples.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            {portfolio.length} Active Allocations
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-neutral-400">
            TOTAL CAPITAL DEPLOYED
          </span>
          <div className="text-3xl font-heading font-black text-black dark:text-white my-1">
            ${totalCapitalDeployed > 0 ? (totalCapitalDeployed / 1000).toFixed(0) + 'k' : '0'}
          </div>
          <span className="font-mono text-xs text-neutral-400">
            Across {portfolio.length} Active Checks &amp; SAFEs
          </span>
        </div>

        <div className="p-6 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-neutral-400">
            AVERAGE PORTFOLIO MULTIPLE
          </span>
          <div className="text-3xl font-heading font-black text-purple-600 dark:text-purple-400 my-1">
            {portfolio.length > 0 ? "1.00x" : "0.00x"}
          </div>
          <span className="font-mono text-xs text-neutral-400">
            {portfolio.length > 0 ? "Tracking live valuations" : "No active holdings yet"}
          </span>
        </div>

        <div className="p-6 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-neutral-400">
            SYNDICATE ANCHORS HELD
          </span>
          <div className="text-3xl font-heading font-black text-amber-500 my-1">
            $0
          </div>
          <span className="font-mono text-xs text-neutral-400">
            Co-investment lead allocations
          </span>
        </div>
      </div>

      {/* Portfolio Holdings Section */}
      <div className="space-y-4">
        <h2 className="text-base font-heading font-black text-black dark:text-white">
          Active Portfolio Holdings
        </h2>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <span className="text-xs font-mono">Loading portfolio allocations...</span>
          </div>
        ) : portfolio.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121316] border border-neutral-200 dark:border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-base font-bold text-black dark:text-white font-mono">
              No Active Portfolio Holdings or Signed SAFEs Yet
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              When you execute 1-Click SAFEs, term sheets, or syndicate allocations on Raisequity, your deployed capital, equity stakes, and valuation multiples will track here in real time.
            </p>
            <div className="pt-2">
              <Link
                to="/investor-dashboard/deals"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all shadow-xs"
              >
                <span>Browse Active Dealflow</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="divide-y divide-neutral-100 dark:divide-white/5">
              {portfolio.map((item) => (
                <div key={item.id} className="py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/5 flex items-center justify-center font-mono font-black text-sm text-black dark:text-white shrink-0">
                      {item.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-black text-base text-black dark:text-white">
                          {item.name}
                        </h4>
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/10 text-neutral-500">
                          {item.sector}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                        Founder: {item.founder} • Closed on {item.dateClosed}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="font-mono font-black text-sm text-black dark:text-white">
                        {item.investedAmount}
                      </div>
                      <div className="font-mono text-[10px] text-neutral-400">
                        @ {item.valuationCap}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {item.sharesOrTokens}
                      </div>
                      <div className="font-mono text-[10px] text-neutral-400">
                        {item.currentMultiple} Current
                      </div>
                    </div>

                    <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}