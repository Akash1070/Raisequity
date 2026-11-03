import React from "react";
import { Check, Info, ArrowUpRight, Coins, Target } from "lucide-react";
import type { MatchWithFounder } from "../../hooks/useFounderMatches";

interface DealActionsPanelProps {
  match: MatchWithFounder;
}

export default function DealActionsPanel({ match }: DealActionsPanelProps) {
  const otherFounder = match.otherFounder || {
    stage: null,
    sector: null,
    location: null,
    what_company_does: null,
    company_blurb: null
  };

  const isAccepted = match.status === "accepted";
  const steps = [
    { label: "Accept", description: "Match Accepted", completed: true },
    { label: "Approve", description: "Unlock Channel", completed: isAccepted },
    { label: "Match", description: "Exchange Details", completed: isAccepted },
    { label: "Connect", description: "Direct Intro", completed: isAccepted }
  ];

  return (
    <div className="bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-[#262626] p-6 shadow-xs space-y-6 transition-colors duration-150">
      {/* 4-Step Intro Flow Status */}
      <div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-4">
          Match Progress Status
        </span>
        <div className="grid grid-cols-4 gap-2 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2 z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                  step.completed
                    ? "bg-[#0070F3] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#171717] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-[#262626]"
                }`}
              >
                {step.completed ? <Check size={12} /> : idx + 1}
              </div>
              <div>
                <div className={`text-[10px] font-mono font-bold uppercase ${step.completed ? "text-[#0070F3]" : "text-slate-400 dark:text-slate-500"}`}>
                  {step.label}
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono hidden md:block">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
          {/* Connector Line behind nodes */}
          <div className="absolute top-3.5 left-[12%] right-[12%] h-[2px] bg-slate-200 dark:bg-[#262626] -z-10 hidden sm:block" />
        </div>
      </div>

      {/* Startup Details Card */}
      <div className="border-t border-slate-200 dark:border-[#262626] pt-5 space-y-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
            <Info size={12} className="text-[#0070F3]" />
            Startup Actionable Details
          </span>
          <div className="bg-slate-50 dark:bg-[#171717] rounded-2xl p-5 border border-slate-200/60 dark:border-[#262626] space-y-3">
            <div className="flex flex-wrap gap-2">
              {otherFounder.stage && (
                <span className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333333] text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg text-[#0070F3] shadow-xs">
                  Stage: {otherFounder.stage}
                </span>
              )}
              {otherFounder.sector && (
                <span className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333333] text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 shadow-xs">
                  Sector: {otherFounder.sector}
                </span>
              )}
              {otherFounder.location && (
                <span className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#333333] text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 shadow-xs">
                  📍 {otherFounder.location}
                </span>
              )}
            </div>

            {/* Pitch Blurb Fields */}
            {otherFounder.what_company_does ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">What they do:</span>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                    {otherFounder.what_company_does}
                  </p>
                </div>
                {otherFounder.company_blurb && (
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Blurb:</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-[#0070F3] pl-2">
                      "{otherFounder.company_blurb}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 font-mono text-center py-2">
                Founder has not configured public memo details yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
