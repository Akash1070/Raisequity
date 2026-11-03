import React, { useEffect, useState } from "react";
import { Plus, Trash2, Activity, X, Save, Briefcase } from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminExperts() {
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", category: "", tags: "", bio: "", rate_per_hour: "", calendly_url: "" });

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const snap = await getDocs(collection(db, "experts"));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setExperts(data);
      } catch (err) {
        console.error("Error fetching experts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expertId = `expert_${Date.now()}`;
      const payload = {
        id: expertId,
        title: form.title, 
        company: form.company, 
        category: form.category,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
        bio: form.bio, 
        rate_per_hour: form.rate_per_hour ? parseFloat(form.rate_per_hour) : null,
        calendly_url: form.calendly_url, 
        is_active: true,
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Activity size={32} className="animate-spin text-black" />
        <p className="text-xs font-mono font-bold text-gray-400">Loading service providers & experts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-black text-black tracking-tight font-heading">Service Providers & Experts</h1>
          <p className="text-gray-500 font-medium mt-1">{experts.length} verified ecosystem experts</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-gray-800 shadow-md transition-all"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Expert"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] p-8 space-y-4 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Expert Title / Name *" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Company / Agency" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="Category (e.g. Legal, OTC, Dev)" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Tags (comma separated)" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            <input value={form.rate_per_hour} onChange={e => setForm({...form, rate_per_hour: e.target.value})} placeholder="Rate/hr (USD)" type="number" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            <input value={form.calendly_url} onChange={e => setForm({...form, calendly_url: e.target.value})} placeholder="Booking / Calendly URL" className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
          </div>
          <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Expert biography & track record..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
          <button type="submit" className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-gray-800 shadow-md transition-all">
            <Save size={16} /> Save Expert Profile
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-clay-border,#e5e2dc)] bg-gray-50/50 font-mono text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Expert</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4">Rate</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {experts.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#d5f5f5] border border-black/10 flex items-center justify-center text-black font-black">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-black">{e.title}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{e.company || "Independent"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-black font-mono bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 uppercase">
                      {e.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {e.tags?.map((t: string) => (
                        <span key={t} className="text-[9px] font-bold bg-[#e8d5f5] text-black px-2 py-0.5 rounded-full border border-black/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-600 font-mono">
                    {e.rate_per_hour ? `$${e.rate_per_hour}/hr` : "Custom"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(e.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {experts.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">No service provider profiles registered</div>
        )}
      </div>
    </div>
  );
}
