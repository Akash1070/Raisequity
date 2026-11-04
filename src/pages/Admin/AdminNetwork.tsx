import React, { useEffect, useState } from "react";
import { Plus, Trash2, Activity, X, Save, ExternalLink, Star, Rocket, Edit, Search, Sparkles, Building, Upload, Database, FileText, MessageSquare, Mail, UserCheck, Linkedin } from "lucide-react";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";

const defaultNetworkPartners = [
  { id: 'alliance-xyz', name: 'Alliance.xyz', category: 'Accelerator', funding: '$500k via SAFE.', description: 'One of the best-known crypto/AI accelerators; strong founder signal because of brand recognition, mentor network, and downstream fundraising outcomes.', bestFor: 'Early-stage crypto or AI founders seeking strong investor signaling.', apply_url: 'https://alliance.xyz', telegram: '@alliance_deals', contact_person: 'Imran Khan (Managing Partner)', email: 'apply@alliance.xyz', linkedin: 'https://linkedin.com/in/imrankhan', featured: true, is_active: true },
  { id: 'denarii-labs', name: 'Denarii Labs', category: 'Accelerator', funding: '$100k - $300k investment.', description: 'Tokenomics-focused accelerator backed by Red Beard Ventures; good fit for Web3 founders needing token design, investor prep, and GTM support.', bestFor: 'Token design, investor prep, and GTM support.', apply_url: 'https://www.denariilabs.xyz', telegram: '@denariilabs', contact_person: 'Sarah (Cohort Lead)', email: 'info@denariilabs.xyz', linkedin: 'https://linkedin.com/company/denariilabs', featured: true, is_active: true },
  { id: 'cointelegraph-accelerator', name: 'Cointelegraph Accelerator', category: 'Accelerator', funding: 'Up to $100k funding + $200k media support.', description: 'Media-driven accelerator for Web3 startups; strong value proposition is distribution, credibility, and strategic exposure.', bestFor: 'Distribution, credibility, and strategic exposure.', apply_url: 'https://cointelegraph.com/tags/cointelegraph-accelerator', telegram: '@ct_accelerator', contact_person: 'Paul (Media Lead)', email: 'accelerator@cointelegraph.com', linkedin: 'https://linkedin.com/company/cointelegraph', featured: true, is_active: true },
  { id: 'ibc-ventures', name: 'IBC Ventures', category: 'Accelerator', funding: 'Six-figure strategic investments.', description: 'Best for founders looking for a mix of incubation, strategic investment, media reach, and access to a large Web3 network.', bestFor: 'Incubation, strategic media reach & ecosystem access.', apply_url: 'https://www.ibcgroup.io', telegram: '@ibc_deals', contact_person: 'Mario (Managing Director)', email: 'ventures@ibcgroup.io', linkedin: 'https://linkedin.com/company/ibc-group', featured: false, is_active: true },
  { id: '0xlabs', name: '0xLabs', category: 'Incubator', funding: '$50M total fund size.', description: 'Focused on project verification and TGE support via a $50M incubation fund for high-conviction Web3 building.', bestFor: 'TGE support and core infrastructure projects.', apply_url: 'https://www.0xlabs.tech', telegram: '@oxlabs_incubator', contact_person: 'Alex (TGE Partner)', email: 'contact@0xlabs.tech', linkedin: 'https://linkedin.com/company/0xlabs', featured: false, is_active: true },
  { id: 'aaa-pad', name: 'AAA Pad by Palo Alto AI', category: 'Incubator', funding: 'Launchpad + Incubation support.', description: 'Incubation and investor connectivity for AI-driven Web3 projects looking to scale with expert backing.', bestFor: 'AI agents and AI x Web3 startups.', apply_url: 'https://aaapad.palo-alto.ai/en', telegram: '@aaapad_ai', contact_person: 'Elena (AI Lead)', email: 'pad@palo-alto.ai', linkedin: 'https://linkedin.com/company/palo-alto-ai', featured: false, is_active: true },
  { id: 'chaingpt-pad', name: 'ChainGPT Pad', category: 'Launchpad', funding: 'Funding, exposure, and community access.', description: 'AI-powered IDO launchpad and incubator for Web3 projects; useful for token launch, distribution, and community access.', bestFor: 'Token launch, distribution, and incubator support.', apply_url: 'https://pad.chaingpt.org', telegram: '@chaingpt_pad', contact_person: 'Ilan (Founder)', email: 'pad@chaingpt.org', linkedin: 'https://linkedin.com/company/chaingpt', featured: true, is_active: true },
  { id: 'legion', name: 'Legion', category: 'Launchpad', funding: 'Incubated by Delphi Labs; connects with VCs.', description: 'Merit-based on-chain fundraising platform designed to connect projects, VCs, and retail participants in a curated way.', bestFor: 'On-chain fundraising and VC connections.', apply_url: 'https://legion.cc/', telegram: '@legion_deals', contact_person: 'Jose (Product Lead)', email: 'team@legion.cc', linkedin: 'https://linkedin.com/company/legion-cc', featured: false, is_active: true },
  { id: 'trustswap', name: 'TrustSwap', category: 'Launchpad', funding: 'Raised $21M+ for startups through community.', description: 'Established crypto launchpad with staking-based access and a recognizable retail investor community.', bestFor: 'Staking-based launches & retail community.', apply_url: 'https://trustswap.org', telegram: '@trustswap_launch', contact_person: 'Jeff (Launch Manager)', email: 'launch@trustswap.com', linkedin: 'https://linkedin.com/company/trustswap', featured: false, is_active: true },
];

export default function AdminNetwork() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  // Bulk Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importFormat, setImportFormat] = useState<"csv" | "json">("csv");
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    category: "Accelerator",
    funding: "",
    description: "",
    bestFor: "",
    apply_url: "",
    telegram: "",
    contact_person: "",
    email: "",
    linkedin: "",
    featured: false
  });

  const categories = ["All", "Accelerator", "Incubator", "Launchpad", "Ecosystem Partner"];

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "network_partners"), limit(200)));
      const dbData = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Real Firestore records only; seed fallback only for fresh databases.
      setPartners(dbData.length > 0 ? dbData : defaultNetworkPartners);
    } catch (err) {
      console.error("Error fetching network partners:", err);
      setPartners(defaultNetworkPartners);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("Import default accelerators, incubators & launchpads into database?")) return;
    setSeeding(true);
    try {
      for (const p of defaultNetworkPartners) {
        await setDoc(doc(db, "network_partners", p.id), p, { merge: true });
      }
      alert("Network Partners default database seeded successfully!");
      fetchPartners();
    } catch (err: any) {
      alert("Error seeding database: " + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const partnerId = form.id || `partner_${Date.now()}`;
      const payload = {
        ...form,
        id: partnerId,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      await setDoc(doc(db, "network_partners", partnerId), payload, { merge: true });
      fetchPartners();
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      alert("Save error: " + err.message);
    }
  };

  const handleEdit = (p: any) => {
    setForm({
      id: p.id || "",
      name: p.name || "",
      category: p.category || "Accelerator",
      funding: p.funding || "",
      description: p.description || "",
      bestFor: p.bestFor || "",
      apply_url: p.apply_url || p.link || "",
      telegram: p.telegram || "",
      contact_person: p.contact_person || "",
      email: p.email || "",
      linkedin: p.linkedin || "",
      featured: !!p.featured
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this network partner?")) return;
    try {
      await deleteDoc(doc(db, "network_partners", id));
      setPartners(partners.filter(p => p.id !== id));
    } catch (err: any) {
      alert("Delete error: " + err.message);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "network_partners", id), { featured: !current });
      setPartners(partners.map(p => p.id === id ? { ...p, featured: !current } : p));
    } catch (err) {
      console.error("Error toggling featured state:", err);
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      name: "",
      category: "Accelerator",
      funding: "",
      description: "",
      bestFor: "",
      apply_url: "",
      telegram: "",
      contact_person: "",
      email: "",
      linkedin: "",
      featured: false
    });
  };

  const handleParseAndImport = async () => {
    if (!importText.trim()) {
      alert("Please paste CSV or JSON content first.");
      return;
    }

    setImporting(true);
    setImportStatus("Parsing network partner data...");

    try {
      let parsedItems: any[] = [];

      if (importFormat === "json") {
        const raw = JSON.parse(importText);
        const arr = Array.isArray(raw) ? raw : [raw];
        parsedItems = arr.map((item: any, idx: number) => ({
          id: item.id || `partner_csv_${Date.now()}_${idx}`,
          name: item.name || item.partner || item.accelerator || "Network Partner",
          category: item.category || "Accelerator",
          funding: item.funding || item.offer || "Varies by cohort",
          description: item.description || item.details || "",
          bestFor: item.bestFor || item.best_for || item.target || "Web3 & AI Founders",
          apply_url: item.apply_url || item.applyUrl || item.url || item.link || "#",
          telegram: item.telegram || item.tg || item.contact_telegram || "",
          contact_person: item.contact_person || item.contact || item.lead || "",
          email: item.email || item.contact_email || "",
          linkedin: item.linkedin || item.contact_linkedin || item.li || "",
          featured: Boolean(item.featured),
          is_active: true,
          created_at: new Date().toISOString()
        }));
      } else {
        const lines = importText.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) throw new Error("CSV text is empty");

        const headerLine = lines[0].toLowerCase();
        const hasHeader = headerLine.includes("name") || headerLine.includes("partner") || headerLine.includes("category");
        const dataLines = hasHeader ? lines.slice(1) : lines;

        const delimiter = importText.includes("\t") ? "\t" : ",";

        parsedItems = dataLines.map((line, idx) => {
          const cols = line.split(delimiter).map(c => c.replace(/^["']|["']$/g, "").trim());
          return {
            id: `partner_csv_${Date.now()}_${idx}`,
            name: cols[0] || `Partner #${idx + 1}`,
            category: cols[1] || "Accelerator",
            funding: cols[2] || "Varies by cohort",
            apply_url: cols[3] || "#",
            description: cols[4] || "",
            bestFor: cols[5] || "Web3 & AI Founders",
            telegram: cols[6] || "",
            contact_person: cols[7] || "",
            email: cols[8] || "",
            linkedin: cols[9] || "",
            featured: false,
            is_active: true,
            created_at: new Date().toISOString()
          };
        });
      }

      setImportStatus(`Importing ${parsedItems.length} network partners into Firestore...`);

      let count = 0;
      for (const item of parsedItems) {
        await setDoc(doc(db, "network_partners", item.id), item, { merge: true });
        count++;
      }

      setImportStatus(`Successfully imported ${count} network partners!`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportText("");
        setImportStatus(null);
        fetchPartners();
      }, 1500);

    } catch (err: any) {
      console.error("Import error:", err);
      setImportStatus("Import failed: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  const filteredPartners = partners.filter(p => {
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchesSearch = !search || 
      p.name?.toLowerCase().includes(search.toLowerCase()) || 
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.bestFor?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-clay-border,#e5e2dc)] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight">
              Network Partners Admin Suite
            </h1>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-mono font-extrabold">
              {partners.length} Entries
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500">
            Manage accelerators, incubators, launchpads, and 1-credit contact unlocks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-900 hover:bg-purple-100 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
          >
            <Upload size={16} /> Bulk Upload (CSV / JSON)
          </button>
          
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles size={16} /> {seeding ? "Seeding..." : "Seed Default Partners"}
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "Add Partner"}
          </button>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-[var(--color-clay-border,#e5e2dc)] space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-black text-base text-black font-mono uppercase tracking-wider">
              {form.id ? "Edit Network Partner" : "Create Network Partner"}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-black">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Partner / Program Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alliance.xyz" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black">
                <option value="Accelerator">Accelerator</option>
                <option value="Incubator">Incubator</option>
                <option value="Launchpad">Launchpad</option>
                <option value="Ecosystem Partner">Ecosystem Partner</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Funding / Support Offer</label>
              <input value={form.funding} onChange={e => setForm({ ...form, funding: e.target.value })} placeholder="e.g. $500k via SAFE" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Website / Application Link</label>
              <input value={form.apply_url} onChange={e => setForm({ ...form, apply_url: e.target.value })} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Best For (Target Founders)</label>
              <input value={form.bestFor} onChange={e => setForm({ ...form, bestFor: e.target.value })} placeholder="e.g. Token design, investor prep, and GTM support" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>

            {/* Direct Contact & Burn System Fields */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-purple-600 uppercase tracking-wider font-mono flex items-center gap-1">
                <MessageSquare size={12} /> Telegram Handle (1-Credit Unlock)
              </label>
              <input value={form.telegram} onChange={e => setForm({ ...form, telegram: e.target.value })} placeholder="@alliance_deals" className="w-full bg-purple-50/50 border border-purple-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-purple-600 uppercase tracking-wider font-mono flex items-center gap-1">
                <UserCheck size={12} /> Contact Person Name
              </label>
              <input value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} placeholder="Imran Khan (Partner Lead)" className="w-full bg-purple-50/50 border border-purple-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-purple-600 uppercase tracking-wider font-mono flex items-center gap-1">
                <Mail size={12} /> Direct Contact Email
              </label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="apply@alliance.xyz" className="w-full bg-purple-50/50 border border-purple-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-purple-600 uppercase tracking-wider font-mono flex items-center gap-1">
                <Linkedin size={12} /> Direct LinkedIn Profile
              </label>
              <input value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/imrankhan" className="w-full bg-purple-50/50 border border-purple-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Program Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Overview of accelerator or launchpad..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-3 text-sm text-black cursor-pointer p-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded text-black focus:ring-0" />
              <Star size={16} className={form.featured ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
              <span>Feature on Top Network Showcase</span>
            </label>

            <button type="submit" className="flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-gray-800 shadow-md transition-all">
              <Save size={18} /> {form.id ? "Update Partner" : "Save Network Partner"}
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
            placeholder="Search partners..."
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

      {/* Partners List */}
      <div className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-clay-border,#e5e2dc)] bg-gray-50/50 font-mono text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Funding</th>
                <th className="px-6 py-4">Direct Contact Channel</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPartners.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-black">
                        <Rocket size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-black">{p.name}</div>
                        <div className="text-[11px] text-gray-500 max-w-md line-clamp-1">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black font-mono bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full border border-gray-200 uppercase">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-700 font-mono">
                    {p.funding || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {p.telegram || p.contact_person || p.email || p.linkedin ? (
                      <div className="space-y-0.5">
                        {p.contact_person && <div className="text-xs font-bold text-gray-900">{p.contact_person}</div>}
                        {p.telegram && <div className="text-[11px] font-mono font-bold text-purple-600">TG: {p.telegram}</div>}
                        {p.email && <div className="text-[11px] font-mono text-gray-600">Email: {p.email}</div>}
                        {p.linkedin && <div className="text-[11px] font-mono text-blue-600 truncate max-w-[150px]">LI: {p.linkedin}</div>}
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-mono">Online Application</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleFeatured(p.id, p.featured)}
                      className={`p-2 rounded-xl transition-colors ${p.featured ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:text-amber-500"}`}
                    >
                      <Star size={18} fill={p.featured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(p)} className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100" title="Edit Partner">
                        <Edit size={16} />
                      </button>
                      {(p.apply_url || p.link) && (
                        <a href={p.apply_url || p.link} target="_blank" rel="noreferrer" className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50" title="Delete Partner">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPartners.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">No network partners found</div>
        )}
      </div>

      {/* Bulk Upload CSV / JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <Upload size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight">Bulk Import Network Partners</h2>
                  <p className="text-xs text-gray-500 font-medium">Upload CSV file or paste JSON/CSV data to scale accelerator listings.</p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-black p-2 rounded-xl hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-1.5 bg-gray-100 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setImportFormat("csv")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${importFormat === "csv" ? "bg-white text-black shadow-2xs" : "text-gray-500 hover:text-black"}`}
                >
                  CSV / TSV Text
                </button>
                <button
                  type="button"
                  onClick={() => setImportFormat("json")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${importFormat === "json" ? "bg-white text-black shadow-2xs" : "text-gray-500 hover:text-black"}`}
                >
                  JSON Array
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono font-black uppercase text-gray-400 mb-1">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv,.tsv,.json,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      const content = evt.target?.result as string;
                      if (content) {
                        setImportText(content);
                        if (file.name.endsWith(".json")) setImportFormat("json");
                      }
                    };
                    reader.readAsText(file);
                  }}
                  className="w-full text-xs text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-black uppercase text-gray-400">
                    Paste {importFormat.toUpperCase()} Content
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">Auto Column Mapping Enabled</span>
                </div>
                <textarea
                  rows={8}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={
                    importFormat === "csv"
                      ? "Name,Category,Funding,ApplyURL,Description,BestFor,Telegram,ContactPerson,Email,LinkedIn\nAlliance.xyz,Accelerator,$500k,https://alliance.xyz,Top accelerator,Crypto founders,@alliance_deals,Imran Khan,apply@alliance.xyz,https://linkedin.com/in/imrankhan"
                      : '[\n  {\n    "name": "Alliance.xyz",\n    "category": "Accelerator",\n    "funding": "$500k",\n    "apply_url": "https://alliance.xyz",\n    "telegram": "@alliance_deals",\n    "contact_person": "Imran Khan",\n    "email": "apply@alliance.xyz",\n    "linkedin": "https://linkedin.com/in/imrankhan"\n  }\n]'
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-mono text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {importStatus && (
                <div className={`p-4 rounded-2xl text-xs font-bold ${importStatus.includes("failed") || importStatus.includes("Error") ? "bg-red-50 text-red-800 border border-red-200" : "bg-purple-50 text-purple-900 border border-purple-200"}`}>
                  {importStatus}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-5 py-3 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleParseAndImport}
                disabled={importing}
                className="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md transition-all flex items-center gap-2"
              >
                <Sparkles size={16} />
                {importing ? "Processing..." : "Start Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
