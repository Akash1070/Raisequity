import React, { useState, useEffect } from "react";
import { 
  Coins, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CreditCard, 
  FileCode2, 
  Send, 
  Share2, 
  Plus, 
  CheckCircle2,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getCreditLedger, earnCredits } from "../../lib/credits";
import { CreditTransaction } from "../../types";
import CreditPackageModal from "../../components/dashboard/CreditPackageModal";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AgencyCredits() {
  const { user, profile, refreshProfile } = useAuth();
  const [ledger, setLedger] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [testProcessing, setTestProcessing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const balance = profile?.credit_balance ?? profile?.credits ?? 50;

  const loadLedger = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const records = await getCreditLedger(user.uid);
      setLedger(records);
    } catch (err) {
      console.warn("Failed to load agency credit ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [user?.uid, balance]);

  const handleInstantDemoTopUp = async () => {
    if (!user?.uid) return;
    setTestProcessing(true);
    try {
      await earnCredits(user.uid, "package_purchase", 200, {
        packageName: "200 Platform Credits Pack",
        priceUsd: 20,
        note: "Agency Suite $20 USD Demo Top-Up (+200 Credits)"
      });
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        credit_balance: balance + 200,
        credits: balance + 200
      }).catch(() => {});
      await refreshProfile();
      await loadLedger();
      setSuccessToast("+200 Credits added to your agency balance!");
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (e: any) {
      console.error("Instant top-up failed:", e);
    } finally {
      setTestProcessing(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-slate-900 dark:text-white">
              Agency Credits &amp; Billing
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Platform Currency
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Universal credits used to submit RFP proposals, pitch funded startups, and publish community broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCreditModalOpen(true)}
            className="px-4 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 font-mono uppercase tracking-wide"
          >
            <Plus size={14} /> Buy 200 Credits ($20)
          </button>
          <button
            onClick={handleInstantDemoTopUp}
            disabled={testProcessing}
            className="px-3.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 font-mono"
            title="Instant sandbox credit top-up for rapid testing"
          >
            {testProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            <span>+200 Demo</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Hero Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="md:col-span-2 p-7 rounded-[28px] bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 dark:bg-[#141518] shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                Available Spendable Balance
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {balance}
                </span>
                <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                  Credits
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coins size={24} />
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              50 Starter Credits active upon registration · 100% Never Expire
            </span>
            <button
              onClick={() => setCreditModalOpen(true)}
              className="text-amber-700 dark:text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              Get More Credits →
            </button>
          </div>
        </div>

        {/* Pricing Card: $20 for 200 Credits */}
        <div className="p-6 rounded-[28px] bg-slate-50 dark:bg-[#15161b] border border-neutral-200 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Unified Top-Up Package
              </span>
              <span className="text-[9px] font-mono font-bold bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded-full">
                Single Tier
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              $20 <span className="text-xs font-normal text-slate-400">USD</span>
            </div>
            <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              +200 Platform Credits
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              No recurring monthly retainers or locks. Top up as you go via Dodo Payments.
            </p>
          </div>

          <button
            onClick={() => setCreditModalOpen(true)}
            className="w-full mt-4 py-3 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white rounded-xl font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Top Up ($20)
          </button>
        </div>
      </div>

      {/* Credit Consumption Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          How Agencies Consume Platform Credits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#15161b] border border-neutral-200 dark:border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FileCode2 size={18} />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                Submit RFP Bids
              </h4>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                1 Credit
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Submit formal proposals and escrow milestone estimates on verified client RFPs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#15161b] border border-neutral-200 dark:border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Send size={18} />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                Pitch Funded Startups
              </h4>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                1 Credit
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Reach out directly to verified funded startups in the Deal Flow feed to pitch your services.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#15161b] border border-neutral-200 dark:border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Share2 size={18} />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                Community Broadcasts
              </h4>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                1 Credit
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Post client case studies, portfolio launches, or ecosystem announcements in the Social Feed.
            </p>
          </div>
        </div>
      </div>

      {/* Credit Transactions Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Agency Credit Transaction Ledger
          </h3>
          <button
            onClick={loadLedger}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh Ledger</span>
          </button>
        </div>

        <div className="bg-white dark:bg-[#141518] rounded-3xl border border-neutral-200 dark:border-white/10 overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="animate-spin text-[#0070F3]" size={24} />
              <span className="text-xs font-mono">Loading transaction ledger...</span>
            </div>
          ) : ledger.length === 0 ? (
            <div className="py-12 text-center space-y-2 px-4">
              <Coins size={28} className="mx-auto text-slate-400" />
              <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                Initial Starter Allocation Active ({balance} Credits)
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Transactions will be logged here in real time whenever you submit proposals, pitch deals, post in community, or purchase credits.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-white/10 bg-slate-50 dark:bg-[#18191e] text-[10px] uppercase text-slate-400">
                    <th className="py-3.5 px-5">Date &amp; Time</th>
                    <th className="py-3.5 px-5">Action / Source</th>
                    <th className="py-3.5 px-5">Type</th>
                    <th className="py-3.5 px-5">Credits</th>
                    <th className="py-3.5 px-5 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                  {ledger.map((tx) => {
                    const isEarn = tx.type === "earn";
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "Recent"}
                        </td>
                        <td className="py-3.5 px-5 text-slate-900 dark:text-white font-bold">
                          {tx.metadata?.note || tx.source.replace(/_/g, " ")}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isEarn
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          }`}>
                            {isEarn ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                            {isEarn ? "Credit Top-Up" : "Credit Spent"}
                          </span>
                        </td>
                        <td className={`py-3.5 px-5 font-bold ${
                          isEarn ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                        }`}>
                          {isEarn ? `+${tx.amount}` : `-${tx.amount}`}
                        </td>
                        <td className="py-3.5 px-5 text-right font-bold text-slate-900 dark:text-white">
                          {tx.balanceAfter !== undefined ? tx.balanceAfter : balance}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Credit Package Top-up Modal */}
      <CreditPackageModal
        isOpen={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        role="service_provider"
      />
    </div>
  );
}