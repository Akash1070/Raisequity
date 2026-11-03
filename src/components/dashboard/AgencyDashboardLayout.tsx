import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  FileCode2,
  Lock,
  Briefcase,
  Coins,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Copy,
  Check,
  Sparkles,
  Bot,
  ExternalLink,
  Layers,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Logo } from "../ui/Logo";

interface AgencySidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
}

function AgencySidebarItem({ to, icon, label, badge }: AgencySidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer ${
          isActive
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1b20] font-medium"
        }`
      }
    >
      <div className="flex items-center gap-3">
        <span className="transition-transform group-hover:scale-110">{icon}</span>
        <span className="text-[13px]">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="bg-emerald-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function AgencyDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const agencyName = (profile as any)?.agency_name || profile?.company_name || profile?.full_name || "ChainCraft Labs";
  const agencyHandle = ((profile as any)?.handle || agencyName.toLowerCase().replace(/[^a-z0-9]/g, "")) || "chaincraft";
  const credits = profile?.credit_balance ?? 150;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://raisequity.com/agency/${agencyHandle}`);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2000);
  };

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

  const sidebarContent = (
    <div className="flex flex-col h-full font-sans text-[#171717] dark:text-[#EDEDED]">
      {/* Brand & Suite Indicator */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo className="w-9 h-9 rounded-xl shadow-xs group-hover:scale-105 transition-transform" />
          <div>
            <span className="font-extrabold text-[17px] tracking-tight text-[#171717] dark:text-white block leading-none font-heading">
              Raisequity
            </span>
            <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 mt-1 inline-block">
              Agency Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Escrow Vault Protection Banner */}
      <div className="mb-4 p-3 bg-emerald-50 dark:bg-[#101b15] rounded-2xl border border-emerald-500/30 shadow-xs">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-black uppercase tracking-wider mb-1">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>100% Escrow Vault</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-emerald-200/70 leading-snug font-medium">
          Pre-funded client milestone deposits. 0.0% default rate with 48h automatic release.
        </p>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <div>
          <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 block mb-1.5">
            CLIENT WORK &amp; RFPs
          </span>
          <nav className="space-y-1">
            <AgencySidebarItem
              to="/agency-dashboard/rfps"
              icon={<FileCode2 size={16} />}
              label="Client RFPs & Bounties"
              badge="5"
            />
            <AgencySidebarItem
              to="/agency-dashboard/escrows"
              icon={<Lock size={16} />}
              label="Active Escrow Vaults"
              badge="2"
            />
            <AgencySidebarItem
              to="/agency-dashboard/grants"
              icon={<Award size={16} />}
              label="Ecosystem Grants"
            />
          </nav>
        </div>

        <div>
          <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 block mb-1.5">
            AGENCY IDENTITY
          </span>
          <nav className="space-y-1">
            <AgencySidebarItem
              to="/agency-dashboard/profile"
              icon={<Briefcase size={16} />}
              label="Agency Portfolio"
            />
            <AgencySidebarItem
              to="/agency-dashboard/credits"
              icon={<Coins size={16} />}
              label="Starter Credits"
              badge="150"
            />
            <AgencySidebarItem
              to="/agency-dashboard/settings"
              icon={<Settings size={16} />}
              label="Settings & Payouts"
            />
          </nav>
        </div>
      </div>

      {/* HireInCrypto-Style Agency Handle Card */}
      <div className="mt-3 p-3 bg-white dark:bg-[#121316] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Agency Handle
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-xl bg-slate-50 dark:bg-[#18191e] border border-slate-200/70 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
          <span className="truncate">raisequity.com/agency/{agencyHandle}</span>
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Copy Public Handle"
          >
            {copiedHandle ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* AI Assistant Box (HireInCrypto Style) */}
      <div className="mt-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Bot size={15} />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-black dark:text-white truncate">
            EscrowBot Active
          </div>
          <div className="text-[9px] font-mono text-neutral-400 truncate">
            100% Pre-funded escrow locked
          </div>
        </div>
      </div>

      {/* User Account Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
            {agencyName[0]}
          </div>
          <div className="min-w-0">
            <div className="font-heading font-black text-xs text-black dark:text-white truncate">
              {agencyName}
            </div>
            <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              Verified Partner
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FAFAFA] dark:bg-[#000000] text-[#171717] dark:text-[#EDEDED] overflow-hidden font-sans transition-colors duration-150">
      {/* Desktop Sidebar (260px) */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-[#262626] p-5 shrink-0 shadow-xs transition-colors duration-150">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#262626] px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 rounded-lg shadow-xs" />
          <span className="font-extrabold text-[17px] tracking-tight text-[#171717] dark:text-white">
            Raisequity
          </span>
          <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            Agency
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Menu size={20} />
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
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[280px] h-full bg-white dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-[#262626] p-5 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Workspace (Split-Pane Ready) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 lg:pt-0">
        {/* Top Institutional Header Bar */}
        <header className="h-14 border-b border-slate-200 dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline-block">
              app.raisequity.com/agency
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
            <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Escrow Protection Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
              <Coins size={12} />
              <span>{credits} Free Credits</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Dashboard Page View */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
