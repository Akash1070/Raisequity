import { useEffect, useState } from "react";
import { Activity, Award } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const snap = await getDocs(collection(db, "matches"));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMatches(data);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Activity size={32} className="animate-spin text-black" />
        <p className="text-xs font-mono font-bold text-gray-400">Loading match engine logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] font-black text-black tracking-tight font-heading">Ecosystem Matches</h1>
        <p className="text-gray-500 font-medium mt-1">{matches.length} founder-investor algorithm matches</p>
      </div>

      <div className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-clay-border,#e5e2dc)] bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Match Hash</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Match Score</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Match Criteria</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {matches.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-black" />
                      {m.id.slice(0, 14)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 text-lg font-black text-black font-heading">{m.score || 95}%</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      {m.status || "CONNECTED"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(m.match_reasons || ["Thesis Alignment", "Check Size Match"]).map((r: string, i: number) => (
                        <span key={i} className="text-[9px] font-bold bg-[#d5f5f5] text-black px-2 py-0.5 rounded-full border border-black/10">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">
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
    </div>
  );
}
