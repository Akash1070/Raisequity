import React, { useState } from "react";
import {
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Lock,
  ArrowUpRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  Layers,
  Send,
  Award
} from "lucide-react";
import { AGENCY_RFPS, AgencyRfp } from "../../data/agencyRfps";

export default function RfpFeed() {
  const [selectedRfpId, setSelectedRfpId] = useState<string>(AGENCY_RFPS[0].id);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [proposalSubmitted, setProposalSubmitted] = useState<boolean>(false);

  // Filter RFPs
  const filteredRfps = AGENCY_RFPS.filter((rfp) => {
    const matchesCategory =
      categoryFilter === "all" || rfp.category === categoryFilter;
    const matchesSearch =
      searchQuery === "" ||
      rfp.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfp.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const selectedRfp =
    AGENCY_RFPS.find((r) => r.id === selectedRfpId) || AGENCY_RFPS[0];

  const categories = [
    { id: "all", label: "All RFPs", count: AGENCY_RFPS.length },
    {
      id: "smart-contracts",
      label: "Smart Contracts & ZK",
      count: AGENCY_RFPS.filter((r) => r.category === "smart-contracts").length
    },
    {
      id: "security-audits",
      label: "Security & Audits",
      count: AGENCY_RFPS.filter((r) => r.category === "security-audits").length
    },
    {
      id: "fullstack-mvp",
      label: "Full-Stack MVP",
      count: AGENCY_RFPS.filter((r) => r.category === "fullstack-mvp").length
    },
    {
      id: "tokenomics-growth",
      label: "Tokenomics & Growth",
      count: AGENCY_RFPS.filter((r) => r.category === "tokenomics-growth").length
    }
  ];

  const handleApply = () => {
    setProposalSubmitted(true);
    setTimeout(() => setProposalSubmitted(false), 4000);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#000000] text-black dark:text-white font-sans overflow-hidden">
      {/* ── 1. HIREINCRYPTO-STYLE TOP HORIZONTAL PILL BAR ── */}
      <div className="border-b border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-5 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {categories.map((c) => {
          const isActive = categoryFilter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-neutral-100 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#25262e]"
              }`}
            >
              <span>{c.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                    : "bg-neutral-200 dark:bg-white/10 text-neutral-500 dark:text-neutral-300"
                }`}
              >
                {c.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 2. SECONDARY INSTITUTIONAL BANNER (HIREINCRYPTO ATS STYLE) ── */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border-b border-emerald-500/20 px-5 py-2 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-emerald-700 dark:text-emerald-400">
            100% Pre-Funded Milestone Escrow
          </span>
          <span className="text-neutral-400 hidden sm:inline">•</span>
          <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline text-[11px]">
            Funds deposited prior to kickoff. 0.0% default rate with automated 48h milestone disbursement.
          </span>
        </div>
        <div className="font-mono text-[11px] font-bold text-neutral-500 hidden md:block">
          Total Locked Escrow: <strong className="text-black dark:text-white">$1,450,000 USD</strong>
        </div>
      </div>

      {/* ── 3. SPLIT-PANE WORKSPACE (MASTER LIST + DETAIL COCKPIT) ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* ── LEFT PANE: MASTER LIST (Interactive Search & RFP Cards) ── */}
        <div className="w-full md:w-[410px] lg:w-[440px] border-r border-neutral-200 dark:border-[#262626] flex flex-col bg-white dark:bg-[#0A0A0A] shrink-0">
          {/* Search Bar */}
          <div className="p-3 border-b border-neutral-200 dark:border-[#262626]">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search RFPs by skill, client, or budget..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-[#121316] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>
          </div>

          {/* List of Cards */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-white/5">
            {filteredRfps.map((rfp) => {
              const isSelected = rfp.id === selectedRfpId;
              return (
                <div
                  key={rfp.id}
                  onClick={() => setSelectedRfpId(rfp.id)}
                  className={`p-4 transition-all cursor-pointer relative group ${
                    isSelected
                      ? "bg-emerald-50/50 dark:bg-[#101b15] border-l-4 border-l-emerald-500"
                      : "hover:bg-neutral-50/70 dark:hover:bg-[#14151a]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={rfp.clientLogo}
                        alt={rfp.clientName}
                        className="w-6 h-6 rounded-lg object-cover border border-neutral-200 dark:border-white/10 shrink-0"
                      />
                      <span className="font-heading font-black text-xs text-black dark:text-white truncate">
                        {rfp.clientName}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-[#1e1f26] text-neutral-500 uppercase">
                        {rfp.categoryLabel}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                      {rfp.budgetFormatted}
                    </span>
                  </div>

                  <h4 className="font-heading font-black text-sm text-black dark:text-white mb-1 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {rfp.projectTitle}
                  </h4>

                  <p className="text-neutral-500 dark:text-neutral-400 text-xs line-clamp-2 mb-2 font-medium">
                    {rfp.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        100% Escrow
                      </span>
                      <span>•</span>
                      <span>{rfp.timeline}</span>
                      <span>•</span>
                      <span>{rfp.bidsCount} proposals</span>
                    </div>
                    <span>{rfp.postedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANE: DETAIL COCKPIT (HireInCrypto Style Inspection & Actions) ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#000000] overflow-y-auto">
          {/* Detail Header */}
          <div className="p-6 bg-white dark:bg-[#0A0A0A] border-b border-neutral-200 dark:border-[#262626] shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <img
                  src={selectedRfp.clientLogo}
                  alt={selectedRfp.clientName}
                  className="w-12 h-12 rounded-2xl object-cover border border-neutral-200 dark:border-white/10 shrink-0 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-black uppercase text-neutral-400">
                      {selectedRfp.clientName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      {selectedRfp.clientFunding}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-heading font-black text-black dark:text-white tracking-tight">
                    {selectedRfp.projectTitle}
                  </h1>
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mt-1">
                    <span>{selectedRfp.clientLocation}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Escrow Vault: {selectedRfp.escrowAddress}
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget Callout */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200 dark:border-white/10 text-right shrink-0">
                <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">
                  Pre-Funded Budget
                </div>
                <div className="text-2xl font-heading font-black text-emerald-600 dark:text-emerald-400">
                  {selectedRfp.budgetFormatted}
                </div>
                <div className="text-[10px] font-mono text-neutral-500">
                  Timeline: {selectedRfp.timeline}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-neutral-100 dark:border-white/5">
              <button
                onClick={handleApply}
                disabled={proposalSubmitted}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all active:scale-95 flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Sparkles size={14} />
                <span>
                  {proposalSubmitted
                    ? "Proposal Submitted to Escrow Queue!"
                    : "Submit Milestone Proposal (1 Credit)"}
                </span>
              </button>

              <button className="px-4 py-2.5 rounded-full bg-white dark:bg-[#18191e] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
                <MessageSquare size={14} />
                <span>Chat with Founder</span>
              </button>

              <a
                href="#escrow-details"
                className="px-4 py-2.5 rounded-full bg-white dark:bg-[#18191e] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-neutral-600 dark:text-neutral-300 font-mono text-xs transition-all flex items-center gap-1.5 ml-auto"
              >
                <span>View Escrow Smart Contract</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Detail Body Content */}
          <div className="p-6 space-y-6 max-w-4xl">
            {/* Section 1: Authenticity & Due Diligence Signals (HireInCrypto Style) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-[#262626] shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100 dark:border-white/5">
                <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={15} />
                  <span>AUTHENTICITY &amp; ESCROW SIGNALS</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  100% Guaranteed Pay
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5">
                  <div className="text-[9px] text-neutral-400 uppercase font-bold mb-0.5">
                    Legal Entity
                  </div>
                  <div className="font-bold text-black dark:text-white flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>Delaware C-Corp</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5">
                  <div className="text-[9px] text-neutral-400 uppercase font-bold mb-0.5">
                    Venture Backing
                  </div>
                  <div className="font-bold text-black dark:text-white truncate">
                    {selectedRfp.authenticitySignals.leadVcFunded}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5">
                  <div className="text-[9px] text-neutral-400 uppercase font-bold mb-0.5">
                    Code Traction
                  </div>
                  <div className="font-bold text-black dark:text-white flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>Verified GitHub Org</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5">
                  <div className="text-[9px] text-neutral-400 uppercase font-bold mb-0.5">
                    Default Protection
                  </div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    0.0% Default Rate
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Technical Scope & Requirements */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-[#262626] shadow-xs">
              <h3 className="font-heading font-black text-base text-black dark:text-white mb-2">
                Project Scope &amp; Specifications
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-4 font-medium">
                {selectedRfp.description}
              </p>

              <div className="space-y-2 mb-5">
                {selectedRfp.scopeBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-2">
                  REQUIRED TECH STACK
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedRfp.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#18191e] border border-neutral-200 dark:border-white/10 font-mono text-xs font-bold text-black dark:text-white"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Escrow Milestone Breakdown & 48h Disbursement */}
            <div id="escrow-details" className="p-5 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-[#262626] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-black text-base text-black dark:text-white">
                  Milestone Disbursement Schedule (48h Payout)
                </h3>
                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Locked in Smart Contract
                </span>
              </div>

              <div className="space-y-3">
                {selectedRfp.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {m.percentage}%
                        </span>
                        <span className="font-heading font-black text-sm text-black dark:text-white">
                          {m.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        {m.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-base text-black dark:text-white">
                        ${m.amountUsd.toLocaleString()} USD
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {m.payoutHours}h auto-release
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

