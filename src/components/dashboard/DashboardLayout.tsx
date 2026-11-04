import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Coins, Settings, LogOut, ChevronDown, Terminal, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useFounderProfile } from "../../hooks/useFounderProfile";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Logo } from "../ui/Logo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();
  const { founderProfile } = useFounderProfile();
  const navigate = useNavigate();

  // Role Protection: Redirect agencies and investors out of Founder Hub
  useEffect(() => {
    if (profile?.role === "service_provider") {
      navigate("/agency-dashboard/rfps", { replace: true });
    } else if (profile?.role === "investor") {
      navigate("/investor-dashboard/deals", { replace: true });
    }
  }, [profile?.role, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsProfileDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fullName = founderProfile?.full_name || profile?.full_name || user?.email?.split("@")[0] || "Founder";
  const avatarUrl =
    founderProfile?.profile_photo_url ||
    profile?.profile_photo_url ||
    profile?.avatar_url ||
    (profile as any)?.photoURL ||
    (user as any)?.photoURL ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName.split(" ")[0]}`;
  const plan = founderProfile?.plan || 'basic';

  const [liveCredits, setLiveCredits] = useState<number | null>(null);

  useEffect(() => {
    const handleCreditUpdate = (e: any) => {
      if (e?.detail?.newBalance !== undefined) {
        setLiveCredits(e.detail.newBalance);
      }
    };
    window.addEventListener('rq_credits_updated', handleCreditUpdate);
    return () => window.removeEventListener('rq_credits_updated', handleCreditUpdate);
  }, []);

  const credits = liveCredits ?? (profile?.credit_balance !== undefined && profile?.credit_balance !== null
    ? profile.credit_balance
    : (founderProfile?.credits !== undefined && founderProfile?.credits !== null
    ? founderProfile.credits
    : 50));

  const planColors: Record<string, string> = {
    basic: "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    premium: "text-amber-600 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30",
    pro: "text-[#0070F3] bg-[#0070F3]/10 border-[#0070F3]/30",
    concierge: "text-emerald-600 dark:text-[#00F5A0] bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30"
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#000000] overflow-hidden text-[#171717] dark:text-[#EDEDED] font-sans transition-colors duration-150">
      {/* Desktop Sidebar (Left Panel) */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-[#262626] p-5 shrink-0 shadow-xs transition-colors duration-150">
        <Sidebar />
      </aside>

      {/* Mobile Header (Top) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#262626] px-4 flex items-center justify-between z-50 transition-colors duration-150">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 rounded-lg shadow-xs" />
          <span className="font-extrabold text-[17px] tracking-tight text-[#171717] dark:text-white">Raisequity</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/dashboard/credits"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 rounded-full border border-amber-500/30 transition-colors"
            title="View credits & perks"
          >
            <Coins size={12} className="text-amber-500" />
            <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-300">{credits}</span>
          </Link>
          <NotificationBell />
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Open mobile navigation"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Sidebar) Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-[280px] h-full bg-white dark:bg-[#0A0A0A] p-5 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-slate-200 dark:border-[#262626] px-8 hidden lg:flex items-center justify-between sticky top-0 z-40 transition-colors duration-150">
          {/* Breadcrumb / Telemetry Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FAFAFA] dark:bg-[#171717] border border-slate-200 dark:border-[#333333] font-mono text-[11px] text-slate-600 dark:text-slate-300 shadow-xs">
            <Terminal size={12} className="text-[#0070F3]" />
            <span>app.raisequity.com/dashboard</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0070F3] ml-2 animate-pulse" />
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle showLabel={true} />

            {/* Interactive Credits Counter */}
            <Link
              to="/dashboard/credits"
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-[#171717] hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-full border border-slate-200 dark:border-[#333333] transition-all cursor-pointer group shadow-xs"
              title="Click to view credits, perks & top up"
            >
              <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-black shadow-xs group-hover:scale-110 transition-transform">
                <Coins size={11} />
              </div>
              <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-300">{credits} Credits</span>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider pl-1.5 border-l border-slate-200 dark:border-neutral-700">Top Up</span>
            </Link>

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Profile Dropdown Button */}
            <div className="relative pl-4 border-l border-slate-200 dark:border-neutral-800" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all cursor-pointer focus:outline-none"
                aria-expanded={isProfileDropdownOpen}
                aria-haspopup="true"
              >
                <div className="text-right">
                  <div className="text-xs font-bold leading-none text-[#171717] dark:text-white">{fullName}</div>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider mt-1 border ${planColors[plan] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {plan}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-xs shrink-0 relative">
                  <img src={avatarUrl} alt="User Profile" className="w-full h-full object-cover" />
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180 text-black dark:text-white" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#171717] rounded-2xl border border-slate-200 dark:border-[#333333] shadow-2xl p-2 z-50 overflow-hidden text-[#171717] dark:text-slate-200"
                  >
                    <div className="p-3 bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-xl mb-1 border border-slate-200 dark:border-[#262626] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-xs shrink-0">
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-extrabold text-[#171717] dark:text-white truncate">{fullName}</div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">{user?.email || "founder@raisequity.com"}</div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        to="/dashboard/settings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-slate-700 dark:text-slate-300"
                      >
                        <Settings size={14} className="text-slate-500" />
                        Settings &amp; SLA
                      </Link>

                      <div className="pt-1 border-t border-slate-100 dark:border-neutral-800">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors text-left cursor-pointer"
                        >
                          <LogOut size={14} />
                          Log Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content Canvas */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-8 pt-20 pb-12 lg:py-6 custom-scrollbar bg-[#FAFAFA] dark:bg-[#000000] transition-colors duration-150">
          <div className="max-w-[1200px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
