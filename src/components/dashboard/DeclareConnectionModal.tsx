import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, ShieldCheck, Plus, Loader2 } from 'lucide-react';
import { declareInvestorConnection } from '../../lib/connections';
import { Sector } from '../../types';

interface DeclareConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  founderId: string;
  founderName: string;
  founderCompany?: string;
  onSuccess?: () => void;
}

const AVAILABLE_SECTORS: Sector[] = [
  'DeFi', 'Infrastructure', 'Gaming', 'SocialFi', 'NFT', 'AI', 'RWA', 'Fintech', 'DeSci', 'SaaS', 'Marketplace', 'Consumer'
];

const STAGES = ['Idea', 'Pre-Seed', 'Seed', 'Series A', 'Series B'];

export default function DeclareConnectionModal({
  isOpen,
  onClose,
  founderId,
  founderName,
  founderCompany = 'My Startup',
  onSuccess
}: DeclareConnectionModalProps) {
  const [investorName, setInvestorName] = useState('');
  const [investorFirm, setInvestorFirm] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<Sector[]>(['DeFi', 'AI']);
  const [selectedStages, setSelectedStages] = useState<string[]>(['Seed']);
  const [ticketSize, setTicketSize] = useState('$50k - $250k');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSector = (sec: Sector) => {
    setSelectedSectors(prev => 
      prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]
    );
  };

  const toggleStage = (st: string) => {
    setSelectedStages(prev => 
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!investorName.trim() || !investorFirm.trim()) {
      setError('Please provide investor name and firm.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await declareInvestorConnection(
        founderId,
        founderName,
        founderCompany,
        investorName,
        investorFirm,
        selectedSectors,
        selectedStages,
        ticketSize
      );

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || 'Failed to declare connection.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[32px] border border-gray-100 shadow-2xl max-w-lg w-full p-8 relative overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-[var(--color-clay-ube)]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-black">Declare Investor Connection</h2>
              <p className="text-xs text-gray-500 font-medium">Allow fellow founders to request warm intros to your network</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[11px] font-black uppercase text-gray-400 block mb-1.5 px-1">Investor / VC Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Marc Andreessen"
                value={investorName}
                onChange={e => setInvestorName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase text-gray-400 block mb-1.5 px-1">Fund / Firm Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Andreessen Horowitz (a16z)"
                value={investorFirm}
                onChange={e => setInvestorFirm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase text-gray-400 block mb-1.5 px-1">Target Sectors</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_SECTORS.map(sec => {
                  const isSel = selectedSectors.includes(sec);
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => toggleSector(sec)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSel ? 'bg-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {sec}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase text-gray-400 block mb-1.5 px-1">Check Size & Stage</label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={ticketSize}
                  onChange={e => setTicketSize(e.target.value)}
                  className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-xs font-bold outline-none"
                >
                  <option value="$10k - $50k">$10k - $50k</option>
                  <option value="$50k - $250k">$50k - $250k</option>
                  <option value="$250k - $1M">$250k - $1M</option>
                  <option value="$1M+">$1M+</option>
                </select>

                <div className="flex gap-1 overflow-x-auto">
                  {STAGES.map(st => {
                    const isSel = selectedStages.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleStage(st)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                          isSel ? 'bg-[var(--color-clay-ube)] text-white' : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-wide hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-wide hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Declare Connection
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
