import React, { useEffect, useState } from "react";
import { Plus, Trash2, Activity, X, Save, ExternalLink, Star, Gift, Edit, Search, Sparkles, Upload, Database, FileText } from "lucide-react";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { web3Grants } from "../../data/grants";

export default function AdminGrants() {
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Bulk Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importFormat, setImportFormat] = useState<"csv" | "json">("csv");
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [form, setForm] = useState({ 
    id: "", title: "", provider: "", amount_max: "", deadline: "", 
    description: "", eligibility: "", apply_url: "", category: "", 
    tips: "", stages: [] as string[], featured: false 
  });

  const availableStages = ['Idea / Pre-Seed', 'Seed / MVP', 'Growth / Scaling', 'Any'];
  const categories = ["All", "L2 & Infrastructure", "AI & Autonomous Agents", "DeFi", "Gaming & Metaverse", "Social & Identity", "Developer Tools"];

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "grants"));
      const dbData = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const grantMap = new Map<string, any>();
      web3Grants.forEach(g => grantMap.set(g.id, g));
      dbData.forEach(g => grantMap.set(g.id, { ...(grantMap.get(g.id) || {}), ...g }));

      setGrants(Array.from(grantMap.values()));
    } catch (err) {
      console.error("Error fetching grants:", err);
      setGrants(web3Grants);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("Import 20+ default Web3 grant opportunities into Firestore database?")) return;
    setSeeding(true);
    try {
      for (const g of web3Grants) {
        const payload = {
          id: g.id,
          title: g.name,
          provider: g.name.split(" ")[0] + " Foundation",
          amount_max: g.fundingValue,
          deadline: g.timeline,
          description: g.description,
          eligibility: g.eligibility,
          apply_url: g.applyUrl,
          category: g.type,
          tips: g.tips,
          stages: g.stage,
          featured: !!g.featured,
          is_active: true,
          created_at: new Date().toISOString()
        };
        await setDoc(doc(db, "grants", g.id), payload);
      }
      await fetchGrants();
    } catch (err: any) {
      alert("Seeding error: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const grantId = form.id || `grant_${Date.now()}`;
      const payload = {
        id: grantId,
        title: form.title, 
        provider: form.provider, 
        amount_max: form.amount_max ? parseFloat(form.amount_max) : null,
        deadline: form.deadline || null, 
        description: form.description, 
        eligibility: form.eligibility,
        apply_url: form.apply_url, 
        category: form.category, 
        tips: form.tips,
        stages: form.stages,
        featured: form.featured,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      await setDoc(doc(db, "grants", grantId), payload);
      setGrants([payload, ...grants.filter(g => g.id !== grantId)]); 
      setShowForm(false); 
      resetForm();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this grant record?")) return;
    try {
      await deleteDoc(doc(db, "grants", id));
      setGrants(grants.filter(g => g.id !== id));
    } catch (err) {
      console.error("Error deleting grant:", err);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "grants", id), { is_active: !current });
      setGrants(grants.map(g => g.id === id ? { ...g, is_active: !current } : g));
    } catch (err) {
      console.error("Error toggling active state:", err);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "grants", id), { featured: !current });
      setGrants(grants.map(g => g.id === id ? { ...g, featured: !current } : g));
    } catch (err) {
      console.error("Error toggling featured state:", err);
    }
  };

  const handleEdit = (grant: any) => {
    setForm({
      id: grant.id,
      title: grant.title || "",
      provider: grant.provider || "",
      amount_max: grant.amount_max ? String(grant.amount_max) : "",
      deadline: grant.deadline || "",
      description: grant.description || "",
      eligibility: grant.eligibility || "",
      apply_url: grant.apply_url || "",
      category: grant.category || "",
      tips: grant.tips || "",
      stages: grant.stages || [],
      featured: !!grant.featured
    });
    setShowForm(true);
  };

  const toggleStage = (stage: string) => {
    if (form.stages.includes(stage)) {
      setForm({ ...form, stages: form.stages.filter(s => s !== stage) });
    } else {
      setForm({ ...form, stages: [...form.stages, stage] });
    }
  };

  const resetForm = () => {
    setForm({ 
      id: "", title: "", provider: "", amount_max: "", deadline: "", 
      description: "", eligibility: "", apply_url: "", category: "",
      tips: "", stages: [], featured: false 
    });
  };

  const handleParseAndImport = async () => {
    if (!importText.trim()) {
      alert("Please paste CSV or JSON content first.");
      return;
    }

    setImporting(true);
    setImportStatus("Parsing grants data...");

    try {
      let parsedItems: any[] = [];

      if (importFormat === "json") {
        const raw = JSON.parse(importText);
        const arr = Array.isArray(raw) ? raw : [raw];
        parsedItems = arr.map((item: any, idx: number) => ({
          id: item.id || `grant_csv_${Date.now()}_${idx}`,
          title: item.title || item.name || item.grant_title || "Grant Opportunity",
          provider: item.provider || item.foundation || item.organization || "Web3 Foundation",
          amount_max: item.amount_max || item.amount || item.fundingValue || "$50,000",
          deadline: item.deadline || item.timeline || "Rolling",
          description: item.description || item.details || "",
          eligibility: item.eligibility || item.requirements || "Open to all Web3 startups",
          apply_url: item.apply_url || item.applyUrl || item.url || item.link || "#",
          category: item.category || item.type || "L2 & Infrastructure",
          tips: item.tips || item.notes || "",
          stages: Array.isArray(item.stages) ? item.stages : (item.stage ? [item.stage] : ["Seed / MVP"]),
          featured: Boolean(item.featured),
          is_active: true,
          created_at: new Date().toISOString()
        }));
      } else {
        const lines = importText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          alert("CSV/TSV must contain a header row and at least one data row.");
          setImporting(false);
          return;
        }

        const delimiter = lines[0].includes("\t") ? "\t" : ",";
        const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));

        for (let i = 1; i < lines.length; i++) {
          let values: string[] = [];
          if (delimiter === "\t") {
            values = lines[i].split("\t").map(v => v.trim().replace(/^["']|["']$/g, ""));
          } else {
            const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
            values = matches.map(v => v.replace(/^["']|["']$/g, "").trim());
          }

          const rowMap: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowMap[h] = values[idx] || "";
          });

          const getRowVal = (...keys: string[]) => {
            for (const k of keys) {
              const matchedKey = Object.keys(rowMap).find(rk => rk.toLowerCase() === k.toLowerCase());
              if (matchedKey && rowMap[matchedKey]) return rowMap[matchedKey];
            }
            return "";
          };

          parsedItems.push({
            id: `grant_csv_${Date.now()}_${i}`,
            title: getRowVal("title", "name", "grant title", "grant_name") || "Grant Opportunity",
            provider: getRowVal("provider", "foundation", "organization") || "Web3 Foundation",
            amount_max: getRowVal("amount_max", "amount", "funding", "fundingvalue") || "$50,000",
            deadline: getRowVal("deadline", "timeline", "due date") || "Rolling",
            description: getRowVal("description", "details", "overview") || "",
            eligibility: getRowVal("eligibility", "requirements") || "Open to all Web3 startups",
            apply_url: getRowVal("apply_url", "applyurl", "url", "link", "website") || "#",
            category: getRowVal("category", "type") || "L2 & Infrastructure",
            tips: getRowVal("tips", "notes") || "",
            stages: (getRowVal("stages", "stage") || "Seed / MVP").split(/[,;|]/).map(s => s.trim()),
            featured: getRowVal("featured").toLowerCase() === "true",
            is_active: true,
            created_at: new Date().toISOString()
          });
        }
      }

      setImportStatus(`Saving ${parsedItems.length} grants to Firestore...`);

      for (const item of parsedItems) {
        await setDoc(doc(db, "grants", item.id), item);
      }

      await fetchGrants();
      setImportStatus(`Success! Imported ${parsedItems.length} grant opportunities.`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportText("");
        setImportStatus(null);
        setImporting(false);
      }, 1200);
    } catch (err: any) {
      console.error("Grant Import Error:", err);
      alert("Failed to import grants: " + err.message);
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
        if (file.name.endsWith(".json")) {
          setImportFormat("json");
        } else {
          setImportFormat("csv");
        }
      }
    };
    reader.readAsText(file);
  };

  const filteredGrants = (grants.length > 0 ? grants : web3Grants.map(g => ({
    id: g.id,
    title: g.name,
    provider: g.name.split(" ")[0] + " Foundation",
    amount_max: g.fundingValue,
    deadline: g.timeline,
    description: g.description,
    eligibility: g.eligibility,
    apply_url: g.applyUrl,
    category: g.type,
    tips: g.tips,
    stages: g.stage,
    featured: !!g.featured,
    is_active: true
  }))).filter(g => {
    const matchesSearch = !search || g.title?.toLowerCase().includes(search.toLowerCase()) || g.provider?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || g.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Activity size={32} className="animate-spin text-black" />
        <p className="text-xs font-mono font-bold text-gray-400">Loading grants directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black text-black tracking-tight font-heading">Grants & Non-Dilutive Capital</h1>
          <p className="text-gray-500 font-medium mt-1">{filteredGrants.length} non-dilutive ecosystem opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-purple-100 shadow-xs transition-all cursor-pointer"
          >
            <Upload size={16} /> Bulk Upload CSV/JSON
          </button>
          {grants.length === 0 && (
            <button 
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles size={16} /> {seeding ? "Importing..." : "Seed Default Grants (20+)"}
            </button>
          )}
          <button 
            onClick={() => {
              if (showForm) resetForm();
              setShowForm(!showForm);
            }} 
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-gray-800 shadow-md transition-all"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Grant"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] p-8 space-y-6 shadow-md">
          <h3 className="text-lg font-black text-black">{form.id ? "Edit Grant Opportunity" : "Add New Grant Opportunity"}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Grant Title *</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Solana Foundation Grant" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Provider *</label>
              <input required value={form.provider} onChange={e => setForm({...form, provider: e.target.value})} placeholder="e.g. Solana Foundation" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Max Funding ($ USD)</label>
              <input value={form.amount_max} onChange={e => setForm({...form, amount_max: e.target.value})} placeholder="e.g. 50000" type="number" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Deadline</label>
              <input value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} placeholder="e.g. Mar 31, 2027" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Category</label>
              <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g. L2 & Infrastructure" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Apply URL</label>
              <input value={form.apply_url} onChange={e => setForm({...form, apply_url: e.target.value})} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Eligible Stages</label>
            <div className="flex flex-wrap gap-2">
              {availableStages.map(stage => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => toggleStage(stage)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    form.stages.includes(stage)
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Grant overview..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Eligibility</label>
              <textarea value={form.eligibility} onChange={e => setForm({...form, eligibility: e.target.value})} placeholder="Applicant requirements..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Tips & Strategy</label>
              <textarea value={form.tips} onChange={e => setForm({...form, tips: e.target.value})} placeholder="Application tips..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="flex flex-col justify-end gap-3">
              <label className="flex items-center gap-3 text-sm text-black cursor-pointer p-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 rounded text-black focus:ring-0" />
                <Star size={16} className={form.featured ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                <span>Feature on Ecosystem Landing Page</span>
              </label>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-gray-800 shadow-md transition-all">
                <Save size={18} /> {form.id ? "Update Grant" : "Save Grant Opportunity"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search grants or providers..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-black text-white border-black shadow-xs"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-clay-border,#e5e2dc)] bg-gray-50/50 font-mono text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Grant</th>
                <th className="px-6 py-4">Max Pool</th>
                <th className="px-6 py-4">Stages</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredGrants.map(g => (
                <tr key={g.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#d2f5a6] border border-black/10 flex items-center justify-center text-black font-black">
                        <Gift size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-black">{g.title}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{g.provider}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-600 font-mono">
                    {g.amount_max ? `$${Number(g.amount_max).toLocaleString()}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(g.stages || ['Any']).map((s: string) => (
                        <span key={s} className="text-[9px] font-black font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200 uppercase">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleFeatured(g.id, g.featured)}
                      className={`p-2 rounded-xl transition-colors ${g.featured ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:text-amber-500"}`}
                    >
                      <Star size={18} fill={g.featured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleActive(g.id, g.is_active)} 
                      className={`text-[10px] font-black font-mono px-2.5 py-1 rounded-full border ${
                        g.is_active !== false 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {g.is_active !== false ? "ACTIVE" : "HIDDEN"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(g)} className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100" title="Edit Grant">
                        <Edit size={16} />
                      </button>
                      {g.apply_url && (
                        <a href={g.apply_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button onClick={() => handleDelete(g.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50" title="Delete Grant">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredGrants.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">No grant records found</div>
        )}
      </div>

      {/* Bulk Upload CSV / JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <Upload size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-black tracking-tight">Bulk Upload Grants</h3>
                  <p className="text-xs text-gray-500 font-medium">Import CSV or JSON grant records into Firestore</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportStatus(null);
                }}
                className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Format toggle & file input */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">Format:</span>
                <button
                  type="button"
                  onClick={() => setImportFormat("csv")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${importFormat === "csv" ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200"}`}
                >
                  CSV / TSV
                </button>
                <button
                  type="button"
                  onClick={() => setImportFormat("json")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${importFormat === "json" ? "bg-black text-white" : "bg-white text-gray-600 border border-gray-200"}`}
                >
                  JSON Array
                </button>
              </div>

              <label className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer shadow-2xs">
                <FileText size={14} />
                Upload File (.csv, .txt, .json)
                <input type="file" accept=".csv,.json,.txt,.tsv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Input Text Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 font-mono">
                Paste Raw {importFormat.toUpperCase()} Data
              </label>
              <textarea
                rows={10}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={
                  importFormat === "csv"
                    ? `title,provider,amount_max,deadline,description,eligibility,apply_url,category\nSolana Foundation Grant,Solana Foundation,$50000,Rolling,Grant for Web3 infrastructure,Open to developers,https://solana.org/grants,L2 & Infrastructure`
                    : `[\n  {\n    "title": "Solana Foundation Grant",\n    "provider": "Solana Foundation",\n    "amount_max": "$50,000",\n    "deadline": "Rolling",\n    "description": "Grant for Web3 infrastructure",\n    "apply_url": "https://solana.org/grants",\n    "category": "L2 & Infrastructure"\n  }\n]`
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-mono text-xs text-black focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {importStatus && (
              <div className="p-4 bg-purple-50 border border-purple-200 text-purple-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <Sparkles size={16} className="animate-spin" />
                {importStatus}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-5 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importing || !importText.trim()}
                onClick={handleParseAndImport}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <Database size={16} />
                {importing ? "Importing..." : "Parse & Import Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
