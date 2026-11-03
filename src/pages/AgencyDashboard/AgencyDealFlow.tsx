import React, { useState, useEffect } from "react";
import {
  Rocket,
  Search,
  Send,
  Coins,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Loader2,
  DollarSign,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Globe,
  Twitter,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { collection, getDocs, query, limit, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { SEEDED_DEAL_FLOW, DealItem } from "../../data/dealFlowData";
import { spendCredits } from "../../lib/credits";
import { getOrCreateConversation, sendDirectMessage } from "../../lib/messages";
import CreditPackageModal from "../../components/dashboard/CreditPackageModal";

export default function AgencyDealFlow() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [deals, setDeals] = useState<DealItem[]>(SEEDED_DEAL_FLOW);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");

  // Pitch Modal State
  const [pitchModalDeal, setPitchModalDeal] = useState<DealItem | null>(null);
  const [pitchMessage, setPitchMessage] = useState("");
  const [submittingPitch, setSubmittingPitch] = useState(false);
  const [pitchSuccess, setPitchSuccess] = useState(false);
  const [pitchError, setPitchError] = useState<string | null>(null);

  // Credit Modal
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  const balance = profile?.credit_balance ?? profile?.credits ?? 50;

  // Load live deal_flow from Firestore
  useEffect(() => {
    async function loadDeals() {
      try {
        setLoading(true);
        const snap = await getDocs(query(collection(db, "deal_flow"), limit(100)));
        if (!snap.empty) {
          const live = snap.docs.map(d => ({ id: d.id, ...d.data() })) as DealItem[];
          setDeals(live);
        }
      } catch (err) {
        console.warn("Could not fetch live deal_flow from Firestore, using seed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDeals();
  }, []);

  const sectors = ["all", "Fintech", "DeFi", "AI & Agents", "Infrastructure", "Gaming", "Security"];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.founder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.keywords || []).some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSector = selectedSector === "all" || 
      deal.sector?.toLowerCase() === selectedSector.toLowerCase() ||
      (deal.industry || []).some(i => i.toLowerCase().includes(selectedSector.toLowerCase()));

    return matchesSearch && matchesSector;
  });

  const handleOpenPitchModal = (deal: DealItem) => {
    setPitchModalDeal(deal);
    setPitchError(null);
    setPitchSuccess(false);
    const agencyName = (profile as any)?.agency_name || profile?.company_name || "Our Agency";
    setPitchMessage(
      `Hi ${deal.founder},\n\nWe saw ${deal.name}'s ${deal.stage} round on Raisequity. ${agencyName} provides tier-1 services suited for ${deal.sector || 'Web3'} protocols.\n\nWe'd love to assist with your technical development, smart contract auditing, or GTM scaling. What is your availability this week for a brief intro call?`
    );
  };

  const handleConfirmPitch = async () => {
    if (!user?.uid || !pitchModalDeal) return;
    if (balance < 1) {
      setPitchError("Insufficient credits. 1 credit required to pitch services.");
      setCreditModalOpen(true);
      return;
    }

    setSubmittingPitch(true);
    setPitchError(null);

    try {
      // 1. Spend 1 credit
      const spendRes = await spendCredits(
        user.uid,
        'boosted_bid',
        1,
        'discretionary_addon',
        { action: 'dealflow_startup_pitch', company: pitchModalDeal.name, founder: pitchModalDeal.founder }
      );

      if (!spendRes.success) {
        setPitchError(spendRes.error || "Failed to deduct credit.");
        setSubmittingPitch(false);
        return;
      }

      const agencyName = (profile as any)?.agency_name || profile?.company_name || profile?.full_name || "Verified Agency";
      const founderUid = pitchModalDeal.founder_id || `founder_${pitchModalDeal.id}`;

      // 2. Create / Get Conversation in Direct Messages
      const convId = await getOrCreateConversation(
        {
          id: user.uid,
          name: agencyName,
          role: "service_provider",
          email: user.email || "agency@raisequity.com",
          headline: `Accredited Service Partner`
        },
        {
          id: founderUid,
          name: pitchModalDeal.founder,
          role: "founder",
          email: pitchModalDeal.founder_email || "founder@raisequity.com",
          headline: `${pitchModalDeal.name} · Founder`
        }
      );

      // 3. Send pitch message
      await sendDirectMessage({
        conversationId: convId,
        sender: {
          id: user.uid,
          name: agencyName,
          role: "service_provider",
          email: user.email || "agency@raisequity.com"
        },
        recipientId: founderUid,
        recipientRole: "founder",
        content: pitchMessage
      });

      // 4. Record in Firestore Notifications
      await addDoc(collection(db, "notifications"), {
        user_id: founderUid,
        type: "agency_pitch",
        title: `New Service Pitch from ${agencyName}`,
        message: `${agencyName} reviewed ${pitchModalDeal.name} on Deal Flow and pitched their services.`,
        created_at: new Date().toISOString(),
        read: false
      }).catch(() => {});

      await refreshProfile();
      setPitchSuccess(true);
    } catch (err: any) {
      console.error("Error submitting pitch:", err);
      setPitchError(err.message || "Failed to send pitch.");
    } finally {
      setSubmittingPitch(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-slate-900 dark:text-white">
              Funded Startups &amp; Protocol Deal Flow
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {deals.length} Active Deals
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Pitch engineering, smart contract security, design, and GTM services directly to funded founders (1 Credit / Pitch).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 font-mono text-xs">
            <Coins size={14} className="text-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">Balance:</span>
            <strong className="text-slate-900 dark:text-white">{balance} Cr</strong>
          </div>
          <button
            onClick={() => setCreditModalOpen(true)}
            className="px-3.5 py-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-xl font-bold text-xs font-mono uppercase tracking-wide transition-all cursor-pointer shadow-xs"
          >
            + Top Up ($20)
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name, founder, tech stack, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#141518] border border-neutral-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0070F3] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer capitalize ${
                selectedSector === sec
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-slate-100 dark:bg-[#18191e] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Startups Deal Flow Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="animate-spin text-[#0070F3]" size={32} />
          <span className="text-xs font-mono">Loading funded startups deal flow...</span>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-[#141518] border border-neutral-200 dark:border-white/10 space-y-2">
          <Rocket size={32} className="mx-auto text-slate-400" />
          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
            No projects matched your filters
          </div>
          <p className="text-xs text-slate-400 font-mono">Try searching for a different keyword or resetting the sector filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="p-6 rounded-[24px] bg-white dark:bg-[#141518] border border-neutral-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 transition-all flex flex-col justify-between shadow-xs group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black font-heading text-lg shrink-0">
                      {deal.name.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                        {deal.name}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        Founder: <strong className="text-slate-700 dark:text-slate-200">{deal.founder}</strong>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md shrink-0">
                    {deal.sector || "Web3"}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {deal.description || deal.tagline || "Institutional grade protocol raising round."}
                </p>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#18191e] border border-neutral-200/60 dark:border-white/5 font-mono text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Target Raise</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-black">
                      {deal.targetRaise || "$1.0M"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Stage</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {deal.stage || "Seed"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Valuation Cap</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {deal.valuationCap || "TBD"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Chain / Stack</span>
                    <strong className="text-slate-800 dark:text-slate-200 truncate block">
                      {deal.chain || (deal.industry && deal.industry[0]) || "Multi-chain"}
                    </strong>
                  </div>
                </div>

                {/* Tags */}
                {deal.keywords && deal.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {deal.keywords.slice(0, 3).map((kw, i) => (
                      <span key={i} className="text-[10px] font-mono bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {deal.website_url && (
                    <a
                      href={deal.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white transition-colors"
                      title="Visit Website"
                    >
                      <Globe size={13} />
                    </a>
                  )}
                  {deal.pitch_deck && (
                    <a
                      href={deal.pitch_deck}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white transition-colors"
                      title="View Deck"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleOpenPitchModal(deal)}
                  className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Send size={12} className="text-amber-400" />
                  <span>Pitch Services (1 Cr)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pitch Modal */}
      {pitchModalDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121316] rounded-[28px] border border-neutral-200 dark:border-white/10 max-w-lg w-full p-6 sm:p-7 space-y-5 font-sans shadow-2xl relative">
            <button
              onClick={() => setPitchModalDeal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {pitchSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                    Pitch Dispatched to {pitchModalDeal.founder}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                    1 Credit deducted. A private messaging channel has been opened in your Client Messages.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setPitchModalDeal(null);
                      navigate("/agency-dashboard/messages");
                    }}
                    className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black rounded-xl font-mono font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare size={14} /> Open Messages Channel
                  </button>
                  <button
                    onClick={() => setPitchModalDeal(null)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 text-slate-600 dark:text-slate-300 font-mono text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                    Direct Founder Pitch
                  </span>
                  <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                    Pitch Services to {pitchModalDeal.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    Connecting with founder <strong className="text-slate-700 dark:text-slate-200">{pitchModalDeal.founder}</strong> ({pitchModalDeal.stage} Round)
                  </p>
                </div>

                {/* Credit Cost Pill */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 font-mono text-xs">
                  <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold">
                    <Coins size={14} className="text-amber-500" /> Outreach Cost: 1 Platform Credit
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Your Balance: <strong className="text-slate-900 dark:text-white">{balance} Cr</strong>
                  </span>
                </div>

                {pitchError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-500/30 text-xs font-mono text-red-600 dark:text-red-300">
                    {pitchError}
                  </div>
                )}

                {/* Pitch Message Area */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Your Tailored Service Proposal Note
                  </label>
                  <textarea
                    rows={6}
                    value={pitchMessage}
                    onChange={(e) => setPitchMessage(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#18191e] border border-neutral-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0070F3]"
                  />
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    This message will instantly initiate a direct private chat thread with the founder.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setPitchModalDeal(null)}
                    className="flex-1 py-3 rounded-xl border border-neutral-300 dark:border-white/10 text-slate-600 dark:text-slate-300 font-mono font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPitch}
                    disabled={submittingPitch || !pitchMessage.trim()}
                    className="flex-2 py-3 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-mono font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {submittingPitch ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Dispatching Pitch &amp; Deducting 1 Credit...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} className="text-amber-400" />
                        <span>Send Pitch (Deduct 1 Credit)</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Credit Package Top-up Modal */}
      <CreditPackageModal
        isOpen={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        requiredCredits={1}
        actionTitle="Pitch Startup Deal Flow"
        role="service_provider"
      />
    </div>
  );
}