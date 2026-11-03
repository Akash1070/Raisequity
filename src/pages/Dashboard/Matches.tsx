import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Building2, Loader2, RefreshCw, Check, X, Terminal } from "lucide-react";
import { useFounderMatches } from "../../hooks/useFounderMatches";
import FounderChatPanel from "../../components/dashboard/FounderChatPanel";
import DealActionsPanel from "../../components/dashboard/DealActionsPanel";

export default function Matches() {
  const { matches, loading, error, respondToMatch, refetch } = useFounderMatches();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();

  const urlFounderId = searchParams.get("founderId");

  // Handle URL query parameters for auto-selecting match
  useEffect(() => {
    if (matches.length > 0) {
      if (urlFounderId) {
        const found = matches.find(
          m => m.otherFounder?.id === urlFounderId || m.otherFounder?.user_id === urlFounderId
        );
        if (found) {
          setSelectedId(found.id);
          return;
        }
      }
      // Default to first match if no active selection
      if (!selectedId) {
        setSelectedId(matches[0].id);
      }
    }
  }, [matches, urlFounderId, selectedId]);

  const selected = matches.find(m => m.id === selectedId) || matches[0] || null;

  const filteredMatches = matches.filter(m => {
    if (!searchTerm) return true;
    const name = m.otherFounder?.full_name?.toLowerCase() || "";
    const comp = m.otherFounder?.company_name?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || comp.includes(term);
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-[#262626] p-8 shadow-xs">
        <p className="text-red-500 dark:text-red-400 font-mono text-sm font-bold">Failed to load matches: {error}</p>
        <button 
          onClick={refetch} 
          className="flex items-center gap-2 bg-[#0070F3] hover:bg-[#0060DF] text-white px-5 py-2.5 rounded-xl font-mono text-xs font-bold cursor-pointer shadow-xs transition-all"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-[#262626] shadow-xs">
        <Loader2 size={32} className="animate-spin text-[#0070F3]" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">Peer Founder Matches</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">Collaborate with matched founders and share double-blind investor intros</p>
        </div>
        <div className="bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-[#262626] p-12 sm:p-16 flex flex-col items-center justify-center gap-4 text-center shadow-xs">
          <div className="w-16 h-16 bg-[#0070F3]/10 border border-[#0070F3]/30 rounded-2xl flex items-center justify-center text-[#0070F3] shadow-xs">
            <Building2 size={32} />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">No active matches found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm leading-relaxed font-normal">
            Your founder matches will appear here once the 6-factor deterministic algorithm pairs you with founders in adjacent sectors. Complete your raise profile to unlock high-intent double-blind intros.
          </p>
        </div>
      </div>
    );
  }

  const other = selected?.otherFounder || null;
  const isPending = selected?.status === "pending";

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6 text-slate-900 dark:text-slate-100 pb-6 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">Peer Founder Matches</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-1">{matches.length} active match{matches.length !== 1 ? "es" : ""}</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Sidebar List (Left 30%) */}
        <div className="w-[320px] flex flex-col bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-[#262626] shadow-xs overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-[#262626] bg-slate-50 dark:bg-[#141414]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-xl text-xs font-mono text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#0070F3] transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-white dark:bg-[#111111]">
            {filteredMatches.map((m) => {
              const f = m.otherFounder || {
                full_name: "Unknown Founder",
                company_name: "Stealth Startup",
                profile_photo_url: null
              };
              const isActive = selected?.id === m.id;
              const isMatchPending = m.status === "pending";
              const avatar = f.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.full_name?.split(" ")[0] || "Founder"}`;

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all border cursor-pointer ${
                    isActive
                      ? "bg-[#0070F3]/10 text-[#0070F3] border-[#0070F3]/30 shadow-xs font-bold"
                      : "bg-slate-50 dark:bg-[#141414] border-slate-200 dark:border-[#262626] hover:bg-slate-100 dark:hover:bg-[#1A1A1A] text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-900">
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className={`font-extrabold text-xs truncate ${isActive ? "text-[#0070F3]" : "text-slate-900 dark:text-white"}`}>
                      {f.full_name}
                    </div>
                    <div className="text-[10px] font-mono truncate text-slate-500 dark:text-slate-400">
                      {f.company_name || "Stealth Startup"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full border ${
                        isMatchPending
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          : m.status === "declined"
                          ? "bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30"
                          : isActive ? "bg-[#0070F3]/20 text-[#0070F3] border-[#0070F3]/30" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {m.status}
                    </span>
                    {m.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-[#0070F3] rounded-full text-[10px] font-black text-white flex items-center justify-center shadow-xs">
                        {m.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Chat & Actions Area (Right 70%) */}
        {selected && other && (
          <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
            {/* Chat Column (60% width) */}
            <div className="flex-1 flex flex-col h-full min-h-0 relative">
              {isPending && (
                <div className="absolute inset-0 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center animate-fade-in rounded-3xl border border-slate-200 dark:border-[#262626] shadow-2xl">
                  <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 mb-4 shadow-xs">
                    <Building2 size={32} />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">{selected?.isBlindIntro ? "Blind Intro Request" : "New Match Request"}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-[320px] mt-2 mb-6 leading-relaxed font-normal">
                    {other.full_name} is requesting a peer connection with you. Accept to start direct messaging {selected?.isBlindIntro && "and securely unlock double-blind contact details"}.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => respondToMatch(selected.id, "accepted", (selected as any).isBlindIntro)}
                      className="px-6 py-2.5 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-all flex items-center gap-2"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button
                      onClick={() => respondToMatch(selected.id, "declined", (selected as any).isBlindIntro)}
                      className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-2"
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex-1 min-h-0">
                <FounderChatPanel match={selected} />
              </div>
            </div>

            {/* Actions & Fit Details Column (40% width) */}
            <div className="w-full md:w-[300px] lg:w-[340px] shrink-0 overflow-y-auto custom-scrollbar">
              <DealActionsPanel match={selected} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
