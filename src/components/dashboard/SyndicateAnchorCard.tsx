import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Coins, CheckCircle2, Award, ArrowUpRight, Sparkles, 
  Users, Building, ShieldCheck, Check 
} from 'lucide-react';

interface SyndicateAnchorCardProps {
  readinessScore?: number;
  companyName?: string;
  onRequestIntake?: () => void;
}

export default function SyndicateAnchorCard({
  readinessScore = 92,
  companyName = "Your Startup",
  onRequestIntake,
}: SyndicateAnchorCardProps) {
  const [requested, setRequested] = useState(false);
  const isQualified = readinessScore >= 85;

  const handleRequest = () => {
    if (onRequestIntake) onRequestIntake();
    setRequested(true);
  };

  return (
    <div className="bg-white rounded-[32px] border border-amber-500/30 p-6 sm:p-7 shadow-lg relative overflow-hidden">
      {/* Decorative Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black">
            <Coins size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Lead-Check Syndicate Anchor</h3>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                $25k–$50k Anchor
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Catalyze your round with verified partner scout capital</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <CheckCircle2 size={13} />
          <span>Readiness Score {readinessScore}/100</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed">
        High-conviction founders scoring <strong>85+ on Raise Readiness</strong> unlock pre-allocated anchor commitments. 
        Raisequity’s verified partner scout syndicates commit the initial <strong>$25,000 to $50,000 lead angel check</strong> to create 
        momentum and FOMO for institutional VCs.
      </p>

      {/* Partner Syndicate Preview */}
      <div className="my-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
            AS
          </div>
          <div>
            <div className="font-black text-slate-900">Apex Angel Syndicate & Scout Partners</div>
            <div className="text-[11px] text-slate-400 font-medium">Checked: 24 Rounds Led · Avg Ticket: $35,000</div>
          </div>
        </div>
        <div className="text-right self-end sm:self-auto">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Allocation Reserved</span>
          <span className="text-sm font-black text-amber-600">$50,000 Lead Check</span>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Standard Post-Money SAFE / SAFT terms. Zero upfront syndicate fees.</span>
        </div>

        <button
          onClick={handleRequest}
          disabled={!isQualified || requested}
          className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {requested ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span>Anchor Syndicate Requested</span>
            </>
          ) : (
            <>
              <Sparkles size={14} className="text-amber-400" />
              <span>Apply for $50k Lead Check</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

