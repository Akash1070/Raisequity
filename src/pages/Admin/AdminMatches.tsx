import { useEffect, useState } from "react";
import { 
  Activity, 
  Award, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageSquare, 
  Building2, 
  DollarSign, 
  User,
  Send,
  Sparkles
} from "lucide-react";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminMatches() {
  const [activeTab, setActiveTab] = useState<"intros" | "algo">("intros");
  const [adminIntros, setAdminIntros] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // 1. Fetch manual outreach requests
      const introsSnap = await getDocs(query(collection(db, "admin_intros"), orderBy("created_at", "desc")));
      const introsData = introsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAdminIntros(introsData);

      // 2. Fetch algorithm matches
      const matchesSnap = await getDocs(collection(db, "matches"));
      const matchesData = matchesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMatches(matchesData);
    } catch (err) {
      console.error("Error fetching match/intro records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleMarkConnected = async (id: string) => {
    try {
      await updateDoc(doc(db, "admin_intros", id), {
        status: "connected",
        connected_at: new Date().toISOString()
      });
      setAdminIntros(prev => prev.map(item => item.id === id ? { ...item, status: "connected" } : item));
    } catch (e) {
      console.error("Error marking intro connected:", e);
    }
  };

  const handleCopyInviteLink = (item: any) => {
    const link = `https://raisequity.com/login?role=founder&deal=${encodeURIComponent(item.deal_id || item.deal_name)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 font-mono">
        <Activity size={32} className="animate-spin text-[#0070F3]" />
        <p className="text-xs font-bold text-gray-400">Loading intro pipeline &amp; matches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight font-heading">
            Match Pipeline &amp; Founder Intros
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-mono mt-1">
            Manually connect investors with un-onboarded founders, facilitate email intros, and onboard dealflow.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-[#18191e] font-mono text-xs font-bold">
          <button
            onClick={() => setActiveTab("intros")}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "intros"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <Mail size={14} />
            <span>Investor Outreaches ({adminIntros.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("algo")}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "algo"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <Award size={14} />
            <span>Algorithm Matches ({matches.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Investor Manual Outreaches */}
      {activeTab === "intros" && (
        <div className="bg-white dark:bg-[#141518] rounded-3xl border border-neutral-200 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-neutral-200 dark:border-white/10 bg-slate-50 dark:bg-[#18191e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                Action Required by Admin
              </span>
              <h3 className="font-heading font-black text-base text-black dark:text-white">
                Pending Manual Introductions &amp; Outreach Requests
              </h3>
            </div>
            <span className="text-xs font-mono text-gray-400">
              {adminIntros.filter(i => i.status !== "connected").length} Pending Actions
            </span>
          </div>

          {adminIntros.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-mono text-xs space-y-2">
              <Mail size={32} className="mx-auto text-gray-300" />
              <div className="font-bold text-gray-700 dark:text-gray-300">No investor outreach requests yet</div>
              <p>When investors request intros or message founders from the Deal Flow directory, requests will appear here for you to connect manually.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-white/5">
              {adminIntros.map((item) => {
                const isConnected = item.status === "connected";
                const founderEmail = item.founder_email || "founder@project.com";
                const investorEmail = item.investor_email || "investor@fund.com";
                const emailSubject = `Introduction: ${item.investor_name} <> ${item.founder_name} (${item.deal_name})`;
                const emailBody = `Hi ${item.founder_name},\n\nI would like to introduce you to ${item.investor_name} (${investorEmail}), an accredited investor on Raisequity who reviewed ${item.deal_name}'s round.\n\nThey requested to connect with you regarding your ${item.target_raise || 'current'} raise:\n\n"${item.message || 'We would love to discuss participating in your round.'}"\n\nYou can reply directly to this thread to schedule a call or coordinate diligence.\n\nBest regards,\nAkash Kumar Jha\nRaisequity Venture Desk`;

                const mailtoUrl = `mailto:${founderEmail}?cc=${investorEmail}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

                return (
                  <div key={item.id} className="p-6 space-y-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    {/* Top Row: Investor & Target Deal */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-black text-base text-black dark:text-white">
                            {item.investor_name}
                          </span>
                          <span className="text-xs font-mono text-gray-400">
                            ({item.investor_email})
                          </span>
                          <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">
                            Wants to Connect With →
                          </span>
                          <span className="font-heading font-black text-base text-emerald-600 dark:text-emerald-400">
                            {item.deal_name}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-gray-500 mt-1">
                          Founder: <strong className="text-gray-800 dark:text-gray-200">{item.founder_name}</strong> {item.founder_email && `(${item.founder_email})`} • Round: {item.target_raise || "Seed"} • {item.sector || "Web3"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-black uppercase ${
                          isConnected
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}>
                          {isConnected ? "Connected ✓" : "Pending Manual Intro"}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">
                          {item.created_at ? new Date(item.created_at).toLocaleString() : "Recent"}
                        </span>
                      </div>
                    </div>

                    {/* Investor's Note / Message */}
                    <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/70 dark:border-white/5 font-mono text-xs text-gray-700 dark:text-gray-300">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Outreach Note:</span>
                      "{item.message}"
                    </div>

                    {/* Action Buttons for Admin */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <a
                        href={mailtoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black rounded-xl font-bold font-mono text-xs text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Mail size={13} />
                        <span>Send Warm Intro Email (Pre-Drafted)</span>
                        <ExternalLink size={11} />
                      </a>

                      <button
                        onClick={() => handleCopyInviteLink(item)}
                        className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-black dark:hover:border-white font-mono text-xs text-gray-700 dark:text-gray-300 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedId === item.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        <span>{copiedId === item.id ? "Invite Link Copied!" : "Copy Founder Onboarding Link"}</span>
                      </button>

                      {!isConnected && (
                        <button
                          onClick={() => handleMarkConnected(item.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 font-mono font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 size={13} />
                          <span>Mark Connected in CRM</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Algorithm Matches */}
      {activeTab === "algo" && (
        <div className="bg-white dark:bg-[#141518] rounded-3xl border border-neutral-200 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-white/10 bg-slate-50 dark:bg-[#18191e]">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Match Hash</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Match Score</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Match Criteria</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                {matches.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-black dark:text-white" />
                        {m.id.slice(0, 14)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 text-lg font-black text-black dark:text-white font-heading">{m.score || 95}%</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                        {m.status || "CONNECTED"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(m.match_reasons || ["Thesis Alignment", "Check Size Match"]).map((r: string, i: number) => (
                          <span key={i} className="text-[9px] font-bold bg-neutral-100 dark:bg-white/10 text-black dark:text-white px-2 py-0.5 rounded-full border border-black/10">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {matches.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm font-medium">No matches generated yet</div>
          )}
        </div>
      )}
    </div>
  );
}