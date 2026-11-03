import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, CheckCircle2, TrendingUp, Sparkles, Scale, FileText, 
  Bot, Clock, Flame, Users, Calendar, ArrowRight, Lock, DollarSign, 
  ExternalLink, Layers, Award, Check 
} from 'lucide-react';
import { Logo } from '../ui/Logo';

type PersonaTab = 'founder' | 'investor' | 'agency';

export function InteractiveEcosystemPreview() {
  const [activeTab, setActiveTab] = useState<PersonaTab>('founder');

  return (
    <section className="my-16 max-w-6xl mx-auto px-4">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0070F3]/10 text-[#0070F3] text-xs font-mono font-bold border border-[#0070F3]/25 mb-4 shadow-xs">
          <Sparkles size={13} className="text-[#0070F3]" />
          <span>The Unified Capital &amp; Execution Infrastructure</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-4">
          One Platform. Three Unfair Advantages.
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400 font-normal text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          See exactly what Founders, Investors, and Service Agencies experience inside Raisequity. 
          Zero guesswork, real verification, and binding algorithmic SLAs.
        </p>

        {/* Persona Switcher Tabs */}
        <div className="inline-flex flex-wrap items-center justify-center p-1.5 bg-[#FAFAFA] dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl mt-8 shadow-sm gap-1">
          <button
            onClick={() => setActiveTab('founder')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'founder'
                ? 'bg-[#0070F3]/15 text-[#0070F3] border border-[#0070F3]/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#171717]'
            }`}
          >
            <ShieldCheck size={15} className={activeTab === 'founder' ? 'text-[#0070F3]' : ''} />
            <span>1. For Founders (SLA Guarantee)</span>
          </button>

          <button
            onClick={() => setActiveTab('investor')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'investor'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#171717]'
            }`}
          >
            <Flame size={15} className={activeTab === 'investor' ? 'text-amber-500' : ''} />
            <span>2. For Investors (7-Day Front-Run)</span>
          </button>

          <button
            onClick={() => setActiveTab('agency')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'agency'
                ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-[#171717]'
            }`}
          >
            <Layers size={15} className={activeTab === 'agency' ? 'text-sky-500' : ''} />
            <span>3. For Agencies (Escrow Contracts)</span>
          </button>
        </div>
      </div>

      {/* Interactive Window Preview (Mac Window Frame) */}
      <div className="bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-[32px] border border-slate-200 dark:border-[#262626] p-4 sm:p-7 shadow-xl overflow-hidden relative transition-colors duration-150">
        {/* Window Chrome Header */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-200 dark:border-[#262626] text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block shadow-[0_0_8px_rgba(255,95,86,0.5)]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block shadow-[0_0_8px_rgba(255,189,46,0.5)]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block shadow-[0_0_8px_rgba(39,201,63,0.5)]" />
            <div className="flex items-center gap-1.5 ml-3">
              <Logo className="w-3.5 h-3.5 rounded shrink-0" />
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                https://raisequity.com/app/{activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#0070F3] bg-[#0070F3]/10 border border-[#0070F3]/25 px-3 py-1 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#0070F3] animate-pulse" />
            <span>Live Telemetry Active</span>
          </div>
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          {activeTab === 'founder' && (
            <motion.div
              key="founder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Top Banner: SLA Outcome Promise (Image 2 Style) */}
              <div className="bg-emerald-500/10 dark:bg-[#041F14] border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">Guaranteed Partner Meeting SLA: Active Window</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-extrabold text-[10px] uppercase font-mono shadow-xs border border-emerald-500/30">
                      100% Refundable
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                    3 confirmed partner-level calls with check-size &amp; stage-matched VCs within 30 days. If &lt;3 delivered, claim 100% automated refund.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">Window Status</span>
                    <span className="text-emerald-700 dark:text-[#00F5A0] font-bold text-sm font-mono">24 Days Left (1/3 Calls)</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-700 dark:text-[#00F5A0] font-black shadow-xs">
                    ✓
                  </div>
                </div>
              </div>

              {/* Grid: Fast-Pass Memo & Syndicate Anchor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1-Page Institutional Memo */}
                <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#0070F3]" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white tracking-wider">Due Diligence Fast-Pass Memo</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#0070F3] bg-[#0070F3]/10 px-2.5 py-0.5 rounded border border-[#0070F3]/25">
                      Delaware C-Corp Verified
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#171717] rounded-xl p-4 border border-slate-200/60 dark:border-[#262626] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Target Raise &amp; Cap:</span>
                      <span className="text-slate-900 dark:text-white font-bold">$1.5M Raise @ $7.5M Cap</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Verified GitHub Commits:</span>
                      <span className="text-emerald-600 dark:text-[#00F5A0] font-bold">248 Commits (Ex-DeepMind team)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Traction MoM:</span>
                      <span className="text-emerald-600 dark:text-[#00F5A0] font-bold">$38,000 MRR (+28% MoM)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Raise Readiness Index:</span>
                      <span className="text-[#0070F3] font-bold">92/100 (Institutional Grade)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Accepted by 180+ VCs in lieu of 30-slide decks</span>
                    <span className="text-[#0070F3] font-bold hover:underline cursor-pointer">Export PDF ↗</span>
                  </div>
                </div>

                {/* Lead-Check Syndicate Anchor */}
                <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-amber-500" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white tracking-wider">Lead-Check Syndicate Anchor</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                      Score 85+ Unlocked
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#171717] rounded-xl p-4 border border-slate-200/60 dark:border-[#262626] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Scout Network:</span>
                      <span className="text-slate-900 dark:text-white font-bold">Apex Angel Syndicate &amp; Partners</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Pre-Committed Lead Check:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">$50,000 Reserved</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Instrument:</span>
                      <span className="text-slate-900 dark:text-white font-bold">Standard YC Post-Money SAFE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Syndicate Fee:</span>
                      <span className="text-emerald-600 dark:text-[#00F5A0] font-bold">$0 Upfront (Zero Drag)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Catalyzes round momentum for follower checks</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer">Request Intake ↗</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'investor' && (
            <motion.div
              key="investor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Top Banner: 7-Day Front-Run Advantage */}
              <div className="bg-amber-500/10 dark:bg-[#1A1408] border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">7-Day Pre-Launch Dealfeed Front-Run</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F5A623] text-black font-extrabold text-[10px] uppercase font-mono shadow-xs">
                      Pro Exclusive
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                    Access high-conviction deals 7 days before they are indexed on public launch directories. Lead deals without associate lag.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">Front-Run Lead Time</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-sm font-mono">4d 18h Remaining</span>
                </div>
              </div>

              {/* Grid: 1-Click SAFE & Telegram Bot Stream */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1-Click SAFE Execution */}
                <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale size={16} className="text-[#0070F3]" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white tracking-wider">1-Click OpenSign SAFE Execution</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#0070F3] bg-[#0070F3]/10 px-2.5 py-0.5 rounded border border-[#0070F3]/25">
                      $0 Legal Fees
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#171717] rounded-xl p-4 border border-slate-200/60 dark:border-[#262626] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Target Founder:</span>
                      <span className="text-slate-900 dark:text-white font-bold">AetherScale AI (Seed)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Check Size:</span>
                      <span className="text-[#0070F3] font-bold">$100,000 Check</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Valuation Cap:</span>
                      <span className="text-slate-900 dark:text-white font-bold">$8,000,000 Post-Money</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Legal Overhead Saved:</span>
                      <span className="text-emerald-600 dark:text-[#00F5A0] font-bold">$5,000 Saved / Instant Signature</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Cryptographically verified on OpenSign</span>
                    <span className="text-[#0070F3] font-bold hover:underline cursor-pointer">Preview SAFE ↗</span>
                  </div>
                </div>

                {/* Instant Telegram Bot Alert */}
                <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot size={16} className="text-[#0070F3]" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white tracking-wider">Thesis-Match Telegram Bot</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#0070F3] bg-[#0070F3]/10 px-2.5 py-0.5 rounded border border-[#0070F3]/30">
                      Instant Push
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#171717] rounded-xl p-4 border border-slate-200/60 dark:border-[#262626] space-y-2 text-xs font-mono">
                    <div className="text-[#0070F3] text-[11px]">⚡ @RaisequityAlertBot Push (Just Now):</div>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      "🚀 High-Fit Match: CogniMesh AI (Seed) matches your $100k-$500k check thesis in AI/Infra. 94% fit score. Delaware verified."
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-[#262626]">
                      <span>Webhook: Slack / Telegram / Zapier</span>
                      <span className="text-[#0070F3] font-bold">Active Stream</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Push delivered within 2 seconds of agreement sign</span>
                    <span className="text-[#0070F3] font-bold hover:underline cursor-pointer">Configure Bot ↗</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'agency' && (
            <motion.div
              key="agency"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Top Banner: Escrow Protected Client Work */}
              <div className="bg-sky-500/10 dark:bg-[#071520] border border-sky-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-sky-500" />
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">Escrow-Backed Client Handoffs</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold text-[10px] uppercase font-mono shadow-xs">
                      Guaranteed Payout
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                    Connect with funded, pre-screened founders with pre-deposited milestone escrow. Never get ghosted on invoices again.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">Agency Protection</span>
                  <span className="text-emerald-600 dark:text-[#00F5A0] font-bold text-sm font-mono">Zero Invoice Risk</span>
                </div>
              </div>

              {/* Grid: Inbound Founder Requests & Perks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Active Client Project Request */}
                <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-[#0070F3]" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white tracking-wider">Inbound Founder Requests</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#0070F3] bg-[#0070F3]/10 px-2.5 py-0.5 rounded border border-[#0070F3]/25">
                      $15k Escrow Funded
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#171717] rounded-xl p-4 border border-slate-200/60 dark:border-[#262626] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Client:</span>
                      <span className="text-slate-900 dark:text-white font-bold">Solara Labs (Recent $2M Seed)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Deliverable:</span>
                      <span className="text-slate-900 dark:text-white">Smart Contract Security Audit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Milestone 1 (70%):</span>
                      <span className="text-emerald-600 dark:text-[#00F5A0] font-bold">$10,500 Locked in Escrow</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Milestone 2 (30%):</span>
                      <span className="text-emerald-600 dark:text-[#00F5A0] font-bold">$4,500 Locked in Escrow</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Direct founder handoff with double-blind fit</span>
                    <span className="text-[#0070F3] font-bold hover:underline cursor-pointer">Accept Contract ↗</span>
                  </div>
                </div>

                {/* Partner Agency Allowances */}
                <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      <span className="text-xs font-mono font-bold uppercase text-slate-900 dark:text-white tracking-wider">Partner Agency Suite</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                      150 Credits Unlocked
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#171717] rounded-xl p-4 border border-slate-200/60 dark:border-[#262626] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Directory Ranking:</span>
                      <span className="text-slate-900 dark:text-white">Verified Tier-1 Service Provider</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Direct Founder Intros:</span>
                      <span className="text-[#0070F3] font-bold">Unlimited Inbound Pipeline</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Ecosystem Perks:</span>
                      <span className="text-slate-900 dark:text-white">$500k+ Cloud &amp; Infra Discounts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Success Fee Offset:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">Up to 30% Fee Reduction</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>Showcase your firm to 180+ VCs and 500+ founders</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer">Join Agency Pool ↗</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}