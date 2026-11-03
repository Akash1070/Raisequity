import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Workflow,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Calendar,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from "lucide-react";

interface IntroItem {
  id: string;
  founder: string;
  company: string;
  sector: string;
  stage: string;
  raise: string;
  requestDate: string;
  status: "pending" | "confirmed" | "completed";
  message: string;
  memoScore: number;
}

const DEFAULT_INTROS: IntroItem[] = [
  {
    id: "intro-1",
    founder: "Elena Rostova",
    company: "NeuroChain AI",
    sector: "AI & Agents",
    stage: "Seed Round",
    raise: "$1.5M @ $7.5M Cap",
    requestDate: "Today, 2:15 PM",
    status: "pending",
    message: "Ex-DeepMind team with 248 verified GitHub commits and $42k MRR seeking $100k-$500k lead/co-investor.",
    memoScore: 96
  },
  {
    id: "intro-2",
    founder: "Marcus Vance",
    company: "SecantX Protocol",
    sector: "Web3 & ZK",
    stage: "Seed Round",
    raise: "$2.2M @ $11.0M Cap",
    requestDate: "Yesterday",
    status: "confirmed",
    message: "Trail of Bits audited ZK settlement protocol. $50k lead check committed by Alliance DAO.",
    memoScore: 92
  },
  {
    id: "intro-3",
    founder: "David Chen",
    company: "HyperScale DB",
    sector: "Infrastructure",
    stage: "Series A",
    raise: "$3.0M @ $15.0M Cap",
    requestDate: "Oct 28, 2026",
    status: "completed",
    message: "Distributed time-series engine with native sub-millisecond vector query serving 400M daily RPCs.",
    memoScore: 88
  }
];

export default function RequestedIntros() {
  const [intros, setIntros] = useState<IntroItem[]>(DEFAULT_INTROS);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered = intros.filter((i) => {
    if (activeFilter === "all") return true;
    return i.status === activeFilter;
  });

  return (
    <div className="w-full space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-[#4f46e5] dark:text-[#805ad5]">
              DOUBLE-BLIND INTRO PIPELINE
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight">
            Requested Partner Intros
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            Review double-blind introduction requests from thesis-matched founders with verified diligence tear sheets.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-[#18191e] p-1 rounded-full border border-neutral-200/80 dark:border-white/5 font-mono text-xs">
          {["all", "pending", "confirmed", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1 rounded-full font-bold uppercase transition-all cursor-pointer ${activeFilter === tab
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Intros List in HireInCrypto Style */}
      <div className="space-y-3.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-black/30 dark:hover:border-white/20"
          >
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-mono font-black text-base flex items-center justify-center shrink-0">
                {item.company.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-heading font-black text-base text-black dark:text-white">
                    {item.company}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#1c1d22] text-neutral-600 dark:text-neutral-300">
                    {item.sector}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {item.memoScore}% Fit
                  </span>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium line-clamp-2 mb-2">
                  {item.message}
                </p>

                <div className="flex items-center gap-3 font-mono text-[10px] text-neutral-400">
                  <span>Founder: <strong className="text-black dark:text-white">{item.founder}</strong></span>
                  <span>•</span>
                  <span>Round: <strong className="text-emerald-600 dark:text-emerald-400">{item.raise}</strong></span>
                  <span>•</span>
                  <span>Requested: {item.requestDate}</span>
                </div>
              </div>
            </div>

            {/* Status & Action */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              {item.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      alert(`Confirmed intro with ${item.founder} (${item.company}). Meeting details will be synchronized via your partner calendar.`);
                      setIntros(intros.map(i => i.id === item.id ? { ...i, status: "confirmed" } : i));
                    }}
                    className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95 shadow-xs cursor-pointer"
                  >
                    Accept Intro &amp; Call →
                  </button>
                  <button
                    onClick={() => setIntros(intros.filter(i => i.id !== item.id))}
                    className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#1c1d22] text-neutral-500 hover:text-black dark:hover:text-white font-mono text-xs transition-all cursor-pointer"
                  >
                    Pass
                  </button>
                </>
              )}

              {item.status === "confirmed" && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                  <CheckCircle2 size={13} />
                  <span>Call Confirmed</span>
                </div>
              )}

              {item.status === "completed" && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-[#1c1d22] text-neutral-500 font-mono text-xs font-bold">
                  <Clock size={13} />
                  <span>Meeting Completed</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
