import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Flame, Rocket, Globe, Users, X, Search, ChevronDown, Lock, Unlock, MessageSquare, Mail, UserCheck, Sparkles, AlertCircle, Linkedin, Copy, CheckCircle2 } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useFounderProfile } from "../hooks/useFounderProfile";
import CreditPackageModal from "../components/dashboard/CreditPackageModal";

const defaultNetworks = {
  accelerators: [
    {
      id: "alliance-xyz",
      name: "Alliance.xyz",
      description: "One of the best-known crypto/AI accelerators; strong founder signal because of brand recognition, mentor network, and downstream fundraising outcomes.",
      funding: "$500k via SAFE.",
      bestFor: "Early-stage crypto or AI founders seeking strong investor signaling.",
      apply_url: "https://alliance.xyz",
      telegram: "@alliance_deals",
      contact_person: "Imran Khan (Managing Partner)",
      email: "apply@alliance.xyz",
      linkedin: "https://linkedin.com/in/imrankhan",
      category: "Accelerator",
    },
    {
      id: "denarii-labs",
      name: "Denarii Labs",
      description: "Tokenomics-focused accelerator backed by Red Beard Ventures; good fit for Web3 founders needing token design, investor prep, and GTM support.",
      funding: "$100k - $300k investment.",
      bestFor: "Token design, investor prep, and GTM support.",
      apply_url: "https://www.denariilabs.xyz",
      telegram: "@denariilabs",
      contact_person: "Sarah (Cohort Lead)",
      email: "info@denariilabs.xyz",
      linkedin: "https://linkedin.com/company/denariilabs",
      category: "Accelerator",
    },
    {
      id: "cointelegraph-accelerator",
      name: "Cointelegraph Accelerator",
      description: "Media-driven accelerator for Web3 startups; strong value proposition is distribution, credibility, and strategic exposure.",
      funding: "Up to $100k funding + $200k media support.",
      bestFor: "Distribution, credibility, and strategic exposure.",
      apply_url: "https://cointelegraph.com/tags/cointelegraph-accelerator",
      telegram: "@ct_accelerator",
      contact_person: "Paul (Media Lead)",
      email: "accelerator@cointelegraph.com",
      linkedin: "https://linkedin.com/company/cointelegraph",
      category: "Accelerator",
    },
    {
      id: "ibc-ventures",
      name: "IBC Ventures",
      description: "Best for founders looking for a mix of incubation, strategic investment, media reach, and access to a large Web3 network.",
      funding: "Six-figure strategic investments.",
      bestFor: "Incubation, strategic media reach & ecosystem access.",
      apply_url: "https://www.ibcgroup.io",
      telegram: "@ibc_deals",
      contact_person: "Mario (Managing Director)",
      email: "ventures@ibcgroup.io",
      linkedin: "https://linkedin.com/company/ibc-group",
      category: "Accelerator",
    },
    {
      id: "0xlabs",
      name: "0xLabs",
      description: "Focused on project verification and TGE support via a $50M incubation fund for high-conviction Web3 building.",
      funding: "$50M total fund size.",
      bestFor: "TGE support and core infrastructure projects.",
      apply_url: "https://www.0xlabs.tech",
      telegram: "@oxlabs_incubator",
      contact_person: "Alex (TGE Partner)",
      email: "contact@0xlabs.tech",
      linkedin: "https://linkedin.com/company/0xlabs",
      category: "Incubator",
    },
    {
      id: "aaa-pad",
      name: "AAA Pad by Palo Alto AI",
      description: "Incubation and investor connectivity for AI-driven Web3 projects looking to scale with expert backing.",
      funding: "Launchpad + Incubation support.",
      bestFor: "AI agents and AI x Web3 startups.",
      apply_url: "https://aaapad.palo-alto.ai/en",
      telegram: "@aaapad_ai",
      contact_person: "Elena (AI Lead)",
      email: "pad@palo-alto.ai",
      linkedin: "https://linkedin.com/company/palo-alto-ai",
      category: "Incubator",
    },
  ],
  launchpads: [
    {
      id: "chaingpt-pad",
      name: "ChainGPT Pad",
      description: "AI-powered IDO launchpad and incubator for Web3 projects; useful for token launch, distribution, and community access.",
      funding: "Funding, exposure, and community access.",
      bestFor: "Token launch, distribution, and incubator support.",
      apply_url: "https://pad.chaingpt.org",
      telegram: "@chaingpt_pad",
      contact_person: "Ilan (Founder)",
      email: "pad@chaingpt.org",
      linkedin: "https://linkedin.com/company/chaingpt",
      category: "Launchpad",
    },
    {
      id: "legion",
      name: "Legion",
      description: "Merit-based on-chain fundraising platform designed to connect projects, VCs, and retail participants in a curated way.",
      funding: "Incubated by Delphi Labs; connects with VCs.",
      bestFor: "On-chain fundraising and VC connections.",
      apply_url: "https://legion.cc/",
      telegram: "@legion_deals",
      contact_person: "Jose (Product Lead)",
      email: "team@legion.cc",
      linkedin: "https://linkedin.com/company/legion-cc",
      category: "Launchpad",
    },
    {
      id: "trustswap",
      name: "TrustSwap",
      description: "Established crypto launchpad with staking-based access and a recognizable retail investor community.",
      funding: "Raised $21M+ for startups through community.",
      bestFor: "Access to a large retail investor community.",
      apply_url: "https://trustswap.com",
      telegram: "@trustswap_launch",
      contact_person: "Jeff (Launch Manager)",
      email: "launch@trustswap.com",
      linkedin: "https://linkedin.com/company/trustswap",
      category: "Launchpad",
    },
  ],
};

function maskContact(val?: string, type: "email" | "telegram" | "linkedin" = "email"): string {
  if (!val) return "";
  if (type === "email") {
    const parts = val.split("@");
    if (parts.length < 2) return "c***@partner.com";
    return `${parts[0].charAt(0)}***@${parts[1]}`;
  }
  if (type === "linkedin") {
    return "in/l***_profile";
  }
  const clean = val.replace(/^@/, "");
  return `@${clean.charAt(0)}***`;
}

export default function Network() {
  const { user } = useAuth();
  const { founderProfile, refetch: refetchProfile } = useFounderProfile();
  const navigate = useNavigate();

  const [dbPartners, setDbPartners] = useState<any[]>([]);
  const [unlockedPartnerIds, setUnlockedPartnerIds] = useState<string[]>([]);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalProgram, setActiveModalProgram] = useState<any | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchNetworkData();
  }, [user?.uid]);

  const fetchNetworkData = async () => {
    try {
      // 1. Fetch user unlocked partners
      if (user?.uid) {
        const uSnap = await getDoc(doc(db, "users", user.uid));
        if (uSnap.exists()) {
          setUnlockedPartnerIds(uSnap.data().unlocked_partners || []);
        } else {
          const fSnap = await getDoc(doc(db, "founder_profiles", user.uid));
          if (fSnap.exists()) {
            setUnlockedPartnerIds(fSnap.data().unlocked_partners || []);
          }
        }
      }

      // 2. Fetch network partners from Firestore
      const ref = collection(db, "network_partners");
      const snap = await getDocs(ref);
      if (!snap.empty) {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setDbPartners(data);
      }
    } catch (err) {
      console.warn("[Network] Error fetching network partners:", err);
    }
  };

  const copyToClipboard = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUnlockContact = async (partner: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!user) {
      navigate("/login?redirect=/dashboard/programs");
      return;
    }

    const currentCredits = founderProfile?.credits || 0;
    if (currentCredits < 1) {
      setShowCreditModal(true);
      return;
    }

    setUnlockingId(partner.id);
    setErrorMsg(null);

    try {
      const uid = user.uid;
      const fRef = doc(db, "founder_profiles", uid);
      const uRef = doc(db, "users", uid);

      const newCredits = currentCredits - 1;

      // Update Firestore founder_profiles
      await updateDoc(fRef, {
        credits: newCredits,
        unlocked_partners: arrayUnion(partner.id)
      }).catch(() => {});

      // Sync Firestore users
      await updateDoc(uRef, {
        credits: newCredits,
        unlocked_partners: arrayUnion(partner.id)
      }).catch(() => {});

      setUnlockedPartnerIds((prev) => [...prev, partner.id]);
      await refetchProfile();

      setSuccessMsg(`Unlocked direct contact for ${partner.name || partner.title}! (1 Credit used)`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("[Network] Unlock Error:", err);
      setErrorMsg("Failed to unlock contact: " + err.message);
    } finally {
      setUnlockingId(null);
    }
  };

  const handleApply = (link?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      navigate("/login?redirect=/dashboard/programs");
      return;
    }
    if (link && link !== "#") {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      navigate("/dashboard/matches");
    }
  };

  const allPrograms = useMemo(() => {
    const defaults = [...defaultNetworks.accelerators, ...defaultNetworks.launchpads];
    const partnerMap = new Map<string, any>();

    // 1. Put default curated programs in map
    defaults.forEach((d) => partnerMap.set(d.id, d));

    // 2. Merge with Firestore entries so database additions are included without wiping defaults
    dbPartners.forEach((p) => {
      const id = p.id || `db_${p.name}`;
      const existing = partnerMap.get(id) || {};
      partnerMap.set(id, { ...existing, ...p });
    });

    const list = Array.from(partnerMap.values());

    return list.map((p) => {
      const isUnlocked = unlockedPartnerIds.includes(p.id) || (founderProfile as any)?.role === "admin";
      const hasDirectContact = Boolean(p.telegram || p.contact_person || p.email || p.linkedin);

      return {
        id: p.id || `partner_${p.name}`,
        name: p.name || p.title,
        description: p.description,
        funding: p.funding || p.grant_amount || "Varies by cohort",
        bestFor: p.bestFor || p.best_for || p.category || "Web3 & AI founders",
        link: p.apply_url || p.link || "#",
        category: p.category || "Accelerator",
        telegram: p.telegram,
        contact_person: p.contact_person,
        email: p.email,
        linkedin: p.linkedin,
        hasDirectContact,
        isUnlocked
      };
    });
  }, [dbPartners, unlockedPartnerIds, founderProfile]);

  const filteredPrograms = useMemo(() => {
    return allPrograms.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.bestFor?.toLowerCase().includes(q);

      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [allPrograms, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8 pb-20 text-slate-900 font-sans">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles size={16} />
            {successMsg}
          </div>
          <button onClick={() => setSuccessMsg(null)}><X size={16} /></button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
          <button onClick={() => setErrorMsg(null)}><X size={16} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Network Partners & Accelerators
            </h1>
            <span className="px-3 py-1 bg-amber-50 text-amber-900 rounded-full text-xs font-mono font-extrabold border border-amber-200">
              {filteredPrograms.length} Programs
            </span>
          </div>
          <p className="text-xs md:text-sm font-medium text-slate-500 max-w-2xl">
            Direct access & 1-credit contact unlocks for top accelerators, incubators, and Web3 ecosystem launchpads.
          </p>
        </div>

        {/* Credit Badge */}
        {user && (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 px-4 py-2.5 rounded-2xl">
            <Sparkles size={18} className="text-purple-600 animate-pulse" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-purple-600 font-mono">Your Credit Balance</div>
              <div className="text-sm font-black text-purple-900">{founderProfile?.credits ?? 150} Credits</div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 bg-white border border-slate-200/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/10 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xs transition-all">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search accelerator, program name, or target domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-white border border-slate-200/80 hover:border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-2xl px-4 py-2.5 pr-9 text-xs font-bold text-slate-700 outline-none shadow-xs cursor-pointer transition-all"
          >
            <option value="All">All Categories</option>
            <option value="Accelerator">Accelerators</option>
            <option value="Incubator">Incubators</option>
            <option value="Launchpad">Launchpads</option>
            <option value="Ecosystem Partner">Ecosystem Partners</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {(searchTerm || selectedCategory !== "All") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPrograms.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -3 }}
            onClick={() => setActiveModalProgram(item)}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono border border-amber-200/60">
                  {item.category}
                </span>

                {item.hasDirectContact && (
                  item.isUnlocked ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                      <Unlock size={10} /> Contact Unlocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold flex items-center gap-1 border border-purple-200">
                      <Lock size={10} /> Contact Gated (1 Cr)
                    </span>
                  )
                )}
              </div>

              <h3 className="text-xl font-black text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">
                {item.name}
              </h3>

              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">Typical Funding</div>
                <div className="text-xs font-bold text-slate-900">{item.funding}</div>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-3 line-clamp-3">
                {item.description}
              </p>

              {/* Direct Contact Card (Unlocked vs Locked) */}
              {item.hasDirectContact && (
                <div className="mt-4 p-3.5 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-purple-700 font-mono tracking-wider">
                    <span>Direct Accelerator Lead</span>
                    {item.isUnlocked ? <Unlock size={12} className="text-emerald-600" /> : <Lock size={12} className="text-amber-600" />}
                  </div>

                  {item.isUnlocked ? (
                    <div className="space-y-1.5 text-xs font-mono">
                      {item.contact_person && (
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <UserCheck size={13} className="text-purple-600 shrink-0" />
                          <span className="truncate">{item.contact_person}</span>
                        </div>
                      )}
                      {item.telegram && (
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-purple-200/80">
                          <a
                            href={`https://t.me/${item.telegram.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="font-bold text-purple-700 hover:underline flex items-center gap-1.5 truncate"
                          >
                            <MessageSquare size={13} className="text-purple-600 shrink-0" />
                            <span>{item.telegram}</span>
                          </a>
                          <ExternalLink size={12} className="text-purple-400 shrink-0 ml-1" />
                        </div>
                      )}
                      {item.email && (
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                          <a
                            href={`mailto:${item.email}`}
                            onClick={e => e.stopPropagation()}
                            className="text-[11px] font-bold text-slate-800 hover:underline flex items-center gap-1.5 truncate"
                          >
                            <Mail size={13} className="text-slate-500 shrink-0" />
                            <span className="truncate">{item.email}</span>
                          </a>
                          <button
                            onClick={(e) => copyToClipboard(item.email, `email-${item.id}`, e)}
                            className="text-slate-400 hover:text-slate-900 cursor-pointer shrink-0 ml-1"
                          >
                            {copiedId === `email-${item.id}` ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </div>
                      )}
                      {item.linkedin && (
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-200/80">
                          <a
                            href={item.linkedin.startsWith("http") ? item.linkedin : `https://linkedin.com/in/${item.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-[11px] font-bold text-blue-800 hover:underline flex items-center gap-1.5 truncate"
                          >
                            <Linkedin size={13} className="text-blue-600 shrink-0" />
                            <span className="truncate">{item.linkedin}</span>
                          </a>
                          <ExternalLink size={12} className="text-blue-400 shrink-0 ml-1" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="font-bold text-slate-600 flex items-center gap-1.5">
                        <UserCheck size={13} className="text-slate-400 shrink-0" />
                        <span>{item.contact_person ? maskContact(item.contact_person, 'email') : 'Verified Lead'}</span>
                      </div>
                      <div className="text-purple-600/80 flex items-center gap-1.5">
                        <MessageSquare size={13} className="shrink-0" />
                        <span>{maskContact(item.telegram || '@partner_lead', 'telegram')}</span>
                      </div>
                      {item.email && (
                        <div className="text-slate-400 flex items-center gap-1.5">
                          <Mail size={13} className="shrink-0" />
                          <span>{maskContact(item.email, 'email')}</span>
                        </div>
                      )}
                      {item.linkedin && (
                        <div className="text-blue-500/70 flex items-center gap-1.5">
                          <Linkedin size={13} className="shrink-0" />
                          <span>{maskContact(item.linkedin, 'linkedin')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              {item.hasDirectContact && !item.isUnlocked ? (
                <button
                  onClick={(e) => handleUnlockContact(item, e)}
                  disabled={unlockingId === item.id}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Sparkles size={14} />
                  {unlockingId === item.id ? "Unlocking..." : "Unlock Direct Contact (1 Credit)"}
                </button>
              ) : (
                <button
                  onClick={(e) => handleApply(item.link, e)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  Apply / Visit Website <ExternalLink size={14} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 flex flex-col items-center justify-center text-center gap-3">
          <Rocket size={36} className="text-slate-300" />
          <h3 className="font-black text-base text-slate-900">No programs match filters</h3>
          <p className="text-xs text-slate-500 font-medium max-w-xs">
            Try adjusting your search query or clear category filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="mt-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Program Detail Popup Modal */}
      <AnimatePresence>
        {activeModalProgram && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setActiveModalProgram(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl space-y-6 border border-slate-200/80"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModalProgram(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-3">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-xl text-xs font-black uppercase font-mono border border-amber-200/60">
                  {activeModalProgram.category}
                </span>

                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {activeModalProgram.name}
                </h2>
              </div>

              {/* Detail Sections */}
              <div className="space-y-4 text-xs font-medium text-slate-600 leading-relaxed">
                {activeModalProgram.description && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 font-mono">Program Overview</div>
                    <p className="text-slate-800 text-xs leading-relaxed">{activeModalProgram.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <div className="text-[10px] font-black uppercase text-slate-400 font-mono mb-1">Typical Funding Ticket</div>
                    <div className="text-xs font-black text-slate-900">{activeModalProgram.funding}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                    <div className="text-[10px] font-black uppercase text-slate-400 font-mono mb-1">Best Fit Founders</div>
                    <div className="text-xs font-bold text-slate-900">{activeModalProgram.bestFor}</div>
                  </div>
                </div>

                {/* Direct Contact Card inside Modal */}
                {activeModalProgram.hasDirectContact && (
                  <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-black uppercase text-purple-700 font-mono">
                      <span>Direct Contact Details</span>
                      {activeModalProgram.isUnlocked ? <Unlock size={14} className="text-emerald-600" /> : <Lock size={14} className="text-amber-600" />}
                    </div>

                    {activeModalProgram.isUnlocked ? (
                      <div className="space-y-2 text-xs font-mono">
                        {activeModalProgram.contact_person && (
                          <div className="flex items-center gap-2 font-bold text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200">
                            <UserCheck size={16} className="text-purple-600" />
                            <span>{activeModalProgram.contact_person}</span>
                          </div>
                        )}
                        {activeModalProgram.telegram && (
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-purple-200">
                            <a
                              href={`https://t.me/${activeModalProgram.telegram.replace(/^@/, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 font-bold text-purple-700 hover:underline"
                            >
                              <MessageSquare size={16} className="text-purple-600" />
                              <span>{activeModalProgram.telegram}</span>
                            </a>
                            <ExternalLink size={14} className="text-purple-500" />
                          </div>
                        )}
                        {activeModalProgram.email && (
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                            <a
                              href={`mailto:${activeModalProgram.email}`}
                              className="flex items-center gap-2 text-slate-800 hover:underline font-bold"
                            >
                              <Mail size={16} className="text-slate-500" />
                              <span>{activeModalProgram.email}</span>
                            </a>
                            <button
                              onClick={() => copyToClipboard(activeModalProgram.email, `modal-email-${activeModalProgram.id}`)}
                              className="text-slate-400 hover:text-slate-900 cursor-pointer"
                            >
                              {copiedId === `modal-email-${activeModalProgram.id}` ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            </button>
                          </div>
                        )}
                        {activeModalProgram.linkedin && (
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-200">
                            <a
                              href={activeModalProgram.linkedin.startsWith("http") ? activeModalProgram.linkedin : `https://linkedin.com/in/${activeModalProgram.linkedin}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 font-bold text-blue-800 hover:underline"
                            >
                              <Linkedin size={16} className="text-blue-600" />
                              <span>{activeModalProgram.linkedin}</span>
                            </a>
                            <ExternalLink size={14} className="text-blue-500" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-xs text-purple-900 font-medium">
                          Direct Telegram handle, contact lead, email, and LinkedIn profile are available for this partner program. Unlock to reveal direct unmasked channels.
                        </div>
                        <button
                          onClick={(e) => {
                            handleUnlockContact(activeModalProgram, e);
                            setActiveModalProgram(null);
                          }}
                          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Sparkles size={16} /> Unlock Contact (1 Credit)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-slate-200/80 flex gap-3">
                <button
                  onClick={() => setActiveModalProgram(null)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={(e) => handleApply(activeModalProgram.link, e)}
                  className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  Apply to Program <ExternalLink size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreditPackageModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        role="founder"
      />
    </div>
  );
}
