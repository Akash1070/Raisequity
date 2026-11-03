import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  User,
  Building2,
  Briefcase,
  Globe,
  Link as LinkIcon,
  DollarSign,
  FileText,
  Target,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { upsertInvestorProfile, getInvestorProfile, getInvestorPreferences } from "../../lib/investors";
import { safeStorage } from "../../lib/storage";
import type { InvestorOnboardingData, InvestorType } from "../../types/investor";
import OnboardingRoleSwitcher from "../../components/auth/OnboardingRoleSwitcher";
import { Logo } from "../../components/ui/Logo";

const SECTORS = ["AI", "SaaS", "Fintech", "B2B Tech", "DevTools", "Consumer", "DeFi", "Web3 Infrastructure", "GameFi", "RWA", "Climate"];
const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Growth"];
const INVESTOR_TYPES: { value: InvestorType; label: string; icon: string }[] = [
  { value: "angel", label: "Angel Investor", icon: "👼" },
  { value: "vc", label: "Venture Capital", icon: "🏛️" },
  { value: "family_office", label: "Family Office", icon: "🏠" },
  { value: "corporate", label: "Corporate VC", icon: "🏢" },
  { value: "grant_provider", label: "Grant Provider", icon: "🎁" },
  { value: "accelerator", label: "Accelerator", icon: "🚀" },
];

export default function InvestorOnboarding() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();

  const [formData, setFormData] = useState<InvestorOnboardingData>({
    full_name: "",
    linkedin_url: "",
    investor_type: "",
    fund_name: "",
    fund_website: "",
    bio: "",
    calendly_link: "",
    cal_link: "",
    quiet_mode: false,
    call_fee_usd: "0",
    preferred_sectors: [],
    preferred_stages: [],
    min_check_size: "",
    max_check_size: "",
    geography: "",
    thesis_description: "",
  });

  useEffect(() => {
    const uid = user?.uid || (user as any)?.id;
    const isLocalCompleted = uid ? Boolean(safeStorage.getItem(`rq_onboarding_completed_${uid}`)) : false;
    if (profile?.onboarding_completed || isLocalCompleted) {
      navigate("/investor-dashboard/deals", { replace: true });
      return;
    }

    // Role check: If profile is founder or agency, direct to their dedicated onboarding
    const userRole = profile?.role;
    if (userRole === "founder") {
      navigate("/onboarding", { replace: true });
      return;
    }
    if (userRole === "service_provider") {
      navigate("/agency-onboarding", { replace: true });
      return;
    }

    async function loadExistingInvestorData() {
      if (!uid) return;
      try {
        const { data: invProfile } = await getInvestorProfile(uid);
        const { data: invPrefs } = await getInvestorPreferences(uid);

        if (invProfile || invPrefs || profile) {
          setFormData((prev) => ({
            ...prev,
            full_name: invProfile?.full_name || profile?.full_name || user?.displayName || prev.full_name,
            linkedin_url: invProfile?.linkedin_url || profile?.linkedin_url || prev.linkedin_url,
            investor_type: invProfile?.investor_type || prev.investor_type,
            fund_name: invProfile?.fund_name || profile?.company_name || prev.fund_name,
            fund_website: invProfile?.fund_website || prev.fund_website,
            bio: invProfile?.bio || profile?.bio || prev.bio,
            calendly_link: invProfile?.calendly_link || prev.calendly_link,
            call_fee_usd: invProfile?.call_fee_usd ? String(invProfile.call_fee_usd) : prev.call_fee_usd,
            preferred_sectors: invPrefs?.preferred_sectors || prev.preferred_sectors,
            preferred_stages: invPrefs?.preferred_stages || prev.preferred_stages,
            min_check_size: invPrefs?.min_check_size ? String(invPrefs.min_check_size) : prev.min_check_size,
            max_check_size: invPrefs?.max_check_size ? String(invPrefs.max_check_size) : prev.max_check_size,
            geography: invPrefs?.geography || prev.geography,
            thesis_description: invPrefs?.thesis_description || prev.thesis_description,
          }));
        }
      } catch (err) {
        console.error("Error loading investor profile prefill:", err);
      }
    }
    loadExistingInvestorData();
  }, [user, profile, navigate]);

  const update = (field: keyof InvestorOnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArray = (field: "preferred_sectors" | "preferred_stages", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.full_name.trim()) {
        setError("Full name is required.");
        return;
      }
      if (!formData.investor_type) {
        setError("Please select an investor type.");
        return;
      }
      if (!formData.linkedin_url.trim()) {
        setError("LinkedIn profile URL is required.");
        return;
      }
      const calendarToolLink = formData.cal_link || formData.calendly_link;
      if (!calendarToolLink || !calendarToolLink.trim()) {
        setError("Calendar scheduling link (Cal.com, Calendly, or SavvyCal) is mandatory.");
        return;
      }
    }
    setStep((s) => s + 1);
  };
  const prevStep = () => { setError(null); setStep((s) => s - 1); };

  const handleComplete = async () => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return;
    setIsSubmitting(true);
    setError(null);
    safeStorage.setItem(`rq_onboarding_completed_${uid}`, "true");

    try {
      const { error: saveError } = await upsertInvestorProfile(uid, formData);
      if (saveError) {
        setError("Failed to save profile: " + saveError.message);
        setIsSubmitting(false);
        return;
      }
      await refreshProfile();
      navigate("/investor-dashboard/deals", { replace: true });
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-black outline-none font-medium text-sm transition-all";
  const labelCls = "text-[11px] font-black uppercase text-gray-400 block mb-2 px-1";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col">
      {/* Header */}
      <div className="p-6 md:p-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8 rounded-lg shadow-xs" />
          <span className="font-black text-[18px] tracking-tight">Raisequity</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black text-gray-300 uppercase tracking-wider">
            Step {step} of 3
          </span>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step >= i ? "w-10 bg-black" : "w-5 bg-gray-200"
              }`}
            />
          ))}
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate("/login", { replace: true });
            }}
            className="text-xs text-gray-500 hover:text-black font-bold ml-2 underline underline-offset-2 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 bg-red-50 text-red-600 p-4 rounded-2xl mb-4 text-sm font-medium w-full max-w-[640px]"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <div className="w-full max-w-[640px]">
          <AnimatePresence mode="wait">
            {/* ──────────────── STEP 1: Identity ──────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-8"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-clay-ube)]/10 text-[var(--color-clay-ube-dark)] rounded-full text-[10px] font-black uppercase mb-4">
                    <ShieldCheck size={14} /> Institutional Access
                  </div>
                  <h1 className="text-[32px] md:text-[40px] font-black text-black leading-tight tracking-tight">
                    Your Investor Identity.
                  </h1>
                  <p className="text-gray-400 font-medium mt-2">
                    Tell us about yourself and your fund to unlock curated deal flow.
                  </p>
                </div>

                <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input className={`${inputCls} pl-12`} placeholder="e.g. Sephi Shapira" value={formData.full_name} onChange={(e) => update("full_name", e.target.value)} />
                    </div>
                  </div>

                  {/* Investor Type */}
                  <div>
                    <label className={labelCls}>Investor Type *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {INVESTOR_TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => update("investor_type", t.value)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm font-bold transition-all ${
                            formData.investor_type === t.value
                              ? "bg-black text-white border-black shadow-lg"
                              : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <span className="text-lg">{t.icon}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fund Name + Website */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Fund / Firm Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input className={`${inputCls} pl-12`} placeholder="e.g. Pantera Capital" value={formData.fund_name} onChange={(e) => update("fund_name", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Fund Website</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input className={`${inputCls} pl-12`} placeholder="https://pantera.capital" value={formData.fund_website} onChange={(e) => update("fund_website", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className={labelCls}>LinkedIn Profile *</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input className={`${inputCls} pl-12`} placeholder="linkedin.com/in/your-handle" value={formData.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className={labelCls}>Short Bio</label>
                    <textarea
                      className={`${inputCls} min-h-[100px] resize-none`}
                      placeholder="Brief background, notable investments, and what gets you excited about startups..."
                      value={formData.bio}
                      onChange={(e) => update("bio", e.target.value)}
                    />
                  </div>

                  {/* Mandatory Calendar Link + Call Fee */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Calendar Scheduling Tool Link * (Cal.com / Calendly)</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                        <input
                          className={`${inputCls} pl-12 border-emerald-200/60 focus:ring-emerald-500`}
                          placeholder="cal.com/your-name or calendly.com/your-name"
                          value={formData.cal_link || formData.calendly_link}
                          onChange={(e) => {
                            update("cal_link", e.target.value);
                            update("calendly_link", e.target.value);
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium mt-1 px-1">
                        Mandatory: Founders use this link to book free or paid mentorship calls with you directly.
                      </p>
                    </div>
                    <div>
                      <label className={labelCls}>Mentorship Call Fee (USD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                          className={`${inputCls} pl-12`}
                          type="number"
                          placeholder="0 = free"
                          value={formData.call_fee_usd}
                          onChange={(e) => update("call_fee_usd", e.target.value)}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium mt-1 px-1">
                        Set to $0 for free office hours or set a fee for paid advisory calls.
                      </p>
                    </div>
                  </div>

                  {/* Quiet Mode Card */}
                  <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-black flex items-center gap-2">
                        <span>🤫 Investor Quiet Mode</span>
                        {formData.quiet_mode && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            Enabled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-1 max-w-sm">
                        When enabled, your profile is hidden from public directories & search, visible ONLY to founders you have an established connection with.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => update("quiet_mode", !formData.quiet_mode)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        formData.quiet_mode
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {formData.quiet_mode ? "ON" : "OFF"}
                    </button>
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={!formData.full_name || !formData.investor_type || !(formData.cal_link || formData.calendly_link)}
                    className="w-full bg-black text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next: Investment Thesis <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ──────────────── STEP 2: Thesis ──────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-8"
              >
                <button onClick={prevStep} className="flex items-center gap-2 text-gray-400 hover:text-black font-bold text-sm transition-colors cursor-pointer">
                  <ChevronLeft size={16} /> Previous
                </button>

                <div>
                  <h1 className="text-[32px] md:text-[40px] font-black text-black leading-tight tracking-tight">
                    Investment Thesis.
                  </h1>
                  <p className="text-gray-400 font-medium mt-2">
                    Define your deal preferences so our AI can curate the best matches.
                  </p>
                </div>

                <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-8">
                  {/* Sectors */}
                  <div>
                    <label className={labelCls}>Preferred Sectors (select multiple)</label>
                    <div className="flex flex-wrap gap-2">
                      {SECTORS.map((s) => {
                        const selected = formData.preferred_sectors.includes(s);
                        return (
                          <button
                            key={s}
                            onClick={() => toggleArray("preferred_sectors", s)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                              selected
                                ? "bg-black text-white border-black"
                                : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stages */}
                  <div>
                    <label className={labelCls}>Preferred Stages</label>
                    <div className="flex flex-wrap gap-2">
                      {STAGES.map((s) => {
                        const selected = formData.preferred_stages.includes(s);
                        return (
                          <button
                            key={s}
                            onClick={() => toggleArray("preferred_stages", s)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                              selected
                                ? "bg-black text-white border-black"
                                : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Check Size + Geography */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Min Check ($)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input className={`${inputCls} pl-12`} type="number" placeholder="25000" value={formData.min_check_size} onChange={(e) => update("min_check_size", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Max Check ($)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input className={`${inputCls} pl-12`} type="number" placeholder="500000" value={formData.max_check_size} onChange={(e) => update("max_check_size", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Geography Focus</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input className={`${inputCls} pl-12`} placeholder="e.g. Global" value={formData.geography} onChange={(e) => update("geography", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Thesis Description */}
                  <div>
                    <label className={labelCls}>Thesis Description</label>
                    <textarea
                      className={`${inputCls} min-h-[120px] resize-none`}
                      placeholder="Describe what you look for in founders and startups. What makes you write a check?..."
                      value={formData.thesis_description}
                      onChange={(e) => update("thesis_description", e.target.value)}
                    />
                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full bg-black text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 hover:shadow-xl transition-all cursor-pointer"
                  >
                    Next: Review & Launch <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ──────────────── STEP 3: Agreement + Launch ──────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <button onClick={prevStep} className="flex items-center gap-2 text-gray-400 hover:text-black font-bold text-sm transition-colors cursor-pointer">
                  <ChevronLeft size={16} /> Previous
                </button>

                <div className="text-center">
                  <div className="w-20 h-20 bg-green-50 text-[var(--color-clay-matcha-dark)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h1 className="text-[32px] font-black text-black leading-tight tracking-tight">
                    Review & Launch 🚀
                  </h1>
                  <p className="text-gray-400 font-medium mt-2 max-w-md mx-auto">
                    You're all set. Complete onboarding to access the curated deal feed.
                  </p>
                </div>

                <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-5">
                  {/* Profile summary cards */}
                  {[
                    { icon: <User size={18} />, label: "Investor", value: formData.full_name || "—", color: "text-[var(--color-clay-ube)]" },
                    { icon: <Building2 size={18} />, label: "Fund", value: formData.fund_name || "Independent", color: "text-[var(--color-clay-matcha)]" },
                    { icon: <Briefcase size={18} />, label: "Type", value: INVESTOR_TYPES.find((t) => t.value === formData.investor_type)?.label || "—", color: "text-[var(--color-clay-lemon-dark)]" },
                    { icon: <Target size={18} />, label: "Sectors", value: formData.preferred_sectors.join(", ") || "All", color: "text-[var(--color-clay-pomegranate)]" },
                    { icon: <FileText size={18} />, label: "Stages", value: formData.preferred_stages.join(", ") || "All", color: "text-blue-500" },
                    { icon: <DollarSign size={18} />, label: "Check Size", value: formData.min_check_size || formData.max_check_size ? `$${Number(formData.min_check_size || 0).toLocaleString()} – $${Number(formData.max_check_size || 0).toLocaleString()}` : "Flexible", color: "text-green-600" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center ${item.color} shadow-sm`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{item.label}</div>
                        <div className="text-sm font-bold text-black truncate">{item.value}</div>
                      </div>
                    </div>
                  ))}

                  {/* Agreement */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      By completing onboarding, you agree to Raisequity's{" "}
                      <span className="text-black font-bold">Terms of Service</span> and{" "}
                      <span className="text-black font-bold">Privacy Policy</span>. Deal flow is curated and all founder data is shared under NDA.
                    </p>
                  </div>

                  <button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="w-full bg-[var(--color-clay-matcha-dark)] text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" /> Setting up deal feed...
                      </>
                    ) : (
                      <>
                        Launch Investor Terminal 🚀
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6">
        <p className="text-[11px] text-gray-300 font-medium">
          Your data is encrypted. Read our{" "}
          <Link to="/" className="text-gray-400 hover:text-black underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
