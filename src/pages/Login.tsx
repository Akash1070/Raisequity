import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, ShieldCheck, ArrowRight, Mail, Lock, Loader2, AlertCircle, CheckCircle } from "lucide-react";
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
      // Store under BOTH keys so AuthContext (rq_ref_code) and legacy readers
      // (referred_by_code) see the referral at signup.
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

    // Honored redirect param: after login, send users where they asked to go.
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
  }, [user, profile, loading, needsProfile, role, navigate]);


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


  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-[#171717] dark:text-[#EDEDED] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-150">
      <div className="w-full max-w-[460px] relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <Logo className="w-10 h-10 rounded-xl shadow-xs group-hover:scale-105 transition-transform" />
            <span className="font-heading font-extrabold text-[28px] tracking-tight text-[#171717] dark:text-white">Raisequity</span>
          </Link>
          {showConfirmation ? (
            <>
              <h1 className="text-[26px] font-black text-[#171717] dark:text-white leading-tight">Check your email</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm">We sent a confirmation link to <strong className="text-[#0070F3]">{email}</strong></p>
            </>
          ) : (
            <>
              <h1 className="text-[26px] font-black text-[#171717] dark:text-white leading-tight">
                {isSignUp ? "Create Institutional Account" : "Access Terminal"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-xs sm:text-sm">
                {isSignUp ? "Join the premier Web2 & Web3 institutional funding network" : "Log in to manage your funding, dealflow & SLA guarantees"}
              </p>
            </>
          )}
        </div>

        {showConfirmation ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0B0F19]/90 backdrop-blur-xl rounded-[28px] border border-slate-800 shadow-2xl p-8 md:p-10 text-center"
          >
            <CheckCircle size={48} className="text-[#00F5A0] mx-auto mb-4" />
            <p className="text-slate-300 font-medium mb-6 text-sm">
              Click the link in your email to confirm your account, then come back and access your terminal.
            </p>
            <button 
              onClick={() => { setShowConfirmation(false); setIsSignUp(false); }}
              className="bg-[#00F5A0] text-black px-8 py-3 rounded-xl font-extrabold text-sm hover:bg-[#00D68B] shadow-[0_0_20px_rgba(0,245,160,0.25)] transition-all cursor-pointer"
            >
              Back to Login
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#0A0A0A] rounded-[28px] border border-slate-200 dark:border-[#262626] shadow-xl p-7 md:p-9 relative transition-colors duration-150"
            >
              {/* Terminal Window Mac dots */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-[#262626]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block" />
                </div>
                <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">auth.raisequity.com</div>
              </div>

              {/* Role Selection Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-[#141414] p-1 rounded-xl mb-6 border border-slate-200 dark:border-[#262626]">
                <button 
                  type="button"
                  onClick={() => { setRole("founder"); setError(null); }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    role === "founder" ? "bg-[#0070F3] text-white shadow-xs" : "text-slate-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <Rocket size={13} /> Founder
                </button>
                <button 
                  type="button"
                  onClick={() => { setRole("investor"); setError(null); }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    role === "investor" ? "bg-[#F5A623] text-black shadow-xs font-bold" : "text-slate-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  <ShieldCheck size={13} /> Investor
                </button>
                <button 
                  type="button"
                  onClick={() => { setRole("service_provider"); setError(null); }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    role === "service_provider" ? "bg-[#00C274] text-black shadow-xs font-bold" : "text-slate-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  Partner
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3.5 rounded-xl mb-5 text-xs font-mono"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 px-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Satoshi Nakamoto"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setError(null); }}
                      disabled={isLoading}
                      className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl px-4 py-3 text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3]/40 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 px-1">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="email" 
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      disabled={isLoading}
                      className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl pl-10 pr-4 py-3 text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3]/40 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Password</label>
                    {!isSignUp && (
                      <button type="button" onClick={handleForgotPassword} className="text-[11px] font-mono text-slate-400 hover:text-[#0070F3] transition-colors cursor-pointer">
                        {resetSent ? "✓ Reset link sent" : "Forgot?"}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); }}
                      disabled={isLoading}
                      className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-xl pl-10 pr-4 py-3 text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3]/40 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0070F3] hover:bg-[#0060DF] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 font-mono"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>{isSignUp ? `Create ${role === 'service_provider' ? 'Agency' : role === 'investor' ? 'Investor' : 'Founder'} Account` : "Enter Terminal"}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-slate-200 dark:bg-[#262626]"></div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">or</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-[#262626]"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white dark:bg-[#141414] hover:bg-slate-50 dark:hover:bg-[#1C1C1C] border border-slate-200 dark:border-[#262626] text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[#262626] text-center">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                  {isSignUp ? "Already have an account?" : "New to Raisequity?"} {" "}
                  <button 
                    onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                    className="text-[#0070F3] dark:text-[#3291FF] font-bold hover:underline underline-offset-4 decoration-2 cursor-pointer font-mono text-xs"
                  >
                    {isSignUp ? "Access Terminal" : "Create Account"}
                  </button>
                </p>
              </div>
            </motion.div>

            <p className="text-center mt-6 text-[10px] text-slate-500 font-mono max-w-xs mx-auto leading-relaxed">
              Institutional grade encryption. Governed by Delaware C-Corp &amp; SAFT compliance frameworks.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
