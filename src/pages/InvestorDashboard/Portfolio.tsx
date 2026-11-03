import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  MessageSquare
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

const DEFAULT_PORTFOLIO: PortfolioDeal[] = [
  {
    id: "p1",
    founder_id: "lead_founder_elena",
    name: "NeuroChain AI",
    sector: "AI & Agents",
    stage: "Seed Round",
    investedAmount: "$100,000",
    investedAmountNum: 100000,
    valuationCap: "$7,500,000",
    sharesOrTokens: "1.33% SAFE",
    currentMultiple: "1.4x",
    status: "Active",
    founder: "Elena Rostova",
    dateClosed: "Oct 15, 2026"
  },
  {
    id: "p2",
    founder_id: "lead_founder_marcus",
    name: "SecantX Protocol",
    sector: "Web3 & ZK",
    stage: "Seed Round",
    investedAmount: "$50,000",
    investedAmountNum: 50000,
    valuationCap: "$11,000,000",
    sharesOrTokens: "0.45% SAFT",
    currentMultiple: "1.1x",
    status: "Follow-on",
    founder: "Marcus Vance",
    dateClosed: "Sep 22, 2026"
  },
  {
    id: "p3",
    founder_id: "lead_founder_david",
    name: "HyperScale DB",
    sector: "Infrastructure",
    stage: "Series A",
    investedAmount: "$150,000",
    investedAmountNum: 150000,
    valuationCap: "$15,000,000",
    sharesOrTokens: "1.00% Preferred",
    currentMultiple: "2.2x",
    status: "Active",
    founder: "David Chen",
    dateClosed: "Jun 10, 2026"
  }
];

export default function Portfolio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioDeal[]>(DEFAULT_PORTFOLIO);

  // Subscribe live to investor_portfolio in Firestore
  useEffect(() => {
    if (!user?.uid) return;

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
            currentMultiple: '1.4x',
            status: data.status || 'Active',
            founder: data.founder_name || 'Founder',
            dateClosed: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Today',
          };
        });

        // Merge live deals ahead of defaults
        setPortfolio([...liveDeals, ...DEFAULT_PORTFOLIO]);
      }
    }, (err) => {
      console.warn("[Portfolio] Snapshot listener error:", err);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const totalCapitalDeployed = portfolio.reduce((acc, curr) => acc + (curr.investedAmountNum || 0), 0);

  return (
    <div className="w-full space-y-6">
      
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

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            TOTAL CAPITAL DEPLOYED
          </span>
          <div className="text-3xl font-heading font-black text-black dark:text-white">
            $<NumberTicker value={Math.round(totalCapitalDeployed / 1000)} />k
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
            Across {portfolio.length} Active Checks &amp; SAFEs
          </span>
        </div>

        <div className="p-5 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            AVERAGE PORTFOLIO MULTIPLE
          </span>
          <div className="text-3xl font-heading font-black text-purple-600 dark:text-purple-400">
            1.62x
          </div>
          <span className="text-[10px] font-mono text-neutral-400 font-bold mt-1 block">
            Net IRR: +48.2%
          </span>
        </div>

        <div className="p-5 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            SYNDICATE ANCHORS HELD
          </span>
          <div className="text-3xl font-heading font-black text-amber-500">
            $<NumberTicker value={80} />k
          </div>
          <span className="text-[10px] font-mono text-neutral-400 font-bold mt-1 block">
            Apex Syndicate Co-Investment
          </span>
        </div>
      </div>

      {/* Portfolio Deals Table in HireInCrypto Style */}
      <div className="p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
        <h2 className="text-lg font-heading font-black text-black dark:text-white">
          Active Portfolio Holdings
        </h2>

        <div className="divide-y divide-neutral-100 dark:divide-white/5 font-mono text-xs">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/10 flex items-center justify-center font-bold text-xs">
                  {item.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-black text-sm text-black dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#1c1d22] text-neutral-600 dark:text-neutral-400">
                      {item.sector}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Founder: {item.founder} • Closed on {item.dateClosed}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6 text-right">
                <div>
                  <div className="font-black text-black dark:text-white">{item.investedAmount}</div>
                  <div className="text-[10px] text-neutral-400">@ {item.valuationCap}</div>
                </div>

                <div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{item.sharesOrTokens}</div>
                  <div className="text-[10px] text-purple-500 font-black">{item.currentMultiple} Current</div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {item.status}
                </span>

                <button
                  onClick={() => {
                    const targetId = item.founder_id || 'lead_founder_elena';
                    navigate(`/investor-dashboard/messages?to=${targetId}&name=${encodeURIComponent(item.founder)}&deal=${encodeURIComponent(item.name)}&company=${encodeURIComponent(item.name)}`);
                  }}
                  className="p-2 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-[#0070F3] hover:text-[#0070F3] text-neutral-400 transition-colors cursor-pointer"
                  title="Message Founder"
                >
                  <MessageSquare size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
