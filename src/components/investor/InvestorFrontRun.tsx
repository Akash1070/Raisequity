import React from 'react';
import { Clock, Send, FileCheck2, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InvestorFrontRunProps {
  className?: string;
}

export function InvestorFrontRun({ className = '' }: InvestorFrontRunProps) {
  return (
    <div className={`w-full rounded-[36px] border border-[#43089f] bg-[#c1b0ff] p-8 sm:p-12 md:p-14 text-black clay-shadow transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[-7px_7px_0px_#000] ${className}`}>
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white font-mono text-[11px] uppercase font-black tracking-[1.4px]">
          <span className="w-2 h-2 rounded-full bg-[#fbbd41] animate-pulse" />
          <span>The Front-Run Advantage</span>
        </div>

        <p className="text-base sm:text-lg md:text-xl text-black/85 font-medium leading-[1.6] max-w-3xl mx-auto">
          Funds spend $500k/yr on junior associates scrolling Twitter and Telegram to find deals after everyone else has already seen them. Raisequity gives Pro investors an unfair proprietary advantage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card 1: 7-Day Pre-Launch Front-Run */}
        <div className="rounded-[28px] border border-[#dad4c8] bg-white p-7 flex flex-col justify-between space-y-5 clay-shadow transition-all duration-300 hover:-translate-y-2 hover:shadow-[-6px_6px_0px_#000]">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-[#fbbd41]/20 border border-[#fbbd41]/40 flex items-center justify-center text-black">
              <Clock size={22} />
            </div>
            <h3 className="font-black text-xl text-black font-heading tracking-tight">
              7-Day Pre-Launch Front-Run
            </h3>
            <p className="text-xs sm:text-sm text-[#9f9b93] font-medium leading-relaxed">
              Pro &amp; Syndicate partners get exclusive access to high-conviction deals <strong className="text-black">7 days before</strong> they appear on the public Deal Feed or Launch Directory. Lead rounds before anyone else.
            </p>
          </div>

          <div className="pt-4 border-t border-[#dad4c8]/60 text-[11px] font-mono font-black text-black flex items-center gap-1.5">
            <Check size={16} className="text-[#078a52] shrink-0" />
            <span>✓ Proprietary Pre-Public Dealflow</span>
          </div>
        </div>

        {/* Card 2: Instant Thesis-Match Webhook */}
        <div className="rounded-[28px] border border-[#dad4c8] bg-white p-7 flex flex-col justify-between space-y-5 clay-shadow transition-all duration-300 hover:-translate-y-2 hover:shadow-[-6px_6px_0px_#000]">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3bd3fd]/20 border border-[#3bd3fd]/40 flex items-center justify-center text-black">
              <Send size={22} />
            </div>
            <h3 className="font-black text-xl text-black font-heading tracking-tight">
              Instant Thesis-Match Webhook
            </h3>
            <p className="text-xs sm:text-sm text-[#9f9b93] font-medium leading-relaxed">
              Receive an immediate push directly to your private Telegram channel the second a verified founder matching your <strong className="text-black">exact check size and sector</strong> signs a facilitation agreement.
            </p>
          </div>

          <div className="pt-4 border-t border-[#dad4c8]/60 text-[11px] font-mono font-black text-[#43089f] flex items-center gap-1.5">
            <Check size={16} className="text-[#43089f] shrink-0" />
            <span>✓ Real-Time Telegram Push Delivery</span>
          </div>
        </div>

        {/* Card 3: 1-Click OpenSign SAFE Execution */}
        <div className="rounded-[28px] border border-[#dad4c8] bg-white p-7 flex flex-col justify-between space-y-5 clay-shadow transition-all duration-300 hover:-translate-y-2 hover:shadow-[-6px_6px_0px_#000]">
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-[#84e7a5]/30 border border-[#84e7a5]/50 flex items-center justify-center text-[#078a52]">
              <FileCheck2 size={22} />
            </div>
            <h3 className="font-black text-xl text-black font-heading tracking-tight">
              1-Click OpenSign SAFE Execution
            </h3>
            <p className="text-xs sm:text-sm text-[#9f9b93] font-medium leading-relaxed">
              Issue standardized, pre-vetted YC Post-Money SAFE or Token SAFT agreements in <strong className="text-black">1 click</strong>, eliminating $5,000 legal setup costs and weeks of lawyer back-and-forth per check.
            </p>
          </div>

          <div className="pt-4 border-t border-[#dad4c8]/60 text-[11px] font-mono font-black text-[#078a52] flex items-center gap-1.5">
            <Check size={16} className="text-[#078a52] shrink-0" />
            <span>✓ Zero Legal Overhead ($5k saved/check)</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/login?role=investor"
          className="inline-flex items-center gap-2.5 bg-black text-white hover:bg-[#43089f] px-10 py-4.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-[-6px_6px_0_#fbbd41] active:scale-95 cursor-pointer font-sans"
        >
          <span>Claim Pro Investor Front-Run Access</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default InvestorFrontRun;
