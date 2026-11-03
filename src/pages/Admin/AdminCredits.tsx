import React, { useEffect, useState } from "react";
import { Plus, Trash2, Activity, X, Save, ExternalLink, Star, Award, Edit, Search, Sparkles, Upload, Database, FileText } from "lucide-react";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { startupCredits, categoryLabels } from "../../data/credits";

export default function AdminCredits() {
  const [credits, setCredits] = useState<any[]>([]);
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
    id: "", company: "", name: "", category: "cloud", value: "", 
    numeric_value: "", description: "", eligibility: "", apply_url: "", 
    notes: "", featured: false 
  });

  const categories = ["All", "cloud", "ai", "database", "analytics", "dev-tools", "email", "design", "other"];

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "credits"), limit(200)));
      const dbData = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const creditMap = new Map<string, any>();
      startupCredits.forEach(c => creditMap.set(c.id, c));
      dbData.forEach(c => creditMap.set(c.id, { ...(creditMap.get(c.id) || {}), ...c }));

      setCredits(Array.from(creditMap.values()));
    } catch (err) {
      console.error("Error fetching credits:", err);
      setCredits(startupCredits);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("Import 40+ default startup partner perks & credits into Firestore database?")) return;
    setSeeding(true);
    try {
      for (const c of startupCredits) {
        const payload = {
          id: c.id,
          company: c.company,
          name: c.name,
          category: c.category,
          value: c.value,
          numeric_value: c.numericValue,
          description: c.description,
          eligibility: c.eligibility,
          apply_url: c.applyUrl,
          notes: c.notes || "",
          featured: !!c.featured,
          is_active: true,
          created_at: new Date().toISOString()
        };
        await setDoc(doc(db, "credits", c.id), payload);
      }
      await fetchCredits();
    } catch (err: any) {
      alert("Seeding error: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const creditId = form.id || `credit_${Date.now()}`;
      const payload = {
        id: creditId,
        company: form.company, 
        name: form.name, 
        category: form.category, 
        value: form.value, 
        numeric_value: form.numeric_value ? parseFloat(form.numeric_value) : null,
        description: form.description, 
        eligibility: form.eligibility, 
        apply_url: form.apply_url, 
        notes: form.notes, 
        featured: form.featured,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      await setDoc(doc(db, "credits", creditId), payload);
      setCredits([payload, ...credits.filter(c => c.id !== creditId)]); 
      setShowForm(false); 
      resetForm();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this credit perk record?")) return;
    try {
      await deleteDoc(doc(db, "credits", id));
      setCredits(credits.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting credit:", err);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "credits", id), { featured: !current });
      setCredits(credits.map(c => c.id === id ? { ...c, featured: !current } : c));
    } catch (err) {
      console.error("Error toggling featured state:", err);
    }
  };

  const handleEdit = (credit: any) => {
    setForm({
      id: credit.id,
      company: credit.company || "",
      name: credit.name || "",
      category: credit.category || "cloud",
      value: credit.value || "",
      numeric_value: credit.numeric_value ? String(credit.numeric_value) : "",
      description: credit.description || "",
      eligibility: credit.eligibility || "",
      apply_url: credit.apply_url || "",
      notes: credit.notes || "",
      featured: !!credit.featured
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ 
      id: "", company: "", name: "", category: "cloud", value: "", 
      numeric_value: "", description: "", eligibility: "", apply_url: "", 
      notes: "", featured: false 
    });
  };

  const handleParseAndImport = async () => {
    if (!importText.trim()) {
      alert("Please paste CSV or JSON content first.");
      return;
    }

    setImporting(true);
    setImportStatus("Parsing partner perks data...");

    try {
      let parsedItems: any[] = [];

      if (importFormat === "json") {
        const raw = JSON.parse(importText);
        const arr = Array.isArray(raw) ? raw : [raw];
        parsedItems = arr.map((item: any, idx: number) => ({
          id: item.id || `credit_csv_${Date.now()}_${idx}`,
          company: item.company || item.provider || item.partner || "Partner",
          name: item.name || item.perk || item.title || "Startup Perk",
          category: item.category || "cloud",
          value: item.value || item.amount || "$5,000 Credits",
          numeric_value: item.numeric_value ? parseFloat(item.numeric_value) : 5000,
          description: item.description || item.details || "",
          eligibility: item.eligibility || item.requirements || "Active Web3 / AI Founders",
          apply_url: item.apply_url || item.applyUrl || item.url || item.link || "#",
          notes: item.notes || item.tips || "",
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

          const rawVal = getRowVal("value", "amount", "credits") || "$5,000 Credits";
          const numVal = parseFloat(rawVal.replace(/[^0-9.]/g, "")) || 5000;

          parsedItems.push({
            id: `credit_csv_${Date.now()}_${i}`,
            company: getRowVal("company", "provider", "partner") || "Partner",
            name: getRowVal("name", "perk", "title") || "Startup Perk",
            category: getRowVal("category", "type") || "cloud",
            value: rawVal,
            numeric_value: numVal,
            description: getRowVal("description", "details") || "",
            eligibility: getRowVal("eligibility", "requirements") || "Active Web3 / AI Founders",
            apply_url: getRowVal("apply_url", "applyurl", "url", "link") || "#",
            notes: getRowVal("notes", "tips") || "",
            featured: getRowVal("featured").toLowerCase() === "true",
            is_active: true,
            created_at: new Date().toISOString()
          });
        }
      }

      setImportStatus(`Saving ${parsedItems.length} partner perks to Firestore...`);

      for (const item of parsedItems) {
        await setDoc(doc(db, "credits", item.id), item);
      }

      await fetchCredits();
      setImportStatus(`Success! Imported ${parsedItems.length} partner perks.`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportText("");
        setImportStatus(null);
        setImporting(false);
      }, 1200);
    } catch (err: any) {
      console.error("Credit Import Error:", err);
      alert("Failed to import credits: " + err.message);
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

  const filteredCredits = (credits.length > 0 ? credits : startupCredits.map(c => ({
    id: c.id,
    company: c.company,
    name: c.name,
    category: c.category,
    value: c.value,
    numeric_value: c.numericValue,
    description: c.description,
    eligibility: c.eligibility,
    apply_url: c.applyUrl,
    notes: c.notes || "",
    featured: !!c.featured,
    is_active: true
  }))).filter(c => {
    const matchesSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Activity size={32} className="animate-spin text-black" />
        <p className="text-xs font-mono font-bold text-gray-400">Loading partner perks & credits...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black text-black tracking-tight font-heading">Partner Perks & Credits</h1>
          <p className="text-gray-500 font-medium mt-1">{filteredCredits.length} active platform credits and partner discounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-purple-100 shadow-xs transition-all cursor-pointer"
          >
            <Upload size={16} /> Bulk Upload CSV/JSON
          </button>
          {credits.length === 0 && (
            <button 
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles size={16} /> {seeding ? "Importing..." : "Seed Default Credits (40+)"}
            </button>
          )}
          <button 
            onClick={() => {
              if (showForm) resetForm();
              setShowForm(!showForm);
            }} 
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-gray-800 shadow-md transition-all"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Credit Perk"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] p-8 space-y-6 shadow-md">
          <h3 className="text-lg font-black text-black">{form.id ? "Edit Partner Perk" : "Add New Partner Credit Perk"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Company / Provider *</label>
              <input required value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="e.g. Google Cloud" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Program Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Google for Startups" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Perk Value Label *</label>
              <input required value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="e.g. Up to $350,000" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Numeric Value ($ USD for sorting)</label>
              <input value={form.numeric_value} onChange={e => setForm({...form, numeric_value: e.target.value})} placeholder="e.g. 350000" type="number" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Apply URL</label>
              <input value={form.apply_url} onChange={e => setForm({...form, apply_url: e.target.value})} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Credit perk overview..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Eligibility Requirements</label>
              <textarea value={form.eligibility} onChange={e => setForm({...form, eligibility: e.target.value})} placeholder="Requirements to qualify..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Admin Notes / Voucher Code</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Special claim instructions or codes..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-3 text-sm text-black cursor-pointer p-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 rounded text-black focus:ring-0" />
              <Star size={16} className={form.featured ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
              <span>Feature on Perks Landing Page</span>
            </label>
            <button type="submit" className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-gray-800 shadow-md transition-all">
              <Save size={18} /> {form.id ? "Update Credit Perk" : "Save Credit Perk"}
            </button>
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
            placeholder="Search perks or companies..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap capitalize ${
                categoryFilter === cat
                  ? "bg-black text-white border-black shadow-xs"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat === "All" ? "All Categories" : (categoryLabels[cat as keyof typeof categoryLabels] || cat)}
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
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCredits.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 text-sm font-extrabold text-black">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                        <Award size={16} />
                      </div>
                      <span>{c.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">
                    {c.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full uppercase border border-gray-200">
                      {c.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-600 font-mono">
                    {c.value}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleFeatured(c.id, c.featured)}
                      className={`p-2 rounded-xl transition-colors ${c.featured ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:text-amber-500"}`}
                    >
                      <Star size={18} fill={c.featured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(c)} className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100" title="Edit Credit Perk">
                        <Edit size={16} />
                      </button>
                      {c.apply_url && (
                        <a href={c.apply_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button onClick={() => handleDelete(c.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50" title="Delete Credit Perk">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCredits.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">No partner credits registered</div>
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
                  <h3 className="text-xl font-black text-black tracking-tight">Bulk Upload Partner Perks & Credits</h3>
                  <p className="text-xs text-gray-500 font-medium">Import CSV or JSON partner perks records into Firestore</p>
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
                    ? `company,name,category,value,description,eligibility,apply_url\nAWS,AWS Activate,cloud,$100000,Up to $100k AWS Credits,Bootstrapped or VC funded,https://aws.amazon.com/activate`
                    : `[\n  {\n    "company": "AWS",\n    "name": "AWS Activate",\n    "category": "cloud",\n    "value": "$100,000 Credits",\n    "description": "Up to $100k AWS Credits",\n    "apply_url": "https://aws.amazon.com/activate"\n  }\n]`
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
