import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Rocket, TrendingUp, Eye, ThumbsUp, CheckCircle2, AlertCircle, Edit3, Trash2, Globe, ExternalLink, ShieldCheck, Sparkles, Loader2, Save, X, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
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
    if (!window.confirm('Are you sure you want to unpublish and delete this directory launch?')) return;
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
      navigate('/launch/submit');
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
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  const compData = company as any;

  // Case 1: No launch project created yet
  if (!activeLaunch) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Directory &amp; Launches</h1>
            <p className="text-slate-400 font-normal text-xs mt-0.5">Publish your startup on the Raisequity Directory to get backlinks &amp; investor eyes.</p>
          </div>
          <Link
            to="/launch/submit"
            className="px-5 py-2.5 bg-[#00F5A0] hover:bg-[#00D68B] text-black rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,245,160,0.25)]"
          >
            <Plus size={16} /> Submit New Launch
          </Link>
        </div>

        <div className="bg-[#0B0F19] rounded-3xl p-8 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 text-[#00F5A0] rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <Rocket size={32} />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-extrabold text-white">No Directory Launch Yet</h3>
            <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed">
              Launch your startup on the Raisequity directory to gain do-follow backlinks, community upvotes, and direct exposure to our network of 180+ verified investors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {compData?.company_name && (
              <button
                onClick={handleQuickLaunchFromProfile}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 bg-[#00F5A0] hover:bg-[#00D68B] text-black rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,245,160,0.25)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? <Loader2 size={16} className="animate-spin text-black" /> : <Sparkles size={16} />}
                Quick Launch "{compData.company_name}"
              </button>
            )}
            <Link
              to="/launch/submit"
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <Rocket size={16} /> Custom Directory Submission
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Active Launch Project Overview & Analytics & CRUD
  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{activeLaunch.company_name}</h1>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              activeLaunch.badgeVerified 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {activeLaunch.badgeVerified ? 'Verified Directory Backlink' : 'Backlink Unverified'}
            </span>
          </div>
          <p className="text-slate-400 font-normal text-xs mt-0.5">{activeLaunch.tagline}</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/launch/${activeLaunch.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5"
          >
            <Globe size={14} /> Public Page <ExternalLink size={12} />
          </a>
          <button
            onClick={() => setBadgeModalOpen(true)}
            className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 shadow-md"
          >
            <ShieldCheck size={14} /> Backlink Badge
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl text-xs font-mono font-bold flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)}><X size={16} /></button>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs font-mono font-bold flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)}><X size={16} /></button>
        </div>
      )}

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase text-slate-400">Total Upvotes</span>
            <ThumbsUp size={16} className="text-[#00F5A0]" />
          </div>
          <div className="text-2xl font-extrabold text-white">{activeLaunch.votes_count || 1}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Community Votes</span>
        </div>

        <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase text-slate-400">Est. Directory Views</span>
            <Eye size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{((activeLaunch.votes_count || 1) * 14) + 42}</div>
          <span className="text-[10px] text-emerald-400 mt-1 block">↑ Active Traffic</span>
        </div>

        <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase text-slate-400">Directory Tier</span>
            <Sparkles size={16} className="text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white capitalize">{activeLaunch.launch_tier || 'Standard'}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Rank Priority</span>
        </div>

        <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase text-slate-400">Backlink Status</span>
            <ShieldCheck size={16} className={activeLaunch.badgeVerified ? "text-emerald-400" : "text-amber-400"} />
          </div>
          <div className="text-sm font-bold text-white">{activeLaunch.badgeVerified ? 'Verified' : 'Pending Verification'}</div>
          <button 
            onClick={() => setBadgeModalOpen(true)} 
            className="text-[10px] font-bold text-[#00F5A0] hover:underline mt-1 block cursor-pointer"
          >
            {activeLaunch.badgeVerified ? 'View Embed Code' : 'Verify Backlink →'}
          </button>
        </div>
      </div>

      {/* CRUD Management Card */}
      <div className="bg-[#0B0F19] rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white">Directory Listing Management</h3>
            <p className="text-xs text-slate-400 font-normal">Update your startup information or manage your public listing.</p>
          </div>
          {!isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Edit3 size={14} /> Edit Listing
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                title="Delete Directory Listing"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 bg-[#00F5A0] hover:bg-[#00D68B] text-black rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {saving ? <Loader2 size={14} className="animate-spin text-black" /> : <Save size={14} />} Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-mono font-bold hover:bg-slate-700 transition-all cursor-pointer"
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
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={editForm.company_name}
                  onChange={e => setEditForm({ ...editForm, company_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black/60 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Category</label>
                <select
                  value={editForm.category}
                  onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black/60 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white outline-none focus:border-emerald-500"
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
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Tagline</label>
              <input
                type="text"
                value={editForm.tagline}
                onChange={e => setEditForm({ ...editForm, tagline: e.target.value })}
                className="w-full px-4 py-2.5 bg-black/60 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Website URL</label>
              <input
                type="url"
                value={editForm.website_url}
                onChange={e => setEditForm({ ...editForm, website_url: e.target.value })}
                className="w-full px-4 py-2.5 bg-black/60 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Full Description</label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-black/60 border border-slate-800 rounded-xl text-xs font-mono font-normal text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-black/60 rounded-2xl border border-slate-800">
              <img 
                src={activeLaunch.logo_url} 
                alt={activeLaunch.company_name} 
                className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-extrabold text-white truncate">{activeLaunch.company_name}</h4>
                <p className="text-xs text-slate-400 font-normal truncate">{activeLaunch.tagline}</p>
                <a href={activeLaunch.website_url} target="_blank" rel="noreferrer" className="text-[10px] font-mono font-bold text-[#00F5A0] hover:underline truncate block mt-0.5">
                  {activeLaunch.website_url}
                </a>
              </div>
            </div>

            <div className="bg-black/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Description</span>
              <p className="text-xs text-slate-300 font-normal leading-relaxed">{activeLaunch.description}</p>
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
