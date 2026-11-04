import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink, CheckCircle2, Loader2, X, Briefcase, Zap, ShieldCheck } from "lucide-react";
import { useFounderProfile } from "../../hooks/useFounderProfile";
import { useFounderMatches } from "../../hooks/useFounderMatches";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc,
  limit 
} from "firebase/firestore";
import { spendCredits } from "../../lib/credits";
import type { FounderInvestorContact, FounderProfile } from "../../types/founder";

interface NetworkContact extends FounderInvestorContact {
  ownerFounder?: Partial<FounderProfile>;
}

export default function DashboardNetwork() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { founderProfile, refetch: refetchProfile } = useFounderProfile();
  const { matches } = useFounderMatches();
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showIntroModal, setShowIntroModal] = useState<NetworkContact | null>(null);
  const [introSending, setIntroSending] = useState(false);
  const [introError, setIntroError] = useState<string | null>(null);
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

  // Fetch investor contacts from matches, user's own contributions, and crowdsourced connections
  useEffect(() => {
    const fetchNetworkContacts = async () => {
      const activeUid = user?.uid || (user as any)?.id || founderProfile?.id;
      const acceptedMatches = matches.filter(m => m.status === "accepted");
      const otherFounderIds = acceptedMatches.map(m => m.otherFounder?.id).filter(Boolean) as string[];

      try {
        let allItems: NetworkContact[] = [];
        const seenIds = new Set<string>();

        // 1. Fetch from other matched founders
        if (otherFounderIds.length > 0) {
          const contactsRef = collection(db, "founder_investor_contacts");
          const chunkSize = 10;
          for (let i = 0; i < otherFounderIds.length; i += chunkSize) {
            const chunk = otherFounderIds.slice(i, i + chunkSize);
            const q = query(contactsRef, where("founder_id", "in", chunk));
            const snap = await getDocs(q);
            snap.docs.forEach((d) => {
              if (!seenIds.has(d.id)) {
                seenIds.add(d.id);
                const data = d.data();
                const match = acceptedMatches.find(m => m.otherFounder?.id === data.founder_id);
                allItems.push({ id: d.id, ...data, ownerFounder: match?.otherFounder || undefined } as NetworkContact);
              }
            });
          }
        }

        // 2. Fetch user's own contributed contacts
        if (activeUid) {
          const ownRef = collection(db, "founder_investor_contacts");
          const ownQ = query(ownRef, where("founder_id", "==", activeUid));
          const ownSnap = await getDocs(ownQ);
          const ownerMe = {
            id: activeUid,
            full_name: founderProfile?.full_name || profile?.full_name || user?.displayName || "You",
            company_name: founderProfile?.company_name || profile?.company_name || "My Startup",
            profile_photo_url: founderProfile?.profile_photo_url || profile?.profile_photo_url || (user as any)?.photoURL,
          };
          ownSnap.docs.forEach((d) => {
            if (!seenIds.has(d.id)) {
              seenIds.add(d.id);
              allItems.push({ id: d.id, ...d.data(), ownerFounder: ownerMe } as NetworkContact);
            }
          });
        }

        // 3. Fetch declared connections from investor_connections
        const connsSnap = await getDocs(query(collection(db, "investor_connections"), limit(25)));
        connsSnap.docs.forEach((d) => {
          const c = d.data();
          const connKey = `conn_${d.id}`;
          if (!seenIds.has(connKey)) {
            seenIds.add(connKey);
            allItems.push({
              id: connKey,
              founder_id: c.founderId || "network",
              investor_name: c.investorName,
              fund_name: c.investorFirm,
              sectors_invested_in: c.sectors || ["AI", "Web3"],
              relationship_description: `Direct check-writer connection declared by ${c.founderName} (${c.founderCompany || 'Portfolio Co'}).`,
              ownerFounder: {
                id: c.founderId,
                full_name: c.founderName || "Community Founder",
                company_name: c.founderCompany || "Portfolio Co",
              },
            } as NetworkContact);
          }
        });

        setContacts(allItems);
      } catch (err) {
        console.error("[Network] Error fetching contacts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkContacts();
  }, [founderProfile, matches, user?.uid]);

  const handleRequestIntro = async (contact: NetworkContact) => {
    if (!founderProfile) return;
    setIntroSending(true);

    const blurb = founderProfile.company_blurb || `${founderProfile.company_name} — ${founderProfile.what_company_does || ""}`;

    try {
      // Deduct the 160 credits via the ledger-backed flow first — never a
      // raw balance mutation.
      const spend = await spendCredits(
        founderProfile.id,
        'warm_intro_request',
        160,
        'discretionary_addon',
        { action: 'network_warm_intro', contactId: contact.id }
      );
      if (!spend.success) {
        setIntroError(spend.error || "Insufficient credits for this intro request.");
        setIntroSending(false);
        return;
      }

      setLiveCredits(spend.newBalance);

      await addDoc(collection(db, "warm_intro_requests"), {
        requesting_founder_id: founderProfile.id,
        introducing_founder_id: contact.founder_id,
        investor_contact_id: contact.id,
        blurb_sent: blurb,
        credits_used: 160,
        status: "pending",
        created_at: new Date().toISOString(),
      });

      // Notify introducing founder
      if (contact.ownerFounder?.user_id) {
        await addDoc(collection(db, "notifications"), {
          user_id: contact.ownerFounder.user_id,
          type: "match_request",
          title: "New intro request",
          body: `${founderProfile.full_name} wants an intro to ${contact.investor_name}`,
          link: "/dashboard/matches",
          created_at: new Date().toISOString(),
          read: false,
        });
      }

      await refetchProfile();
    } catch (err) {
      console.error("[Network] Error sending intro request:", err);
    } finally {
      setIntroSending(false);
      setShowIntroModal(null);
    }
  };

  const filtered = contacts.filter(c =>
    !searchTerm ||
    c.investor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fund_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.sectors_invested_in?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isPremium = founderProfile?.plan !== "basic";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#0B0F19] rounded-3xl border border-slate-800">
        <Loader2 size={32} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 text-slate-100 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-mono">Founder Network</h1>
          <p className="text-slate-400 text-xs font-mono mt-1">Access verified investor check-writers contributed by matched peers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <div className="bg-[#0B0F19] p-4 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-xl focus-within:border-emerald-500/60 transition-all">
            <Search className="text-slate-500 shrink-0" size={18} />
            <input 
              type="text" 
              placeholder="Search by investor name, fund, sector..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-xs font-mono text-slate-200 placeholder:text-slate-500" 
            />
          </div>

          {/* Contact Cards */}
          {filtered.length === 0 ? (
            <div className="bg-[#0B0F19] rounded-3xl border border-slate-800 p-16 flex flex-col items-center justify-center gap-3 text-center shadow-xl">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mb-2">
                <Briefcase size={32} />
              </div>
              <h3 className="font-extrabold text-base text-white">No network contacts unlocked yet</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed font-normal">
                Accept peer founder matches to unlock their shared investor rolodex. Give-to-Get network reciprocity keeps dealflow verified and high-intent.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((contact) => {
                const isBlurred = !isPremium && !contact.verified;
                return (
                  <motion.div 
                    key={contact.id} 
                    whileHover={{ y: -3 }}
                    className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-base ${isBlurred ? "blur-sm" : ""}`}>
                          {contact.investor_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className={`text-sm font-extrabold text-white ${isBlurred ? "blur-sm select-none" : ""}`}>{contact.investor_name}</h4>
                          <span className="text-[11px] font-mono text-slate-400">{contact.fund_name || "Independent"}</span>
                        </div>
                      </div>
                      {contact.investor_linkedin && !isBlurred && (
                        <a href={contact.investor_linkedin} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-emerald-400 transition-colors">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>

                    {contact.relationship_description && (
                      <p className={`text-xs text-slate-300 leading-relaxed font-normal ${isBlurred ? "blur-sm select-none" : ""}`}>
                        {contact.relationship_description}
                      </p>
                    )}

                    {contact.sectors_invested_in && contact.sectors_invested_in.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {contact.sectors_invested_in.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-black/60 rounded-md text-[10px] font-mono font-bold text-emerald-400 border border-slate-800">{s}</span>
                        ))}
                      </div>
                    )}

                    {contact.check_size_min && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Check size: ${contact.check_size_min?.toLocaleString()} — ${contact.check_size_max?.toLocaleString()}
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-800/80 mt-auto space-y-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-500 uppercase tracking-wider font-mono">Intro Via</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-300">
                          <div className="w-5 h-5 rounded-md overflow-hidden bg-slate-800 border border-slate-700">
                            <img src={contact.ownerFounder?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.ownerFounder?.full_name || "F"}`} alt="" className="w-full h-full object-cover" />
                          </div>
                          {contact.ownerFounder?.full_name || "Founder"}
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowIntroModal(contact)}
                        className="w-full py-2.5 bg-[#00F5A0] hover:bg-[#00D68B] text-black rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(0,245,160,0.25)]"
                      >
                        Request Intro · 160 credits
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-[#0C111D] to-[#080C14] border border-slate-800 text-white p-6 rounded-3xl space-y-5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              <h3 className="text-base font-extrabold leading-tight tracking-tight">Executive Network Access</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Pro members get verified partner-level warm introductions, 100% money-back SLA protection, and instant push alerts.
            </p>
            <ul className="space-y-2.5">
              {["3 Guaranteed Partner Calls / 30 Days", "Due Diligence Fast-Pass 1-Page Memo", "1-Click OpenSign SAFE Execution", "Lead-Check Syndicate Anchor ($50k)"].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs font-medium text-slate-200">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => navigate("/dashboard/settings?tab=billing")}
              className="w-full py-3 bg-[#00F5A0] hover:bg-[#00D68B] text-black rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,245,160,0.25)] cursor-pointer"
            >
              Activate Pro SLA ($20/mo)
            </button>
          </div>

          <div className="bg-[#0B0F19] border border-slate-800 p-6 rounded-3xl space-y-3 shadow-xl">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Network Telemetry Stats</h4>
            <div className="space-y-2.5 pt-1">
              <div className="flex justify-between text-xs font-mono"><span className="text-slate-400">Total Rolodex</span><span className="font-bold text-white">{contacts.length}</span></div>
              <div className="flex justify-between text-xs font-mono"><span className="text-slate-400">Verified Check-Writers</span><span className="font-bold text-emerald-400">{contacts.filter(c => c.verified).length}</span></div>
              <div className="flex justify-between text-xs font-mono"><span className="text-slate-400">Accepted Peer Matches</span><span className="font-bold text-indigo-400">{matches.filter(m => m.status === "accepted").length}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Intro Request Modal */}
      <AnimatePresence>
        {showIntroModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setShowIntroModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#111111] rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-slate-200 dark:border-[#262626] transition-colors duration-150" 
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowIntroModal(null)} 
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">Request Warm Intro</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">to <span className="font-bold text-[#0070F3]">{showIntroModal.investor_name}</span></p>
                {showIntroModal.fund_name && <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{showIntroModal.fund_name}</p>}
              </div>

              <div className="bg-slate-50 dark:bg-[#171717] rounded-2xl p-4 border border-slate-200/60 dark:border-[#262626] mb-6">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Your blurb (sent with this intro)</div>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-normal leading-relaxed whitespace-pre-line">
                  {founderProfile?.company_blurb || `${founderProfile?.company_name} — ${founderProfile?.what_company_does || "No blurb set"}`}
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#171717] rounded-2xl border border-slate-200/60 dark:border-[#262626] mb-6">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Cost</span>
                <span className="text-xs font-mono font-extrabold text-[#0070F3]">160 credits</span>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowIntroModal(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-[#202020] dark:hover:bg-[#262626] text-slate-700 dark:text-slate-300 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleRequestIntro(showIntroModal)} 
                  disabled={introSending || (founderProfile?.credits || 0) < 160}
                  className="flex-1 py-3 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl font-mono font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-xs active:scale-95"
                >
                  {introSending ? <Loader2 size={16} className="animate-spin mx-auto text-white" /> : "Request Intro"}
                </button>
              </div>

              {(founderProfile?.credits || 0) < 160 && (
                <p className="text-[11px] text-red-400 font-mono text-center mt-3">
                  Insufficient credits. You currently have {founderProfile?.credits || 0} credits.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
