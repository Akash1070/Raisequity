import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { safeStorage } from '../../lib/storage';
import { Rocket, ShieldCheck, Briefcase, Loader2, Sparkles } from 'lucide-react';

interface OnboardingRoleSwitcherProps {
  currentRole: 'founder' | 'investor' | 'service_provider';
}

export default function OnboardingRoleSwitcher({ currentRole }: OnboardingRoleSwitcherProps) {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const roles = [
    {
      id: 'founder' as const,
      label: 'Founder',
      tagline: 'Raising Capital',
      icon: Rocket,
      path: '/onboarding',
      activeBg: 'bg-black text-white shadow-[-3px_3px_0_rgba(0,0,0,1)]',
    },
    {
      id: 'investor' as const,
      label: 'Investor',
      tagline: 'Venture & Angels',
      icon: ShieldCheck,
      path: '/investor-onboarding',
      activeBg: 'bg-[var(--color-clay-matcha-dark,#15803d)] text-white shadow-[-3px_3px_0_rgba(0,0,0,1)]',
    },
    {
      id: 'service_provider' as const,
      label: 'Agency / Partner',
      tagline: 'Services & Audits',
      icon: Briefcase,
      path: '/agency-onboarding',
      activeBg: 'bg-[#0070F3] text-white shadow-[-3px_3px_0_rgba(0,0,0,1)]',
    },
  ];

  const handleSwitch = async (targetRole: 'founder' | 'investor' | 'service_provider', targetPath: string) => {
    if (targetRole === currentRole || switchingTo) return;
    const uid = user?.uid || (user as any)?.id;
    setSwitchingTo(targetRole);

    try {
      if (uid) {
        await setDoc(
          doc(db, 'users', uid),
          { role: targetRole, updated_at: new Date().toISOString() },
          { merge: true }
        );
        safeStorage.setItem('rq_role', targetRole);
        try {
          await refreshProfile();
        } catch (_) {}
      }
      navigate(targetPath, { replace: true });
    } catch (err) {
      console.error('Failed to switch onboarding role:', err);
      navigate(targetPath, { replace: true });
    } finally {
      setSwitchingTo(null);
    }
  };

  return (
    <div className="w-full mb-6">
      <div className="bg-white/80 dark:bg-[#141414]/90 backdrop-blur-md border border-slate-200/80 dark:border-[#262626] rounded-[24px] p-2 sm:p-2.5 shadow-sm">
        <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-500" /> Onboarding Track
          </span>
          <span className="text-[10px] text-slate-400 font-sans normal-case">
            Wrong track? Select your role to switch
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            const isPending = switchingTo === r.id;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSwitch(r.id, r.path)}
                disabled={Boolean(switchingTo)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:px-3 rounded-[16px] text-xs font-bold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? `${r.activeBg} border-black dark:border-white/20`
                    : 'bg-slate-50/70 dark:bg-[#1a1a1a] border-slate-200/70 dark:border-[#2e2e2e] text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#222222] hover:text-black dark:hover:text-white hover:border-slate-300'
                } ${isPending ? 'opacity-70' : ''}`}
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                )}
                <div className="text-center sm:text-left leading-tight">
                  <div className="font-extrabold text-[12px] tracking-tight">{r.label}</div>
                  <div className={`hidden sm:block text-[9px] font-mono tracking-tight ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                    {r.tagline}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

