import { useEffect, useState } from "react";
import { Search, Trash2, ExternalLink, Activity, Building2, GitCommit, FileText, CheckCircle2, DollarSign, X, MessageSquare } from "lucide-react";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Deal Tracer Modal State
  const [tracingCompany, setTracingCompany] = useState<any | null>(null);
  const [traceData, setTraceData] = useState<{
    intros: any[];
    outcomes: any[];
    invoices: any[];
  }>({ intros: [], outcomes: [], invoices: [] });
  const [loadingTrace, setLoadingTrace] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const snap = await getDocs(collection(db, "companies"));
        let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (data.length === 0) {
          // Fallback check founder_profiles
          const fSnap = await getDocs(collection(db, "founder_profiles"));
          data = fSnap.docs.map(d => ({ id: d.id, name: d.data().company_name || 'Founder Startup', ...d.data() }));
        }
        setCompanies(data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleOpenTracer = async (company: any) => {
    setTracingCompany(company);
    setLoadingTrace(true);
    try {
      // 1. Fetch Intro Requests
      const introsSnap = await getDocs(query(collection(db, "intro_requests"), where("founder_id", "==", company.id)));
      const intros = introsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 2. Fetch Deal Outcomes
      const outcomesSnap = await getDocs(query(collection(db, "deal_outcomes"), where("founder_id", "==", company.id)));
      const outcomes = outcomesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 3. Fetch Success Fee Invoices
      const invoicesSnap = await getDocs(query(collection(db, "success_fee_invoices"), where("founder_id", "==", company.id)));
      const invoices = invoicesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setTraceData({ intros, outcomes, invoices });
    } catch (err) {
      console.error("Error loading deal trace:", err);
    } finally {
      setLoadingTrace(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this company record?")) return;
    try {
      await deleteDoc(doc(db, "companies", id));
      setCompanies(companies.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting company:", err);
    }
  };

  const filtered = companies.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 font-sans">
        <div>
          <h1 className="text-[32px] font-black text-black tracking-tight font-heading">Registered Companies & Deal Tracer</h1>
          <p className="text-gray-500 font-medium mt-1">Trace end-to-end deal lifecycles from intro request to success fee invoice</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by company name or sector..." 
            className="w-full bg-white border border-[var(--color-clay-border,#e5e2dc)] rounded-2xl pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-400 focus:ring-2 focus:ring-black outline-none shadow-xs" 
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Activity size={32} className="animate-spin text-black" />
            <p className="text-xs font-mono font-bold text-gray-400">Loading startup roster...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--color-clay-border,#e5e2dc)] bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Company</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Stage</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Sector</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Target Raise</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#e8d5f5] text-black border border-black/10 flex items-center justify-center font-black">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-extrabold text-black">{c.name || c.company_name || "Unnamed Company"}</div>
                            <div className="text-[11px] text-gray-500">{c.tagline || c.one_liner || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 uppercase">
                          {c.stage || "Pre-Seed"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black font-mono bg-[#d5f5f5] text-black px-2.5 py-1 rounded-full border border-black/10">
                          {c.industry?.[0] || c.sector || "Web3"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-extrabold text-black">
                        {c.funding_goal ? (typeof c.funding_goal === 'number' ? `$${(c.funding_goal / 1000).toFixed(0)}k` : c.funding_goal) : "—"}
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <button
                          onClick={() => handleOpenTracer(c)}
                          className="px-3 py-1.5 bg-black text-white rounded-xl text-xs font-black flex items-center gap-1 hover:bg-emerald-600 transition-all cursor-pointer"
                        >
                          <GitCommit size={14} /> Trace Deal
                        </button>
                        {c.website && (
                          <a href={c.website} target="_blank" rel="noreferrer" className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100">
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button onClick={() => handleDelete(c.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm font-medium">No registered companies found</div>
            )}
          </div>
        )}

        {/* DEAL TRACER MODAL */}
        {tracingCompany && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 border border-gray-100 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Deal Lifecycle Tracer
                  </span>
                  <h3 className="font-black text-xl text-black mt-1">
                    {tracingCompany.name || tracingCompany.company_name}
                  </h3>
                </div>
                <button onClick={() => setTracingCompany(null)} className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              {loadingTrace ? (
                <div className="py-12 text-center text-xs font-bold text-gray-400 flex items-center justify-center gap-2">
                  <Activity size={16} className="animate-spin text-black" /> Tracing lifecycle records...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Step 1: Intro Request */}
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-black">
                      <span className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-purple-600" /> Step 1: Warm Intro Request
                      </span>
                      <span className="text-gray-400 font-mono">{traceData.intros.length} Recorded</span>
                    </div>
                    {traceData.intros.length > 0 ? (
                      traceData.intros.map((intro) => (
                        <div key={intro.id} className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-100">
                          <div>Status: <span className="font-bold uppercase text-purple-700">{intro.status || 'pending'}</span></div>
                          <p className="text-[11px] text-gray-500 mt-1">"{intro.note || intro.message || 'No custom note attached'}"</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No intro request recorded yet.</p>
                    )}
                  </div>

                  {/* Step 2: Deal Outcomes */}
                  <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600" /> Step 2: Declared Deal Outcome
                      </span>
                      <span className="text-emerald-700 font-mono">{traceData.outcomes.length} Closed</span>
                    </div>
                    {traceData.outcomes.length > 0 ? (
                      traceData.outcomes.map((out) => (
                        <div key={out.id} className="text-xs text-gray-800 bg-white p-3 rounded-xl border border-emerald-100 space-y-1">
                          <div className="font-bold">Check Size: ${(out.investment_amount_usd || 100000).toLocaleString()}</div>
                          <div>Round Stage: {out.round_stage || 'Pre-Seed'}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No closed deal outcome declared yet.</p>
                    )}
                  </div>

                  {/* Step 3: Success Fee Invoice */}
                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-amber-950">
                      <span className="flex items-center gap-2">
                        <DollarSign size={16} className="text-amber-600" /> Step 3: Success Fee Invoice Status
                      </span>
                      <span className="text-amber-700 font-mono">{traceData.invoices.length} Invoices</span>
                    </div>
                    {traceData.invoices.length > 0 ? (
                      traceData.invoices.map((inv) => (
                        <div key={inv.id} className="text-xs text-gray-800 bg-white p-3 rounded-xl border border-amber-100 flex items-center justify-between">
                          <span>Amount: ${(inv.fee_amount_usd || 2000).toLocaleString()}</span>
                          <span className="font-black uppercase text-amber-700 px-2 py-0.5 bg-amber-50 rounded-md">
                            {inv.status || 'pending'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No success fee invoice generated yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
