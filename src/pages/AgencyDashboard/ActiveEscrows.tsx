import React from "react";
import { Lock, ShieldCheck, CheckCircle2, Clock, ArrowUpRight, Coins, ExternalLink } from "lucide-react";

export default function ActiveEscrows() {
  const activeEscrows = [
    {
      id: "esc_fasqon_01",
      client: "Fasqon Fintech",
      title: "Cross-Chain SEPA-to-USDC Smart Settlement",
      totalLocked: "$45,000 USDC",
      milestonesCompleted: "1 of 3",
      nextRelease: "$18,000 USDC (Milestone 2)",
      releaseHours: "In Review (Est 24h)",
      contract: "0x7F2a...94E1",
      network: "Arbitrum One",
      status: "In Progress"
    },
    {
      id: "esc_secantx_02",
      client: "SecantX Protocol",
      title: "Circom ZK Constraint & Verifier Audit",
      totalLocked: "$38,000 USD",
      milestonesCompleted: "0 of 2",
      nextRelease: "$19,000 USD (Milestone 1)",
      releaseHours: "48h Post-Delivery",
      contract: "0x3D1c...62B8",
      network: "Ethereum Mainnet",
      status: "Active Kickoff"
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#262626]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
              ESCROW GUARANTEE ENGINE
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight">
            Active Client Escrow Vaults
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
            All client funds are 100% pre-funded before kickoff. Guaranteed disbursement within 48h of milestone completion.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121316] border border-neutral-200 dark:border-white/10 shrink-0 text-right shadow-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">
            Total Vault Balance
          </div>
          <div className="text-2xl font-heading font-black text-emerald-600 dark:text-emerald-400">
            $83,000 USD
          </div>
          <div className="text-[10px] font-mono text-neutral-500">
            2 Active Contracts Locked
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {activeEscrows.map((e) => (
          <div
            key={e.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-[#262626] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  {e.status}
                </span>
                <span className="font-mono text-xs text-neutral-400">
                  {e.client}
                </span>
              </div>
              <h3 className="font-heading font-black text-lg text-black dark:text-white">
                {e.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-500">
                <span>Progress: <strong className="text-black dark:text-white">{e.milestonesCompleted}</strong></span>
                <span>•</span>
                <span>Network: <strong className="text-black dark:text-white">{e.network}</strong></span>
                <span>•</span>
                <span>Vault: <strong className="text-emerald-600">{e.contract}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 text-right font-mono min-w-[170px]">
                <div className="text-[10px] text-neutral-400 uppercase font-bold">Total Locked</div>
                <div className="font-black text-black dark:text-white text-base">{e.totalLocked}</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">{e.nextRelease}</div>
              </div>

              <button className="px-4 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-xs">
                Submit Deliverable
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

