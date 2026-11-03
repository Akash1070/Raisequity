import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Calendar,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Award,
  ExternalLink,
  Plus,
  Loader2
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";

interface BookableInvestor {
  id: string;
  name: string;
  role: string;
  firm: string;
  focus: string;
  bookingUrl: string;
  rate?: string;
  avatarSeed: string;
}

export default function InvestorCoaching() {
  const { user } = useAuth();
  const [bookableInvestors, setBookableInvestors] = useState<BookableInvestor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookableInvestors() {
      try {
        setLoading(true);
        const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "investor")));
        const found: BookableInvestor[] = [];

        usersSnap.docs.forEach(docSnap => {
          const d = docSnap.data();
          const bookingUrl = d.diligence_link || d.cal_link || d.calendly_link || d.topmate_url;
          if (bookingUrl && bookingUrl.trim().length > 0) {
            found.push({
              id: docSnap.id,
              name: d.full_name || d.name || "Accredited Partner",
              role: d.title || d.firm_role || "General Partner",
              firm: d.firm_name || d.company_name || "Venture Fund",
              focus: d.investment_thesis || d.bio || "Protocol architecture, cross-border structuring, and tokenomics.",
              bookingUrl: bookingUrl.trim(),
              rate: d.session_rate || "Peer / Syndicate",
              avatarSeed: (d.full_name || "Partner").split(" ")[0]
            });
          }
        });

        // Always include verified platform venture lead partner (Topmate verified booking)
        const leadPartnerUrl = "https://topmate.io/yourweb3guy/1784407?utm_source=public_profile&utm_campaign=yourweb3guy";
        const hasLead = found.some(i => i.bookingUrl === leadPartnerUrl);
        if (!hasLead) {
          found.unshift({
            id: "lead_diligence_desk",
            name: "Raisequity Venture Desk",
            role: "Head of Technical Diligence",
            firm: "Raisequity Advisory",
            focus: "Smart contract audit review, Delaware C-Corp SAFT structuring, and tokenomics validation.",
            bookingUrl: leadPartnerUrl,
            rate: "Free for Partners",
            avatarSeed: "VentureDesk"
          });
        }

        setBookableInvestors(found);
      } catch (err) {
        console.warn("Could not load bookable investors:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBookableInvestors();
  }, []);

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-[#4f46e5] dark:text-[#805ad5]">
              TECHNICAL DILIGENCE NETWORK
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight flex items-center gap-2.5">
            Diligence Coaching &amp; Partner Calls
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            Connect directly with verified check-writers who have provided direct 1:1 scheduling links (Cal.com, Calendly, Topmate).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Link
            to="/investor-dashboard/settings?tab=thesis"
            className="px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus size={13} />
            <span>Add Your Booking Link</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Overview & Available Partners */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Diligence Standards */}
        <div className="lg:col-span-5 p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck size={12} className="text-emerald-400" /> INSTITUTIONAL ADVISORY
          </div>

          <h2 className="text-xl font-heading font-black text-black dark:text-white leading-tight">
            Peer Check-Writer Diligence Calls
          </h2>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
            Only investors who have verified and provided a live scheduling link (Cal.com, Calendly, or Topmate) appear here. You can book peer reviews, share diligence notes, and syndicate allocations directly.
          </p>

          <div className="space-y-2.5 pt-2 font-mono text-xs">
            {[
              "Formal Verification & ZK Circuit Audits",
              "Delaware C-Corp & Cross-Border Tokenomics Setup",
              "Liquidity Provisioning & DEX Market Making",
              "AI Inference Node Economics & GPU Clusters"
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 flex items-center gap-2.5 text-black dark:text-white">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Add your own link tip */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono space-y-2">
            <span className="font-bold text-amber-700 dark:text-amber-400 block">
              Want other investors to book diligence calls with you?
            </span>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11px]">
              Add your personal Cal.com, Calendly, or Topmate URL in your Investor Settings. Once saved, other verified check-writers will be able to book 1:1 sessions with you.
            </p>
            <Link
              to="/investor-dashboard/settings?tab=thesis"
              className="text-amber-700 dark:text-amber-300 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
            >
              Configure Diligence Link →
            </Link>
          </div>
        </div>

        {/* Right Column: Available Partners with Active Booking Links */}
        <div className="lg:col-span-7 space-y-3.5">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="animate-spin text-purple-500" size={32} />
              <span className="text-xs font-mono">Loading bookable check-writers...</span>
            </div>
          ) : bookableInvestors.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121316] border border-neutral-200 dark:border-white/10 space-y-3">
              <User size={32} className="mx-auto text-neutral-400" />
              <h3 className="text-base font-bold text-black dark:text-white font-mono">
                No Other Check-Writers Have Added Booking Links Yet
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                Be the first check-writer to provide your Cal.com or Calendly diligence link to accept peer calls.
              </p>
              <Link
                to="/investor-dashboard/settings?tab=thesis"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-xl text-xs font-mono font-bold"
              >
                Configure Your Link in Settings
              </Link>
            </div>
          ) : (
            bookableInvestors.map((partner) => (
              <div
                key={partner.id}
                className="p-5 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-black/30 dark:hover:border-white/20"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/10 overflow-hidden shrink-0">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.avatarSeed}`}
                      alt={partner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-black text-base text-black dark:text-white">
                        {partner.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        {partner.firm}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-400 mb-1">
                      {partner.role}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug">
                      {partner.focus}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono">
                  {partner.rate && (
                    <span className="text-xs font-black text-black dark:text-white">
                      {partner.rate}
                    </span>
                  )}

                  <a
                    href={partner.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Book 1:1 Call</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}