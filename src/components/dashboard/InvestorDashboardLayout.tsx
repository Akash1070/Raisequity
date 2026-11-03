import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, Compass, Settings, Bell, Menu, X, BarChart3, Users2, Workflow, LogOut, ChevronDown, Terminal, Flame, ShieldCheck, MessageSquare, Coins, Plus, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Logo } from "../ui/Logo";
import CreditPackageModal from "./CreditPackageModal";

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function SidebarItem({ to, icon, label, badge }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
          isActive
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-bold shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-850 font-medium"
        }`
      }
    >
      <div className="flex items-center gap-3">
        <span className="transition-transform group-hover:scale-110">{icon}</span>
        <span className="text-[13px]">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-amber-400 text-black text-[10px] font-mono font-black px-2 py-0.5 rounded-full shadow-xs">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function InvestorDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fullName = profile?.full_name || user?.email?.split("@")[0] || "Pro Investor";
  const avatarSeed = fullName.split(" ")[0];
  const avatarUrl =
    profile?.profile_photo_url ||
    profile?.avatar_url ||
    (profile as any)?.photoURL ||
    (user as any)?.photoURL ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

  const handleLogout = async () => {
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

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#000000] text-[#171717] dark:text-[#EDEDED] overflow-hidden font-sans transition-colors duration-150">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-[#262626] p-5 shrink-0 shadow-xs transition-colors duration-150">
        <div className="flex items-center gap-3 mb-6 px-1">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo className="w-9 h-9 rounded-xl shadow-xs" />
            <div>
              <span className="font-extrabold text-[17px] tracking-tight text-[#171717] dark:text-white block leading-none font-heading">Raisequity</span>
              <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 mt-1 inline-block">Pro Investor</span>
            </div>
          </Link>
        </div>

        {/* 7-Day Front-Run Advantage Pill */}
        <div className="mb-4 p-3 bg-slate-50 dark:bg-[#171717] rounded-xl border border-amber-500/30 shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
            <Flame size={12} className="fill-amber-400 text-amber-500" />
            <span>Front-Run Active</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">7-Day Pre-Public Access to high-conviction dealflow.</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider px-2 block mb-1.5">
              DISCOVER
            </span>
            <nav className="space-y-1">
              <SidebarItem to="/investor-dashboard/deals" icon={<LayoutGrid size={16} />} label="Deals" badge={180} />
              <SidebarItem to="/investor-dashboard/community" icon={<Share2 size={16} />} label="Community Feed / Socials" />
              <SidebarItem to="/investor-dashboard/messages" icon={<MessageSquare size={16} />} label="Direct Messages" />
              <SidebarItem to="/investor-dashboard/recommended" icon={<Users2 size={16} />} label="Recommended" badge={6} />
              <SidebarItem to="/investor-dashboard/intros" icon={<Workflow size={16} />} label="Requested Intros" badge={2} />
            </nav>
          </div>

          <div>
            <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider px-2 block mb-1.5">
              ACTIVITY
            </span>
            <nav className="space-y-1">
              <SidebarItem to="/investor-dashboard/portfolio" icon={<BarChart3 size={16} />} label="Portfolio & SAFEs" />
              <SidebarItem to="/investor-dashboard/coaching" icon={<Compass size={16} />} label="Partner Calls" />
            </nav>
          </div>
        </div>

        {/* Credit Balance & Top Up Box */}
        <div className="mb-2 p-2.5 bg-white dark:bg-[#121316] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Coins size={11} className="text-amber-500" />
              Partner Credits
            </span>
            <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-300">
              {profile?.credit_balance ?? 50}
            </span>
          </div>
          <button
            onClick={() => setCreditModalOpen(true)}
            className="w-full py-1.5 px-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
          >
            <Plus size={11} /> Top Up Credits
          </button>
        </div>

        {/* HireInCrypto-Style Investor Handle Box */}
        <div className="mb-2 p-2.5 bg-white dark:bg-[#121316] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Investor Handle
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="flex items-center justify-between gap-1 p-1 rounded-lg bg-slate-50 dark:bg-[#18191e] border border-slate-200/70 dark:border-white/5 font-mono text-[10px] text-slate-700 dark:text-slate-300">
            <span className="truncate">raisequity.com/investor/{user?.email?.split('@')[0] || 'partner'}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://raisequity.com/investor/${user?.email?.split('@')[0] || 'partner'}`);
              }}
              className="p-1 text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
              title="Copy Handle"
            >
              <Flame size={11} className="text-amber-500" />
            </button>
          </div>
        </div>

        {/* AI Assistant Box (HireInCrypto Style) */}
        <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Terminal size={13} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-black dark:text-white truncate">
              Sentinel AI Active
            </div>
            <div className="text-[8px] font-mono text-neutral-400 truncate">
              Fast-Pass Diligence ready
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-[#262626] space-y-1">
          <SidebarItem to="/investor-dashboard/settings" icon={<Settings size={18} />} label="Settings" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-semibold text-xs cursor-pointer"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#262626] px-4 flex items-center justify-between z-50 transition-colors duration-150">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 rounded-lg shadow-xs" />
          <span className="font-extrabold text-[17px] tracking-tight text-[#171717] dark:text-white">Raisequity</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <Menu size={22} />
          </button>
        </div>
      </div>

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
              className="w-72 h-full bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-[#262626] p-5 text-[#171717] dark:text-slate-100 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Logo className="w-8 h-8 rounded-lg shadow-xs" />
                  <span className="font-extrabold text-[17px] tracking-tight text-[#171717] dark:text-white">Raisequity</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"><X size={20} /></button>
              </div>

              <nav className="space-y-1">
                <SidebarItem to="/investor-dashboard/deals" icon={<LayoutGrid size={18} />} label="Deal Feed" />
                <SidebarItem to="/investor-dashboard/community" icon={<Share2 size={18} />} label="Community Feed" />
                <SidebarItem to="/investor-dashboard/messages" icon={<MessageSquare size={18} />} label="Direct Messages" />
                <SidebarItem to="/investor-dashboard/intros" icon={<Workflow size={18} />} label="Requested Intros" />
                <SidebarItem to="/investor-dashboard/portfolio" icon={<BarChart3 size={18} />} label="Onboarded Projects" />
                <SidebarItem to="/investor-dashboard/recommended" icon={<Users2 size={18} />} label="Recommended" />
                <SidebarItem to="/investor-dashboard/coaching" icon={<Compass size={18} />} label="Partner Calls" />
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto w-full pt-16 lg:pt-0 bg-[#FAFAFA] dark:bg-[#000000] transition-colors duration-150">
        <header className="h-16 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-slate-200 dark:border-[#262626] px-8 hidden lg:flex items-center justify-between sticky top-0 z-40 transition-colors duration-150">
           <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FAFAFA] dark:bg-[#171717] border border-slate-200 dark:border-[#333333] font-mono text-[11px] text-slate-600 dark:text-slate-300 shadow-xs">
                <Terminal size={12} className="text-amber-500" />
                <span>app.raisequity.com/investor</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-2 animate-pulse" />
              </div>
           </div>

           <div className="flex items-center gap-3">
              <ThemeToggle showLabel={true} />

              <div className="relative pl-4 border-l border-slate-200 dark:border-neutral-800" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all cursor-pointer focus:outline-none"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="text-right">
                    <div className="text-xs font-bold leading-none text-[#171717] dark:text-white">{fullName}</div>
                    <div className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase mt-1">Verified Partner</div>
                  </div>
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-xs shrink-0">
                     <img src={avatarUrl} alt="Investor" className="w-full h-full object-cover" />
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
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">{user?.email || "investor@raisequity.com"}</div>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <Link
                          to="/investor-dashboard/settings"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-slate-700 dark:text-slate-300"
                        >
                          <Settings size={14} className="text-slate-500" />
                          Investor Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors text-left cursor-pointer"
                        >
                          <LogOut size={14} />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>
        </header>

        {location.pathname === "/investor-dashboard/deals" || location.pathname === "/investor-dashboard" ? (
          <div className="flex-1 h-full w-full flex flex-col overflow-hidden">
            {children}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pt-20 lg:pt-8 pb-12 lg:pb-8 px-4 sm:px-8 max-w-5xl mx-auto w-full">
            {children}
          </div>
        )}
      </main>

      <CreditPackageModal
        isOpen={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        requiredCredits={25}
        actionTitle="Partner Credit Top-Up"
      />
    </div>
  );
}
