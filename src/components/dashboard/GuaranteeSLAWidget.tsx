import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Calendar, CheckCircle2, Clock, AlertCircle, 
  HelpCircle, Sparkles, RefreshCw, ChevronRight, Lock 
} from 'lucide-react';

interface GuaranteeSLAWidgetProps {
  completedCallsCount?: number;
  daysRemaining?: number;
  onViewMeetings?: () => void;
  onClaimRefund?: () => void;
}

export default function GuaranteeSLAWidget({
  completedCallsCount = 1,
  daysRemaining = 24,
  onViewMeetings,
  onClaimRefund,
}: GuaranteeSLAWidgetProps) {
  const [showTerms, setShowTerms] = useState(false);
  const [refundClaimed, setRefundClaimed] = useState(false);

  const targetCalls = 3;
  const isFulfilled = completedCallsCount >= targetCalls;
  const isRefundEligible = !isFulfilled && daysRemaining === 0;

  const handleRefundClick = () => {
    if (onClaimRefund) {
      onClaimRefund();
    }
    setRefundClaimed(true);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#121620] text-white rounded-[32px] p-6 sm:p-7 border border-emerald-500/30 shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-white">Guaranteed Partner Meeting SLA</h3>
              <span className="bg-emerald-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                Active Guarantee
              </span>
            </div>
            <p className="text-xs text-slate-400">3 Confirmed Partner-Level VC Intro Calls in 30 Days or 100% Full Refund</p>
          </div>
        </div>

        {/* Days Left Countdown Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl border border-white/10 text-xs font-bold text-slate-300 self-start sm:self-auto">
          <Clock size={13} className="text-emerald-400" />
          <span>{daysRemaining} Days Remaining in Window</span>
        </div>
      </div>

      {/* Progress Cards: 3 Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        {[1, 2, 3].map((callNum) => {
          const isDone = completedCallsCount >= callNum;
          const isNext = completedCallsCount + 1 === callNum;

          return (
            <div
              key={callNum}
              className={`p-3.5 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : isNext
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/5 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider">Partner Call #{callNum}</span>
                {isDone ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <Calendar size={14} className={isNext ? 'text-amber-400' : 'text-slate-600'} />
                )}
              </div>
              <div className="text-xs font-black">
                {isDone ? 'Completed & Confirmed' : isNext ? 'Matching in Thesis Queue' : 'Pending Scheduling'}
              </div>
            </div>
          );
        })}
      </div>

      {/* SLA Policy Bullet Points */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs space-y-2 mt-4 text-slate-300">
        <div className="flex items-center justify-between text-[11px] font-black uppercase text-emerald-400 tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} /> The Raisequity Partner SLA Promise
          </span>
          <button
            onClick={() => setShowTerms(!showTerms)}
            className="text-slate-400 hover:text-white flex items-center gap-1 underline cursor-pointer lowercase"
          >
            {showTerms ? 'hide terms' : 'learn terms'}
          </button>
        </div>

        <p className="leading-relaxed">
          Unlike PitchBook or Crunchbase which sell dead email directories, Raisequity commits to real, qualified outcomes: 
          <strong> 3 confirmed partner meetings with thesis-matched check-writers</strong>. If fewer than 3 meetings are delivered 
          within your 30-day window, you are entitled to a 100% full refund with 1 click.
        </p>

        {showTerms && (
          <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px] text-slate-400">
            <div>• Partners must match your stage, sector, and minimum check size (&gt;$25k).</div>
            <div>• Meetings must be confirmed on your connected calendar (Cal.com or Calendly).</div>
            <div>• 100% automated refund processing directly back to your payment method via Dodo Payments.</div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>SLA Status: <strong>{isFulfilled ? 'Goal Reached (3/3 Completed)' : `${completedCallsCount}/3 Partner Calls Locked`}</strong></span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isRefundEligible ? (
            <button
              onClick={handleRefundClick}
              disabled={refundClaimed}
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              {refundClaimed ? '✓ 100% Refund Claim Submitted' : 'Claim 100% Money-Back Refund'}
            </button>
          ) : (
            <button
              onClick={onViewMeetings}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Partner Bookings</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

