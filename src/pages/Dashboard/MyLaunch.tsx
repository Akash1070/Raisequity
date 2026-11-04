import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Rocket, TrendingUp, Eye, ThumbsUp, CheckCircle2, AlertCircle, Edit3, Trash2, Globe, ExternalLink, ShieldCheck, Sparkles, Loader2, Save, X, Plus, Trophy, Zap, ArrowRight, Share2, Award, Check, FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFounderCompany } from '../../hooks/useFounderCompany';
import { getFounderLaunches, updateLaunch, deleteLaunch, createLaunch } from '../../lib/launches';
import { LaunchItem } from '../../types/launch';
import EmbedBadgeModal from '../../components/launch/EmbedBadgeModal';

export default function MyLaunch() {
  const { user } = useAuth();
  const { company } = useFounderCompany();
  const navigate = useNavigate();

  const [launches, setLaunches] = useState<LaunchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLaunch, setActiveLaunch] = useState<LaunchItem | null>(null);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    company_name: '',
    tagline: '',
    description: '',
    website_url: '',
    category: 'Tech',
    twitter_handle: '',
  });
  const [saving, setSaving] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [confirmDeleteLaunch, setConfirmDeleteLaunch] = useState(false);

  const fetchLaunches = async () => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getFounderLaunches(uid);
    setLaunches(data);
    if (data.length > 0) {
      setActiveLaunch(data[0]);
      setEditForm({
        company_name: data[0].company_name || '',
        tagline: data[0].tagline || '',
        description: data[0].description || '',
        website_url: data[0].website_url || '',
        category: data[0].category || 'Tech',
        twitter_handle: data[0].twitter_handle || '',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLaunches();
  }, [user]);

  const handleSaveEdit = async () => {
    if (!activeLaunch) return;
    setSaving(true);
    setActionError(null);
    const res = await updateLaunch(activeLaunch.id, editForm);
    if (res.success) {
      setActionSuccess('Launch details updated successfully!');
      setIsEditing(false);
      await fetchLaunches();
    } else {
      setActionError(res.error || 'Failed to update launch.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!activeLaunch) return;
    if (!confirmDeleteLaunch) {
      setConfirmDeleteLaunch(true);
      setTimeout(() => setConfirmDeleteLaunch(false), 4000);
      return;
    }
    setConfirmDeleteLaunch(false);
    setSaving(true);
    const res = await deleteLaunch(activeLaunch.id);
    if (res.success) {
      setActiveLaunch(null);
      await fetchLaunches();
      setActionSuccess('Launch deleted from directory.');
    } else {
      setActionError(res.error || 'Failed to delete launch.');
    }
    setSaving(false);
  };

  const handleQuickLaunchFromProfile = async () => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return;
    const comp = company as any;
    if (!comp?.company_name || !comp?.company_website) {
      navigate('/dashboard/launch/submit');
      return;
    }

    setSaving(true);
    setActionError(null);
    const founderName = (user as any)?.displayName || 'Founder';
    const res = await createLaunch(uid, founderName, {
      company_name: comp.company_name,
      tagline: comp.tagline || `${comp.company_name} — High-growth early stage project`,
      description: comp.description || `${comp.company_name} is accelerating development in Web3, AI, and SaaS.`,
      website_url: comp.company_website,
      logo_url: comp.logo_url || '',
      screenshots: comp.pitch_deck_url ? [comp.pitch_deck_url] : [],
      category: comp.sector || 'Web3',
      twitter_handle: comp.twitter_url ? comp.twitter_url.replace(/.*twitter\.com\//, '').replace(/.*x\.com\//, '') : '',
      maker_comment: 'Excited to launch our verified project on Raisequity!',
      launch_tier: 'standard',
      scheduled_date: 'Mon 24 Aug',
      target_keywords: [comp.sector || 'Web3', 'Seed Round', 'Institutional'],
    });

    if (res.success && res.launch) {
      setActionSuccess('Project published to directory successfully!');
      await fetchLaunches();
    } else {
      setActionError(res.error || 'Failed to publish project.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 rounded-[32px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <Loader2 size={32} className="animate-spin text-black dark:text-white" />
        <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-bold">Synchronizing directory telemetry...</span>
      </div>
    );
  }

  const compData = company as any;

  // ══════════════════════════════════════════════════════════
  // Case 1: Empty State (No Active Launch Created Yet)
  // High-Density Bento Grid with clear institutional value
  // ══════════════════════════════════════════════════════════
  if (!activeLaunch) {
    return (
      <div className="space-y-6 w-full">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={11} /> Directory Intelligence &amp; Analytics
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-black dark:text-white">
              My Launch &amp; Performance
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 max-w-2xl">
              Publish your startup on the Raisequity Launchpad to unlock guaranteed do-follow backlinks, community upvotes, and direct pipeline distribution to 180+ verified check-writers.
            </p>
          </div>

          <Link
            to="/dashboard/launch/submit"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus size={15} /> Submit New Launch
          </Link>
        </div>

        {/* ── MAIN EMPTY BENTO CARD ── */}
        <div className="relative rounded-[32px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-8 sm:p-12 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {/* Subtle Glow Accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-200/40 via-cyan-200/20 dark:from-emerald-900/15 dark:via-cyan-900/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
            {/* Center Animated Icon Container */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-white/5 border border-[#e8e6df] dark:border-white/10 flex items-center justify-center text-black dark:text-white shadow-xs">
                <Rocket size={36} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-mono text-[9px] font-black border-2 border-white dark:border-[#121316]">
                #42
              </div>
            </div>

            <span className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-[1.5px] text-emerald-600 dark:text-emerald-400 mb-2">
              • LAUNCHPAD COHORT #42 IS LIVE •
            </span>

            <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-black dark:text-white mb-3">
              Launch Your Product, Earn DR Backlinks &amp; Climb the Weekly Leaderboard
            </h2>

            <p className="text-neutral-600 dark:text-neutral-300 text-sm font-medium leading-relaxed mb-6 max-w-xl text-center">
              This isn't just another directory. Raisequity is built for one thing: <strong>getting your product seen and ranked everywhere that matters</strong>. 
              Plugging into our engine optimizes your product for <strong>GEO, AEO, and SEO</strong> so you show up across LLMs like ChatGPT, Claude, and Perplexity, as well as top search engines.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left mb-8 w-full max-w-xl">
              <div className="p-3 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200/80 dark:border-white/5 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <Sparkles size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>50+ Data Points Extracted:</strong> AI scans your website and instantly creates a fully optimized launch page.</span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200/80 dark:border-white/5 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <FileText size={15} className="text-[#0070F3] shrink-0 mt-0.5" />
                <span><strong>Auto Blog Article:</strong> Generates a high-quality article built to rank fast and drive high-intent organic traffic.</span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200/80 dark:border-white/5 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <Globe size={15} className="text-purple-500 shrink-0 mt-0.5" />
                <span><strong>High DR Backlinks:</strong> Permanent do-follow backlinks and llms.txt integration for domain authority.</span>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200/80 dark:border-white/5 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <Trophy size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Weekly Leaderboard:</strong> Live exposure to early adopters and our network of 180+ verified check-writers.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              {compData?.company_name ? (
                <button
                  onClick={handleQuickLaunchFromProfile}
                  disabled={saving}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_2px_12px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {saving ? <Loader2 size={16} className="animate-spin text-black" /> : <Sparkles size={16} />}
                  1-Click Launch "{compData.company_name}"
                </button>
              ) : null}

              <Link
                to="/dashboard/launch/submit"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Rocket size={15} /> Submit Custom Launch →
              </Link>
            </div>
          </div>
        </div>

        {/* ── BENTO 3-FEATURE BENEFIT PILLARS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Dofollow Backlinks */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/20 dark:hover:border-white/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-[#e8e6df] dark:border-white/10 flex items-center justify-center text-black dark:text-white">
                  <Globe size={18} className="text-blue-500" />
                </div>
                <span className="font-mono text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  PERMANENT DOFOLLOW
                </span>
              </div>
              <h3 className="text-base font-heading font-black text-black dark:text-white mb-1.5">
                Permanent SEO Authority
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                Receive authoritative do-follow backlinks and AI-search indexing (<code className="font-mono text-[10px] bg-neutral-100 dark:bg-white/5 px-1 py-0.5 rounded">llms.txt</code>) to boost your technical search ranking.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#e8e6df] dark:border-white/10 flex items-center gap-2 text-[11px] font-mono font-bold text-neutral-400">
              <Check size={13} className="text-emerald-500" /> Verified Domain Routing
            </div>
          </div>

          {/* Card 2: Weekly Cohort Podium */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/20 dark:hover:border-white/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-[#e8e6df] dark:border-white/10 flex items-center justify-center text-black dark:text-white">
                  <Trophy size={18} className="text-amber-500" />
                </div>
                <span className="font-mono text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  WEEKLY PODIUM
                </span>
              </div>
              <h3 className="text-base font-heading font-black text-black dark:text-white mb-1.5">
                Front-Run Spotlight
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                Rank among the Top 3 startups of the week to earn the Gold, Silver, or Bronze podium placement featured across our entire investor terminal.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#e8e6df] dark:border-white/10 flex items-center gap-2 text-[11px] font-mono font-bold text-neutral-400">
              <Check size={13} className="text-emerald-500" /> Real-Time Live Upvoting
            </div>
          </div>

          {/* Card 3: Investor Diligence Eyes */}
          <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/20 dark:hover:border-white/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-[#e8e6df] dark:border-white/10 flex items-center justify-center text-black dark:text-white">
                  <Zap size={18} className="text-purple-500" />
                </div>
                <span className="font-mono text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  180+ CHECK-WRITERS
                </span>
              </div>
              <h3 className="text-base font-heading font-black text-black dark:text-white mb-1.5">
                Deterministic Allocation
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed">
                Direct integration with our HireInCrypto split-pane diligence suite, allowing tier-1 VCs and angels to execute 1-Click SAFE intros immediately.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#e8e6df] dark:border-white/10 flex items-center gap-2 text-[11px] font-mono font-bold text-neutral-400">
              <Check size={13} className="text-emerald-500" /> 30-Day Guaranteed SLA
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // Case 2: Active Launch Project Overview, Telemetry & Management
  // Redesigned with Clean Light/Dark Theme & Bento Architecture
  // ══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-black dark:text-white">
              {activeLaunch.company_name}
            </h1>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              activeLaunch.badgeVerified 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}>
              {activeLaunch.badgeVerified ? 'Verified Directory Backlink' : 'Backlink Unverified'}
            </span>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-0.5">{activeLaunch.tagline}</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/launch/${activeLaunch.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-black dark:text-white border border-[#e8e6df] dark:border-white/10 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Globe size={14} /> Public Page <ExternalLink size={12} />
          </a>
          <button
            onClick={() => setBadgeModalOpen(true)}
            className="px-4 py-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShieldCheck size={14} /> Embed Badge
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl text-xs font-mono font-bold flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="cursor-pointer"><X size={16} /></button>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 p-4 rounded-2xl text-xs font-mono font-bold flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="cursor-pointer"><X size={16} /></button>
        </div>
      )}

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#121316] p-5 rounded-[24px] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Total Upvotes</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ThumbsUp size={14} />
            </div>
          </div>
          <div className="text-2xl font-mono font-extrabold text-black dark:text-white">{activeLaunch.votes_count || 1}</div>
          <span className="text-[10px] font-mono text-neutral-400 mt-1 block">Community Votes</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#121316] p-5 rounded-[24px] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Est. Directory Views</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Eye size={14} />
            </div>
          </div>
          <div className="text-2xl font-mono font-extrabold text-black dark:text-white">{((activeLaunch.votes_count || 1) * 14) + 42}</div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">↑ Active Traffic</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#121316] p-5 rounded-[24px] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Directory Tier</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Sparkles size={14} />
            </div>
          </div>
          <div className="text-xl font-heading font-black text-black dark:text-white capitalize">{activeLaunch.launch_tier || 'Standard'}</div>
          <span className="text-[10px] font-mono text-neutral-400 mt-1 block">Cohort Priority</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#121316] p-5 rounded-[24px] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">Backlink Status</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeLaunch.badgeVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="text-sm font-heading font-bold text-black dark:text-white">
            {activeLaunch.badgeVerified ? 'Verified Active' : 'Pending Check'}
          </div>
          <button 
            onClick={() => setBadgeModalOpen(true)} 
            className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-1 block cursor-pointer"
          >
            {activeLaunch.badgeVerified ? 'View Embed Code' : 'Verify Backlink →'}
          </button>
        </div>
      </div>

      {/* CRUD Management Card */}
      <div className="bg-white dark:bg-[#121316] rounded-[28px] p-6 sm:p-8 border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#e8e6df] dark:border-white/10 gap-3">
          <div>
            <h3 className="text-lg font-heading font-black text-black dark:text-white">Directory Listing Configuration</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Update your public metadata, category tags, and do-follow website endpoint.</p>
          </div>
          {!isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-black dark:text-white rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-[#e8e6df] dark:border-white/10"
              >
                <Edit3 size={14} /> Edit Listing
              </button>
              <button
                onClick={handleDelete}
                className={`transition-all cursor-pointer ${
                  confirmDeleteLaunch
                    ? "px-3 py-1.5 bg-rose-600 text-white font-mono text-[10px] font-black rounded-full shadow-xs"
                    : "p-2 text-rose-500 hover:bg-rose-500/10 rounded-full"
                }`}
                title={confirmDeleteLaunch ? "Click again to confirm unpublish" : "Delete Directory Listing"}
              >
                {confirmDeleteLaunch ? "Confirm Delete?" : <Trash2 size={16} />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {saving ? <Loader2 size={14} className="animate-spin text-black" /> : <Save size={14} />} Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 rounded-full text-xs font-mono font-bold hover:bg-neutral-200 dark:hover:bg-white/10 transition-all cursor-pointer border border-[#e8e6df] dark:border-white/10"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={editForm.company_name}
                  onChange={e => setEditForm({ ...editForm, company_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-black/40 border border-[#e8e6df] dark:border-white/10 rounded-xl text-xs font-mono font-bold text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-1">Category</label>
                <select
                  value={editForm.category}
                  onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-black/40 border border-[#e8e6df] dark:border-white/10 rounded-xl text-xs font-mono font-bold text-black dark:text-white outline-none focus:border-black dark:focus:border-white cursor-pointer"
                >
                  <option value="Tech">Tech</option>
                  <option value="SaaS">SaaS</option>
                  <option value="AI">AI</option>
                  <option value="Web3">Web3 / Crypto</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Fintech">Fintech</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-1">Tagline</label>
              <input
                type="text"
                value={editForm.tagline}
                onChange={e => setEditForm({ ...editForm, tagline: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-black/40 border border-[#e8e6df] dark:border-white/10 rounded-xl text-xs font-mono font-bold text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-1">Website URL</label>
              <input
                type="url"
                value={editForm.website_url}
                onChange={e => setEditForm({ ...editForm, website_url: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-black/40 border border-[#e8e6df] dark:border-white/10 rounded-xl text-xs font-mono font-bold text-black dark:text-white outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-1">Full Description</label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-black/40 border border-[#e8e6df] dark:border-white/10 rounded-xl text-xs font-mono font-normal text-black dark:text-white outline-none focus:border-black dark:focus:border-white leading-relaxed"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-black/30 rounded-2xl border border-[#e8e6df] dark:border-white/10">
              {activeLaunch.logo_url ? (
                <img 
                  src={activeLaunch.logo_url} 
                  alt={activeLaunch.company_name} 
                  className="w-12 h-12 rounded-xl object-cover border border-[#e8e6df] dark:border-white/10 shrink-0" 
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black font-heading shrink-0 text-base">
                  {activeLaunch.company_name?.charAt(0) || 'R'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-heading font-black text-black dark:text-white truncate">{activeLaunch.company_name}</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal truncate">{activeLaunch.tagline}</p>
                <a href={activeLaunch.website_url} target="_blank" rel="noreferrer" className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline truncate block mt-0.5">
                  {activeLaunch.website_url} ↗
                </a>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-black/30 p-4 rounded-2xl border border-[#e8e6df] dark:border-white/10">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-1">Description</span>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed">{activeLaunch.description}</p>
            </div>
          </div>
        )}
      </div>

      <EmbedBadgeModal
        isOpen={badgeModalOpen}
        onClose={() => setBadgeModalOpen(false)}
        launchId={activeLaunch.id}
        slug={activeLaunch.slug}
        companyName={activeLaunch.company_name}
        websiteUrl={activeLaunch.website_url}
        isVerified={activeLaunch.badgeVerified}
      />
    </div>
  );
}
