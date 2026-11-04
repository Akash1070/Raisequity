import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Briefcase,
  Zap,
  Globe,
  Coins,
  FileText,
  PhoneCall,
  Sparkles,
  Award,
  Terminal,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { safeStorage } from "../lib/storage";
import { Logo } from "../components/ui/Logo";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"founder" | "investor" | "service_provider" | "admin">("founder");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle, user, profile, loading } = useAuth();

  const from = (location.state as any)?.from;
  const needsProfile = (location.state as any)?.needsProfile;

  // Save referral code and role if present in URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const refCode = searchParams.get("ref");
    if (refCode) {
      safeStorage.setItem("referred_by_code", refCode);
      safeStorage.setItem("rq_ref_code", refCode);
    }
    const roleParam = searchParams.get("role");
    if (roleParam === "agency" || roleParam === "service_provider" || roleParam === "investor" || roleParam === "admin" || roleParam === "founder") {
      setRole((roleParam === "agency" ? "service_provider" : roleParam) as any);
    }
  }, [location.search]);

  // Honored redirect param: after login, send users where they asked to go.
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get("redirect");
    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
      setRedirectPath(redirect);
    }
  }, [location.search]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const userRole = profile?.role || role || "founder";
    const currentUid = profile?.id || user?.uid || (user as any)?.id;
    const isLocallyCompleted = currentUid ? Boolean(safeStorage.getItem(`rq_onboarding_completed_${currentUid}`)) : false;
    const onboardingCompleted = (profile?.onboarding_completed ?? false) || isLocallyCompleted;

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const isUserAdmin = (adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()) || userRole === "admin";

    if (isUserAdmin) {
      navigate("/admin", { replace: true });
      return;
    }

    if (redirectPath) {
      navigate(redirectPath, { replace: true });
      return;
    }

    if (needsProfile) {
      if (userRole === "founder" && !onboardingCompleted) {
        navigate("/onboarding", { replace: true });
      } else if (userRole === "investor" && !onboardingCompleted) {
        navigate("/investor-onboarding", { replace: true });
      } else if (userRole === "service_provider" && !onboardingCompleted) {
        navigate("/agency-onboarding", { replace: true });
      } else if (userRole === "founder") {
        navigate("/dashboard/feed", { replace: true });
      } else if (userRole === "service_provider") {
        navigate("/agency-dashboard/rfps", { replace: true });
      } else if (userRole === "investor") {
        navigate("/investor-dashboard/deals", { replace: true });
      }
      return;
    }

    if (onboardingCompleted) {
      if (userRole === "founder") navigate("/dashboard/feed", { replace: true });
      else if (userRole === "service_provider") navigate("/agency-dashboard/rfps", { replace: true });
      else if (userRole === "investor") navigate("/investor-dashboard/deals", { replace: true });
    } else {
      if (userRole === "founder") navigate("/onboarding", { replace: true });
      else if (userRole === "investor") navigate("/investor-onboarding", { replace: true });
      else if (userRole === "service_provider") navigate("/agency-onboarding", { replace: true });
    }
  }, [user, profile, loading, needsProfile, role, navigate, redirectPath]);

  const validateForm = (): boolean => {
    if (isSignUp && !fullName.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return false;
    }
    if (!password) {
      setError("Please enter your password.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, role === "admin" ? "founder" : role, fullName);
        if (error) {
          const errCode = (error as any).code || "";
          const errMsg = error.message || "";
          if (errCode === "auth/email-already-in-use" || errMsg.includes("email-already-in-use")) {
            setError("An account with this email already exists. Switched to Log In tab — please enter your password to log in.");
            setIsSignUp(false);
          } else {
            setError(errMsg);
          }
          return;
        }
        setShowConfirmation(true);
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
          return;
        }
      }
    } catch (err: any) {
      console.error("Auth submission error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your account email first, then click Forgot?");
      return;
    }
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send password reset email.");
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const preferredRole = role === "admin" ? "founder" : role;
      const { error } = await signInWithGoogle(preferredRole);
      if (error) {
        const errorMsg = error.message || "";
        if (errorMsg.includes("configuration-not-found") || (error as any).code === "auth/configuration-not-found") {
          setError("Google Sign-In is not enabled on this Firebase domain yet. Please log in using Email & Password.");
        } else {
          setError(errorMsg);
        }
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      const errorMsg = err.message || "";
      if (errorMsg.includes("configuration-not-found") || err.code === "auth/configuration-not-found") {
        setError("Google Sign-In is not enabled on this Firebase domain yet. Please log in using Email & Password.");
      } else {
        setError(errorMsg || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Persona Content Configuration based on Selected Role
  const personaContent = {
    founder: {
      badge: "Founder Gateway · $500k Perks Unlocked 🚀",
      badgeColor: "bg-blue-500/10 text-[#0070F3] border-blue-500/20",
      headline: "Scale faster with pre-funded capital & $500k in credits.",
      narrative: "Connect directly with 250+ vetted angel syndicates, claim instant Google Cloud & AWS perks, and sign legal SAFEs with 1-click.",
      features: [
        {
          title: "$500k in Cloud Credits & Perks",
          desc: "Pre-approved credits for Google Cloud ($350k), AWS ($100k), Cloudflare, and OpenAI.",
          icon: <Coins size={14} className="text-[#0070F3]" />
        },
        {
          title: "1-Click SAFE & SAFT Execution",
          desc: "Standardized institutional agreements eliminating $5,000 legal setup costs for angel rounds.",
          icon: <FileText size={14} className="text-purple-500" />
        },
        {
          title: "Direct Check-Writer Introductions",
          desc: "Crowdsourced warm intro graph granting direct WhatsApp & Telegram access to verified leads.",
          icon: <Zap size={14} className="text-amber-500" />
        }
      ],
      helpTitle: "Need custom fundraising help?",
      helpDesc: "Book a direct 15-min strategy call with platform partners.",
      helpEmail: "8093akash@gmail.com",
      callLink: "https://cal.com/raisequity",
      ecosystem: ["Google Cloud", "AWS Activate", "Base", "Solana", "Arbitrum", "Dodo Payments"]
    },
    investor: {
      badge: "Institutional Partner · 7-Day Pre-Public Dealflow 💼",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      headline: "Access institutional dealflow before it hits Twitter.",
      narrative: "Filter 180+ verified Web2 & Web3 startups by ARR, chain, GitHub velocity, and anchor backers with instant Cal.com scheduling.",
      features: [
        {
          title: "7-Day Front-Run Window",
          desc: "Review verified pitch decks and cap tables 7 days before public syndication launches.",
          icon: <Award size={14} className="text-amber-500" />
        },
        {
          title: "Founder Warm Introductions Graph",
          desc: "Reach founders directly with peer-introduced verified channels via Telegram and Cal.com.",
          icon: <Sparkles size={14} className="text-emerald-500" />
        },
        {
          title: "Algorithmic Thesis Match",
          desc: "Filter 180+ startups across AI, DeFi, RWA, and Infrastructure tailored to your check size.",
          icon: <ShieldCheck size={14} className="text-[#0070F3]" />
        }
      ],
      helpTitle: "Syndicate check-writer or fund lead?",
      helpDesc: "Inquire about institutional co-investment allocations & SPVs.",
      helpEmail: "8093akash@gmail.com",
      callLink: "https://cal.com/raisequity",
      ecosystem: ["a16z crypto", "Pantera", "Coinbase Ventures", "Framework", "Y Combinator", "Stripe"]
    },
    service_provider: {
      badge: "Vetted Agency Studio · 100% Milestone Escrow 🏛️",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      headline: "Lock guaranteed contracts with pre-funded escrow vaults.",
      narrative: "Pitch development, smart contract auditing, and GTM services directly to funded founders with active treasury capital and 0% default rate.",
      features: [
        {
          title: "100% Pre-Funded Milestone Escrows",
          desc: "Clients deposit milestone capital upfront with zero dispute risk and instant USDC settlement.",
          icon: <ShieldCheck size={14} className="text-emerald-500" />
        },
        {
          title: "Pitch 90+ Funded Startups",
          desc: "Direct access to seed-funded founders actively searching for protocol engineering and GTM.",
          icon: <Briefcase size={14} className="text-[#0070F3]" />
        },
        {
          title: "Accredited Agency Directory",
          desc: "Gain institutional trust with a verified studio profile, dofollow backlinks, and client reviews.",
          icon: <Sparkles size={14} className="text-purple-500" />
        }
      ],
      helpTitle: "Agency studio looking for deals?",
      helpDesc: "Connect with our dealflow desk to review active client RFPs.",
      helpEmail: "8093akash@gmail.com",
      callLink: "https://cal.com/raisequity",
      ecosystem: ["Smart Contract Audits", "Full-Stack Web3", "Tokenomics", "ZK Proofs", "GTM Scaling"]
    },
    admin: {
      badge: "Super Admin Gateway 🛡️",
      badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      headline: "Platform Operations & Master Ledger Control.",
      narrative: "Administrative access to verified contracts, user roles, credit packages, and system telemetries.",
      features: [],
      helpTitle: "Platform Admin Access",
      helpDesc: "Strict access control with multi-factor authentication.",
      helpEmail: "8093akash@gmail.com",
      callLink: "https://cal.com/raisequity",
      ecosystem: ["Delaware C-Corp", "FireStore", "Dodo Payments", "Google Cloud"]
    }
  };

  const currentPersona = personaContent[role === "admin" ? "founder" : role];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030303] text-slate-900 dark:text-[#EDEDED] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 font-sans transition-colors duration-150">
      
      {/* ── EXPANSIVE CONTAINER (IMAGE 2 WIDE LAYOUT UPGRADE) ── */}
      <div className="w-full max-w-6xl bg-white dark:bg-[#0A0A0A] rounded-[32px] border border-slate-200/80 dark:border-[#262626] shadow-2xl overflow-hidden relative z-10 transition-colors duration-150">
        
        {showConfirmation ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 sm:p-16 text-center max-w-lg mx-auto space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-black text-slate-900 dark:text-white">Check your inbox</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-mono">
                We sent a confirmation link to <strong className="text-[#0070F3]">{email}</strong>.
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Click the verification link to activate your institutional profile, then log in to enter your workspace terminal.
            </p>
            <button 
              onClick={() => { setShowConfirmation(false); setIsSignUp(false); }}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              Back to Terminal Login
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
            
            {/* ════════ LEFT COLUMN: DYNAMIC VALUE PROPOSITION PANEL (5 COLS) ════════ */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 via-slate-100/60 to-white dark:from-[#0E0F12] dark:via-[#0A0A0A] dark:to-[#050505] p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-[#222222] flex flex-col justify-between relative overflow-hidden">
              
              {/* Brand Header */}
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <Link to="/" className="inline-flex items-center gap-2.5 group">
                    <Logo className="w-8 h-8 rounded-xl shadow-xs group-hover:scale-105 transition-transform" />
                    <span className="font-heading font-black text-2xl tracking-tight text-slate-900 dark:text-white">
                      Raisequity
                    </span>
                  </Link>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-[#1A1A1A] border border-slate-300/60 dark:border-white/10 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>v2.4 Live</span>
                  </div>
                </div>

                {/* Animated Persona Value Proposition Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* Persona Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold border shadow-xs">
                      <span className={currentPersona.badgeColor}>{currentPersona.badge}</span>
                    </div>

                    {/* Dynamic Headline */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 dark:text-white leading-snug tracking-tight">
                        {currentPersona.headline}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        {currentPersona.narrative}
                      </p>
                    </div>

                    {/* High-Impact Feature Highlights */}
                    <div className="space-y-2.5 pt-1">
                      {currentPersona.features.map((feat, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 dark:bg-[#141518]/80 border border-slate-200/80 dark:border-white/5 shadow-xs"
                        >
                          <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-[#1F2025] shrink-0">
                            {feat.icon}
                          </div>
                          <div>
                            <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                              {feat.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed mt-0.5">
                              {feat.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Concierge & Ecosystem Strip */}
              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-[#222222] space-y-4 relative z-10">
                {/* Concierge Support Block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      {currentPersona.helpTitle}
                    </span>
                    <a 
                      href={`mailto:${currentPersona.helpEmail}`}
                      className="text-[11px] text-[#0070F3] hover:underline"
                    >
                      {currentPersona.helpEmail}
                    </a>
                  </div>
                  <a
                    href={currentPersona.callLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                  >
                    <PhoneCall size={12} />
                    <span>Book Strategy Call</span>
                    <ExternalLink size={10} />
                  </a>
                </div>

                {/* Ecosystem Tags Strip */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400 mr-1">
                    Ecosystem:
                  </span>
                  {currentPersona.ecosystem.map((eco, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-[#16171B] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-2xs"
                    >
                      {eco}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ════════ RIGHT COLUMN: AUTHENTICATION INTERACTION PANEL (7 COLS) ════════ */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white dark:bg-[#0A0A0A]">
              
              <div className="max-w-md w-full mx-auto space-y-6">
                
                {/* Mac Terminal Header Dots */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block" />
                  </div>
                  <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Terminal size={12} className="text-[#0070F3]" />
                    <span>auth.raisequity.com/v2</span>
                  </div>
                </div>

                {/* Role Switcher Tabs (Founder / Investor / Partner) */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Select Your Institutional Role:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-[#141518] p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
                    <button 
                      type="button"
                      onClick={() => { setRole("founder"); setError(null); }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        role === "founder" 
                          ? "bg-[#0070F3] text-white shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <Rocket size={13} />
                      <span>Founder</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setRole("investor"); setError(null); }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        role === "investor" 
                          ? "bg-[#F5A623] text-black shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <ShieldCheck size={13} />
                      <span>Investor</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setRole("service_provider"); setError(null); }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        role === "service_provider" 
                          ? "bg-[#00C274] text-black shadow-sm" 
                          : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <Briefcase size={13} />
                      <span>Partner</span>
                    </button>
                  </div>
                </div>

                {/* Form Heading */}
                <div>
                  <h1 className="text-2xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                    {isSignUp 
                      ? `Create ${role === 'service_provider' ? 'Agency' : role === 'investor' ? 'Investor' : 'Founder'} Account` 
                      : `${role === 'service_provider' ? 'Agency Studio' : role === 'investor' ? 'Institutional Partner' : 'Founder'} Terminal`}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                    {isSignUp 
                      ? "Join the premier Web2 & Web3 institutional funding ecosystem." 
                      : "Enter your credentials to access your dealflow & milestone escrow."}
                  </p>
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-white dark:bg-[#141518] hover:bg-slate-50 dark:hover:bg-[#1B1C20] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 py-3.5 rounded-2xl font-mono font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-px bg-slate-200 dark:border-white/10"></div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    or continue with work email
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:border-white/10"></div>
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl text-xs font-mono"
                  >
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Email / Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 px-1">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Satoshi Nakamoto"
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); setError(null); }}
                        disabled={isLoading}
                        className="w-full bg-slate-50 dark:bg-[#141518] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0070F3] outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 px-1">
                      Work Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input 
                        type="email" 
                        required
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(null); }}
                        disabled={isLoading}
                        className="w-full bg-slate-50 dark:bg-[#141518] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0070F3] outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5 px-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Password *
                      </label>
                      {!isSignUp && (
                        <button 
                          type="button" 
                          onClick={handleForgotPassword} 
                          className="text-[11px] font-mono text-slate-400 hover:text-[#0070F3] transition-colors cursor-pointer"
                        >
                          {resetSent ? "✓ Reset link sent" : "Forgot password?"}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(null); }}
                        disabled={isLoading}
                        className="w-full bg-slate-50 dark:bg-[#141518] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0070F3] outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0070F3] hover:bg-[#0060DF] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 font-mono"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>{isSignUp ? `Create ${role === 'service_provider' ? 'Agency' : role === 'investor' ? 'Investor' : 'Founder'} Account` : "Enter Terminal"}</span>
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Account Toggle Link */}
                <div className="pt-2 text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                    {isSignUp ? "Already have an institutional account?" : "New to Raisequity?"}{" "}
                    <button 
                      type="button"
                      onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                      className="text-[#0070F3] dark:text-[#3291FF] font-bold hover:underline underline-offset-4 cursor-pointer font-mono text-xs ml-1"
                    >
                      {isSignUp ? "Sign In to Terminal" : "Create Account"}
                    </button>
                  </p>
                </div>

                {/* Regulatory / Compliance Badge */}
                <p className="text-center text-[10px] text-slate-400 font-mono leading-relaxed pt-2">
                  Institutional grade 256-bit encryption. Governed by Delaware C-Corp &amp; SAFT compliance frameworks.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
