import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Workflow,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Calendar,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Loader2,
  Send
} from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";

interface IntroItem {
  id: string;
  founder: string;
  company: string;
  sector: string;
  stage: string;
  raise: string;
  requestDate: string;
  status: "pending" | "confirmed" | "completed";
  message: string;
  memoScore: number;
}

export default function RequestedIntros() {
  const { user } = useAuth();
  const [intros, setIntros] = useState<IntroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [acceptedNote, setAcceptedNote] = useState<string | null>(null);

  // Subscribe live to real intro requests in Firestore
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "admin_intros"),
      where("investor_id", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const live = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            founder: d.founder_name || d.founder || "Founder",
            company: d.deal_name || d.company_name || d.company || "Portfolio Protocol",
            sector: d.sector || "Web3",
            stage: d.stage || "Seed",
            raise: d.target_raise ? `${d.target_raise}` : "$1.5M",
            requestDate: d.created_at ? new Date(d.created_at).toLocaleDateString() : "Recent",
            status: (d.status === "connected" ? "confirmed" : d.status === "completed" ? "completed" : "pending") as "pending" | "confirmed" | "completed",
            message: d.message || "Double-blind partner introduction coordinated via Raisequity Venture Desk.",
            memoScore: d.memo_score || 94
          };
        });
        setIntros(live);
        setLoading(false);
      },
      (err) => {
        console.warn("Could not listen to real intros:", err);
        setIntros([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const filtered = intros.filter((i) => {
    if (activeFilter === "all") return true;
    return i.status === activeFilter;
  });

  return (
    <div className="w-full space-y-6 font-sans">
      {acceptedNote && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs font-mono text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between shadow-xs">
          <span>✓ {acceptedNote}</span>
          <button onClick={() => setAcceptedNote(null)} className="text-emerald-600 dark:text-emerald-400 hover:opacity-80">✕</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-[1.5px] text-[#4f46e5] dark:text-[#805ad5]">
              DOUBLE-BLIND INTRO PIPELINE
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight">
            Requested Partner Intros
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">
            Track double-blind introduction requests and scheduled meetings with thesis-matched founders.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-[#18191e] rounded-xl font-mono text-xs">
          {["all", "pending", "confirmed", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase text-[10px] transition-all cursor-pointer ${
                activeFilter === tab
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Intro List / Zero State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <Loader2 className="animate-spin text-[#0070F3]" size={32} />
          <span className="text-xs font-mono">Loading intro requests...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121316] border border-neutral-200 dark:border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Workflow size={24} />
          </div>
          <h3 className="text-base font-bold text-black dark:text-white font-mono">
            No Introduction Requests Yet
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            When founders matching your thesis request an intro, or when you click "Request 1-Click Intro" on deal flow startups, your active introductions will be tracked here in real time.
          </p>
          <div className="pt-2">
            <Link
              to="/investor-dashboard/deals"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all shadow-xs"
            >
              <span>Explore Deals &amp; Request Intros</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-black text-sm shrink-0">
                  {item.company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-black text-base text-black dark:text-white">
                      {item.company}
                    </h3>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-neutral-500">
                      {item.sector}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      {item.memoScore}% Fit
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 mb-1">
                    {item.message}
                  </p>
                  <div className="text-[11px] font-mono text-neutral-400">
                    Founder: <strong className="text-black dark:text-white">{item.founder}</strong> • Round: {item.raise} • Requested: {item.requestDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-3 py-1.5 rounded-full font-mono text-[10px] font-black uppercase flex items-center gap-1.5 ${
                  item.status === "confirmed"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                    : item.status === "completed"
                    ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                }`}>
                  {item.status === "confirmed" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  <span>{item.status === "confirmed" ? "Call Confirmed" : item.status === "completed" ? "Meeting Completed" : "Coordinating Intro"}</span>
                </span>
                <Link
                  to="/investor-dashboard/messages"
                  className="px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-bold text-xs font-mono transition-all cursor-pointer shadow-xs"
                >
                  Messages →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}