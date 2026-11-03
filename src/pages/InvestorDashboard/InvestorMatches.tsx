import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageCircle, MoreVertical, CheckCircle2, Share2, Loader2, RefreshCw, Users } from "lucide-react";
import { useMatches } from "../../hooks/useMatches";
import { useMutateMatch } from "../../hooks/useMutateMatch";

export default function InvestorMatches() {
  const { matches, loading, error, refetch } = useMatches();
  const { updateStatus, isUpdating } = useMutateMatch();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected: any = matches.find((m: any) => m.id === selectedId) || matches[0] || null;

  const handleStatusUpdate = async (status: any) => {
    if (!selected) return;
    await updateStatus.mutateAsync({ matchId: selected.id, status });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500 font-bold">Failed to load matches</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-xl font-bold text-sm">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-black">Matches</h1>
          <p className="text-gray-500 font-medium">Meet and collaborate with matched founders</p>
        </div>
        <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 p-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center">
            <Users size={32} className="text-gray-300" />
          </div>
          <h3 className="font-black text-[18px] text-black">No matches yet</h3>
          <p className="text-gray-500 font-medium text-sm max-w-xs">
            Your founder matches will appear here once the matching engine runs. Browse the deal feed to discover companies.
          </p>
        </div>
      </div>
    );
  }

  const company = selected?.companies;
  const founder = company?.users;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-black">Matches</h1>
          <p className="text-gray-500 font-medium">{matches.length} founder match{matches.length !== 1 ? "es" : ""}</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="w-[350px] flex flex-col bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search founders..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-clay-matcha)] transition-all" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {matches.map((match: any) => {
              const co = match.companies;
              const fn = co?.users;
              const activeId = selectedId || matches[0]?.id;
              return (
                <button
                  key={match.id}
                  onClick={() => setSelectedId(match.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeId === match.id ? "bg-[var(--color-clay-matcha-light)]/20 shadow-sm" : "hover:bg-gray-50"}`}
                >
                  <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 ${activeId === match.id ? "border-[var(--color-clay-matcha)]" : "border-white"}`}>
                    <img src={fn?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.id}`} alt={co?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-bold text-sm text-black truncate">{fn?.full_name || "Founder"}</div>
                    <div className="text-[11px] text-gray-400 font-bold uppercase">{co?.name || "—"}</div>
                  </div>
                  <div className="text-[10px] text-green-500 font-black bg-green-50 px-2 py-0.5 rounded-full">
                    {match.score ? `${Math.round(match.score)}%` : "—"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="flex-1 flex flex-col bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-4 border-gray-50">
                  <img src={founder?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selected.id}`} alt={founder?.full_name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-black">{founder?.full_name || "Founder"}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-400 font-bold uppercase">{company?.name}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{selected.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {company?.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-[11px] font-black text-[var(--color-clay-matcha)] hover:underline">
                    Visit Website ↗
                  </a>
                )}
                <button className="p-2 text-gray-400 hover:text-black"><MoreVertical size={20} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-2xl mx-auto space-y-8">
                <section>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Company blurb</h3>
                  <p className="text-[14px] text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100 italic">
                    "{company?.tagline || company?.description || "No description added yet."}"
                  </p>
                </section>
                {selected.match_reasons?.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Why you matched</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.match_reasons.map((r: string) => (
                        <span key={r} className="px-3 py-1.5 bg-[var(--color-clay-matcha)]/10 text-[var(--color-clay-matcha-dark)] rounded-full text-[11px] font-bold">{r}</span>
                      ))}
                    </div>
                  </section>
                )}
                <section>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Messages & Activity</h3>
                  <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <MessageCircle className="text-gray-300 mb-3" size={32} />
                    <p className="text-[14px] text-gray-400 font-medium italic">No messages yet. Start the conversation!</p>
                  </div>
                </section>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="max-w-3xl mx-auto relative">
                <input type="text" placeholder="Type a message..." className="w-full pl-6 pr-24 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[var(--color-clay-matcha)] focus:border-transparent transition-all" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all"><Share2 size={18} /></button>
                  <button className="bg-[var(--color-clay-matcha)] text-white p-2.5 rounded-xl hover:shadow-lg transition-all"><CheckCircle2 size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-[300px] flex flex-col gap-6">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
            <h3 className="text-[14px] font-bold text-black flex items-center gap-2 mb-6">
              <CheckCircle2 size={18} className="text-[var(--color-clay-matcha)]" /> Engagement Status
            </h3>
            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {[
                { label: "Match", sub: "Company matched to your thesis", done: true, icon: "1" },
                { label: "Interested", sub: "Mark company as interested", done: ["interested", "intro_requested", "connected"].includes(selected?.status), icon: "2" },
                { label: "Intro", sub: "Request introduction via Raisequity", done: ["intro_requested", "connected"].includes(selected?.status), icon: "3" },
                { label: "Connect", sub: "Live introduction made", done: selected?.status === "connected", icon: "4" },
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[22px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${step.done ? "bg-[var(--color-clay-matcha)] border-[var(--color-clay-matcha)] text-white" : "bg-white border-gray-200 text-gray-300"}`}>
                    {step.icon}
                  </div>
                  <div>
                    <div className={`text-[12px] font-bold ${step.done ? "text-black" : "text-gray-300"}`}>{step.label}</div>
                    <div className="text-[11px] text-gray-400 leading-tight mt-0.5">{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 space-y-2">
              <button
                onClick={() => handleStatusUpdate("interested")}
                disabled={isUpdating || selected?.status !== "pending"}
                className="w-full py-3 bg-[var(--color-clay-matcha)] text-white rounded-xl text-[14px] font-bold hover:shadow-lg transition-all disabled:opacity-40"
              >
                {isUpdating ? "Updating..." : "Mark Interested"}
              </button>
              <button
                onClick={() => handleStatusUpdate("passed")}
                disabled={isUpdating || ["passed", "connected"].includes(selected?.status)}
                className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl text-[14px] font-bold hover:bg-gray-200 transition-all disabled:opacity-40"
              >
                Pass
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
