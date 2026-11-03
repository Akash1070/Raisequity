import React, { useState } from "react";
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
  CheckCircle2
} from "lucide-react";

interface RecommendedStartup {
  id: string;
  name: string;
  founder: string;
  sector: string;
  stage: string;
  raise: string;
  valuation: string;
  mrr: string;
  traction: string;
  matchScore: number;
  thesisMatchNote: string;
}

const RECOMMENDED_STARTUPS: RecommendedStartup[] = [
  {
    id: "rec-1",
    name: "NeuroChain AI",
    founder: "Elena Rostova",
    sector: "AI & Agents",
    stage: "Seed Round",
    raise: "$1.5M",
    valuation: "$7.5M Cap",
    mrr: "$42k MRR (+28% MoM)",
    traction: "248 commits / 30d • Ex-DeepMind Team",
    matchScore: 96,
    thesisMatchNote: "Direct match for your $100k-$500k check preference in autonomous AI infrastructure."
  },
  {
    id: "rec-2",
    name: "SecantX Protocol",
    founder: "Marcus Vance",
    sector: "Web3 & ZK",
    stage: "Seed Round",
    raise: "$2.2M",
    valuation: "$11.0M Cap",
    mrr: "$28k MRR (+35% MoM)",
    traction: "Trail of Bits Audited • $50k Lead Locked",
    matchScore: 92,
    thesisMatchNote: "Matches your DeFi settlement and cross-chain liquidity allocation quota."
  },
  {
    id: "rec-3",
    name: "HyperScale DB",
    founder: "David Chen",
    sector: "Infrastructure",
    stage: "Series A",
    raise: "$3.0M",
    valuation: "$15.0M Cap",
    mrr: "$68k MRR (+22% MoM)",
    traction: "Serving 400M daily RPCs • YC W24",
    matchScore: 88,
    thesisMatchNote: "High-throughput time-series database for institutional trading systems."
  },
  {
    id: "rec-4",
    name: "Fasqon Fintech",
    founder: "Alexandre Silva",
    sector: "Fintech & RWA",
    stage: "Pre-Seed",
    raise: "$800k",
    valuation: "$4.0M Cap",
    mrr: "$19k MRR (+40% MoM)",
    traction: "FCA-registered EMI rails in UK & EU",
    matchScore: 85,
    thesisMatchNote: "Crypto-native neobank bridging Web3 liquidity and SEPA accounts."
  }
];

export default function RecommendedFounders() {
  const [invited, setInvited] = useState<Record<string, boolean>>({});

  const handleRequestIntro = (id: string, name: string) => {
    setInvited((prev) => ({ ...prev, [id]: true }));
    alert(`Double-blind intro request sent to ${name}. If accepted, a calendar invite will be automatically dispatched.`);
  };

  return (
    <div className="w-full space-y-6">
      
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
            Top 1% founders curated directly to match your sector thesis and check-size criteria.
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RECOMMENDED_STARTUPS.map((item) => (
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
                  <strong className="text-emerald-600 dark:text-emerald-400">{item.raise} @ {item.valuation}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Revenue / Traction:</span>
                  <strong className="text-black dark:text-white">{item.mrr}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Signals:</span>
                  <strong className="text-neutral-600 dark:text-neutral-300">{item.traction}</strong>
                </div>
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-4 leading-relaxed">
                💡 <strong className="text-black dark:text-white">Why Matched:</strong> {item.thesisMatchNote}
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
              <Link
                to={`/launch/${item.id === 'rec-1' ? 'neurochain-ai' : item.id === 'rec-2' ? 'secantx-protocol' : 'hyperscale-db'}`}
                className="font-mono text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1"
              >
                Inspect Pitch <ChevronRight size={13} />
              </Link>

              <button
                onClick={() => handleRequestIntro(item.id, item.name)}
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
                    <Send size={13} /> Request 1-Click Intro
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
