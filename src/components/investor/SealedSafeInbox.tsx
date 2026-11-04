import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { founderSignsSealedSafe } from '../../lib/sealedAgreement';
import { Loader2, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface PendingSafe {
  id: string;
  company_name?: string;
  instrument?: string;
  amount?: number;
  val_cap?: number;
  investor_name?: string;
  document_text?: string;
}

/**
 * Founder-facing inbox for SAFEs awaiting their signature. Rendered inside
 * the Messages page so founders can review, countersign, or decline the
 * in-app sealed agreements investors issue to them.
 */
export default function SealedSafeInbox({ founderId }: { founderId: string }) {
  const [pending, setPending] = useState<PendingSafe[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!founderId) return;
    const q = query(
      collection(db, 'safes'),
      where('founder_id', '==', founderId),
      where('status', '==', 'pending_founder_signature')
    );
    const unsub = onSnapshot(q, (snap) => {
      const items: PendingSafe[] = [];
      snap.docs.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          company_name: data.company_name,
          instrument: data.instrument,
          amount: data.amount,
          val_cap: data.val_cap,
          investor_name: data.investor_name,
          document_text: data.document_text,
        });
      });
      setPending(items);
    }, (err) => console.warn('[SealedSafeInbox] listen error:', err));
    return () => unsub();
  }, [founderId]);

  if (pending.length === 0) return null;

  const sign = async (id: string, agree: boolean) => {
    setBusyId(id);
    setResult(null);
    try {
      const snap = await getDoc(doc(db, 'safes', id));
      const data = snap.data() || {};
      const res = await founderSignsSealedSafe(
        id,
        data.founder_name || 'Founder',
        data.founder_email || '',
        agree
      );
      setResult(
        res.success
          ? { ok: true, text: agree ? 'Agreement signed and sealed. Copies emailed to both parties.' : 'Agreement declined.' }
          : { ok: false, text: res.error || 'Failed to record your signature.' }
      );
    } catch (err: any) {
      setResult({ ok: false, text: err?.message || 'Failed to record your signature.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mb-5 rounded-3xl border border-sky-200 dark:border-sky-500/30 bg-sky-50/60 dark:bg-sky-950/20 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-sky-600 dark:text-sky-400" />
        <h3 className="text-sm font-black text-slate-900 dark:text-white">
          SAFEs awaiting your signature
        </h3>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-600 text-white">
          {pending.length}
        </span>
      </div>

      {result && (
        <div className={`flex items-start gap-2 text-xs font-mono font-bold p-3 rounded-xl ${
          result.ok ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-red-50 text-red-700'
        }`}>
          {result.ok ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5" />}
          <span>{result.text}</span>
        </div>
      )}

      {pending.map((s) => (
        <div key={s.id} className="p-4 rounded-2xl bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-white/10 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-black text-slate-900 dark:text-white text-sm">{s.company_name}</div>
              <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                {s.investor_name} issued a {s.instrument || 'SAFE'} of ${Number(s.amount || 0).toLocaleString('en-US')} at ${Number(s.val_cap || 0).toLocaleString('en-US')} cap
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => sign(s.id, true)}
                disabled={busyId === s.id}
                className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-black transition-all hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {busyId === s.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                Sign &amp; Seal
              </button>
              <button
                onClick={() => sign(s.id, false)}
                disabled={busyId === s.id}
                className="px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-300 text-[11px] font-bold hover:text-red-600 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                <X size={12} /> Decline
              </button>
            </div>
          </div>

          {s.document_text && (
            <pre className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/70 dark:border-white/5 rounded-xl p-3">
              {s.document_text}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
