import React, { useEffect, useState } from "react";
import { 
  Rocket, Clock, Link as LinkIcon, DollarSign, Calendar as CalendarIcon, Trophy, Plus, Trash2, 
  Activity, X, Save, ExternalLink, Star, Edit, Search, Sparkles, 
  CheckCircle2, AlertCircle, ArrowUpRight, ShieldCheck, Flame, ArrowRight, ArrowLeft
} from "lucide-react";
import { query, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, writeBatch, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { LaunchItem, SponsorItem } from "../../types/launch";
import { projects } from "../../data/projects";
import { SEEDED_LAUNCHES, SEEDED_DEAL_FLOW } from "../../data/dealFlowData";

const defaultSampleLaunches: LaunchItem[] = projects.slice(0, 8).map((p, idx) => {
  const dates = [
    new Date().toISOString().split("T")[0],
    new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0],
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
  ];
  const tiers: ('standard' | 'premium' | 'spotlight')[] = ['premium', 'spotlight', 'standard', 'standard', 'premium'];
  const tier = tiers[idx % tiers.length];

  return {
    id: `launch_${p.id || idx}`,
    slug: p.id || `project-${idx}`,
    founder_id: `founder_${idx}`,
    founder_name: "Web3 Founder",
    company_name: p.name,
    tagline: p.oneLiner || p.fullDescription.substring(0, 68),
    description: p.fullDescription,
    website_url: p.links?.website || "https://raisequity.com",
    logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    screenshots: [],
    category: p.sector || p.stage || "Web3",
    twitter_handle: p.links?.twitter || "",
    maker_comment: "Built with passion for the Web3 ecosystem! Check us out and share feedback.",
    launch_tier: tier,
    scheduled_date: dates[idx % dates.length],
    status: idx === 0 ? "launched" : "queue",
    badgeVerified: idx % 2 === 0,
    votes_count: (idx * 7) + 5,
    created_at: new Date(Date.now() - 86400000 * idx).toISOString(),
    is_winner: idx === 0,
  };
});

export default function AdminLaunches() {
  const [launches, setLaunches] = useState<LaunchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'launches' | 'sponsors'>('launches');
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({
    company_name: '',
    tagline: '',
    url: '',
    logo_url: '',
    banner_cta: 'Explore Platform →',
    duration_days: 7,
  });

  const fetchSponsors = async () => {
    setLoadingSponsors(true);
    try {
      const snap = await getDocs(query(collection(db, "sponsors"), limit(200)));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as SponsorItem[];
      setSponsors(data);
    } catch (err) {
      console.warn("Error fetching sponsors:", err);
    } finally {
      setLoadingSponsors(false);
    }
  };

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorForm.company_name || !sponsorForm.url) return;
    try {
      const sId = `sponsor_${Date.now()}`;
      const now = new Date();
      const expires = new Date(now.getTime() + (sponsorForm.duration_days || 7) * 86400000);
      const newSponsor: SponsorItem = {
        id: sId,
        company_name: sponsorForm.company_name.trim(),
        tagline: sponsorForm.tagline.trim(),
        url: sponsorForm.url.trim(),
        logo_url: sponsorForm.logo_url.trim(),
        banner_cta: sponsorForm.banner_cta.trim() || 'Explore Platform →',
        active: true,
        starts_at: now.toISOString(),
        expires_at: expires.toISOString(),
        created_at: now.toISOString(),
      };

      await setDoc(doc(db, "sponsors", sId), newSponsor);
      setSponsors(prev => [newSponsor, ...prev]);
      setShowSponsorModal(false);
      setSponsorForm({
        company_name: '',
        tagline: '',
        url: '',
        logo_url: '',
        banner_cta: 'Explore Platform →',
        duration_days: 7,
      });
      setSyncFeedback({ type: 'success', message: '1-Week Featured Sponsor successfully published sitewide!' });
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      setSyncFeedback({ type: 'error', message: 'Failed to create sponsor: ' + err.message });
    }
  };

  const handleToggleSponsor = async (sponsor: SponsorItem) => {
    try {
      const updated = !sponsor.active;
      await updateDoc(doc(db, "sponsors", sponsor.id), { active: updated });
      setSponsors(prev => prev.map(s => s.id === sponsor.id ? { ...s, active: updated } : s));
    } catch (err: any) {
      console.error("Error toggling sponsor:", err);
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    try {
      await deleteDoc(doc(db, "sponsors", id));
      setSponsors(prev => prev.filter(s => s.id !== id));
      setSyncFeedback({ type: 'success', message: 'Sponsor deleted successfully.' });
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch (err: any) {
      console.error("Error deleting sponsor:", err);
    }
  };


  const [form, setForm] = useState<Partial<LaunchItem>>({
    id: "",
    company_name: "",
    tagline: "",
    description: "",
    website_url: "",
    logo_url: "",
    category: "Web3",
    launch_tier: "premium",
    scheduled_date: new Date().toISOString().split("T")[0],
    status: "queue",
    votes_count: 1,
    badgeVerified: false,
    is_winner: false,
    founder_name: "",
    twitter_handle: "",
    maker_comment: ""
  });

  const categories = ["All", "Web3", "AI", "SaaS", "Infrastructure", "DeFi", "Gaming"];
  const tiers = ["All", "standard", "premium", "spotlight"];

  useEffect(() => {
    fetchLaunches();
    fetchSponsors();
  }, []);

  const fetchLaunches = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "launches"), limit(200)));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as LaunchItem[];
      setLaunches(data);
    } catch (err) {
      console.error("Error fetching launches:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync98Deals = async () => {
    setSeeding(true);
    setSyncFeedback({ type: 'success', message: 'Syncing 98 verified projects into Firestore deal_flow & launches...' });
    try {
      // 1. Batch write to launches
      const batchSize = 100;
      for (let i = 0; i < SEEDED_LAUNCHES.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = SEEDED_LAUNCHES.slice(i, i + batchSize);
        chunk.forEach((l: any) => {
          batch.set(doc(db, "launches", l.id), l, { merge: true });
        });
        await batch.commit();
      }

      // 2. Batch write to deal_flow
      for (let i = 0; i < SEEDED_DEAL_FLOW.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = SEEDED_DEAL_FLOW.slice(i, i + batchSize);
        chunk.forEach((d: any) => {
          batch.set(doc(db, "deal_flow", d.id), d, { merge: true });
        });
        await batch.commit();
      }

      await fetchLaunches();
      setSyncFeedback({ type: 'success', message: `Successfully synced ${SEEDED_LAUNCHES.length} verified projects to Firestore!` });
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (err: any) {
      setSyncFeedback({ type: 'error', message: "Sync error: " + (err.message || 'Failed') });
    } finally {
      setSeeding(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lId = form.id || `launch_${Date.now()}`;
      const payload: LaunchItem = {
        id: lId,
        slug: form.slug || form.company_name?.toLowerCase().replace(/[^a-z0-9]/g, "-") || `launch-${Date.now()}`,
        founder_id: form.founder_id || "admin_manual",
        founder_name: form.founder_name || "Admin",
        company_name: form.company_name || "",
        tagline: form.tagline || "",
        description: form.description || "",
        website_url: form.website_url || "",
        logo_url: form.logo_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
        screenshots: form.screenshots || [],
        category: form.category || "Web3",
        twitter_handle: form.twitter_handle || "",
        maker_comment: form.maker_comment || "",
        launch_tier: form.launch_tier || "standard",
        scheduled_date: form.scheduled_date || new Date().toISOString().split("T")[0],
        status: form.status || "launched",
        badgeVerified: !!form.badgeVerified,
        votes_count: form.votes_count ? Number(form.votes_count) : 1,
        created_at: form.created_at || new Date().toISOString(),
        is_winner: !!form.is_winner,
      };

      await setDoc(doc(db, "launches", lId), payload);
      setLaunches([payload, ...launches.filter(l => l.id !== lId)]);
      setShowForm(false);
      resetForm();
      setSyncFeedback({ type: 'success', message: 'Project launch saved successfully!' });
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      setSyncFeedback({ type: 'error', message: "Save error: " + (err.message || 'Failed') });
    }
  };

  const handleEdit = (item: LaunchItem) => {
    setForm(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 4000);
      return;
    }
    setConfirmDeleteId(null);
    try {
      await deleteDoc(doc(db, "launches", id));
      setLaunches(launches.filter(l => l.id !== id));
      setSyncFeedback({ type: 'success', message: 'Launch removed.' });
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch (err: any) {
      setSyncFeedback({ type: 'error', message: "Delete error: " + (err.message || 'Failed') });
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const nextStatus = current === "launched" ? "queue" : "launched";
    try {
      await updateDoc(doc(db, "launches", id), { status: nextStatus });
      setLaunches(launches.map(l => l.id === id ? { ...l, status: nextStatus as any } : l));
    } catch (err: any) {
      setSyncFeedback({ type: 'error', message: "Status toggle error: " + err.message });
    }
  };

  const toggleWinner = async (id: string, current?: boolean) => {
    try {
      await updateDoc(doc(db, "launches", id), { is_winner: !current });
      setLaunches(launches.map(l => l.id === id ? { ...l, is_winner: !current } : l));
    } catch (err: any) {
      setSyncFeedback({ type: 'error', message: "Winner toggle error: " + err.message });
    }
  };

  const toggleBadgeVerified = async (id: string, current?: boolean) => {
    try {
      await updateDoc(doc(db, "launches", id), { badgeVerified: !current });
      setLaunches(launches.map(l => l.id === id ? { ...l, badgeVerified: !current } : l));
    } catch (err: any) {
      setSyncFeedback({ type: 'error', message: "Verification toggle error: " + err.message });
    }
  };

  const shiftLaunchDate = async (id: string, currentDate: string, daysShift: number) => {
    const curr = new Date(currentDate || Date.now());
    curr.setDate(curr.getDate() + daysShift);
    const newDate = curr.toISOString().split("T")[0];
    try {
      await updateDoc(doc(db, "launches", id), { scheduled_date: newDate });
      setLaunches(launches.map(l => l.id === id ? { ...l, scheduled_date: newDate } : l));
    } catch (err: any) {
      setSyncFeedback({ type: 'error', message: "Date shift error: " + err.message });
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      company_name: "",
      tagline: "",
      description: "",
      website_url: "",
      logo_url: "",
      category: "Web3",
      launch_tier: "premium",
      scheduled_date: new Date().toISOString().split("T")[0],
      status: "queue",
      votes_count: 1,
      badgeVerified: false,
      is_winner: false,
      founder_name: "",
      twitter_handle: "",
      maker_comment: ""
    });
  };

  const calculateRevenue = () => {
    return launches.reduce((acc, l) => {
      if (l.launch_tier === "premium") return acc + 11;
      if (l.launch_tier === "spotlight") return acc + 39;
      return acc;
    }, 0);
  };

  // Find Today's Launch Project (or closest upcoming)
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLaunch = launches.find(l => l.scheduled_date === todayStr || l.status === "launched") || launches[0];

  const filteredLaunches = launches.filter(l => {
    const matchesSearch = !search || l.company_name?.toLowerCase().includes(search.toLowerCase()) || l.tagline?.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === "All" || l.launch_tier === tierFilter;
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Activity size={32} className="animate-spin text-black" />
        <p className="text-xs font-mono font-bold text-gray-400">Loading Directory Launches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[32px] font-black text-black tracking-tight font-heading">Launch Directory &amp; Daily Queue</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200">1 Launch / Day Slot System</span>
          </div>
          <p className="text-gray-500 font-medium mt-1">Manage project launches, daily slot queues, 1-week sponsor spots, and revenue monetization.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeAdminTab === 'launches' ? (
            <>
              <button
                onClick={handleSync98Deals}
                disabled={seeding}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles size={16} /> {seeding ? "Syncing..." : `⚡ Sync 98 CSV Deals`}
              </button>
              <button
                onClick={() => {
                  if (showForm) resetForm();
                  setShowForm(!showForm);
                }}
                className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-gray-800 shadow-md transition-all cursor-pointer"
              >
                {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Submission"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowSponsorModal(true)}
              className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-gray-800 shadow-md transition-all cursor-pointer"
            >
              <Plus size={16} /> Add 1-Week Sponsor Spot
            </button>
          )}
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveAdminTab('launches')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeAdminTab === 'launches'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-500 hover:text-black hover:bg-gray-100'
          }`}
        >
          🚀 All Launches &amp; Directory Queue ({launches.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('sponsors')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeAdminTab === 'sponsors'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-500 hover:text-black hover:bg-gray-100'
          }`}
        >
          📢 1-Week Featured Sponsors &amp; Ads ({sponsors.length})
        </button>
      </div>

      {/* Sync Feedback Notification Banner */}
      {syncFeedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between ${
          syncFeedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <span>{syncFeedback.message}</span>
          <button onClick={() => setSyncFeedback(null)} className="text-slate-400 hover:text-slate-700 ml-4">✕</button>
        </div>
      )}

      {/* CONDITIONAL TAB CONTENT */}
      {activeAdminTab === 'launches' ? (
        <div className="space-y-8">
          {/* METRICS & REVENUE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--color-clay-border,#e5e2dc)] p-6 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider">Directory Earnings</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><DollarSign size={18} /></div>
          </div>
          <div className="text-3xl font-black text-black font-mono">${calculateRevenue()} USD</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">From $11 Premium & $39 Spotlight launches</p>
        </div>

        <div className="bg-white border border-[var(--color-clay-border,#e5e2dc)] p-6 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider">Total Submissions</span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><Rocket size={18} /></div>
          </div>
          <div className="text-3xl font-black text-black font-mono">{launches.length} Projects</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">{launches.filter(l => l.launch_tier !== 'standard').length} Paid Priority Submissions</p>
        </div>

        <div className="bg-white border border-[var(--color-clay-border,#e5e2dc)] p-6 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider">Today's Launch Status</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Flame size={18} /></div>
          </div>
          <div className="text-xl font-black text-black truncate">{todayLaunch?.company_name || "No Launch Scheduled"}</div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1 uppercase font-mono">{todayLaunch ? (todayLaunch.status === "launched" ? "LIVE ON DIRECTORY" : `SCHEDULED FOR ${todayLaunch.scheduled_date || "TODAY"}`) : "READY FOR LAUNCH"}</p>
        </div>

        <div className="bg-white border border-[var(--color-clay-border,#e5e2dc)] p-6 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider">Community Votes</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Trophy size={18} /></div>
          </div>
          <div className="text-3xl font-black text-black font-mono">{launches.reduce((acc, l) => acc + (l.votes_count || 0), 0)} Upvotes</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Across all directory projects</p>
        </div>
      </div>

      {/* TODAY'S FEATURED LAUNCH SPOTLIGHT BANNER */}
      {todayLaunch ? (
        <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white rounded-3xl p-8 border border-gray-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black px-3 py-1 rounded-full uppercase border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            TODAY'S FEATURED LAUNCH (1 PROJECT / DAY RULE)
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-2">
            <img src={todayLaunch.logo_url} alt={todayLaunch.company_name} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white">{todayLaunch.company_name}</h2>
                <span className={`text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full uppercase ${
                  todayLaunch.launch_tier === "spotlight" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" :
                  todayLaunch.launch_tier === "premium" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                  "bg-gray-800 text-gray-300 border border-gray-700"
                }`}>
                  {todayLaunch.launch_tier} TIER
                </span>
              </div>
              <p className="text-sm text-gray-300 max-w-2xl font-medium">{todayLaunch.tagline}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 font-mono pt-1">
                <span>Maker: <strong className="text-white">{todayLaunch.founder_name}</strong></span>
                <span>•</span>
                <span>Scheduled Date: <strong className="text-amber-400">{todayLaunch.scheduled_date}</strong></span>
                <span>•</span>
                <span>Upvotes: <strong className="text-emerald-400">{todayLaunch.votes_count}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => toggleStatus(todayLaunch.id, todayLaunch.status)}
                className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                  todayLaunch.status === "launched" 
                    ? "bg-emerald-500 text-black hover:bg-emerald-400" 
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                <CheckCircle2 size={16} /> {todayLaunch.status === "launched" ? "Published Live" : "Publish Today"}
              </button>

              <button
                onClick={() => toggleWinner(todayLaunch.id, todayLaunch.is_winner)}
                className={`px-4 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 border ${
                  todayLaunch.is_winner 
                    ? "bg-amber-400 text-black border-amber-400" 
                    : "bg-transparent text-white border-gray-700 hover:border-amber-400"
                }`}
              >
                <Trophy size={16} /> {todayLaunch.is_winner ? "Winner Badge" : "Make Winner"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white rounded-3xl p-8 border border-gray-800 shadow-lg text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Rocket size={24} />
          </div>
          <h2 className="text-xl font-black font-heading text-white">No Launches In Queue Yet</h2>
          <p className="text-xs text-gray-400 max-w-md">No projects have been submitted to the launch directory yet. Click below to add your project to test the daily launch queue slot system.</p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="mt-2 flex items-center gap-2 bg-emerald-500 text-black px-5 py-2.5 rounded-2xl font-black text-xs hover:bg-emerald-400 transition-all shadow-md"
          >
            <Plus size={16} /> Add Your First Launch Submission
          </button>
        </div>
      )}

      {/* SUBMISSION / EDIT FORM */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] p-8 space-y-6 shadow-md">
          <h3 className="text-lg font-black text-black">{form.id ? "Edit Launch Submission" : "Add New Launch Submission"}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Company / Product Name *</label>
              <input required value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="e.g. Raisequity" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Founder Name *</label>
              <input required value={form.founder_name} onChange={e => setForm({ ...form, founder_name: e.target.value })} placeholder="e.g. Satoshi" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Website URL *</label>
              <input required value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Launch Tier</label>
              <select value={form.launch_tier} onChange={e => setForm({ ...form, launch_tier: e.target.value as any })} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black">
                <option value="standard">Standard ($0 Free Queue)</option>
                <option value="premium">Premium ($11 Skip Queue)</option>
                <option value="spotlight">Spotlight ($39 Instant + SEO)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Scheduled Launch Date (1/Day)</label>
              <input type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Category</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Web3, AI, SaaS" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Tagline (Max 70 chars, no period)</label>
            <input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="e.g. Institutional directory and liquidity layer for Web3 builders" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Full description..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 text-xs text-black cursor-pointer font-bold bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-200">
              <input type="checkbox" checked={form.badgeVerified} onChange={e => setForm({ ...form, badgeVerified: e.target.checked })} className="rounded text-black focus:ring-0" />
              <ShieldCheck size={16} className={form.badgeVerified ? "text-emerald-600" : "text-gray-400"} />
              <span>Backlink Verified</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-black cursor-pointer font-bold bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-200">
              <input type="checkbox" checked={form.is_winner} onChange={e => setForm({ ...form, is_winner: e.target.checked })} className="rounded text-black focus:ring-0" />
              <Trophy size={16} className={form.is_winner ? "text-amber-500" : "text-gray-400"} />
              <span>Launch of the Week Winner</span>
            </label>

            <div className="flex-1 text-right">
              <button type="submit" className="bg-black text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-gray-800 shadow-md transition-all">
                <Save size={16} className="inline mr-2" /> {form.id ? "Update Submission" : "Save Submission"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* FILTERS AND SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search project or tagline..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
            {tiers.map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase font-mono ${
                  tierFilter === t ? "bg-black text-white shadow-2xs" : "text-gray-600 hover:text-black"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
            {["All", "queue", "launched"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase font-mono ${
                  statusFilter === s ? "bg-black text-white shadow-2xs" : "text-gray-600 hover:text-black"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LAUNCHES TABLE */}
      <div className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-clay-border,#e5e2dc)] bg-gray-50/50 font-mono text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Product / Maker</th>
                <th className="px-6 py-4">Tier & Price</th>
                <th className="px-6 py-4">Slot Date (1/Day)</th>
                <th className="px-6 py-4">Votes</th>
                <th className="px-6 py-4">Backlink</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLaunches.map(l => (
                <tr key={l.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={l.logo_url} alt={l.company_name} className="w-10 h-10 rounded-2xl object-cover border border-gray-200" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-black">{l.company_name}</span>
                          {l.is_winner && (
                            <span className="text-[10px] font-black font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Trophy size={10} /> WINNER
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 max-w-sm line-clamp-1">{l.tagline}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black font-mono px-2.5 py-1 rounded-full uppercase border ${
                      l.launch_tier === "spotlight" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      l.launch_tier === "premium" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {l.launch_tier === "spotlight" ? "$39 SPOTLIGHT" : l.launch_tier === "premium" ? "$11 PREMIUM" : "FREE QUEUE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-gray-800">
                    <div className="flex items-center gap-1.5">
                      <span>{l.scheduled_date || "Unscheduled"}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => shiftLaunchDate(l.id, l.scheduled_date, -1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600" title="Move earlier by 1 day">
                          <ArrowLeft size={12} />
                        </button>
                        <button onClick={() => shiftLaunchDate(l.id, l.scheduled_date, 1)} className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600" title="Delay by 1 day (if someone paid instant launch)">
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-black text-black">
                    🔥 {l.votes_count || 1}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleBadgeVerified(l.id, l.badgeVerified)}
                      className={`text-[10px] font-black font-mono px-2.5 py-1 rounded-full border ${
                        l.badgeVerified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {l.badgeVerified ? "VERIFIED" : "PENDING"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(l.id, l.status)}
                      className={`text-[10px] font-black font-mono px-2.5 py-1 rounded-full border ${
                        l.status === "launched" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {l.status === "launched" ? "PUBLISHED" : "QUEUED"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(l)} className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100" title="Edit Launch">
                        <Edit size={16} />
                      </button>
                      {l.website_url && (
                        <a href={l.website_url} target="_blank" rel="noreferrer" className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button onClick={() => handleDelete(l.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50" title="Delete Launch">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLaunches.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">No launch submissions found</div>
        )}
      </div>
        </div>
      ) : (
        /* SPONSORS MANAGEMENT TAB */
        <div className="space-y-6">
          {/* Sponsors Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[var(--color-clay-border,#e5e2dc)] p-6 rounded-3xl shadow-xs">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 block mb-1">
                Active Sitewide Sponsors
              </span>
              <div className="text-3xl font-black text-black font-mono">
                {sponsors.filter(s => s.active).length} Active
              </div>
              <p className="text-[11px] text-gray-500 font-medium mt-1">Displayed on launch detail &amp; directory pages</p>
            </div>

            <div className="bg-white border border-[var(--color-clay-border,#e5e2dc)] p-6 rounded-3xl shadow-xs">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 block mb-1">
                1-Week Sponsor Window
              </span>
              <div className="text-3xl font-black text-black font-mono">
                7 Days Duration
              </div>
              <p className="text-[11px] text-gray-500 font-medium mt-1">Automatic expiration calculation</p>
            </div>

            <div className="bg-white border border-[var(--color-clay-border,#e5e2dc)] p-6 rounded-3xl shadow-xs">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 block mb-1">
                Telegram Lead Inquiries
              </span>
              <div className="text-base font-black text-black font-mono flex items-center gap-2 mt-2">
                <a
                  href="https://t.me/akash_kumar107"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  @akash_kumar107 on TG →
                </a>
              </div>
              <p className="text-[11px] text-gray-500 font-medium mt-2">Where sponsors book their spot</p>
            </div>
          </div>

          {/* Sponsors Table */}
          <div className="bg-white rounded-3xl border border-[var(--color-clay-border,#e5e2dc)] overflow-hidden shadow-xs">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-black font-heading">Active &amp; Past 1-Week Sponsors</h3>
                <p className="text-xs text-gray-500">Enable or remove sponsor banners appearing sitewide across project profiles.</p>
              </div>
              <button
                onClick={() => setShowSponsorModal(true)}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Sponsor
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Sponsor Brand</th>
                    <th className="px-6 py-4">Promo Copy &amp; URL</th>
                    <th className="px-6 py-4">1-Week Window</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sponsors.map(s => {
                    const expires = new Date(s.expires_at).getTime();
                    const now = Date.now();
                    const daysLeft = Math.max(0, Math.ceil((expires - now) / 86400000));
                    const isExpired = expires < now;

                    return (
                      <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {s.logo_url ? (
                              <img src={s.logo_url} alt="" className="w-8 h-8 rounded-xl object-cover border border-gray-200" />
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0070F3] font-black flex items-center justify-center text-xs border border-blue-200">
                                {s.company_name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <strong className="text-sm font-black text-black font-sans block">{s.company_name}</strong>
                              <span className="text-[10px] text-gray-400">{s.banner_cta || 'Explore Platform'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-sm">
                          <p className="font-sans text-xs text-gray-700 truncate">{s.tagline}</p>
                          <a href={s.url} target="_blank" rel="noreferrer" className="text-[11px] text-[#0070F3] hover:underline flex items-center gap-1 mt-0.5 truncate">
                            {s.url} <ExternalLink size={11} />
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[11px] text-gray-800 font-bold">
                            {new Date(s.starts_at).toLocaleDateString()} → {new Date(s.expires_at).toLocaleDateString()}
                          </div>
                          <span className={`text-[10px] ${daysLeft > 0 && s.active ? 'text-emerald-600 font-black' : 'text-gray-400'}`}>
                            {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleSponsor(s)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all cursor-pointer ${
                              s.active && !isExpired
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}
                          >
                            {s.active && !isExpired ? 'ACTIVE' : 'PAUSED'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a href={s.url} target="_blank" rel="noreferrer" className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100" title="Visit URL">
                              <ExternalLink size={16} />
                            </a>
                            <button
                              onClick={() => handleDeleteSponsor(s.id)}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete Sponsor"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {sponsors.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-xs font-mono">
                No sponsors created yet. Click "Add 1-Week Sponsor Spot" to activate a sponsor sitewide!
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE SPONSOR MODAL */}
      {showSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-black text-lg text-black">Add 1-Week Sponsor Spot</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">Sitewide sponsor banner running for 7 days</p>
              </div>
              <button onClick={() => setShowSponsorModal(false)} className="text-gray-400 hover:text-black font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleCreateSponsor} className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Company / Brand Name *</label>
                <input
                  required
                  placeholder="e.g. HireInCrypto"
                  value={sponsorForm.company_name}
                  onChange={e => setSponsorForm({ ...sponsorForm, company_name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Promo Tagline / Value Proposition *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. The premier Web3 hiring portal for crypto protocols & developers."
                  value={sponsorForm.tagline}
                  onChange={e => setSponsorForm({ ...sponsorForm, tagline: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-black outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Destination URL (Website / Landing Page) *</label>
                <input
                  required
                  placeholder="https://hireincrypto.com"
                  value={sponsorForm.url}
                  onChange={e => setSponsorForm({ ...sponsorForm, url: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-black outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Button CTA Text</label>
                  <input
                    placeholder="e.g. Explore Roles →"
                    value={sponsorForm.banner_cta}
                    onChange={e => setSponsorForm({ ...sponsorForm, banner_cta: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-black outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Logo / Banner URL (Optional)</label>
                  <input
                    placeholder="https://.../logo.png"
                    value={sponsorForm.logo_url}
                    onChange={e => setSponsorForm({ ...sponsorForm, logo_url: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-black outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800 space-y-1">
                <span className="font-bold block">1-Week Automatic Schedule:</span>
                <p>Starts immediately upon creation and runs active for 7 full days across all launch pages &amp; directories.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSponsorModal(false)}
                  className="px-4 py-2.5 text-gray-500 hover:text-black font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold shadow-md"
                >
                  Publish 1-Week Sponsor Spot →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
