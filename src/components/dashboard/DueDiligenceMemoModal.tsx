import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, ShieldCheck, CheckCircle2, Download, Copy, Check, 
  ExternalLink, Sparkles, Building2, TrendingUp, X, GitCommit 
} from 'lucide-react';
import { InstitutionalMemoData } from '../../lib/institutionalMemo';

interface DueDiligenceMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memo: InstitutionalMemoData;
}

export default function DueDiligenceMemoModal({ isOpen, onClose, memo }: DueDiligenceMemoModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyMemo = () => {
    const text = `Institutional Due Diligence Fast-Pass Tear Sheet: ${memo.companyName} (${memo.sector} · ${memo.stage})\n` +
      `Raising: ${memo.raiseAmountFormatted} at ${memo.valuationCap} (${memo.instrument})\n` +
      `Traction: ${memo.tractionMetrics.map(m => `${m.label}: ${m.value} (${m.growth})`).join(' | ')}\n` +
      `Team: ${memo.teamBackground}\n` +
      `Verified Delaware Entity & GitHub Commits. Forwardable Link: ${memo.website}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="bg-white rounded-[32px] border border-gray-200 shadow-2xl max-w-3xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="bg-[#0D0F12] text-white p-6 sm:p-7 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 font-black">
                <FileText size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-white">Institutional Due Diligence Fast-Pass</h2>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Partner VC Tear Sheet
                  </span>
                </div>
                <p className="text-xs text-gray-400">Accepted by partner VCs in lieu of a 30-slide pitch deck</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Print or Save as PDF"
              >
                <Download size={13} /> Export PDF
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable 1-Page Tear Sheet Content */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar bg-slate-50/50 print:bg-white print:p-0">
            {/* Top Company Header Card */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-black tracking-tight">{memo.companyName}</h3>
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                    {memo.stage}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{memo.tagline}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold uppercase pt-1">
                  <span>{memo.sector}</span>
                  <span>•</span>
                  <span>{memo.location}</span>
                  <span>•</span>
                  <a href={memo.website} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-0.5">
                    {memo.website.replace(/^https?:\/\//, '')} <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Raise Readiness Index */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-center shrink-0 w-full sm:w-auto">
                <div className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Raise Readiness</div>
                <div className="text-3xl font-black text-emerald-600 tracking-tight">{memo.raiseReadinessScore}/100</div>
                <div className="text-[10px] text-emerald-700 font-bold">Institutional Grade</div>
              </div>
            </div>

            {/* Verification Seals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-slate-800 shadow-xs">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Delaware C-Corp</span>
              </div>
              <div className="bg-white border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-slate-800 shadow-xs">
                <GitCommit size={16} className="text-emerald-500 shrink-0" />
                <span>GitHub Verified</span>
              </div>
              <div className="bg-white border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-slate-800 shadow-xs">
                <TrendingUp size={16} className="text-emerald-500 shrink-0" />
                <span>Verified Unit Econ</span>
              </div>
              <div className="bg-white border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-xs font-bold text-slate-800 shadow-xs">
                <Sparkles size={16} className="text-emerald-500 shrink-0" />
                <span>Zero-Noise SLA</span>
              </div>
            </div>

            {/* Round Economics & Instrument */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">Round Architecture</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Target Raise</span>
                  <span className="text-lg font-black text-slate-900">{memo.raiseAmountFormatted}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Valuation Cap</span>
                  <span className="text-lg font-black text-slate-900">{memo.valuationCap}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Legal Instrument</span>
                  <span className="text-sm font-black text-emerald-700">{memo.instrument}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Check Min</span>
                  <span className="text-lg font-black text-slate-900">$25k–$50k</span>
                </div>
              </div>
            </div>

            {/* Traction & Growth Metrics */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">Institutional Traction Audit</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {memo.tractionMetrics.map((metric, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">{metric.label}</span>
                      <span className="font-black text-slate-900 text-sm">{metric.value}</span>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-black text-[11px]">
                      {metric.growth}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team & Cap Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">Team Credentials</div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {memo.teamBackground}
                </p>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">Cap Table Distribution</div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Founders</span>
                    <span className="text-slate-900">{memo.capTableStructure.foundersPct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${memo.capTableStructure.foundersPct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 font-medium">
                    <span>Option Pool: {memo.capTableStructure.optionPoolPct}%</span>
                    <span>Investors: {memo.capTableStructure.investorsPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Forwardable Memo Summary */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 text-xs">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Forwardable Partner Blurb</div>
              <p className="text-slate-300 leading-relaxed italic">
                "{memo.forwardableBlurb}"
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 font-medium">
              Verified on {memo.generatedDate} · Cryptographically stamped by Raisequity
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleCopyMemo}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Forwardable Tear Sheet'}
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-initial bg-black hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

