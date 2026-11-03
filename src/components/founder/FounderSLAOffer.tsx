import React from 'react';
import { ShieldCheck, FileText, DollarSign, CheckCircle2, ArrowUpRight, Terminal, Sparkles, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

interface FounderSLAOfferProps {
  className?: string;
  showBrowserFrame?: boolean;
}

export function FounderSLAOffer({ className = '', showBrowserFrame = true }: FounderSLAOfferProps) {
  return (
    <div className={`w-full rounded-[36px] border border-[#dad4c8] dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden clay-shadow transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[-7px_7px_0px_#000] ${className}`}>
      {/* ── BROWSER / TERMINAL CHROME HEADER (Organic Clay Style) ── */}
      {showBrowserFrame && (
        <div className="px-6 py-4 border-b border-[#dad4c8] dark:border-[#262626] bg-[#faf9f7] dark:bg-[#0A0A0A] flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#fc7981] inline-block shadow-xs" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#fbbd41] inline-block shadow-xs" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#84e7a5] inline-block shadow-xs" />
            <div className="ml-3 hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-[#141414] border border-[#dad4c8] dark:border-[#262626] font-mono text-[11px] text-black/70 dark:text-slate-400">
              <Logo className="w-3.5 h-3.5 rounded shrink-0" />
              <span className="text-[#43089f] font-bold">https://</span>
              <span>raisequity.com/app/founder</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#84e7a5]/20 border border-[#84e7a5]/40 text-[#078a52] dark:text-[#84e7a5] font-mono text-[10px] uppercase font-black tracking-[1.2px]">
              <span className="w-2 h-2 rounded-full bg-[#078a52] dark:bg-[#84e7a5] animate-pulse" />
              <span>Live Telemetry Active</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8 md:p-10 space-y-6">
        {/* ── TOP SLA BANNER: Guaranteed Partner Meeting SLA (From Image 2 / Matcha Block) ── */}
        <div className="rounded-[28px] border border-[#078a52]/30 bg-[#84e7a5]/20 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-black text-base sm:text-lg text-black dark:text-white tracking-tight flex items-center gap-2">
                Guaranteed Partner Meeting SLA: Active Window
              </h3>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#84e7a5] text-[#078a52] border border-[#078a52]/40">
                100% Refundable
              </span>
            </div>
            <p className="text-xs sm:text-sm text-black/70 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
              3 confirmed partner-level calls with check-size &amp; stage-matched VCs within 30 days. If &lt;3 delivered, claim 100% automated refund.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-left md:text-right">
              <span className="block text-[9px] font-mono uppercase tracking-[1.4px] text-black/50 dark:text-slate-400 font-bold">
                Window Status
              </span>
              <span className="font-mono text-sm sm:text-base font-black text-[#078a52]">
                24 Days Left (1/3 Calls)
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#84e7a5] text-[#078a52] flex items-center justify-center font-black text-base shadow-xs shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* ── TWO INSTITUTIONAL CARDS: Due Diligence Memo & Syndicate Anchor ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CARD 1: DUE DILIGENCE FAST-PASS MEMO */}
          <div className="rounded-[28px] border border-[#dad4c8] dark:border-[#262626] bg-[#faf9f7] dark:bg-[#181818] p-6 sm:p-7 flex flex-col justify-between space-y-5 clay-shadow transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-[#dad4c8] dark:border-[#262626] pb-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#43089f]" />
                  <span className="font-mono text-xs font-black uppercase tracking-[1.2px] text-black dark:text-white">
                    Due Diligence Fast-Pass Memo
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#84e7a5]/25 text-[#078a52] border border-[#84e7a5]/40">
                  Delaware C-Corp
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 rounded-2xl bg-white dark:bg-[#202020] border border-[#dad4c8]/60 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[#9f9b93]">Target Raise &amp; Cap:</span>
                  <span className="font-black text-black dark:text-white">$1.5M Raise @ $7.5M Cap</span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#202020] border border-[#dad4c8]/60 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[#9f9b93]">Verified GitHub Commits:</span>
                  <span className="font-black text-[#078a52]">248 Commits (Ex-DeepMind)</span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#202020] border border-[#dad4c8]/60 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[#9f9b93]">Traction MoM:</span>
                  <span className="font-black text-[#078a52]">$38,000 MRR (+28% MoM)</span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#202020] border border-[#dad4c8]/60 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[#9f9b93]">Raise Readiness Index:</span>
                  <span className="font-black text-[#43089f]">94/100 (Top 5% Quartile)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#dad4c8] dark:border-[#262626] flex items-center justify-between text-xs">
              <span className="text-[#9f9b93] text-[11px] font-medium">
                Accepted by 180+ VCs in lieu of 30-slide decks
              </span>
              <Link
                to="/login?role=founder"
                className="font-mono text-xs font-black text-[#43089f] dark:text-[#c1b0ff] hover:underline inline-flex items-center gap-1"
              >
                Export PDF <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* CARD 2: LEAD-CHECK SYNDICATE ANCHOR */}
          <div className="rounded-[28px] border border-[#dad4c8] dark:border-[#262626] bg-[#faf9f7] dark:bg-[#181818] p-6 sm:p-7 flex flex-col justify-between space-y-5 clay-shadow transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-[#dad4c8] dark:border-[#262626] pb-3">
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-[#fbbd41]" />
                  <span className="font-mono text-xs font-black uppercase tracking-[1.2px] text-black dark:text-white">
                    Lead-Check Syndicate Anchor
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#fbbd41]/30 text-black border border-[#fbbd41]/50">
                  Score 85+ Unlocked
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 rounded-2xl bg-white dark:bg-[#202020] border border-[#dad4c8]/60 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[#9f9b93]">Scout Network:</span>
                  <span className="font-black text-black dark:text-white">Apex Angel Syndicate &amp; Partners</span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#202020] border border-[#dad4c8]/60 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[#9f9b93]">Pre-Committed Lead Check:</span>
                  <span className="font-black text-black">$50,000 Reserved</span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#202020] border border-[#dad4c8]/60 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[#9f9b93]">Instrument:</span>
                  <span className="font-black text-black dark:text-white">Standard YC Post-Money SAFE</span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#202020] border border-[#dad4c8]/60 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[#9f9b93]">Syndicate Fee:</span>
                  <span className="font-black text-[#078a52]">$0 Upfront (Zero Drag)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#dad4c8] dark:border-[#262626] flex items-center justify-between text-xs">
              <span className="text-[#9f9b93] text-[11px] font-medium">
                Catalyzes round momentum for follower checks
              </span>
              <Link
                to="/login?role=founder"
                className="font-mono text-xs font-black text-black hover:underline inline-flex items-center gap-1"
              >
                Request Intake <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FounderSLAOffer;
