import React, { useEffect, useState } from "react";
import { Search, Activity, ShieldCheck, CheckCircle2, Clock, Upload, Plus, Trash2, Edit, X, Download, FileText, Send, Database } from "lucide-react";
import { collection, getDocs, doc, updateDoc, query, where, limit, getCountFromServer } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { processInvestorVerificationReferral } from "../../lib/referrals";
import { getWeb3Investors, createWeb3Investor, updateWeb3Investor, deleteWeb3Investor, bulkImportWeb3Investors } from "../../lib/investors";
import { Web3Investor } from "../../types/investor";

export default function AdminInvestors() {
  const [activeTab, setActiveTab] = useState<"directory" | "platform">("directory");
  
  // Platform registered users (investors)
  const [platformInvestors, setPlatformInvestors] = useState<any[]>([]);
  const [loadingPlatform, setLoadingPlatform] = useState(true);

  // Web3 Investor Directory dataset
  const [directoryInvestors, setDirectoryInvestors] = useState<Web3Investor[]>([]);
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [totalInvestorCount, setTotalInvestorCount] = useState<number | null>(null);
  const [currentLimit, setCurrentLimit] = useState(1000);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Partial<Web3Investor> | null>(null);

  // Bulk Import state
  const [importText, setImportText] = useState("");
  const [importFormat, setImportFormat] = useState<"csv" | "json">("csv");
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fetchPlatformInvestors = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "investor"), limit(100));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPlatformInvestors(data);
    } catch (err) {
      console.error("Error fetching platform investors:", err);
    } finally {
      setLoadingPlatform(false);
    }
  };

  const fetchDirectoryInvestors = async (targetLimit?: number) => {
    setLoadingDirectory(true);
    const useLimit = targetLimit ?? currentLimit;
    try {
      const countSnap = await getCountFromServer(collection(db, "web3_investors"));
      setTotalInvestorCount(countSnap.data().count);
    } catch (e) {
      console.warn("Could not retrieve server total count:", e);
    }
    const list = await getWeb3Investors([], true, { limit: useLimit });
    setDirectoryInvestors(list);
    setLoadingDirectory(false);
  };

  useEffect(() => {
    fetchPlatformInvestors();
    fetchDirectoryInvestors();
  }, []);

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await updateDoc(doc(db, "users", userId), { is_approved: newStatus });

      if (newStatus) {
        await processInvestorVerificationReferral(userId);
      }

      setPlatformInvestors(platformInvestors.map(i => i.id === userId ? { ...i, is_approved: newStatus } : i));
    } catch (err) {
      console.error("Error toggling investor approval:", err);
    }
  };

  const handleDeleteInvestor = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this investor from the directory?")) return;
    const res = await deleteWeb3Investor(id);
    if (res.success) {
      setDirectoryInvestors(directoryInvestors.filter(i => i.id !== id));
    } else {
      alert("Failed to delete: " + res.error);
    }
  };

  const handleSaveInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvestor?.name || !editingInvestor?.firm) {
      alert("Name and Firm are required.");
      return;
    }

    if (editingInvestor.id) {
      // Update
      const res = await updateWeb3Investor(editingInvestor.id, editingInvestor);
      if (res.success) {
        fetchDirectoryInvestors();
        setShowEditModal(false);
        setEditingInvestor(null);
      } else {
        alert("Error updating investor: " + res.error);
      }
    } else {
      // Create
      const res = await createWeb3Investor(editingInvestor as Omit<Web3Investor, "id">);
      if (res.success) {
        fetchDirectoryInvestors();
        setShowEditModal(false);
        setEditingInvestor(null);
      } else {
        alert("Error creating investor: " + res.error);
      }
    }
  };

  const handleParseAndImport = async () => {
    if (!importText.trim()) {
      alert("Please paste CSV or JSON content first.");
      return;
    }

    setImporting(true);
    setImportStatus("Parsing data...");

    try {
      let parsedItems: Omit<Web3Investor, "id">[] = [];

      if (importFormat === "json") {
        const raw = JSON.parse(importText);
        const arr = Array.isArray(raw) ? raw : [raw];
        parsedItems = arr.map((item: any) => {
          const getVal = (...keys: string[]) => {
            for (const k of keys) {
              const foundKey = Object.keys(item).find(ik => ik.trim().toLowerCase() === k.toLowerCase());
              if (foundKey && item[foundKey]) return String(item[foundKey]).trim();
            }
            return "";
          };

          const partnerName = getVal("Partner Name", "name", "Investor Name", "partner_name");
          const firmName = getVal("Investor Name", "company", "firm", "fund");

          return {
            name: partnerName || firmName || "Web3 Investor",
            firm: firmName || partnerName || "Independent / Angel",
            category: getVal("Fund Type", "type", "category") || "VC Fund",
            role: getVal("title", "role") || "Partner",
            sectors: (getVal("Fund Focus (Sectors)", "industry", "sectors") || "Web3, DeFi")
              .split(/[,;|]/)
              .map((s: string) => s.trim())
              .filter(Boolean),
            stage: getVal("Fund Stage", "stage") || "Seed",
            check_size: getVal("check_size", "check size", "Check Size") || "$50k - $250k",
            location: getVal("Location", "location") || "Global",
            email: getVal("Partner Email", "email") || "",
            telegram: getVal("telegram", "Telegram", "tg") || "",
            twitter: getVal("Twitter Link", "twitter") || "",
            linkedin: getVal("LinkedIn Link", "linkedin") || "",
            website: getVal("Website (if available)", "website") || "",
            verified: true,
            know_count: 0,
          };
        });
      } else {
        // Parse CSV or TSV (Tab separated Excel copy-paste)
        const lines = importText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          alert("CSV/TSV data must have a header row and at least one data row.");
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
            // CSV split considering quotes
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

          const partnerName = getRowVal("partner name", "full name", "name");
          const firmName = getRowVal("investor name", "company", "firm", "fund") || (partnerName ? `${partnerName} Capital` : "");

          parsedItems.push({
            name: partnerName || firmName || "Web3 Investor",
            firm: firmName || partnerName || "Angel / VC",
            category: getRowVal("fund type", "type", "category") || "VC Fund",
            role: getRowVal("title", "role") || "Partner",
            sectors: (getRowVal("fund focus (sectors)", "industry", "sectors") || "Web3, Crypto")
              .split(/[,;|]/)
              .map((s: string) => s.trim())
              .filter(Boolean),
            stage: getRowVal("fund stage", "stage") || "Pre-seed / Seed",
            check_size: getRowVal("check_size", "check size") || "$50k - $250k",
            location: getRowVal("location") || "Global",
            email: getRowVal("partner email", "email") || "",
            telegram: getRowVal("telegram", "tg") || "",
            twitter: getRowVal("twitter link", "twitter") || "",
            linkedin: getRowVal("linkedin link", "linkedin") || "",
            website: getRowVal("website (if available)", "website") || "",
            verified: true,
            know_count: 0,
          });
        }
      }

      setImportStatus(`Importing ${parsedItems.length} records into Firestore...`);
      const result = await bulkImportWeb3Investors(parsedItems);

      if (result.success) {
        setImportStatus(`Successfully imported ${result.count} investor records!`);
        setTimeout(() => {
          setShowImportModal(false);
          setImportText("");
          setImportStatus(null);
          fetchDirectoryInvestors();
        }, 1500);
      } else {
        alert("Import failed: " + result.error);
      }
    } catch (err: any) {
      alert("Parsing error: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  const filteredDirectory = directoryInvestors.filter(inv => {
    const matchesSearch = !search || 
      inv.name.toLowerCase().includes(search.toLowerCase()) || 
      inv.firm.toLowerCase().includes(search.toLowerCase()) ||
      inv.email?.toLowerCase().includes(search.toLowerCase()) ||
      inv.telegram?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "All" || inv.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const sampleCSV = `Name,Firm,Category,Email,Telegram,Sectors,Stage,Check Size,LinkedIn
Vitalik Buterin,Ethereum Foundation,Angel Investor,vitalik@ethereum.org,@vitalik,Layer 1; DeFi,Pre-seed,$100k - $500k,https://linkedin.com
Sandeep Nailwal,Polygon Ventures,VC Fund,sandeep@polygon.technology,@sandeep_p,DeFi; DePIN,Seed,$250k - $1M,https://linkedin.com`;

  return (
    <div className="space-y-6 pb-20 text-slate-900">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight font-heading">
            Investor Management & Directory Hub
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Manage registered platform investors & bulk ingest investor databases for credit unlocks.
          </p>
        </div>

        {/* Action Buttons for Directory */}
        {activeTab === "directory" && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Upload size={16} /> Bulk Import CSV / JSON
            </button>
            <button
              onClick={() => {
                setEditingInvestor({
                  name: "",
                  firm: "",
                  category: "VC Fund",
                  role: "Partner",
                  sectors: ["Web3", "DeFi"],
                  stage: "Seed",
                  check_size: "$50k - $250k",
                  email: "",
                  telegram: "",
                });
                setShowEditModal(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> Add Investor
            </button>
          </div>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "directory"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Database size={16} /> Verified Investor Database ({totalInvestorCount ? totalInvestorCount.toLocaleString() : directoryInvestors.length})
        </button>
        <button
          onClick={() => setActiveTab("platform")}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "platform"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <ShieldCheck size={16} /> Registered Platform Accounts ({platformInvestors.length})
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={activeTab === "directory" ? "Search Web3 investor name, firm, email, telegram..." : "Search registered user name, firm, email..."}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 outline-none shadow-xs"
          />
        </div>

        {activeTab === "directory" && (
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer shadow-xs"
          >
            <option value="All">All Categories</option>
            <option value="VC Fund">VC Funds</option>
            <option value="Angel Investor">Angel Investors</option>
            <option value="Accelerator">Accelerators</option>
            <option value="Incubator">Incubators</option>
            <option value="Family Office">Family Offices</option>
            <option value="Ecosystem Fund">Ecosystem Funds</option>
          </select>
        )}
      </div>

      {/* Live Pipeline Telemetry Bar */}
      {activeTab === "directory" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Loaded <strong className="text-slate-900">{filteredDirectory.length}</strong> of{" "}
              <strong className="text-slate-900">{totalInvestorCount ? totalInvestorCount.toLocaleString() : directoryInvestors.length}</strong> verified investors
            </span>
          </div>
          {totalInvestorCount && directoryInvestors.length < totalInvestorCount && (
            <button
              onClick={() => {
                const nextLimit = currentLimit + 1000;
                setCurrentLimit(nextLimit);
                fetchDirectoryInvestors(nextLimit);
              }}
              disabled={loadingDirectory}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              {loadingDirectory ? <Activity size={12} className="animate-spin text-white" /> : <Plus size={12} />}
              Load 1,000 More Records
            </button>
          )}
        </div>
      )}

      {/* VIEW 1: WEB3 INVESTOR DATABASE */}
      {activeTab === "directory" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          {loadingDirectory ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Activity size={32} className="animate-spin text-slate-900" />
              <p className="text-xs font-mono font-bold text-slate-400">Loading Web3 investor database...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Investor / Firm</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Contact Details</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Check Size</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Warm Bridges</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDirectory.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 border border-purple-200 flex items-center justify-center font-black text-sm shrink-0">
                            {inv.name?.charAt(0) || "I"}
                          </div>
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">{inv.name}</div>
                            <div className="text-xs text-slate-500 font-medium">{inv.firm} • {inv.role || "Partner"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-wide border border-slate-200">
                          {inv.category || "VC Fund"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5 text-xs font-mono">
                          {inv.email && <div className="text-slate-700 font-bold">✉️ {inv.email}</div>}
                          {inv.telegram && <div className="text-sky-600 font-bold">✈️ {inv.telegram}</div>}
                          {!inv.email && !inv.telegram && <span className="text-slate-400 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-slate-900">
                        {inv.check_size || "$100k"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold border border-emerald-200/60">
                          🤝 {inv.know_count || 0} Intros
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingInvestor(inv);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                            title="Edit Investor"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteInvestor(inv.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Investor"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredDirectory.length === 0 && !loadingDirectory && (
            <div className="text-center py-16 text-slate-400 text-sm font-medium">
              No Web3 investor profiles found in dataset. Use the "Bulk Import CSV / JSON" button above to populate your database!
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: REGISTERED PLATFORM USERS */}
      {activeTab === "platform" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          {loadingPlatform ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Activity size={32} className="animate-spin text-slate-900" />
              <p className="text-xs font-mono font-bold text-slate-400">Loading registered platform accounts...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Investor Account</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Firm / Entity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Approval Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Action Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {platformInvestors.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-black">
                            {inv.full_name?.charAt(0) || "I"}
                          </div>
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">{inv.full_name || "Institutional Investor"}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{inv.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-extrabold text-slate-900">
                        {inv.company_name || inv.firm_name || "Angel / Independent"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black font-mono px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                          inv.is_approved 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {inv.is_approved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {inv.is_approved ? "APPROVED VERIFIED" : "PENDING REVIEW"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleApproval(inv.id, inv.is_approved)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                            inv.is_approved
                              ? "bg-slate-100 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600"
                              : "bg-slate-900 text-white border-slate-900 shadow-xs hover:bg-emerald-600"
                          }`}
                        >
                          {inv.is_approved ? "Revoke Access" : "Approve Investor"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-6 relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Upload className="text-purple-600" size={24} />
                <h3 className="text-xl font-black text-slate-900">Bulk Ingest Investors Dataset</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Format Selector */}
            <div className="flex items-center gap-4">
              <label className="text-xs font-black text-slate-700">Data Format:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImportFormat("csv")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    importFormat === "csv" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  CSV Format
                </button>
                <button
                  type="button"
                  onClick={() => setImportFormat("json")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    importFormat === "json" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  JSON Format
                </button>
              </div>
            </div>

            {/* File Upload Button */}
            <div className="border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-all rounded-2xl p-6 text-center cursor-pointer relative group">
              <input
                type="file"
                accept=".csv,.json,.txt,.tsv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const content = event.target?.result as string;
                    if (content) {
                      setImportText(content);
                      if (file.name.endsWith('.json')) {
                        setImportFormat('json');
                      } else {
                        setImportFormat('csv');
                      }
                    }
                  };
                  reader.readAsText(file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm border border-purple-100 group-hover:scale-110 transition-transform">
                  <Upload size={24} />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Click to Upload your .CSV or .JSON File</span>
                  <span className="text-[10px] font-bold text-purple-600 block mt-0.5">Supports Excel .csv exports with 3,000+ rows</span>
                </div>
              </div>
            </div>

            {/* Template Sample */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-slate-500 font-mono">Sample CSV Structure Header</span>
                <button
                  onClick={() => setImportText(sampleCSV)}
                  className="text-xs font-extrabold text-purple-600 hover:underline"
                >
                  Load Sample Data
                </button>
              </div>
              <pre className="text-[10px] font-mono text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap">
                {importFormat === "csv" 
                  ? "Name,Firm,Category,Email,Telegram,Sectors,Stage,Check Size,LinkedIn" 
                  : `[\n  { "name": "Investor", "firm": "Fund", "email": "a@vc.com", "telegram": "@tg" }\n]`}
              </pre>
            </div>

            {/* Input Textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-700">
                  File Data Preview / Direct Paste:
                </label>
                {importText && (
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    {importText.split(/\r?\n/).length - 1} rows detected
                  </span>
                )}
              </div>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                rows={6}
                placeholder={importFormat === "csv" ? "Uploaded file text will appear here (or paste CSV here)..." : "Paste JSON array here..."}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            {importStatus && (
              <div className="p-3 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 flex items-center gap-2">
                <Activity size={16} className="animate-spin" />
                {importStatus}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleParseAndImport}
                disabled={importing}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {importing ? <Activity size={16} className="animate-spin" /> : <Send size={16} />}
                Import Dataset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT INVESTOR MODAL */}
      {showEditModal && editingInvestor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveInvestor} className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-4 relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900">
                {editingInvestor.id ? "Edit Investor Profile" : "Add New Web3 Investor"}
              </h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Investor Name *</label>
                <input
                  required
                  value={editingInvestor.name || ""}
                  onChange={e => setEditingInvestor({ ...editingInvestor, name: e.target.value })}
                  placeholder="e.g. Marc Andreessen"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Firm / Entity *</label>
                <input
                  required
                  value={editingInvestor.firm || ""}
                  onChange={e => setEditingInvestor({ ...editingInvestor, firm: e.target.value })}
                  placeholder="e.g. a16z crypto"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Category</label>
                <select
                  value={editingInvestor.category || "VC Fund"}
                  onChange={e => setEditingInvestor({ ...editingInvestor, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="VC Fund">VC Fund</option>
                  <option value="Angel Investor">Angel Investor</option>
                  <option value="Accelerator">Accelerator</option>
                  <option value="Incubator">Incubator</option>
                  <option value="Family Office">Family Office</option>
                  <option value="Ecosystem Fund">Ecosystem Fund</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Check Size</label>
                <input
                  value={editingInvestor.check_size || "$100k"}
                  onChange={e => setEditingInvestor({ ...editingInvestor, check_size: e.target.value })}
                  placeholder="e.g. $100k - $500k"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingInvestor.email || ""}
                  onChange={e => setEditingInvestor({ ...editingInvestor, email: e.target.value })}
                  placeholder="investor@vc.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Telegram Handle</label>
                <input
                  value={editingInvestor.telegram || ""}
                  onChange={e => setEditingInvestor({ ...editingInvestor, telegram: e.target.value })}
                  placeholder="@handle"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">Sectors (Comma Separated)</label>
              <input
                value={Array.isArray(editingInvestor.sectors) ? editingInvestor.sectors.join(", ") : editingInvestor.sectors || ""}
                onChange={e => setEditingInvestor({ ...editingInvestor, sectors: e.target.value.split(",").map(s => s.trim()) })}
                placeholder="e.g. DeFi, Layer 1, AI, DePIN"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xs"
              >
                Save Investor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
