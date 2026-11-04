import React from 'react';
import { useLandingData } from '../../hooks/useLandingData';

export function LiveActivityMarquee() {
  const { fomoActivities } = useLandingData();
  const duplicatedActivities = [...fomoActivities, ...fomoActivities];

  return (
    <div className="w-full overflow-hidden bg-[#FAFAFA] dark:bg-[#0A0A0A] border-y border-slate-200 dark:border-[#262626] py-3 relative group transition-colors duration-150">
      {/* Left/Right Fade Gradients */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAFAFA] dark:from-[#0A0A0A] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAFAFA] dark:from-[#0A0A0A] to-transparent z-10" />

      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6">
        {duplicatedActivities.map((act, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-[#171717] border border-slate-200 dark:border-[#333333] hover:border-[#0070F3] text-xs transition-colors shrink-0 shadow-xs"
          >
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono border ${act.badgeColor}`}>
              {act.tag}
            </span>
            <span className="text-[#171717] dark:text-white font-bold tracking-tight">{act.title}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-[#0070F3] dark:text-[#00F5A0] font-mono font-bold">{act.metric}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{act.timeAgo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiveActivityMarquee;
