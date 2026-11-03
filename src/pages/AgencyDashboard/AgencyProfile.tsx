import React from "react";
import { Briefcase, ShieldCheck, Award, Star, ExternalLink, CheckCircle2, Coins } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function AgencyProfile() {
  const { profile } = useAuth();
  const agencyName = (profile as any)?.agency_name || profile?.company_name || "ChainCraft Labs";

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
      <div className="pb-4 border-b border-neutral-200 dark:border-[#262626]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
            AGENCY IDENTITY &amp; CREDENTIALS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight">
          {agencyName}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
          Institutional Service Provider &amp; Audit Partner profile indexed across the Raisequity ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-[#262626] shadow-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">Completed Projects</div>
          <div className="text-2xl font-heading font-black text-black dark:text-white mt-1">14</div>
          <div className="text-[10px] font-mono text-emerald-600 font-bold mt-1">100% Escrow Released</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-[#262626] shadow-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">Client Satisfaction</div>
          <div className="text-2xl font-heading font-black text-black dark:text-white mt-1">4.95 / 5.0</div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1">22 Verified Founder Reviews</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-[#262626] shadow-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">Available RFP Credits</div>
          <div className="text-2xl font-heading font-black text-emerald-600 dark:text-emerald-400 mt-1">150 Credits</div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1">Free Tier Partner Allotment</div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-[#262626] space-y-4 shadow-xs">
        <h3 className="font-heading font-black text-lg text-black dark:text-white">
          Verified Service Capabilities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Smart Contract Security Audits (Solidity &amp; Rust)</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Account Abstraction (ERC-4337 &amp; Paymasters)</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Zero-Knowledge Verifiers (Circom &amp; Halo2)</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Full-Stack Web3 DApp Engineering (Next.js &amp; Viem)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
