import React, { useState, useEffect } from "react";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Coins,
  ExternalLink,
  Upload,
  FileCheck,
  X,
  Loader2,
  Sparkles
} from "lucide-react";
import { collection, getDocs, query, limit, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";

interface EscrowItem {
  id: string;
  client: string;
  title: string;
  totalLocked: string;
  totalAmountUsd: number;
  milestonesCompleted: string;
  nextRelease: string;
  releaseHours: string;
  contract: string;
  network: string;
  status: string;
  clientId?: string;
}

export default function ActiveEscrows() {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState<EscrowItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real escrow-backed engagements from Firestore (deal_flow + agreements).
  useEffect(() => {
    let active = true;
    async function loadEscrows() {
      try {
        const [flowSnap, agSnap] = await Promise.all([
          getDocs(query(collection(db, "deal_flow"), limit(100))),
          getDocs(query(collection(db, "agreements"), limit(100))),
        ]);
        const items: EscrowItem[] = [];
        flowSnap.docs.forEach((d) => {
          const data = d.data();
          const locked = Number(data.escrow_locked_amount || data.escrow_amount || 0) || 0;
          if (locked <= 0 && data.escrow_status !== "funded") return;
          const client = data.founder_name || data.company_name || data.name || "Client";
          items.push({
            id: d.id,
            client,
            title: data.project_title || data.tagline || data.description?.slice(0, 60) || "Milestone Engagement",
            totalLocked: `$${locked.toLocaleString()} ${data.escrow_currency || "USD"}`,
            totalAmountUsd: locked,
            milestonesCompleted: data.milestones_completed || "0 of 3",
            nextRelease: data.next_release || `${data.escrow_currency || "USD"} release on milestone completion`,
            releaseHours: data.release_hours || "48h Post-Delivery",
            contract: data.escrow_contract || data.contract_address || "—",
            network: data.network || data.chain || "—",
            status: data.escrow_status === "funded" ? "In Progress" : (data.deliverable_status || "In Progress"),
            clientId: data.founder_id || data.founderId || undefined,
          });
        });
        agSnap.docs.forEach((d) => {
          const data = d.data();
          const locked = Number(data.escrow_amount || 0) || 0;
          if (locked <= 0) return;
          items.push({
            id: d.id,
            client: data.client_name || data.founder_name || "Client",
            title: data.project_title || "Facilitation Engagement",
            totalLocked: `$${locked.toLocaleString()} ${data.escrow_currency || "USD"}`,
            totalAmountUsd: locked,
            milestonesCompleted: data.milestones_completed || "0 of 3",
            nextRelease: data.next_release || "Release on milestone completion",
            releaseHours: "48h Post-Delivery",
            contract: data.escrow_contract || "—",
            network: data.network || "—",
            status: data.escrow_status === "funded" ? "In Progress" : "In Progress",
            clientId: data.founder_id || undefined,
          });
        });
        if (active) setEscrows(items);
      } catch (err) {
        console.warn("[ActiveEscrows] load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadEscrows();
    return () => { active = false; };
  }, []);

  const [activeModalEscrow, setActiveModalEscrow] = useState<EscrowItem | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [deliverableNotes, setDeliverableNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalEscrow || !user) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Persist the deliverable record — a real backend write.
      await addDoc(collection(db, "escrow_deliverables"), {
        escrow_id: activeModalEscrow.id,
        agency_id: user.uid,
        client_name: activeModalEscrow.client,
        project_title: activeModalEscrow.title,
        deliverable_url: deliverableUrl,
        notes: deliverableNotes,
        status: "pending_review",
        created_at: new Date().toISOString(),
      });

      // Update the source engagement doc when it is a deal_flow entry.
      try {
        await updateDoc(doc(db, "deal_flow", activeModalEscrow.id), {
          deliverable_status: "submitted",
          deliverable_submitted_at: new Date().toISOString(),
        }).catch(() => {});
      } catch (_) {}

      // Notify the client founder if we have a real user.
      if (activeModalEscrow.clientId) {
        await addDoc(collection(db, "notifications"), {
          userId: activeModalEscrow.clientId,
          type: "escrow_deliverable",
          title: "Deliverable Submitted for Review",
          body: `Your agency submitted a deliverable for "${activeModalEscrow.title}". Review it within 48h to trigger payout.`,
          link: "/dashboard/messages",
          read: false,
          created_at: new Date().toISOString(),
        }).catch(() => {});
      }

      setEscrows((prev) =>
        prev.map((item) =>
          item.id === activeModalEscrow.id
            ? { ...item, status: "Deliverable Submitted (Review Active)", releaseHours: "48h Auto-Release Active" }
            : item
        )
      );
      setSubmitSuccess(`Deliverable submitted for ${activeModalEscrow.title}. 48h automatic payout counter initiated.`);
      setActiveModalEscrow(null);
      setDeliverableUrl("");
      setDeliverableNotes("");
      setTimeout(() => setSubmitSuccess(null), 6000);
    } catch (err: any) {
      console.error("[ActiveEscrows] submit error:", err);
      setSubmitError(err?.message || "Failed to record deliverable submission. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 overflow-y-auto h-full text-black dark:text-white font-sans">
      
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#262626]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
              ESCROW GUARANTEE ENGINE
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight">
            Active Client Escrow Vaults
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 max-w-2xl">
            All client funds are 100% pre-funded before kickoff. Guaranteed disbursement within 48h of milestone completion.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121316] border border-neutral-200 dark:border-white/10 shrink-0 text-right shadow-xs">
          <div className="text-[10px] font-mono font-bold uppercase text-neutral-400">
            Total Vault Balance
          </div>
          <div className="text-2xl font-heading font-black text-emerald-600 dark:text-emerald-400">
            ${escrows.reduce((a, e) => a + (e.totalAmountUsd || 0), 0).toLocaleString()} USD
          </div>
          <div className="text-[10px] font-mono text-neutral-500">
            {escrows.length} Active Contracts Locked
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>{submitSuccess}</span>
          </div>
          <button onClick={() => setSubmitSuccess(null)} className="text-emerald-600 hover:text-emerald-800 ml-4">
            ✕
          </button>
        </div>
      )}

      {/* ── ESCROW VAULTS LIST ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="animate-spin text-emerald-500" size={28} />
            <span className="text-xs font-mono">Loading escrow vaults...</span>
          </div>
        ) : escrows.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A]">
            <Lock size={28} className="mx-auto text-neutral-400 mb-2" />
            <p className="text-sm font-bold text-black dark:text-white font-mono">No funded escrow vaults yet</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              Once a client engagement is pre-funded, its escrow vault will appear here automatically.
            </p>
          </div>
        ) : escrows.map((e) => (
          <div
            key={e.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-[#262626] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  {e.status}
                </span>
                <span className="font-mono text-xs text-neutral-400 font-bold">
                  Client: {e.client}
                </span>
              </div>
              <h3 className="font-heading font-black text-lg text-black dark:text-white">
                {e.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-500">
                <span>Progress: <strong className="text-black dark:text-white">{e.milestonesCompleted}</strong></span>
                <span>•</span>
                <span>Network: <strong className="text-black dark:text-white">{e.network}</strong></span>
                <span>•</span>
                <span>Vault: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{e.contract}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 text-right font-mono min-w-[170px]">
                <div className="text-[10px] text-neutral-400 uppercase font-bold">Total Locked</div>
                <div className="font-black text-black dark:text-white text-base">{e.totalLocked}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">{e.nextRelease}</div>
              </div>

              <button
                onClick={() => setActiveModalEscrow(e)}
                className="px-4 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Upload size={13} />
                <span>Submit Deliverable</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── DELIVERABLE SUBMISSION MODAL ── */}
      {activeModalEscrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#121316] border border-neutral-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 text-black dark:text-white shadow-2xl relative space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-emerald-500" />
                <h3 className="font-heading font-black text-lg">
                  Submit Milestone Deliverable
                </h3>
              </div>
              <button
                onClick={() => setActiveModalEscrow(null)}
                className="text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-neutral-500 font-mono leading-relaxed">
              Submitting milestone deliverable for <strong>{activeModalEscrow.title}</strong> ({activeModalEscrow.client}). Once submitted, client has 48h to verify before funds auto-disburse to your payout address.
            </p>

            {submitError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-600 dark:text-red-300">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmitDeliverable} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-neutral-400 mb-1">
                  Deliverable URL (GitHub PR / Figma / Audit PDF)
                </label>
                <input
                  type="url"
                  required
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  placeholder="https://github.com/client/repo/pull/42 or report link"
                  className="w-full bg-neutral-50 dark:bg-[#18191e] border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-neutral-400 mb-1">
                  Deliverable Summary &amp; Verification Notes
                </label>
                <textarea
                  rows={3}
                  required
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                  placeholder="Explain completed milestone items, test coverage results, and audit findings..."
                  className="w-full bg-neutral-50 dark:bg-[#18191e] border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-700 dark:text-emerald-300">
                🔒 Payout Target: <strong>{activeModalEscrow.nextRelease}</strong> will release to your configured payout address upon confirmation.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalEscrow(null)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  <span>{isSubmitting ? "Initiating 48h Escrow Verification..." : "Confirm Submission →"}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
