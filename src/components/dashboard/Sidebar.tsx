import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Home, Users, Share2, Briefcase, Settings, LogOut, Gift, Coins, Crown, Sparkles, Zap, Flame, Rocket, Clock, MessageSquare
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useFounderProfile } from "../../hooks/useFounderProfile";
import ReferralCard from "./ReferralCard";
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
      {badge !== undefined && badge > 0 && (
        <span className="bg-[#0070F3] text-white text-[10px] font-black min-w-[20px] px-2 py-0.5 rounded-full text-center font-mono shadow-xs">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    basic: { bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-300", icon: null },
    premium: { bg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30", text: "text-amber-600 dark:text-amber-300", icon: <Crown size={11} /> },
    pro: { bg: "bg-[#0070F3]/10 border-[#0070F3]/30", text: "text-[#0070F3]", icon: <Sparkles size={11} /> },
    concierge: { bg: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-600 dark:text-[#00F5A0]", icon: <Zap size={11} /> },
  };
  const c = config[plan] || config.basic;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border ${c.bg} ${c.text}`}>
      {c.icon}
      {plan}
    </span>
  );
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, profile, signOut } = useAuth();
  const { founderProfile } = useFounderProfile();
  const [showReferralModal, setShowReferralModal] = useState(false);
  const navigate = useNavigate();

  const fullName = founderProfile?.full_name || profile?.full_name || user?.email?.split("@")[0] || "Founder";
  const avatarUrl = founderProfile?.profile_photo_url || profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName.split(" ")[0]}`;
  const plan = founderProfile?.plan || 'basic';
  const credits = founderProfile?.credits ?? profile?.credit_balance ?? 50;
  const referralCode = founderProfile?.referral_code || 'RAISEQUITY';

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleSwitchToAgency = async () => {
    const uid = user?.uid || (user as any)?.id;
    if (uid) {
      try {
        await updateDoc(doc(db, "users", uid), {
          role: "service_provider",
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Could not switch role:", err);
      }
    }
    navigate("/agency-dashboard/rfps");
  };

  return (
    <div className="flex flex-col h-full font-sans text-[#171717] dark:text-[#EDEDED]">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-5 px-1">
        <Logo className="w-9 h-9 rounded-xl shadow-xs" />
        <div>
          <span className="font-extrabold text-[17px] tracking-tight text-[#171717] dark:text-white block leading-none font-heading">Raisequity</span>
          <span className="text-[9px] font-mono font-bold text-[#0070F3] uppercase tracking-widest bg-[#0070F3]/10 px-2 py-0.5 rounded border border-[#0070F3]/25 mt-1 inline-block">Founder Hub</span>
        </div>
      </div>

      {/* Invite Button */}
      <button
        onClick={() => setShowReferralModal(true)}
        className="w-full flex items-center justify-center gap-2 px-3.5 py-2 mb-3 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
      >
        <Gift size={14} />
        <span>Invite Founders</span>
        <span className="bg-white/20 text-white px-1.5 py-0.2 rounded font-mono text-[10px] font-black">+50</span>
      </button>

      {/* Portal Switcher Pill */}
      <div className="mb-3 p-1.5 bg-slate-100 dark:bg-[#141414] rounded-xl border border-slate-200 dark:border-[#262626] flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-500 font-bold px-1.5 text-[10px] uppercase">Portal:</span>
        <button
          onClick={handleSwitchToAgency}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] shadow-xs cursor-pointer active:scale-95 transition-all"
          title="Switch to Agency Dashboard"
        >
          <Sparkles size={11} />
          <span>Agency Suite →</span>
        </button>
      </div>

      {/* User Card */}
      <Link 
        to="/dashboard/settings" 
        onClick={onClose}
        className="mb-3 p-2.5 bg-slate-50 dark:bg-[#171717] hover:bg-slate-100 dark:hover:bg-[#1F1F1F] transition-colors rounded-xl border border-slate-200 dark:border-[#262626] block group"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-700 shrink-0">
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#171717] dark:text-white truncate leading-tight mb-0.5 group-hover:text-[#0070F3] transition-colors">{fullName}</div>
            <PlanBadge plan={plan} />
          </div>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-white dark:bg-[#0A0A0A] rounded-lg border border-slate-200 dark:border-neutral-800">
          <div className="w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center">
            <Coins size={9} className="text-black" />
          </div>
          <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-300">{credits}</span>
          <span className="text-[9px] font-mono text-slate-500 uppercase">credits</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        <SidebarItem to="/dashboard/feed" icon={<Home size={16} />} label="Feed & Telemetry" />
        <SidebarItem to="/dashboard/community" icon={<Share2 size={16} />} label="Community Feed / Socials" />
        <SidebarItem to="/dashboard/messages" icon={<MessageSquare size={16} />} label="Direct Messages" />
        <SidebarItem to="/dashboard/matches" icon={<Users size={16} />} label="Double-Blind Matches" badge={3} />
        <SidebarItem to="/dashboard/investors" icon={<Briefcase size={16} />} label="Check-Writers CRM" />
        <SidebarItem to="/dashboard/bookings" icon={<Clock size={16} />} label="30-Day SLA Calls" badge={1} />
        <SidebarItem to="/dashboard/services" icon={<Sparkles size={16} />} label="Vetted Web3 Agencies" badge={109} />
        <SidebarItem to="/dashboard/launch" icon={<Rocket size={16} />} label="Launch Directory" />
        <SidebarItem to="/dashboard/grants" icon={<Zap size={16} />} label="Grants Directory" />
        <SidebarItem to="/dashboard/credits" icon={<Gift size={16} />} label="Perks & Credits" />
      </nav>

      {/* HireInCrypto-Style Founder Handle Box */}
      <div className="mb-2 p-2.5 bg-white dark:bg-[#121316] rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Founder Handle
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="flex items-center justify-between gap-1 p-1 rounded-lg bg-slate-50 dark:bg-[#18191e] border border-slate-200/70 dark:border-white/5 font-mono text-[10px] text-slate-700 dark:text-slate-300">
          <span className="truncate">raisequity.com/f/{user?.email?.split('@')[0] || 'founder'}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://raisequity.com/f/${user?.email?.split('@')[0] || 'founder'}`);
            }}
            className="p-1 text-slate-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Copy Handle"
          >
            <Sparkles size={11} className="text-[#0070F3]" />
          </button>
        </div>
      </div>

      {/* AI Assistant Status Box (HireInCrypto Style) */}
      <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-[#0070F3]/5 to-purple-500/5 border border-[#0070F3]/20 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[#0070F3]/10 text-[#0070F3] flex items-center justify-center shrink-0">
          <Zap size={13} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-black dark:text-white truncate">
            Radar AI Active
          </div>
          <div className="text-[8px] font-mono text-neutral-400 truncate">
            180+ VCs indexed
          </div>
        </div>
      </div>

      {/* Footer Settings + Logout */}
      <div className="pt-3 border-t border-slate-200 dark:border-[#262626] space-y-1 mt-auto">
        <SidebarItem to="/dashboard/settings" icon={<Settings size={16} />} label="Settings" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-xs font-semibold cursor-pointer"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>

      {showReferralModal && (
        <ReferralCard
          referralCode={referralCode}
          onClose={() => setShowReferralModal(false)}
        />
      )}
    </div>
  );
}
