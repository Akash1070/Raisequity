import React from "react";
import { Check, X, ShieldCheck } from "lucide-react";

interface ComparisonRow {
  feature: string;
  traditional: string;
  raisequity: string;
  isPositive: boolean;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: "Pricing Model",
    traditional: "$4,000 – $10,000 / yr upfront (No outcome guarantee)",
    raisequity: "$20 / month with 100% Money-Back Outcome SLA",
    isPositive: true,
  },
  {
    feature: "Intro Methodology",
    traditional: "Cold, scraped generic email lists (1% response rate)",
    raisequity: "Algorithmic double-blind match against verified check-writers (94% response)",
    isPositive: true,
  },
  {
    feature: "Partner Meeting Horizon",
    traditional: "3 to 6 months of unanswered cold DMs",
    raisequity: "3 Confirmed partner meetings guaranteed in 30 days",
    isPositive: true,
  },
  {
    feature: "Pitch Review Friction",
    traditional: "30-slide PDF decks sent to spam folders",
    raisequity: "1-Page Institutional Fast-Pass Memo accepted by partner VCs",
    isPositive: true,
  },
  {
    feature: "Syndicate Catalyst",
    traditional: "None — you are on your own to find the lead",
    raisequity: "$25k–$50k Lead Check Syndicate Anchor for high-readiness founders",
    isPositive: true,
  },
  {
    feature: "Contract & SAFE Execution",
    traditional: "$5,000 in lawyer fees & 3 weeks of back-and-forth",
    raisequity: "1-Click OpenSign YC SAFE ($0 legal fees, 60s execution)",
    isPositive: true,
  },
];

export function AnimatedComparisonTable() {
  return (
    <div className="w-full overflow-hidden rounded-[36px] md:rounded-[44px] border border-[#dad4c8] dark:border-[#262626] bg-white dark:bg-[#111111] clay-shadow hover:shadow-[-7px_7px_0px_#000] transition-all duration-300">
      <div className="p-8 sm:p-10 border-b border-[#dad4c8] dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#faf9f7] dark:bg-[#000000]">
        <div>
          <span className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-[1.4px] bg-black text-white px-4 py-1.5 rounded-full inline-block mb-3">
            Outcome Comparison
          </span>
          <h3 className="text-2xl sm:text-4xl font-black text-black dark:text-white tracking-[-1.5px] font-heading leading-tight">
            The Old Way vs. The Raisequity SLA
          </h3>
          <p className="text-[#9f9b93] text-sm font-medium mt-1">
            Deterministic institutional capital matching vs. antiquated manual outreach.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black text-[#078a52] bg-[#84e7a5] px-4 py-2 rounded-full border border-[#078a52]/30 flex items-center gap-1.5 clay-shadow">
            <ShieldCheck size={16} /> 100% Money-Back SLA
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#dad4c8] dark:border-[#262626] text-[11px] font-mono font-black uppercase tracking-wider text-[#9f9b93] bg-[#faf9f7] dark:bg-black/40">
              <th className="py-5 px-6 sm:px-8 w-1/4">Capability</th>
              <th className="py-5 px-6 sm:px-8 w-3/8 text-rose-500">Traditional Directories (Cold Outreach)</th>
              <th className="py-5 px-6 sm:px-8 w-3/8 text-[#078a52] bg-[#84e7a5]/10">Raisequity Ecosystem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dad4c8]/50 dark:divide-[#262626] text-xs sm:text-sm font-sans">
            {COMPARISON_DATA.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#faf9f7] dark:hover:bg-[#171717] transition-colors">
                <td className="py-5 px-6 sm:px-8 font-black text-black dark:text-white font-heading">
                  {row.feature}
                </td>
                <td className="py-5 px-6 sm:px-8 text-black/60 dark:text-slate-400 font-medium">
                  <div className="flex items-start gap-2.5">
                    <X size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <span>{row.traditional}</span>
                  </div>
                </td>
                <td className="py-5 px-6 sm:px-8 font-bold text-black dark:text-white bg-[#84e7a5]/10">
                  <div className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#078a52] dark:text-[#84e7a5] shrink-0 mt-0.5" />
                    <span>{row.raisequity}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AnimatedComparisonTable;
