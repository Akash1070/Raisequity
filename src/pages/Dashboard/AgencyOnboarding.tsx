import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Building2,
  Globe,
  Link as LinkIcon,
  DollarSign,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Lock,
  User,
  MapPin,
  FileCheck2,
  Award,
  Layers,
  Coins
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { safeStorage } from "../../lib/storage";
import { Logo } from "../../components/ui/Logo";
import OnboardingTrackSwitcher from "../../components/onboarding/OnboardingTrackSwitcher";

const SERVICE_TRACKS = [
  "Full-Stack Dev & Smart Contracts",
  "Smart Contract Audits & Security",
  "Tokenomics, Legal & Entity Setup",
  "Web3 Growth & KOL Marketing",
  "Market Making & Liquidity Desks",
  "Cloud & AI Compute Infrastructure",
  "Executive Search & Talent Hiring",
  "Token Listing & Exchange Advisory",
  "Fractional CFO & Treasury Ops",
];

const BUDGET_TIERS = [
  "$5k – $15k (Sprint / Audit)",
  "$15k – $40k (Mid-Stage Build)",
  "$40k – $100k (Core Protocol Dev)",
  "$100k+ (Enterprise Retainer)",
];

export default function AgencyOnboarding() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();

  const [formData, setFormData] = useState({
    // Step 1: Agency Identity
    agency_name: "",
    website_url: "",
    contact_name: "",
    work_email: "",
    linkedin_url: "",
    location: "",
    bio: "",

    // Step 2: Tracks & Track Record
    selected_tracks: [] as string[],
    average_budget: "$15k – $40k (Mid-Stage Build)",
    portfolio_url: "",
    github_or_case_study: "",
    outcome_metrics: "",
    notable_clients: "",

    // Step 3: Escrow & Settlement
    settlement_currency: "USDC" as "USDC" | "USD_WIRE",
    payout_address: "",
    accepts_escrow_terms: true,
  });

  // Redirect if already completed or on wrong role track
  useEffect(() => {
    const uid = user?.uid || (user as any)?.id;
    if (uid) {
      const isLocalCompleted = Boolean(safeStorage.getItem(`rq_onboarding_completed_${uid}`));
      if (profile?.onboarding_completed || isLocalCompleted) {
        navigate("/agency-dashboard/rfps", { replace: true });
        return;
      }

      // Ensure role is synchronized to service_provider
      if (uid && profile && profile.role !== "service_provider" && !profile.onboarding_completed) {
        updateDoc(doc(db, "users", uid), { role: "service_provider" }).catch(() => {});
        safeStorage.setItem(`rq_user_role_${uid}`, "service_provider");
      }
    }

    // Prefill user data if available
    if (profile || user) {
      setFormData((prev) => ({
        ...prev,
        contact_name: profile?.full_name || user?.displayName || prev.contact_name,
        work_email: profile?.email || user?.email || prev.work_email,
        linkedin_url: profile?.linkedin_url || prev.linkedin_url,
        agency_name: profile?.company_name || prev.agency_name,
      }));
    }
  }, [user, profile, navigate]);

  const update = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTrack = (track: string) => {
    setFormData((prev) => ({
      ...prev,
      selected_tracks: prev.selected_tracks.includes(track)
        ? prev.selected_tracks.filter((t) => t !== track)
        : [...prev.selected_tracks, track],
    }));
  };

  const switchRole = async (targetRole: 'founder' | 'investor') => {
    const uid = user?.uid || (user as any)?.id;
    if (uid) {
      try {
        await updateDoc(doc(db, "users", uid), { role: targetRole });
        await refreshProfile();
      } catch (err) {
        console.error("Error updating role:", err);
      }
    }
    if (targetRole === 'founder') navigate("/onboarding", { replace: true });
    else if (targetRole === 'investor') navigate("/investor-onboarding", { replace: true });
  };

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.agency_name.trim()) {
        setError("Agency or Firm name is required.");
        return;
      }
      if (!formData.contact_name.trim()) {
        setError("Primary contact person name is required.");
        return;
      }
      if (!formData.website_url.trim()) {
        setError("Agency website URL is required.");
        return;
      }
      if (!formData.linkedin_url.trim()) {
        setError("LinkedIn profile URL is required for identity verification.");
        return;
      }
    }
    if (step === 2) {
      if (formData.selected_tracks.length === 0) {
        setError("Please select at least 1 service specialization track.");
        return;
      }
      if (!formData.portfolio_url.trim()) {
        setError("A portfolio, GitHub, or case study URL is required to verify track record.");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const handleComplete = async () => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const now = new Date().toISOString();

      // 1. Create or update Service Provider profile in Firestore
      const providerDocRef = doc(db, "service_providers", uid);
      await setDoc(providerDocRef, {
        id: uid,
        agency_name: formData.agency_name,
        website_url: formData.website_url,
        contact_name: formData.contact_name,
        work_email: formData.work_email,
        linkedin_url: formData.linkedin_url,
        location: formData.location,
        bio: formData.bio,
        selected_tracks: formData.selected_tracks,
        average_budget: formData.average_budget,
        portfolio_links: [formData.portfolio_url, formData.github_or_case_study].filter(Boolean),
        outcome_metrics: [formData.outcome_metrics, formData.notable_clients].filter(Boolean),
        settlement_currency: formData.settlement_currency,
        payout_address: formData.payout_address,
        is_verified_partner: true,
        starter_credits_awarded: 150,
        updated_at: now,
      }, { merge: true });

      // 2. Update user profile
      const userDocRef = doc(db, "users", uid);
      await updateDoc(userDocRef, {
        role: "service_provider",
        company_name: formData.agency_name,
        full_name: formData.contact_name,
        linkedin_url: formData.linkedin_url,
        bio: formData.bio,
        onboarding_completed: true,
        credit_balance: (profile?.credit_balance || 0) + 150, // Grant 150 Starter Credits
        credits: (profile?.credit_balance || 0) + 150,
        updated_at: now,
      });

      safeStorage.setItem(`rq_onboarding_completed_${uid}`, "true");
      await refreshProfile();
      navigate("/dashboard/feed", { replace: true });
    } catch (err: any) {
      console.error("Agency onboarding error:", err);
      setError(err.message || "Failed to complete onboarding. Please try again.");
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full bg-[#faf9f7] dark:bg-[#1a1a1a] border border-[#dad4c8] dark:border-[#333] rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none font-medium text-sm transition-all text-black dark:text-white";
  const labelCls = "text-[11px] font-black uppercase text-black/60 dark:text-slate-400 block mb-2 px-1 font-mono tracking-wider";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#000000] text-black dark:text-white font-sans flex flex-col transition-colors duration-150">
      
      {/* ── TOP HEADER ── */}
      <div className="p-6 md:px-10 md:py-6 flex items-center justify-between gap-4 border-b border-[#dad4c8] dark:border-[#262626] bg-white dark:bg-[#0a0a0a]">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="w-8 h-8 rounded-lg shadow-xs" />
          <span className="font-heading font-black text-[20px] tracking-tight">Raisequity</span>
        </Link>

        {/* Step Indicator & Sign Out */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono font-black text-black/60 dark:text-slate-400 uppercase tracking-wider">
            Step {step} of 3
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step >= i ? "w-8 bg-black dark:bg-white" : "w-4 bg-[#dad4c8] dark:bg-[#333]"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate("/login", { replace: true });
            }}
            className="text-xs text-black/60 dark:text-slate-400 hover:text-black dark:hover:text-white font-mono font-bold ml-2 underline cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex justify-center px-6 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl text-sm font-medium w-full max-w-[680px] clay-shadow"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        </div>
      )}

      {/* Main Form Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 pb-20">
        <OnboardingTrackSwitcher currentTrack="service_provider" />
        <div className="w-full max-w-[680px]">
          <AnimatePresence mode="wait">

            {/* ════════════════ STEP 1: AGENCY IDENTITY ════════════════ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                className="space-y-6"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#84e7a5] text-[#078a52] rounded-full text-[10px] font-mono font-black uppercase tracking-wider mb-4 border border-[#078a52]/30">
                    <ShieldCheck size={14} /> Ecosystem Service Partner
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white leading-tight font-heading tracking-tight">
                    Register Your Agency.
                  </h1>
                  <p className="text-[#9f9b93] font-medium mt-1 text-sm sm:text-base">
                    Connect with funded seed-stage founders and receive pre-funded milestone escrow RFPs.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#111111] rounded-[32px] md:rounded-[40px] p-8 md:p-10 border border-[#dad4c8] dark:border-[#262626] clay-shadow space-y-6">
                  {/* Agency Name */}
                  <div>
                    <label className={labelCls}>Agency / Studio Name *</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
                      <input
                        className={`${inputCls} pl-12`}
                        placeholder="e.g. Protocol Audit Studio, Apex Web3 Dev"
                        value={formData.agency_name}
                        onChange={(e) => update("agency_name", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Website + Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Agency Website *</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
                        <input
                          className={`${inputCls} pl-12`}
                          placeholder="https://youragency.com"
                          value={formData.website_url}
                          onChange={(e) => update("website_url", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>HQ Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
                        <input
                          className={`${inputCls} pl-12`}
                          placeholder="e.g. New York, London, Remote"
                          value={formData.location}
                          onChange={(e) => update("location", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Primary Contact + Work Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Primary Contact Name *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
                        <input
                          className={`${inputCls} pl-12`}
                          placeholder="e.g. Marcus Chen"
                          value={formData.contact_name}
                          onChange={(e) => update("contact_name", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Work Email *</label>
                      <div className="relative">
                        <FileCheck2 className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
                        <input
                          className={`${inputCls} pl-12`}
                          placeholder="partner@youragency.com"
                          value={formData.work_email}
                          onChange={(e) => update("work_email", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* LinkedIn Profile */}
                  <div>
                    <label className={labelCls}>Contact LinkedIn Profile *</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={18} />
                      <input
                        className={`${inputCls} pl-12`}
                        placeholder="linkedin.com/in/your-handle"
                        value={formData.linkedin_url}
                        onChange={(e) => update("linkedin_url", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Agency Bio */}
                  <div>
                    <label className={labelCls}>Agency Summary &amp; Core Value Proposition</label>
                    <textarea
                      className={`${inputCls} min-h-[90px] resize-none`}
                      placeholder="Brief overview of your team capabilities, tech stack, and what sets your agency apart..."
                      value={formData.bio}
                      onChange={(e) => update("bio", e.target.value)}
                    />
                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full bg-black text-white hover:bg-[#43089f] py-4 rounded-full font-bold text-sm tracking-wide transition-all shadow-[-4px_4px_0_#84e7a5] hover:shadow-[-6px_6px_0_#fbbd41] hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-2 font-mono uppercase"
                  >
                    Next: Service Tracks &amp; Portfolio <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ════════════════ STEP 2: TRACKS & PORTFOLIO ════════════════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                className="space-y-6"
              >
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 text-black/60 dark:text-slate-400 hover:text-black dark:hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} /> Back to Identity
                </button>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white leading-tight font-heading tracking-tight">
                    Service Specializations.
                  </h1>
                  <p className="text-[#9f9b93] font-medium mt-1 text-sm sm:text-base">
                    Select your service tracks so funded startups can send matched project proposals.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#111111] rounded-[32px] md:rounded-[40px] p-8 md:p-10 border border-[#dad4c8] dark:border-[#262626] clay-shadow space-y-7">
                  {/* Service Tracks Multi-Select */}
                  <div>
                    <label className={labelCls}>Specialized Service Tracks (select all that apply) *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SERVICE_TRACKS.map((track) => {
                        const isSelected = formData.selected_tracks.includes(track);
                        return (
                          <button
                            key={track}
                            type="button"
                            onClick={() => toggleTrack(track)}
                            className={`p-3.5 rounded-2xl border text-xs font-mono font-bold text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? "bg-black text-white border-black shadow-xs"
                                : "bg-[#faf9f7] dark:bg-[#1a1a1a] text-black dark:text-white border-[#dad4c8] dark:border-[#333] hover:border-black"
                            }`}
                          >
                            <span>{track}</span>
                            {isSelected && <CheckCircle2 size={15} className="text-[#84e7a5] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Budget Tier Selector */}
                  <div>
                    <label className={labelCls}>Average Project Scope / Engagement Budget</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {BUDGET_TIERS.map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => update("average_budget", tier)}
                          className={`p-3.5 rounded-2xl border text-xs font-mono font-bold text-left transition-all cursor-pointer ${
                            formData.average_budget === tier
                              ? "bg-[#fbbd41] text-black border-black/30 shadow-xs"
                              : "bg-[#faf9f7] dark:bg-[#1a1a1a] text-black/70 dark:text-slate-300 border-[#dad4c8] dark:border-[#333] hover:border-black"
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Portfolio & Case Study Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Portfolio Case Study / Deck URL *</label>
                      <input
                        className={inputCls}
                        placeholder="https://youragency.com/case-studies"
                        value={formData.portfolio_url}
                        onChange={(e) => update("portfolio_url", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>GitHub / Audits Repository (Optional)</label>
                      <input
                        className={inputCls}
                        placeholder="https://github.com/your-org"
                        value={formData.github_or_case_study}
                        onChange={(e) => update("github_or_case_study", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Outcome Metrics */}
                  <div>
                    <label className={labelCls}>Track Record &amp; Notable Outcomes</label>
                    <textarea
                      className={`${inputCls} min-h-[80px] resize-none`}
                      placeholder="e.g. Audited 14 protocols ($400M TVL); Built MVP for 8 Seed startups; Managed $2M liquidity..."
                      value={formData.outcome_metrics}
                      onChange={(e) => update("outcome_metrics", e.target.value)}
                    />
                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full bg-black text-white hover:bg-[#43089f] py-4 rounded-full font-bold text-sm tracking-wide transition-all shadow-[-4px_4px_0_#84e7a5] hover:shadow-[-6px_6px_0_#fbbd41] hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-2 font-mono uppercase"
                  >
                    Next: Escrow Settlement &amp; 150 Credits <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ════════════════ STEP 3: ESCROW & CREDITS ════════════════ */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                className="space-y-6"
              >
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 text-black/60 dark:text-slate-400 hover:text-black dark:hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} /> Back to Tracks
                </button>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-black dark:text-white leading-tight font-heading tracking-tight">
                    Escrow &amp; Welcome Grant.
                  </h1>
                  <p className="text-[#9f9b93] font-medium mt-1 text-sm sm:text-base">
                    Activate your 150 starter credits and configure milestone settlement.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#111111] rounded-[32px] md:rounded-[40px] p-8 md:p-10 border border-[#dad4c8] dark:border-[#262626] clay-shadow space-y-6">
                  
                  {/* 150 Starter Credits Welcome Grant Card (Clay Matcha Green) */}
                  <div className="bg-[#84e7a5] border border-[#078a52] text-black rounded-[28px] p-6 space-y-2 clay-shadow">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-black text-white px-3 py-1 rounded-full">
                        Welcome Grant
                      </span>
                      <Coins size={22} className="text-[#078a52]" />
                    </div>
                    <h3 className="text-2xl font-black font-heading leading-tight">
                      150 Free Starter Platform Credits
                    </h3>
                    <p className="text-xs text-black/80 font-medium leading-relaxed">
                      Automatically credited to your account upon completing registration. Use these credits to sponsor ecosystem posts, bid on founder RFPs, and connect directly with funded startups.
                    </p>
                  </div>

                  {/* Settlement Currency Preference */}
                  <div>
                    <label className={labelCls}>Preferred Milestone Escrow Payout Currency</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => update("settlement_currency", "USDC")}
                        className={`p-4 rounded-2xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          formData.settlement_currency === "USDC"
                            ? "bg-black text-white border-black shadow-xs"
                            : "bg-[#faf9f7] dark:bg-[#1a1a1a] text-black dark:text-white border-[#dad4c8] dark:border-[#333]"
                        }`}
                      >
                        <Lock size={15} className="text-[#3bd3fd]" />
                        <span>USDC / USDT (Instant Escrow)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => update("settlement_currency", "USD_WIRE")}
                        className={`p-4 rounded-2xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          formData.settlement_currency === "USD_WIRE"
                            ? "bg-black text-white border-black shadow-xs"
                            : "bg-[#faf9f7] dark:bg-[#1a1a1a] text-black dark:text-white border-[#dad4c8] dark:border-[#333]"
                        }`}
                      >
                        <DollarSign size={15} className="text-[#078a52]" />
                        <span>USD Wire / ACH Bank Transfer</span>
                      </button>
                    </div>
                  </div>

                  {/* Payout Details (Optional during onboarding) */}
                  <div>
                    <label className={labelCls}>
                      {formData.settlement_currency === "USDC" ? "Payout Wallet Address (Optional)" : "Bank Name / Wire Note (Optional)"}
                    </label>
                    <input
                      className={inputCls}
                      placeholder={formData.settlement_currency === "USDC" ? "0x... (ERC20 / Polygon)" : "e.g. JPMorgan Chase Account"}
                      value={formData.payout_address}
                      onChange={(e) => update("payout_address", e.target.value)}
                    />
                    <p className="text-[10px] text-black/50 dark:text-slate-400 font-mono mt-1 px-1">
                      Can be updated anytime inside your Agency Dashboard Settings.
                    </p>
                  </div>

                  {/* Escrow Terms Checkbox */}
                  <div className="p-4 bg-[#faf9f7] dark:bg-[#1a1a1a] rounded-2xl border border-[#dad4c8] dark:border-[#333] flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="escrow_terms"
                      checked={formData.accepts_escrow_terms}
                      onChange={(e) => update("accepts_escrow_terms", e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
                    />
                    <label htmlFor="escrow_terms" className="text-xs text-black/80 dark:text-slate-300 font-medium leading-relaxed cursor-pointer">
                      I agree to the <strong className="text-black dark:text-white">Raisequity 100% Pre-Funded Milestone Escrow</strong> protocol. Clients deposit 100% funds into escrow prior to project kickoff, released within 48h of milestone sign-off.
                    </label>
                  </div>

                  <button
                    onClick={handleComplete}
                    disabled={isSubmitting || !formData.accepts_escrow_terms}
                    className="w-full bg-black text-white hover:bg-[#43089f] py-4 rounded-full font-bold text-sm tracking-wide transition-all shadow-[-4px_4px_0_#84e7a5] hover:shadow-[-6px_6px_0_#fbbd41] hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-2 font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Activating 150 Credits &amp; Partner Status...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="text-[#fbbd41]" />
                        <span>Complete Registration (Claim 150 Free Credits)</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
