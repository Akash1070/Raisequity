import React from "react";
import { Share2, Sparkles, MessageSquare, Plus, Coins, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import CommunityBroadcastFeed from "../components/dashboard/CommunityBroadcastFeed";

export default function CommunityFeedPage() {
  const { profile } = useAuth();
  const userRole = (profile?.role || "founder") as "founder" | "investor" | "service_provider" | "admin";
  const credits = profile?.credit_balance ?? profile?.credits ?? 50;

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-slate-900 dark:text-white">
              Community Broadcasts &amp; Socials
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
              Live Network
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Ecosystem deal announcements, syndicate updates, hiring, and agency case studies (1 Credit / Post).
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 font-mono text-xs">
          <Coins size={14} className="text-amber-500" />
          <span className="text-slate-500 dark:text-slate-400">Balance:</span>
          <strong className="text-slate-900 dark:text-white">{credits} Credits</strong>
        </div>
      </div>

      {/* Embedded Broadcast Feed Component */}
      <CommunityBroadcastFeed
        userRole={userRole}
        userCredits={credits}
      />
    </div>
  );
}