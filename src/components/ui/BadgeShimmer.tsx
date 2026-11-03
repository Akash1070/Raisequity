import React from 'react';

interface BadgeShimmerProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
  variant?: 'emerald' | 'amber' | 'purple' | 'slate' | 'indigo';
}

export function BadgeShimmer({
  children,
  text,
  className = '',
  variant = 'emerald',
}: BadgeShimmerProps) {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-[#00F5A0] border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
    indigo: 'bg-[#0070F3]/10 text-[#0070F3] dark:text-[#3291FF] border-[#0070F3]/30',
    slate: 'bg-slate-100 dark:bg-[#171717] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#262626]',
  };

  const content = children || text;

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${variantStyles[variant]} ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <span className="relative z-10 flex items-center gap-1.5">{content}</span>
    </div>
  );
}

