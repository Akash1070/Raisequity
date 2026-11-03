import React, { useEffect, useState } from "react";
import { Plus, Trash2, Activity, X, Save, Briefcase, Search, Sparkles, CheckCircle2, ShieldCheck, Tag, ExternalLink } from "lucide-react";
import { query, collection, getDocs, doc, setDoc, deleteDoc, writeBatch, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { SEEDED_AGENCIES } from "../../data/seededAgencies";

export default function AdminExperts() {
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", category: "", tags: "", bio: "", rate_per_hour: "", calendly_url: "" });

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(query(collection(db, "experts"), limit(200)));
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // If Firestore is empty or has fewer than seeded, auto-merge with seeded catalog
      if (data.length === 0) {
        data = SEEDED_AGENCIES;
      }
      setExperts(data);
    } catch (err) {
      console.error("Error fetching experts:", err);
      // Graceful fallback to verified catalogue
      setExperts(SEEDED_AGENCIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleSyncVettedAgencies = async () => {
    setSyncing(true);
    setSyncMessage("Syncing 109 verified Web3 agencies to Firestore...");
    try {
      const batch = writeBatch(db);
      for (const agency of SEEDED_AGENCIES) {
        const docRef = doc(db, "experts", agency.id);
        batch.set(docRef, {
          ...agency,
          updated_at: new Date().toISOString()
        }, { merge: true });
      }
      await batch.commit();
      setSyncMessage("Successfully synced all 109 agencies to Firestore!");
      await fetchExperts();
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (err: any) {
      console.error("Sync error:", err);
      setSyncMessage("Sync error: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expertId = `expert_${Date.now()}`;
      const payload = {
        id: expertId,
        title: form.title, 
        company: form.company, 
        category: form.category || "Growth & Marketing Advisory",
        tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
        portfolio: [],
        bio: form.bio, 
        rate_per_hour: form.rate_per_hour ? parseFloat(form.rate_per_hour) : null,
        calendly_url: form.calendly_url, 
        is_active: true,
        verified: true,
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, "experts", expertId), payload);
      setExperts([payload, ...experts]); 
      setShowForm(false); 
      setForm({ title: "", company: "", category: "", tags: "", bio: "", rate_per_hour: "", calendly_url: "" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service provider expert?")) return;
    try {
      await deleteDoc(doc(db, "experts", id));
      setExperts(experts.filter(e => e.id !== id));
    } catch (err) {
      console.error("Error deleting expert:", err);
    }
  };

  const categories = ["All", ...Array.from(new Set(experts.map(e => e.category).filter(Boolean)))];

  const filteredExperts = experts.filter(e => {
    const matchesSearch = !search || 
      e.title?.toLowerCase().includes(search.toLowerCase()) || 
      e.company?.toLowerCase().includes(search.toLowerCase()) ||
      e.bio?.toLowerCase().includes(search.toLowerCase()) ||
      e.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase())) ||
      e.portfolio?.some((p: string) => p.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Activity size={32} className="animate-spin text-black" />
        <p className="text-xs font-mono font-bold text-gray-400">Loading service providers & experts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold">ECOSYSTEM DIRECTORY • VERIFIED SERVICE EXPERTS</span>
          </div>
          <h1 className="text-[32px] font-black text-black tracking-tight font-heading">Service Providers &amp; Experts</h1>
          <p className="text-gray-500 font-medium text-xs sm:text-sm mt-0.5">
            {experts.length} verified ecosystem agencies, KOL networks, PR firms, and tokenomics modelers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncVettedAgencies}
            disabled={syncing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all cursor-pointer"
          >
            {syncing ? <Activity size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Sync 109 Verified Web3 Agencies
          </button>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 shadow-xs transition-all cursor-pointer"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Add Expert"}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-mono font-bold flex items-center justify-between">
          <span>{syncMessage}</span>
          <button onClick={() => setSyncMessage(null)}><X size={14} /></button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] p-8 space-y-4 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Expert Title / Agency Name *" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Company / Agency" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Category (e.g. KOL Marketing & PR, Tokenomics)" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Tags & Protocols (comma separated)" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            <input value={form.rate_per_hour} onChange={e => setForm({...form, rate_per_hour: e.target.value})} placeholder="Rate/hr (USD)" type="number" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            <input value={form.calendly_url} onChange={e => setForm({...form, calendly_url: e.target.value})} placeholder="Booking / Request URL" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
          </div>
          <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Expert biography, track record, and verified clients..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
          <button type="submit" className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-gray-800 shadow-md transition-all cursor-pointer">
            <Save size={16} /> Save Expert Profile
          </button>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by agency name, service offering, or client protocol (e.g. Mantle, Solana, Sui, Arbitrum)..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 outline-none shadow-xs"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer shadow-xs"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="text-xs font-mono text-slate-500 px-1">
        Showing <strong>{filteredExperts.length}</strong> of <strong>{experts.length}</strong> verified Web3 service providers &amp; agencies
      </div>

      {/* Experts Table */}
      <div className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-clay-border,#e5e2dc)] bg-gray-50/50 font-mono text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Agency / Expert</th>
                <th className="px-6 py-4">Category &amp; Status</th>
                <th className="px-6 py-4">Client Portfolio / Tags</th>
                <th className="px-6 py-4">Perks / Rate</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExperts.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 max-w-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center justify-center font-black shrink-0 font-heading">
                        {e.title?.charAt(0) || "A"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-black flex items-center gap-1.5">
                          <span>{e.title}</span>
                          {e.verified && (
                            <ShieldCheck size={14} className="text-emerald-500 inline shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">{e.company || "Web3 Agency"}</div>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">{e.bio}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black font-mono bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full border border-gray-200 uppercase inline-block">
                        {e.category || "General Advisory"}
                      </span>
                      {e.vetting_status && (
                        <div>
                          <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            e.vetting_status === "Vetted" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {e.vetting_status}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {e.portfolio?.slice(0, 4).map((p: string) => (
                        <span key={p} className="text-[9px] font-mono font-bold bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200">
                          {p}
                        </span>
                      ))}
                      {e.tags?.slice(0, 3).map((t: string) => (
                        <span key={t} className="text-[9px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {e.discount_code ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg block max-w-xs">
                        {e.discount_code}
                      </span>
                    ) : e.rate_per_hour ? (
                      <span className="font-bold text-black">${e.rate_per_hour}/hr</span>
                    ) : (
                      <span className="text-gray-400 font-bold">RFP / Custom Escrow</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Delete Expert"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
