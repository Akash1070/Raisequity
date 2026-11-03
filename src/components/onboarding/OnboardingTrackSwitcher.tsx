import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ShieldCheck, Briefcase, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { safeStorage } from '../../lib/storage';
import { UserRole } from '../../types';

interface TrackSwitcherProps {
  currentTrack: 'founder' | 'investor' | 'service_provider';
}

export default function OnboardingTrackSwitcher({ currentTrack }: TrackSwitcherProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [switching, setSwitching] = useState<string | null>(null);

  const handleSwitchTrack = async (targetRole: 'founder' | 'investor' | 'service_provider') => {
    if (targetRole === currentTrack || switching) return;
    setSwitching(targetRole);

    const uid = user?.uid || (user as any)?.id;
    if (uid) {
      try {
        await updateDoc(doc(db, 'users', uid), {
          role: targetRole,
          updated_at: new Date().toISOString()
        });
        safeStorage.setItem(`rq_user_role_${uid}`, targetRole);
      } catch (err) {
        console.warn('[OnboardingTrackSwitcher] Firestore role update fallback:', err);
      }
    }

    if (targetRole === 'founder') {
      navigate('/onboarding', { replace: true });
    } else if (targetRole === 'investor') {
      navigate('/investor-onboarding', { replace: true });
    } else if (targetRole === 'service_provider') {
      navigate('/agency-onboarding', { replace: true });
    }
    setSwitching(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 bg-white dark:bg-[#121316] rounded-2xl border border-slate-200 dark:border-white/10 p-3 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3 px-1 text-xs font-mono">
        <span className="flex items-center gap-1.5 text-amber-500 font-bold uppercase tracking-wider text-[11px]">
          <Sparkles size={13} /> Onboarding Track
        </span>
        <span className="text-slate-400 dark:text-neutral-500 text-[11px]">
          Wrong track? Select your role to switch
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Founder Track */}
        <button
          type="button"
          onClick={() => handleSwitchTrack('founder')}
          disabled={Boolean(switching)}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer border ${
            currentTrack === 'founder'
              ? 'bg-[#0070F3] text-white border-[#0070F3] shadow-md shadow-blue-500/20'
              : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            currentTrack === 'founder' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
          }`}>
            {switching === 'founder' ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-extrabold leading-tight ${currentTrack === 'founder' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              Founder
            </div>
            <div className={`text-[10px] font-mono leading-tight mt-0.5 truncate ${currentTrack === 'founder' ? 'text-blue-100' : 'text-slate-400 dark:text-neutral-500'}`}>
              Raising Capital
            </div>
          </div>
        </button>

        {/* Investor Track */}
        <button
          type="button"
          onClick={() => handleSwitchTrack('investor')}
          disabled={Boolean(switching)}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer border ${
            currentTrack === 'investor'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
              : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            currentTrack === 'investor' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
          }`}>
            {switching === 'investor' ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-extrabold leading-tight ${currentTrack === 'investor' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              Investor
            </div>
            <div className={`text-[10px] font-mono leading-tight mt-0.5 truncate ${currentTrack === 'investor' ? 'text-emerald-100' : 'text-slate-400 dark:text-neutral-500'}`}>
              Venture &amp; Angels
            </div>
          </div>
        </button>

        {/* Agency Track */}
        <button
          type="button"
          onClick={() => handleSwitchTrack('service_provider')}
          disabled={Boolean(switching)}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer border ${
            currentTrack === 'service_provider'
              ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-md shadow-purple-500/20'
              : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            currentTrack === 'service_provider' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
          }`}>
            {switching === 'service_provider' ? <Loader2 size={16} className="animate-spin" /> : <Briefcase size={16} />}
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-extrabold leading-tight ${currentTrack === 'service_provider' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              Agency / Partner
            </div>
            <div className={`text-[10px] font-mono leading-tight mt-0.5 truncate ${currentTrack === 'service_provider' ? 'text-purple-100' : 'text-slate-400 dark:text-neutral-500'}`}>
              Services &amp; Audits
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

