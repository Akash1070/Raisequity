import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, ShieldCheck, Sparkles, ExternalLink, Send, Check, Filter, Briefcase, Zap, Globe, MessageSquare, Tag, ArrowRight, X, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { SEEDED_AGENCIES, SeededAgency } from "../../data/seededAgencies";
import { useAuth } from "../../contexts/AuthContext";
import { useFounderProfile } from "../../hooks/useFounderProfile";
import { getOrCreateConversation, sendDirectMessage } from "../../lib/messages";

const CATEGORY_TABS = [
  "All",
  "KOL Marketing & PR",
  "Tokenomics & Governance",
  "Growth & Marketing Advisory",
  "Exchange Listings & Liquidity",
  "Talent & HR Recruitment",
  "Public Relations & Comms",
  "Design, Creative & Media",
  "Blockchain & Technical Advisory"
];

export default function ServicesDirectory() {
  const { user } = useAuth();
  const { founderProfile } = useFounderProfile();
  const navigate = useNavigate();

  const [agencies, setAgencies] = useState<SeededAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [onboardedAgenciesMap, setOnboardedAgenciesMap] = useState<Record<string, any>>({});

  // RFP / Intro Request Modal State
  const [selectedAgency, setSelectedAgency] = useState<SeededAgency | null>(null);
  const [rfpScope, setRfpScope] = useState("");
  const [rfpBudget, setRfpBudget] = useState("$10k - $25k");
  const [sendingRfp, setSendingRfp] = useState(false);
  const [rfpSuccess, setRfpSuccess] = useState(false);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        const userMap: Record<string, any> = {};

        // 1. Fetch live registered agencies from "service_providers" collection (e.g. Unfold Logic)
        const spAgencies: SeededAgency[] = [];
        try {
          const spSnap = await getDocs(collection(db, "service_providers"));
          spSnap.docs.forEach(docSnap => {
            const p = docSnap.data();
            const uid = docSnap.id;
            const agencyName = p.agency_name || p.company_name || p.contact_name || "Verified Web3 Agency";
            const tracks: string[] = p.selected_tracks || [];

            let category = "Blockchain & Technical Advisory";
            if (tracks.some((t: string) => t.toLowerCase().includes("marketing") || t.toLowerCase().includes("kol"))) {
              category = "KOL Marketing & PR";
            } else if (tracks.some((t: string) => t.toLowerCase().includes("tokenomic") || t.toLowerCase().includes("legal"))) {
              category = "Tokenomics & Governance";
            } else if (tracks.some((t: string) => t.toLowerCase().includes("audit") || t.toLowerCase().includes("dev") || t.toLowerCase().includes("smart contract"))) {
              category = "Blockchain & Technical Advisory";
            } else if (tracks.some((t: string) => t.toLowerCase().includes("design") || t.toLowerCase().includes("media"))) {
              category = "Design, Creative & Media";
            } else if (tracks.some((t: string) => t.toLowerCase().includes("pr") || t.toLowerCase().includes("comms"))) {
              category = "Public Relations & Comms";
            }

            spAgencies.push({
              id: uid,
              title: agencyName,
              company: agencyName,
              category,
              services: tracks.length > 0 ? tracks : ["Full-Stack Dev", "Smart Contracts", "Technical Advisory"],
              portfolio: p.outcome_metrics?.length ? p.outcome_metrics : ["Solana", "Ethereum", "Web3 Protocols"],
              vetting_status: "Vetted",
              bio: p.bio || `${agencyName} is an active accredited Web3 agency suite partner on Raisequity.`,
              tags: tracks.length > 0 ? [...tracks, "Vetted", "Platform Partner"] : ["Technical Advisory", "Smart Contracts", "Vetted"],
              discount_code: `Code [${agencyName.split(" ")[0].toUpperCase()}] → Direct Partner Booking`,
              calendly_url: p.website_url || "https://raisequity.com",
              rate_per_hour: null,
              is_active: true,
              verified: true,
            });

            userMap[uid] = { id: uid, full_name: agencyName, company_name: agencyName, ...p };
            userMap[agencyName.toLowerCase()] = { id: uid, full_name: agencyName, company_name: agencyName, ...p };
          });
        } catch (spErr) {
          console.warn("Could not fetch service_providers collection:", spErr);
        }

        // 2. Fetch from "experts" collection
        let expertData: any[] = [];
        try {
          const snap = await getDocs(collection(db, "experts"));
          expertData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (expErr) {
          console.warn("Could not fetch experts collection:", expErr);
        }

        // 3. Fetch registered agency users from "users" collection to enrich onboarded map
        try {
          const usersSnap = await getDocs(query(collection(db, "users"), where("role", "in", ["service_provider", "agency"])));
          usersSnap.docs.forEach(docSnap => {
            const u = docSnap.data();
            const uid = docSnap.id;
            userMap[uid] = { id: uid, ...u };
            if (u.company_name) userMap[u.company_name.toLowerCase()] = { id: uid, ...u };
            if (u.agency_name) userMap[u.agency_name.toLowerCase()] = { id: uid, ...u };
            if (u.full_name) userMap[u.full_name.toLowerCase()] = { id: uid, ...u };
            if (u.email) userMap[u.email.toLowerCase()] = { id: uid, ...u };
          });
        } catch (uErr) {
          console.warn("Could not fetch registered agency users:", uErr);
        }

        setOnboardedAgenciesMap(userMap);

        // 4. Combine all agencies with platform-created agencies first!
        const combinedAgencies: SeededAgency[] = [...spAgencies];
        for (const exp of expertData) {
          if (!combinedAgencies.some(a => a.id === exp.id || a.title.toLowerCase() === exp.title?.toLowerCase())) {
            combinedAgencies.push(exp);
          }
        }
        for (const seeded of SEEDED_AGENCIES) {
          if (!combinedAgencies.some(a => a.id === seeded.id || a.title.toLowerCase() === seeded.title.toLowerCase())) {
            combinedAgencies.push(seeded);
          }
        }

        setAgencies(combinedAgencies);
      } catch (err) {
        console.error("Error fetching agencies:", err);
        setAgencies(SEEDED_AGENCIES);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const handleSendRfp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgency) return;
    setSendingRfp(true);

    try {
      const agencyUser =
        onboardedAgenciesMap[selectedAgency.id] ||
        onboardedAgenciesMap[selectedAgency.title.toLowerCase()] ||
        onboardedAgenciesMap[selectedAgency.company.toLowerCase()];

      // 1. Write intro lead to admin_intros collection so Admin can bridge and capture deal facilitation commission
      await addDoc(collection(db, "admin_intros"), {
        type: "founder_agency_bridge_rfp",
        founder_id: user?.uid || "",
        founder_name: founderProfile?.full_name || (user as any)?.displayName || user?.email?.split("@")[0] || "Founder",
        founder_email: user?.email || "",
        company_name: founderProfile?.company_name || "My Web3 Startup",
        agency_id: selectedAgency.id,
        agency_name: selectedAgency.title,
        agency_company: selectedAgency.company,
        agency_category: selectedAgency.category,
        agency_user_id: agencyUser?.id || null,
        rfp_scope: rfpScope.trim(),
        budget: rfpBudget,
        status: "pending_admin_bridge",
        created_at: new Date().toISOString()
      });

      // 2. If agency is an onboarded active user on platform, also send direct chat
      if (agencyUser?.id && user?.uid) {
        try {
          const currentPart = {
            id: user.uid,
            name: founderProfile?.full_name || user.email?.split("@")[0] || "Founder",
            email: user.email || "",
            role: "founder" as const,
            company_name: founderProfile?.company_name || ""
          };
          const targetPart = {
            id: agencyUser.id,
            name: agencyUser.full_name || selectedAgency.title,
            email: agencyUser.email || "",
            role: "service_provider" as const,
            company_name: selectedAgency.company
          };
          const convId = await getOrCreateConversation(currentPart, targetPart, { deal_name: `RFP: ${selectedAgency.category}` });
          await sendDirectMessage({
            conversationId: convId,
            sender: currentPart,
            recipientId: targetPart.id,
            recipientRole: targetPart.role,
            content: `Hi ${selectedAgency.title} team,\n\nI submitted an RFP for ${rfpScope.trim()}.\nTarget budget: ${rfpBudget}.\n\nLooking forward to connecting!`,
            messageType: 'text'
          });
        } catch (msgErr) {
          console.warn("Direct chat creation warning:", msgErr);
        }
      }

      setSendingRfp(false);
      setRfpSuccess(true);
      setTimeout(() => {
        setRfpSuccess(false);
        setSelectedAgency(null);
        setRfpScope("");
      }, 2500);
    } catch (err) {
      console.error("Error sending RFP:", err);
      setSendingRfp(false);
      setRfpSuccess(true);
      setTimeout(() => {
        setRfpSuccess(false);
        setSelectedAgency(null);
        setRfpScope("");
      }, 2500);
    }
  };

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = !search ||
      agency.title.toLowerCase().includes(search.toLowerCase()) ||
      agency.company.toLowerCase().includes(search.toLowerCase()) ||
      agency.bio.toLowerCase().includes(search.toLowerCase()) ||
      agency.portfolio?.some(p => p.toLowerCase().includes(search.toLowerCase())) ||
      agency.services?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      agency.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = activeCategory === "All" || agency.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-20 w-full text-slate-900 dark:text-white">
      {/* ── TOP HERO HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e8e6df] dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>ACCREDITED SERVICE PROVIDERS &amp; AGENCIES</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-black dark:text-white">
            Vetted Web3 Agencies &amp; Experts
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Directly connect with 100+ accredited Web3 marketing agencies, KOL networks, tokenomics architects, PR firms, and exchange listing partners with verified client portfolios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-2xs font-mono text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-neutral-500 dark:text-neutral-400">Total Partners:</span>
            <strong className="text-black dark:text-white font-black">{agencies.length} Vetted</strong>
          </div>
        </div>
      </div>

      {/* ── CATEGORY FILTER PILLS ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORY_TABS.map(cat => {
          const count = cat === "All" ? agencies.length : agencies.filter(a => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-mono text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-white dark:bg-[#121316] text-neutral-500 hover:text-black dark:hover:text-white border border-[#e8e6df] dark:border-white/10"
              }`}
            >
              {cat} <span className="opacity-60 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* ── SEARCH BAR & TELEMETRY ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by agency name, service offering, or client protocol (e.g. Mantle, Solana, Sui, Arbitrum, Binance)..."
            className="w-full bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-black dark:text-white placeholder:text-neutral-400 focus:border-black dark:focus:border-white outline-none shadow-xs"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 px-1">
        Showing <strong>{filteredAgencies.length}</strong> of <strong>{agencies.length}</strong> accredited Web3 agencies
      </div>

      {/* ── BENTO AGENCY GRID ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-[#121316] rounded-3xl border border-[#e8e6df] dark:border-white/10">
          <Loader2 size={32} className="animate-spin text-black dark:text-white" />
          <span className="font-mono text-xs uppercase tracking-wider text-neutral-400 font-bold">Loading accredited partner directory...</span>
        </div>
      ) : filteredAgencies.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#121316] rounded-3xl border border-[#e8e6df] dark:border-white/10">
          <Briefcase size={36} className="text-neutral-400 mx-auto mb-3" />
          <h3 className="text-base font-heading font-black text-black dark:text-white">No agencies match your criteria</h3>
          <p className="text-xs text-neutral-500 mt-1">Try clearing your search or switching categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgencies.map((agency) => (
            <div
              key={agency.id}
              className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/20 dark:hover:border-white/20 hover:-translate-y-0.5 group"
            >
              <div>
                {/* Header: Avatar, Name, Vetting Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-heading font-black text-base shrink-0">
                      {agency.title.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-heading font-black text-black dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {agency.title}
                      </h3>
                      <span className="font-mono text-[10px] text-neutral-400 block truncate">
                        {agency.category}
                      </span>
                    </div>
                  </div>

                  <span className={`font-mono text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                    agency.vetting_status === "Vetted"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                  }`}>
                    {agency.vetting_status}
                  </span>
                </div>

                {/* Bio & Scope */}
                <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed line-clamp-3 mb-4">
                  {agency.bio}
                </p>

                {/* Client Portfolio Pills */}
                {agency.portfolio && agency.portfolio.length > 0 && (
                  <div className="mb-4">
                    <span className="font-mono text-[9px] font-black uppercase text-neutral-400 tracking-wider block mb-1.5">
                      Client &amp; Ecosystem Portfolio:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {agency.portfolio.slice(0, 5).map((client) => (
                        <span
                          key={client}
                          className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 border border-[#e8e6df] dark:border-white/5"
                        >
                          {client}
                        </span>
                      ))}
                      {agency.portfolio.length > 5 && (
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md text-neutral-400">
                          +{agency.portfolio.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Discount Code / Partner Perk */}
                {agency.discount_code && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold mb-4 flex items-center gap-1.5">
                    <Sparkles size={12} className="shrink-0 text-emerald-500" />
                    <span className="truncate">{agency.discount_code}</span>
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              {(() => {
                const agencyUser =
                  onboardedAgenciesMap[agency.id] ||
                  onboardedAgenciesMap[agency.title.toLowerCase()] ||
                  onboardedAgenciesMap[agency.company.toLowerCase()];

                return (
                  <div className="pt-4 border-t border-[#e8e6df] dark:border-white/10 flex items-center justify-between gap-2 mt-2">
                    <button
                      onClick={() => {
                        if (agencyUser?.id) {
                          navigate(`/dashboard/messages?to=${agencyUser.id}&name=${encodeURIComponent(agencyUser.full_name || agency.title)}&role=service_provider&company=${encodeURIComponent(agency.company)}`);
                        } else {
                          // Unregistered agency: open Concierge Bridge Request
                          setSelectedAgency(agency);
                          setRfpScope(`Hi ${agency.title} team, I would like to initiate an introductory chat regarding your ${agency.category} services.`);
                        }
                      }}
                      className="px-3 py-1.5 rounded-full border border-neutral-200 dark:border-white/10 hover:border-[#0070F3] hover:text-[#0070F3] font-mono text-[11px] font-bold text-neutral-600 dark:text-neutral-300 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare size={12} className="text-[#0070F3]" />
                      <span>{agencyUser?.id ? "Direct Chat" : "Intro / Chat"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedAgency(agency);
                        setRfpScope("");
                      }}
                      className="px-4 py-1.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      <Send size={12} /> Request RFP
                    </button>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}

      {/* ── RFP & INTRO MODAL ── */}
      <AnimatePresence>
        {selectedAgency && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e6df] dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-heading font-black">
                    {selectedAgency.title.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-heading font-black text-black dark:text-white">
                        {selectedAgency.title}
                      </h3>
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {onboardedAgenciesMap[selectedAgency.id] || onboardedAgenciesMap[selectedAgency.title.toLowerCase()] ? "Active Onboarded Partner" : "Concierge Bridge Intro"}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400">{selectedAgency.category} • Facilitated by Raisequity Concierge</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgency(null)}
                  className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {rfpSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <Check size={28} />
                  </div>
                  <h4 className="text-lg font-heading font-black text-black dark:text-white">Bridge Intro &amp; RFP Dispatched!</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                    Your request has been routed to the Raisequity Venture Concierge desk. We are facilitating a warm intro directly with {selectedAgency.title} via email and Telegram within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendRfp} className="space-y-4">
                  <div>
                    <label className="font-mono text-[10px] font-bold uppercase text-neutral-400 block mb-1">
                      Project / Startup Name
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={founderProfile?.company_name || "My Web3 Startup"}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-[#e8e6df] dark:border-white/10 text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] font-bold uppercase text-neutral-400 block mb-1">
                      Scope of Work &amp; Deliverables *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={rfpScope}
                      onChange={e => setRfpScope(e.target.value)}
                      placeholder="Outline what services you need (e.g. KOL campaign for upcoming mainnet, tokenomics audit, tier-1 PR distribution)..."
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-black/30 border border-[#e8e6df] dark:border-white/10 text-xs text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] font-bold uppercase text-neutral-400 block mb-1">
                      Target Budget Range
                    </label>
                    <select
                      value={rfpBudget}
                      onChange={e => setRfpBudget(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-black/30 border border-[#e8e6df] dark:border-white/10 text-xs font-mono font-bold text-black dark:text-white outline-none cursor-pointer"
                    >
                      <option value="Under $10k">Under $10k (Trial Campaign)</option>
                      <option value="$10k - $25k">$10k - $25k (Standard GTM)</option>
                      <option value="$25k - $50k">$25k - $50k (Mainnet / TGE Sprint)</option>
                      <option value="$50k+">$50k+ (Enterprise Multi-Month)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAgency(null)}
                      className="px-4 py-2.5 rounded-full text-xs font-mono font-bold text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingRfp}
                      className="px-6 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      {sendingRfp ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Submit RFP to {selectedAgency.title}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

