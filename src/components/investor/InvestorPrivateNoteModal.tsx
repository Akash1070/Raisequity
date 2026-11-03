import React, { useState, useEffect } from 'react';
import { FileText, X, Save, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { getInvestorNote, saveInvestorNote } from '../../lib/investorNotes';

interface InvestorPrivateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  investorId: string;
  founderId: string;
  companyName: string;
  founderName?: string;
  startupId?: string;
}

export default function InvestorPrivateNoteModal({
  isOpen,
  onClose,
  investorId,
  founderId,
  companyName,
  founderName,
  startupId,
}: InvestorPrivateNoteModalProps) {
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && investorId && founderId) {
      setLoading(true);
      getInvestorNote(investorId, founderId)
        .then((note) => {
          if (note) {
            setNoteText(note.note_text || '');
          } else {
            setNoteText('');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, investorId, founderId]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    const res = await saveInvestorNote(investorId, founderId, noteText, startupId);
    setSaving(false);
    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-black">Private Investor CRM Note</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  <Lock size={10} /> Private
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                For {companyName} {founderName ? `(${founderName})` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-400 font-medium">
            This note is private to your investor account. Founders and other investors cannot see this information.
          </p>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-purple-600" />
            </div>
          ) : (
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record your personal notes, diligence thoughts, valuation targets, or call summaries..."
              className="w-full h-44 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-600 outline-none resize-none transition-all"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} /> Saved privately
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-200/60 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-6 py-2.5 bg-black text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-purple-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Private Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
