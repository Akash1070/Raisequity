import React from "react";
import { CheckCircle2, AlertCircle, ArrowRight, UserCheck, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

interface MissionProgressCardProps {
  profileCompleteness: number;
  missingFields: string[];
  contactsCount: number;
  onReviewClick: () => void;
  onAddClick: () => void;
}

export default function MissionProgressCard({
  profileCompleteness,
  missingFields,
  contactsCount,
  onReviewClick,
  onAddClick
}: MissionProgressCardProps) {
  // Determine if steps are complete
  const stepAComplete = profileCompleteness >= 80;
  const stepBComplete = contactsCount >= 3;

  const totalSteps = 2;
  const completedSteps = (stepAComplete ? 1 : 0) + (stepBComplete ? 1 : 0);
  const stepsLeft = totalSteps - completedSteps;
  const progressPct = Math.round((completedSteps / totalSteps) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#111111] rounded-[24px] border border-slate-200 dark:border-[#262626] shadow-xs p-5 sm:p-6 space-y-5 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150"
    >
      <div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#0070F3]">
          Warm-Intro Mission
        </span>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
          {stepsLeft > 0 ? (
            <>You are <span className="text-[#0070F3]">{stepsLeft} step{stepsLeft !== 1 ? 's' : ''}</span> away from partner unlock</>
          ) : (
            <>Mission Accomplished! 🚀 Ready for intros</>
          )}
        </h3>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="relative h-2 bg-slate-100 dark:bg-[#202020] rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            className="absolute left-0 top-0 h-full bg-[#0070F3] rounded-full"
          />
        </div>
        <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {completedSteps} / {totalSteps} Steps Completed ({progressPct}%)
        </div>
      </div>

      <div className="space-y-3">
        {/* Step A — Review Profile */}
        <div
          className={`flex items-start justify-between p-3.5 rounded-xl border transition-all ${
            stepAComplete
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-[#00F5A0]"
              : "border-slate-200/80 dark:border-[#262626] bg-slate-50 dark:bg-[#171717]"
          }`}
        >
          <div className="flex gap-2.5 min-w-0">
            <div className={`mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full flex items-center justify-center ${
              stepAComplete ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-slate-600 text-slate-500"
            }`}>
              {stepAComplete ? <CheckCircle2 size={12} className="stroke-[3]" /> : <span className="text-[9px] font-mono font-bold">1</span>}
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-bold uppercase font-mono ${stepAComplete ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"}`}>
                Review your profile
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Target: {profileCompleteness}% / 80% minimum complete
              </div>
              {!stepAComplete && missingFields.length > 0 && (
                <div className="text-[10px] text-red-500 font-mono mt-1 flex items-start gap-1">
                  <AlertCircle size={11} className="shrink-0 mt-0.5" />
                  <span className="leading-tight">
                    Missing: {missingFields.slice(0, 3).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onReviewClick}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-[#202020] dark:hover:bg-[#262626] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#333333] rounded-lg text-[10px] font-mono font-bold uppercase cursor-pointer transition-all shrink-0"
          >
            Review <ArrowRight size={10} />
          </button>
        </div>

        {/* Step B — Add Investors */}
        <div
          className={`flex items-start justify-between p-3.5 rounded-xl border transition-all ${
            stepBComplete
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-[#00F5A0]"
              : "border-slate-200/80 dark:border-[#262626] bg-slate-50 dark:bg-[#171717]"
          }`}
        >
          <div className="flex gap-2.5 min-w-0">
            <div className={`mt-0.5 shrink-0 w-4.5 h-4.5 rounded-full flex items-center justify-center ${
              stepBComplete ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-slate-600 text-slate-500"
            }`}>
              {stepBComplete ? <CheckCircle2 size={12} className="stroke-[3]" /> : <span className="text-[9px] font-mono font-bold">2</span>}
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-bold uppercase font-mono ${stepBComplete ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"}`}>
                Contribute investors
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Target: {contactsCount} / 3 contributed contacts
              </div>
              {!stepBComplete && (
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-1">
                  Add {3 - contactsCount} more contacts to unlock double-blind intros.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onAddClick}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-[#202020] dark:hover:bg-[#262626] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#333333] rounded-lg text-[10px] font-mono font-bold uppercase cursor-pointer transition-all shrink-0"
          >
            Add <PlusCircle size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
