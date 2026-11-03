import React, { useState, useEffect } from "react";
import {
  Briefcase,
  ShieldCheck,
  Award,
  Star,
  ExternalLink,
  CheckCircle2,
  Coins,
  Save,
  Loader2,
  Sparkles,
  Globe,
  Mail,
  Send,
  Copy,
  Check,
  Wallet,
  Building2,
  MapPin,
  Tag
} from "lucide-react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";

const AVAILABLE_TRACKS = [
  "Smart Contract Security Audits",
  "Solidity & Rust Protocol Engineering",
  "ZK Verifiers & Circom Development",
  "Account Abstraction (ERC-4337)",
  "Full-Stack Web3 DApp (Next.js/Viem)",
  "Tokenomics Architecture & Vesting",
  "KOL & Web3 Growth Marketing",
  "DeFi Liquidity & Market Making Advisory",
  "Legal Structuring & SAFT Compliance"
];

const BUDGET_RANGES = [
  "$5k - $15k USD",
  "$15k - $35k USD",
  "$35k - $75k USD",
  "$75k - $150k+ USD"
];

export default function AgencyProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const uid = user?.uid || (user as any)?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [form, setForm] = useState({
    agency_name: "",
    contact_name: "",
    work_email: "",
    website_url: "",
    telegram_handle: "",
    linkedin_url: "",
    location: "",
    bio: "",
    average_budget: "$15k - $35k USD",
    settlement_currency: "USDC (Arbitrum / Base)",
    payout_address: "",
    selected_tracks: ["Smart Contract Security Audits", "Full-Stack Web3 DApp (Next.js/Viem)"] as string[],
    notable_clients: "Fasqon Fintech, SecantX, NeuroChain"
  });

  useEffect(() => {
    async function loadAgencyData() {
      if (!uid) return;
      setLoading(true);
      try {
        const providerSnap = await getDoc(doc(db, "service_providers", uid));
        if (providerSnap.exists()) {
          const data = providerSnap.data();
          setForm({
            agency_name: data.agency_name || profile?.company_name || "",
            contact_name: data.contact_name || profile?.full_name || "",
            work_email: data.work_email || user?.email || "",
            website_url: data.website_url || "",
            telegram_handle: data.telegram_handle || "",
            linkedin_url: data.linkedin_url || profile?.linkedin_url || "",
            location: data.location || "Remote / Global",
            bio: data.bio || profile?.bio || "",
            average_budget: data.average_budget || "$15k - $35k USD",
            settlement_currency: data.settlement_currency || "USDC (Arbitrum / Base)",
            payout_address: data.payout_address || "",
            selected_tracks: Array.isArray(data.selected_tracks) && data.selected_tracks.length > 0
              ? data.selected_tracks
              : ["Smart Contract Security Audits", "Full-Stack Web3 DApp (Next.js/Viem)"],
            notable_clients: Array.isArray(data.outcome_metrics)
              ? data.outcome_metrics.join(", ")
              : data.notable_clients || "Fasqon Fintech, SecantX, NeuroChain"
          });
        } else {
          // Initialize from profile/user
          setForm((prev) => ({
            ...prev,
            agency_name: profile?.company_name || profile?.full_name || "ChainCraft Labs",
            contact_name: profile?.full_name || "Verified Partner",
            work_email: user?.email || "",
            bio: profile?.bio || "Institutional Web3 service provider and protocol audit studio."
          }));
        }
      } catch (err) {
        console.error("Error loading agency profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAgencyData();
  }, [uid, profile]);

  const toggleTrack = (track: string) => {
    setForm((prev) => {
      const exists = prev.selected_tracks.includes(track);
      if (exists) {
        return { ...prev, selected_tracks: prev.selected_tracks.filter((t) => t !== track) };
      } else {
        return { ...prev, selected_tracks: [...prev.selected_tracks, track] };
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const now = new Date().toISOString();
      const providerRef = doc(db, "service_providers", uid);
      await setDoc(providerRef, {
        id: uid,
        agency_name: form.agency_name,
        contact_name: form.contact_name,
        work_email: form.work_email,
        website_url: form.website_url,
        telegram_handle: form.telegram_handle,
        linkedin_url: form.linkedin_url,
        location: form.location,
        bio: form.bio,
        average_budget: form.average_budget,
        settlement_currency: form.settlement_currency,
        payout_address: form.payout_address,
        selected_tracks: form.selected_tracks,
        outcome_metrics: form.notable_clients.split(",").map((s) => s.trim()).filter(Boolean),
        is_verified_partner: true,
        updated_at: now
      }, { merge: true });

      // Sync to experts collection so updates immediately reflect in Services Directory
      try {
        await setDoc(doc(db, "experts", uid), {
          id: uid,
          title: form.agency_name,
          company: form.agency_name,
          category: form.selected_tracks?.[0] || "Blockchain & Technical Advisory",
          services: form.selected_tracks || ["Technical Advisory", "Smart Contracts"],
          portfolio: form.notable_clients.split(",").map((s) => s.trim()).filter(Boolean),
          vetting_status: "Vetted",
          bio: form.bio || `${form.agency_name} provides institutional Web3 services.`,
          tags: form.selected_tracks || ["Web3", "Vetted"],
          calendly_url: form.website_url || "https://raisequity.com",
          rate_per_hour: null,
          is_active: true,
          verified: true,
          updated_at: now
        }, { merge: true });
      } catch (expSyncErr) {
        console.warn("Could not sync experts doc:", expSyncErr);
      }

      // Update user doc as well
      await updateDoc(doc(db, "users", uid), {
        company_name: form.agency_name,
        full_name: form.contact_name,
        linkedin_url: form.linkedin_url,
        bio: form.bio,
        role: "service_provider",
        updated_at: now
      });

      if (refreshProfile) {
        await refreshProfile();
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Error saving agency profile:", err);
      setSaveError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const agencyHandle = form.agency_name
    ? form.agency_name.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "partner";

  const publicUrl = `https://raisequity.com/agency/${agencyHandle}`;

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const inputCls =
    "w-full bg-slate-50 dark:bg-[#121316] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 font-mono transition-colors";
  const labelCls = "block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white dark:bg-[#0A0A0A] p-8">
        <Loader2 size={28} className="animate-spin text-emerald-500" />
        <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider">Loading Agency Dossier...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto h-full text-black dark:text-white font-sans">
      
      {/* ── TOP HEADER & IDENTITY ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#262626]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
              AGENCY IDENTITY &amp; CREDENTIALS
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight">
            {form.agency_name || "Agency Workspace"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 max-w-2xl">
            Vetted institutional service provider profile indexed across the Raisequity founder &amp; RFP dealflow network.
          </p>
        </div>

        {/* Public Share Handle Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={copyPublicLink}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10 hover:border-black dark:hover:border-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
          >
            {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copiedLink ? "Copied URL!" : "Copy Public Link"}</span>
          </button>
        </div>
      </div>

      {/* ── METRIC STATS ROW (HireInCrypto ATS Style) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] shadow-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">Completed Contracts</div>
          <div className="text-2xl font-heading font-black text-black dark:text-white mt-1">14</div>
          <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            100% Milestone Escrow Released
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] shadow-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">Founder Trust Rating</div>
          <div className="text-2xl font-heading font-black text-black dark:text-white mt-1">4.95 / 5.0</div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1">
            22 Verified Reviews on Directory
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] shadow-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">Available RFP Credits</div>
          <div className="text-2xl font-heading font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {profile?.credit_balance ?? 150} Credits
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1">
            Starter Partner Allotment
          </div>
        </div>
      </div>

      {/* Save Notifications */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>Agency profile saved and published to the Web3 Services Directory!</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono text-xs font-bold">
          {saveError}
        </div>
      )}

      {/* ── EDIT PROFILE FORM ── */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: Core Agency Identity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
            <Building2 size={16} className="text-emerald-500" />
            <h3 className="font-heading font-black text-base text-black dark:text-white">
              Studio &amp; Legal Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Agency / Studio Name</label>
              <input
                type="text"
                value={form.agency_name}
                onChange={(e) => setForm({ ...form, agency_name: e.target.value })}
                placeholder="e.g. ChainCraft Labs"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Primary Contact Name</label>
              <input
                type="text"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder="e.g. Alex Chen"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Official Work Email</label>
              <input
                type="email"
                value={form.work_email}
                onChange={(e) => setForm({ ...form, work_email: e.target.value })}
                placeholder="contact@agency.com"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Website URL</label>
              <input
                type="url"
                value={form.website_url}
                onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                placeholder="https://agency.com"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Telegram Handle (for Founders)</label>
              <input
                type="text"
                value={form.telegram_handle}
                onChange={(e) => setForm({ ...form, telegram_handle: e.target.value })}
                placeholder="@agency_partner"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Location / Jurisdiction</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Zug, Switzerland / Remote"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Studio Bio &amp; Positioning</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Describe your engineering, audit, or marketing edge, core stack, and turn-around times..."
              className={inputCls}
            />
          </div>
        </div>

        {/* Card 2: Service Tracks & Specializations */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
            <Tag size={16} className="text-emerald-500" />
            <h3 className="font-heading font-black text-base text-black dark:text-white">
              Verified Service Tracks (Click to Toggle)
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {AVAILABLE_TRACKS.map((track) => {
              const selected = form.selected_tracks.includes(track);
              return (
                <button
                  key={track}
                  type="button"
                  onClick={() => toggleTrack(track)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selected
                      ? "bg-emerald-500 text-black shadow-xs font-black"
                      : "bg-slate-100 dark:bg-[#18191e] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {selected && <Check size={12} />}
                  <span>{track}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className={labelCls}>Typical Project Budget Bracket</label>
              <select
                value={form.average_budget}
                onChange={(e) => setForm({ ...form, average_budget: e.target.value })}
                className={inputCls}
              >
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Notable Past Clients / Audited Protocols</label>
              <input
                type="text"
                value={form.notable_clients}
                onChange={(e) => setForm({ ...form, notable_clients: e.target.value })}
                placeholder="Fasqon, SecantX, Arbitrum Grantee"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Payout Vault & Smart Contract Settlement */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
            <Wallet size={16} className="text-emerald-500" />
            <h3 className="font-heading font-black text-base text-black dark:text-white">
              Escrow Payout Settlement (Crypto / USDC)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Settlement Network &amp; Currency</label>
              <input
                type="text"
                value={form.settlement_currency}
                onChange={(e) => setForm({ ...form, settlement_currency: e.target.value })}
                placeholder="USDC (Arbitrum One / Base / Ethereum)"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Payout Wallet Address (48h Auto-Disbursement)</label>
              <input
                type="text"
                value={form.payout_address}
                onChange={(e) => setForm({ ...form, payout_address: e.target.value })}
                placeholder="0x... or Solana pubkey"
                className={inputCls}
              />
            </div>
          </div>
          <p className="text-[11px] font-mono text-neutral-400">
            Escrow deposits are held in smart contracts and released directly to this wallet upon client milestone verification.
          </p>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{saving ? "Saving Agency Dossier..." : "Save Agency Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
