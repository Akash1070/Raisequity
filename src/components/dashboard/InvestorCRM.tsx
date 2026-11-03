import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Trash2, 
  Loader2, 
  MoreVertical, 
  ChevronRight,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { 
  PipelineEntry, 
  CRMStage 
} from '../../types';
import { 
  getPipelineEntries, 
  createPipelineEntry, 
  updatePipelineStage, 
  deletePipelineEntry, 
  calculateFundraiseProgress,
  FundraiseProgress
} from '../../lib/crm';

interface InvestorCRMProps {
  founderId: string;
  fundingGoal?: number;
}

const STAGE_CONFIG: { id: CRMStage; label: string; color: string; dotColor: string }[] = [
  { id: 'researching', label: 'Researching', color: 'text-slate-400', dotColor: 'bg-slate-400' },
  { id: 'contacted', label: 'Contacted', color: 'text-sky-400', dotColor: 'bg-sky-400' },
  { id: 'in_conversation', label: 'In Conversation', color: 'text-indigo-400', dotColor: 'bg-indigo-400' },
  { id: 'term_sheet', label: 'Term Sheet', color: 'text-amber-400', dotColor: 'bg-amber-400' },
  { id: 'closed', label: 'Closed / Committed', color: 'text-[#00F5A0]', dotColor: 'bg-[#00F5A0]' },
  { id: 'passed', label: 'Passed', color: 'text-rose-400', dotColor: 'bg-rose-400' },
];

export default function InvestorCRM({ founderId, fundingGoal = 500000 }: InvestorCRMProps) {
  const [entries, setEntries] = useState<PipelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [investorName, setInvestorName] = useState('');
  const [investorFirm, setInvestorFirm] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(50000);
  const [initialStage, setInitialStage] = useState<CRMStage>('researching');
  const [isAdding, setIsAdding] = useState(false);

  const loadData = async () => {
    try {
      const data = await getPipelineEntries(founderId);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load CRM entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (founderId) loadData();
  }, [founderId]);

  const progress: FundraiseProgress = calculateFundraiseProgress(entries, fundingGoal);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorName.trim() || !investorFirm.trim()) return;

    setIsAdding(true);
    try {
      const res = await createPipelineEntry(
        founderId,
        investorName,
        investorFirm,
        initialStage,
        Number(targetAmount) || 0,
        0,
        '',
        false
      );
      if (res.success && res.entry) {
        setEntries(prev => [res.entry!, ...prev]);
      }
      setShowAddModal(false);
      setInvestorName('');
      setInvestorFirm('');
      setTargetAmount(50000);
      setInitialStage('researching');
    } catch (err) {
      console.error('Error adding pipeline entry:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStageChange = async (entryId: string, newStage: CRMStage) => {
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, stage: newStage } : e));
    await updatePipelineStage(entryId, newStage);
  };

  const handleDelete = async (entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId));
    await deletePipelineEntry(entryId);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Fundraise Progress Bar */}
      <div className="bg-white dark:bg-[#111111] rounded-[28px] border border-slate-200 dark:border-[#262626] p-6 md:p-8 shadow-xs transition-colors duration-150">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#0070F3] tracking-wider">
              <TrendingUp size={15} /> Fundraise Pipeline CRM
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Investor Management Board</h2>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0070F3] hover:bg-[#0060DF] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 font-mono"
          >
            <Plus size={15} /> Add Investor Lead
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 bg-slate-50 dark:bg-[#171717] p-5 rounded-2xl border border-slate-200/60 dark:border-[#262626]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">Target Goal: <b className="text-slate-900 dark:text-white">${(fundingGoal / 1000).toFixed(0)}k</b></span>
            <span className="text-[#0070F3] font-bold">${(progress.totalCommitted / 1000).toFixed(0)}k Committed ({progress.percentCommitted}%)</span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 dark:bg-[#262626] rounded-full overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentCommitted}%` }}
              className="h-full bg-[#0070F3] shadow-xs"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 pt-1">
            <span>{progress.activeCount} Active Convos</span>
            <span>{progress.termSheetCount} Term Sheets</span>
            <span className="text-emerald-600 dark:text-[#00F5A0]">{progress.closedCount} Closed Checks</span>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {STAGE_CONFIG.map(col => {
          const colEntries = entries.filter(e => e.stage === col.id);

          return (
            <div key={col.id} className="bg-slate-50 dark:bg-[#111111] rounded-2xl p-3 border border-slate-200 dark:border-[#262626] flex flex-col min-h-[380px] transition-colors duration-150">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className={`font-mono text-[11px] font-bold uppercase tracking-tight ${col.color}`}>{col.label}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-[#171717] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#333333]">
                  {colEntries.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-2.5 overflow-y-auto custom-scrollbar">
                {colEntries.map(entry => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#171717] rounded-xl p-3 border border-slate-200 dark:border-[#262626] hover:border-[#0070F3]/40 shadow-xs transition-all group relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{entry.investorName}</h4>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{entry.investorFirm}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {entry.targetAmount ? (
                      <div className="mt-2.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#262626]">
                        <span>Target:</span>
                        <span className="text-emerald-600 dark:text-[#00F5A0] font-bold">${(entry.targetAmount / 1000).toFixed(0)}k</span>
                      </div>
                    ) : null}

                    {/* Move Stage Selector */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-[#262626] flex items-center justify-between">
                      <select
                        value={entry.stage}
                        onChange={e => handleStageChange(entry.id, e.target.value as CRMStage)}
                        className="text-[9px] font-mono font-bold uppercase text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-[#333333] rounded-lg px-2 py-1 outline-none cursor-pointer"
                      >
                        {STAGE_CONFIG.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>

                      {entry.isPlatformConnection && (
                        <span className="text-[8px] font-mono font-bold text-emerald-700 dark:text-[#00F5A0] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-0.5">
                          <ShieldCheck size={9} /> Verified
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}

                {colEntries.length === 0 && (
                  <div className="h-28 border border-dashed border-slate-200 dark:border-[#262626] rounded-xl flex items-center justify-center text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    No leads
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#111111] rounded-[24px] border border-slate-200 dark:border-[#262626] shadow-2xl max-w-md w-full p-6 sm:p-7 relative text-slate-900 dark:text-slate-100 transition-colors"
            >
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">Add Investor to CRM</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-5">Track platform-matched or off-platform investor leads</p>

              <form onSubmit={handleAddEntry} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">Investor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Guo"
                    value={investorName}
                    onChange={e => setInvestorName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#0070F3]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">Fund / VC Firm</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Conviction VC"
                    value={investorFirm}
                    onChange={e => setInvestorFirm(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#0070F3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">Target Check ($)</label>
                    <input
                      type="number"
                      value={targetAmount}
                      onChange={e => setTargetAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[#0070F3]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">Stage</label>
                    <select
                      value={initialStage}
                      onChange={e => setInitialStage(e.target.value as CRMStage)}
                      className="w-full bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      {STAGE_CONFIG.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#202020] dark:hover:bg-[#262626] text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="flex-1 py-2.5 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl font-extrabold text-xs uppercase shadow-xs transition-all cursor-pointer font-mono"
                  >
                    {isAdding ? <Loader2 size={15} className="animate-spin mx-auto" /> : 'Save Lead'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
