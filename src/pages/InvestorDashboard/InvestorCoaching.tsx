import React, { useState } from "react";
import {
  Compass,
  Calendar,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Award
} from "lucide-react";

interface DiligenceSession {
  name: string;
  role: string;
  firm: string;
  focus: string;
  rate: string;
  avatarSeed: string;
}

const DILIGENCE_PARTNERS: DiligenceSession[] = [
  {
    name: "Robert Mitchnick",
    role: "Digital Assets Lead",
    firm: "Tier-1 Crypto Fund",
    focus: "Institutional custody, protocol tokenomics & staking structures.",
    rate: "$450 / hr",
    avatarSeed: "Robert"
  },
  {
    name: "Cuy Sheffield",
    role: "Head of Crypto & Web3",
    firm: "Global Venture Fund",
    focus: "ZK circuit audits, smart contract formal verification & dApp go-to-market.",
    rate: "$600 / hr",
    avatarSeed: "Cuy"
  },
  {
    name: "Sarah Lin",
    role: "General Partner",
    firm: "Decentralized AI Syndicate",
    focus: "Decentralized compute clusters, LLM evaluation & multi-agent systems.",
    rate: "$500 / hr",
    avatarSeed: "Sarah"
  }
];

export default function InvestorCoaching() {
  const [booked, setBooked] = useState<Record<string, boolean>>({});

  const handleBookSession = (name: string) => {
    setBooked(prev => ({ ...prev, [name]: true }));
    alert(`Diligence session with ${name} reserved. Cal.com booking link sent to your registered partner email.`);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-[#4f46e5] dark:text-[#805ad5]">
              TECHNICAL DILIGENCE NETWORK
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight flex items-center gap-2.5">
            Diligence Coaching &amp; Partner Calls
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            1:1 technical sessions with veteran check-writers and auditors to review complex protocol architectures before wiring capital.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
            3 Tier-1 Experts Available
          </span>
        </div>
      </div>

      {/* 2-Column Overview & Available Partners */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Diligence Standards */}
        <div className="lg:col-span-5 p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck size={12} className="text-emerald-400" /> INSTITUTIONAL ADVISORY
          </div>

          <h2 className="text-xl font-heading font-black text-black dark:text-white leading-tight">
            Structured Protocol Diligence Sessions
          </h2>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
            Review tokenomics models, smart contract attack surfaces, and governance mechanisms with verified partners who have audited $10B+ in TVL.
          </p>

          <div className="space-y-2.5 pt-2 font-mono text-xs">
            {[
              "Formal Verification & ZK Circuit Audits",
              "Delaware C-Corp & Cross-Border Tokenomics Setup",
              "Liquidity Provisioning & DEX Market Making",
              "AI Inference Node Economics & GPU Clusters"
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 flex items-center gap-2.5 text-black dark:text-white">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Available Partners List */}
        <div className="lg:col-span-7 space-y-3.5">
          {DILIGENCE_PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className="p-5 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-black/30 dark:hover:border-white/20"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/10 overflow-hidden shrink-0">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.avatarSeed}`}
                    alt={partner.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-black text-base text-black dark:text-white">
                      {partner.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      {partner.firm}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mb-1">
                    {partner.role}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug">
                    {partner.focus}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono">
                <span className="text-xs font-black text-black dark:text-white">
                  {partner.rate}
                </span>

                <button
                  onClick={() => handleBookSession(partner.name)}
                  disabled={booked[partner.name]}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    booked[partner.name]
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                      : "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black shadow-xs active:scale-95"
                  }`}
                >
                  {booked[partner.name] ? "Reserved ✓" : "Book 1:1 →"}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
