import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { 
  LayoutDashboard, Users, Building2, TrendingUp, Award, 
  Briefcase, Gift, Globe, LogOut, Menu, X, 
  Shield, ChevronDown, FileText, Rocket, Sliders, Terminal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { Logo } from "../ui/Logo";

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
      end
      className={({ isActive }) =>
        `flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
          isActive
            ? "bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/30 font-bold shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-850 font-medium"
        }`
      }
    >
      <div className="flex items-center gap-3">
        <span className="transition-transform group-hover:scale-110">{icon}</span>
        <span className="text-[13px]">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-[#0070F3] text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-full shadow-xs min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsProfileDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sidebarContent = (
    <div className="flex flex-col h-full font-sans text-[#171717] dark:text-[#EDEDED]">
      <div className="flex items-center gap-3 mb-4 px-1">
        <Logo className="w-9 h-9 rounded-xl shadow-xs" />
        <div>
          <span className="font-extrabold text-[17px] tracking-tight text-[#171717] dark:text-white block leading-none font-heading">Raisequity</span>
          <span className="text-[9px] font-mono font-bold text-[#0070F3] uppercase tracking-widest bg-[#0070F3]/10 px-2 py-0.5 rounded border border-[#0070F3]/25 mt-1 inline-block">Admin Terminal</span>
        </div>
      </div>

      <div className="mt-4 mb-2 px-2">
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Platform Core</span>
      </div>

      <nav className="space-y-1">
        <SidebarItem to="/admin" icon={<LayoutDashboard size={17} />} label="System Overview" />
        <SidebarItem to="/admin/companies" icon={<Building2 size={17} />} label="Startups & Decks" badge={5} />
        <SidebarItem to="/admin/investors" icon={<TrendingUp size={17} />} label="Verified Investors" badge={2} />
        <SidebarItem to="/admin/matches" icon={<Briefcase size={17} />} label="Match Pipeline" />
        <SidebarItem to="/admin/agreements" icon={<FileText size={17} />} label="Agreements & SAFEs" />
        <SidebarItem to="/admin/launches" icon={<Rocket size={17} />} label="Directory Launches" />
      </nav>

      <div className="mt-6 mb-2 px-2">
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Perks &amp; Grants</span>
      </div>

      <nav className="space-y-1">
        <SidebarItem to="/admin/grants" icon={<Award size={17} />} label="Ecosystem Grants" />
        <SidebarItem to="/admin/credits" icon={<Gift size={17} />} label="Founder Credits" />
        <SidebarItem to="/admin/experts" icon={<Globe size={17} />} label="Service Directory" />
      </nav>

      <div className="mt-6 mb-2 px-2">
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Configuration</span>
      </div>

      <nav className="space-y-1">
        <SidebarItem to="/admin/config" icon={<Sliders size={17} />} label="Platform Config" />
      </nav>

      {/* HireInCrypto-Style Admin Handle Box */}
      <div className="mb-2 p-2.5 bg-white dark:bg-[#121316] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Console Terminal ID
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="p-1 rounded-lg bg-slate-50 dark:bg-[#18191e] border border-slate-200/70 dark:border-white/5 font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate">
          admin.sys.raisequity.io/v2
        </div>
      </div>

      {/* AI Assistant Box (HireInCrypto Style) */}
      <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Terminal size={13} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-black dark:text-white truncate">
            Watchdog Engine Active
          </div>
          <div className="text-[8px] font-mono text-neutral-400 truncate">
            Zero anomalous events
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-[#262626] mt-auto">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-semibold text-xs cursor-pointer"
        >
          <LogOut size={17} />
          <span>Exit Console</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#000000] text-[#171717] dark:text-[#EDEDED] overflow-hidden font-sans transition-colors duration-150">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-[#262626] p-5 shrink-0 shadow-xs transition-colors duration-150">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#262626] px-4 flex items-center justify-between z-50 transition-colors duration-150">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 rounded-lg shadow-xs" />
          <span className="font-extrabold text-[17px] tracking-tight text-[#171717] dark:text-white">Admin Control</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
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
              className="w-72 h-full bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-[#262626] p-5 relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-5 right-5 p-2 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white rounded-lg cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full pt-16 lg:pt-0 flex flex-col bg-[#FAFAFA] dark:bg-[#000000] transition-colors duration-150">
        {/* Top Navbar */}
        <header className="h-16 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-slate-200 dark:border-[#262626] px-8 hidden lg:flex items-center justify-between sticky top-0 z-40 transition-colors duration-150">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FAFAFA] dark:bg-[#171717] border border-slate-200 dark:border-[#333333] font-mono text-[11px] text-slate-600 dark:text-slate-300 shadow-xs">
            <Terminal size={12} className="text-[#0070F3]" />
            <span>admin.raisequity.com/control</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0070F3] ml-2 animate-pulse" />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative pl-2" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all cursor-pointer focus:outline-none"
              >
                <div className="text-right">
                  <div className="text-xs font-bold leading-none text-[#171717] dark:text-white">{profile?.full_name || "Admin"}</div>
                  <div className="text-[9px] font-mono text-[#0070F3] font-bold uppercase mt-1">Super Admin</div>
                </div>
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-xs shrink-0">
                  <img
                    src={profile?.profile_photo_url || profile?.avatar_url || (profile as any)?.photoURL || (user as any)?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`}
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown size={14} className={`text-slate-500 dark:text-slate-400 transition-transform ${isProfileDropdownOpen ? "rotate-180 text-black dark:text-white" : ""}`} />
              </button>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#171717] rounded-2xl border border-slate-200 dark:border-[#333333] shadow-2xl p-2 z-50 text-[#171717] dark:text-slate-200"
                  >
                    <div className="p-3 bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-xl mb-1 border border-slate-200 dark:border-[#262626]">
                      <div className="text-xs font-extrabold text-[#171717] dark:text-white">{profile?.full_name || "System Admin"}</div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">{user?.email || "admin@raisequity.com"}</div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
