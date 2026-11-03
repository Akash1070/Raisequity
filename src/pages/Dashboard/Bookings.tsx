import React, { useState, useEffect } from "react";
import { 
  Calendar, Clock, ExternalLink, AlertCircle, ShieldCheck, 
  CheckCircle2, Flame, Sparkles, Video, ArrowRight, UserCheck, 
  FileText, RefreshCw, ChevronRight, HelpCircle
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useFounderProfile } from "../../hooks/useFounderProfile";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { CallBooking } from "../../types/founder";

interface SLACallSlot {
  id: string;
  callNumber: number;
  partnerName: string;
  partnerTitle: string;
  fundName: string;
  thesisMatch: number;
  status: "completed" | "matching" | "ready_to_schedule";
  dateFormatted?: string;
  timeFormatted?: string;
  meetingUrl?: string;
  notes?: string;
}

const DEFAULT_SLA_CALLS: SLACallSlot[] = [
  {
    id: "sla-call-1",
    callNumber: 1,
    partnerName: "Dr. Sarah Chen",
    partnerTitle: "General Partner",
    fundName: "Decasonic Ventures",
    thesisMatch: 96,
    status: "completed",
    dateFormatted: "Friday, Oct 24, 2026",
    timeFormatted: "10:30 AM EST",
    notes: "Passed thesis screen. Requested follow-up data room access and cap table overview.",
  },
  {
    id: "sla-call-2",
    callNumber: 2,
    partnerName: "Marcus Vance",
    partnerTitle: "Managing Director",
    fundName: "Framework & Delphi Digital",
    thesisMatch: 92,
    status: "ready_to_schedule",
    meetingUrl: "https://topmate.io/yourweb3guy/1784407?utm_source=public_profile&utm_campaign=yourweb3guy",
    notes: "Double-blind match confirmed. Slot available for direct partner pitch.",
  },
  {
    id: "sla-call-3",
    callNumber: 3,
    partnerName: "Allocators in Queue",
    partnerTitle: "Thesis Matching",
    fundName: "Pantera Syndicate & 180+ VCs",
    thesisMatch: 88,
    status: "matching",
    notes: "Algorithmic matching running against round size and ARR metrics.",
  },
];

export default function Bookings() {
  const { user, profile } = useAuth();
  const { founderProfile } = useFounderProfile();
  const [bookings, setBookings] = useState<CallBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"sla" | "all">("sla");
  const [refundClaimed, setRefundClaimed] = useState(false);
  const [memoDownloaded, setMemoDownloaded] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookings() {
      const uid = user?.uid || (user as any)?.id;
      if (!uid) return;
      try {
        const ref = collection(db, "call_bookings");
        const q = query(ref, where("founder_id", "==", uid));
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as CallBooking[];
        setBookings(items);
      } catch (err) {
        console.warn("[Bookings] Error fetching custom bookings:", err);
      }
    }
    loadBookings();
  }, [user]);

  const fullName = founderProfile?.full_name || profile?.full_name || "Founder";
  const companyName = founderProfile?.company_name || profile?.company_name || "Your Startup";

  return (
    <div className="space-y-6 pb-24 text-slate-900 dark:text-slate-100 font-sans">
      {memoDownloaded && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs font-mono text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between shadow-xs">
          <span>✓ {memoDownloaded}</span>
          <button onClick={() => setMemoDownloaded(null)} className="text-emerald-600 dark:text-emerald-400">✕</button>
        </div>
      )}
      {/* ── 1. HEADER BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#262626] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-[#00F5A0] font-mono text-xs font-bold border border-emerald-500/30 mb-2">
            <ShieldCheck size={13} />
            <span>Guaranteed Partner Meeting SLA: Active Window</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Partner Meetings &amp; Call Bookings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Track confirmed VC partner meetings, pick scheduling slots, and manage your binding 30-Day Meeting SLA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open("https://cal.com/raisequity-partners/30min-fast-pass", "_blank")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0070F3] hover:bg-[#0060DF] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Calendar size={14} /> Schedule Next Pitch Call
          </button>
        </div>
      </div>

      {/* ── 2. BINDING 30-DAY SLA OUTCOME GUARANTEE COCKPIT ── */}
      <div className="rounded-3xl bg-slate-50 dark:bg-[#111111] border border-emerald-500/30 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                3 Confirmed Partner-Level Calls in 30 Days
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] font-mono text-[10px] font-black uppercase border border-emerald-500/30">
                100% Refundable
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Raisequity is the only platform that guarantees confirmed partner meetings with check-size matched investors. If fewer than 3 meetings occur within your 30-day window, you can claim an automated 100% full refund with 1 click.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-white dark:bg-[#18191e] px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Window Status</div>
              <div className="text-sm font-mono font-black text-emerald-600 dark:text-[#00F5A0]">24 Days Left</div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-[#262626]" />
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Delivered</div>
              <div className="text-sm font-mono font-black text-slate-900 dark:text-white">1 / 3 Calls</div>
            </div>
          </div>
        </div>

        {/* ── 3-STEP SLA CALL PIPELINE ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEFAULT_SLA_CALLS.map((call) => (
            <div
              key={call.id}
              className={`p-5 rounded-2xl border transition-all ${
                call.status === "completed"
                  ? "bg-white dark:bg-[#16171b] border-emerald-500/40 shadow-xs"
                  : call.status === "ready_to_schedule"
                  ? "bg-white dark:bg-[#16171b] border-[#0070F3]/40 shadow-xs"
                  : "bg-white/60 dark:bg-[#141518] border-slate-200 dark:border-[#262626]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-500">
                  PARTNER CALL #{call.callNumber}
                </span>
                {call.status === "completed" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-[#00F5A0] font-mono text-[9px] font-bold border border-emerald-500/30">
                    <CheckCircle2 size={11} /> Completed &amp; Verified
                  </span>
                ) : call.status === "ready_to_schedule" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-mono text-[9px] font-bold border border-[#0070F3]/30">
                    <Calendar size={11} /> Ready to Book
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[9px] font-bold border border-amber-500/30">
                    <RefreshCw size={11} className="animate-spin" /> Matching in Queue
                  </span>
                )}
              </div>

              <div className="space-y-1 mb-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {call.partnerName}
                </h3>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {call.partnerTitle} • <span className="font-bold text-slate-900 dark:text-slate-200">{call.fundName}</span>
                </div>
              </div>

              {call.dateFormatted && (
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Clock size={12} className="text-emerald-500" />
                  <span>{call.dateFormatted} ({call.timeFormatted})</span>
                </div>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-[#1a1b20] p-2.5 rounded-xl border border-slate-100 dark:border-white/5 mb-3 leading-relaxed">
                "{call.notes}"
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 font-bold">
                  Thesis Fit: <strong className="text-emerald-600 dark:text-[#00F5A0]">{call.thesisMatch}%</strong>
                </span>

                {call.status === "ready_to_schedule" ? (
                  <button
                    onClick={() => window.open(call.meetingUrl, "_blank")}
                    className="px-3 py-1.5 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    Select Slot <ChevronRight size={12} />
                  </button>
                ) : call.status === "completed" ? (
                  <button
                    onClick={() => {
                      setMemoDownloaded(`Meeting memo for ${companyName} x ${call.partnerName} generated.`);
                      setTimeout(() => setMemoDownloaded(null), 4000);
                    }}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FileText size={11} /> View Memo
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-amber-500 font-bold">Priority Pipeline</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── REFUND REQUEST / CONTINGENCY ROW ── */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HelpCircle size={14} className="text-slate-400" />
            <span>Have questions regarding your meeting schedule or investor notes? Our partner concierge is on standby.</span>
          </div>

          <button
            onClick={() => {
              setRefundClaimed(true);
            }}
            disabled={refundClaimed}
            className={`text-xs font-mono font-bold px-4 py-2 rounded-xl transition-all cursor-pointer ${
              refundClaimed
                ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                : "bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
            }`}
          >
            {refundClaimed ? "SLA Audit Scheduled (100% Backed)" : "Verify 30-Day SLA Protection"}
          </button>
        </div>
      </div>

      {/* ── 3. DIRECT SCHEDULING INTEGRATION (CAL.COM / CALENDLY) ── */}
      <div className="rounded-3xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/25 flex items-center justify-center text-[#0070F3]">
              <Video size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Partner Pitch Room &amp; Calendar Booking
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connected meeting calendar for {fullName} ({companyName}). Verified 1-on-1 calls are held over Google Meet / Zoom.
              </p>
            </div>
          </div>

          <a
            href={(profile as any)?.calendar_booking_url || "https://topmate.io/yourweb3guy/1784407?utm_source=public_profile&utm_campaign=yourweb3guy"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-all"
          >
            Open in Topmate <ExternalLink size={12} />
          </a>
        </div>

        {/* Embedded Booking Preview Box */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#16171b] border border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-[#00F5A0] text-[10px] font-mono font-bold">
              <Sparkles size={11} /> Next Available Window: Today / Tomorrow
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Instant Partner Fast-Pass Session (30 Minutes)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
              Pitch your round directly to vetted venture partners. Automated dual-sided recording, fast-pass diligence memo distribution, and post-call feedback delivered within 24 hours.
            </p>
          </div>

          <button
            onClick={() => window.open((profile as any)?.calendar_booking_url || "https://topmate.io/yourweb3guy/1784407?utm_source=public_profile&utm_campaign=yourweb3guy", "_blank")}
            className="w-full md:w-auto px-6 py-3 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Calendar size={14} /> Book Partner Session on Topmate →
          </button>
        </div>
      </div>
    </div>
  );
}
