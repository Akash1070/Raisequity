import React from 'react';
import { motion } from 'framer-motion';

interface ActivityItem {
  tag: string;
  badgeColor: string;
  title: string;
  metric: string;
  timeAgo: string;
}

const ACTIVITIES: ActivityItem[] = [
  { tag: 'SAFE Executed', badgeColor: 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3]/25', title: 'CogniMesh AI ($1.5M Round)', metric: '$100k Check Issued (OpenSign)', timeAgo: '4m ago' },
  { tag: 'Partner SLA', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-[#00F5A0] border-emerald-500/25', title: 'Decentralized Identity Protocol', metric: '3/3 Partner Calls Completed', timeAgo: '12m ago' },
  { tag: 'Syndicate Anchor', badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25', title: 'NeuroChain Robotics', metric: '$50k Angel Anchor Reserved', timeAgo: '28m ago' },
  { tag: 'Fast-Pass Memo', badgeColor: 'bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3]/25', title: 'HyperScale DB (Seed)', metric: 'Delaware C-Corp & GitHub Verified', timeAgo: '41m ago' },
  { tag: 'Escrow Milestone', badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/25', title: 'Smart Contract Audit Handoff', metric: '$15,000 Milestone Funded', timeAgo: '1h ago' },
  { tag: 'Grant Claimed', badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-[#00F5A0] border-emerald-500/25', title: 'Google Cloud Web3 Program', metric: '$200,000 Infra Credits Unlocked', timeAgo: '1h ago' },
  { tag: 'Telegram Alert', badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/25', title: 'Apex Ventures Partner Feed', metric: '96% Fit Deal Pushed', timeAgo: '2h ago' },
];

export function LiveActivityMarquee() {
  const duplicatedActivities = [...ACTIVITIES, ...ACTIVITIES];

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
