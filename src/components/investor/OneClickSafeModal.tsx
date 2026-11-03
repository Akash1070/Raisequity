import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, ShieldCheck, CheckCircle2, DollarSign, 
  Sparkles, Loader2, X, ExternalLink, Scale, Check, MessageSquare
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { issueStandardSafeAgreement, SafeAgreementPayload } from '../../lib/opensign';
import { getOrCreateConversation, sendDirectMessage } from '../../lib/messages';

interface OneClickSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: any;
  investor: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OneClickSafeModal({
  isOpen,
  onClose,
  company,
  investor,
}: OneClickSafeModalProps) {
  const navigate = useNavigate();
  const [checkAmount, setCheckAmount] = useState<number>(50000);
  const [valCap, setValCap] = useState<number>(company?.valuation_cap || 6000000);
  const [discountPct, setDiscountPct] = useState<number>(20);
  const [instrument, setInstrument] = useState<'Post-Money SAFE' | 'Token SAFT (Web3)'>('Post-Money SAFE');
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [executedDocUrl, setExecutedDocUrl] = useState<string | null>(null);
  const [createdConvId, setCreatedConvId] = useState<string | null>(null);

  if (!isOpen || !company) return null;

  const founderId = company.founder_id || company.founderId || 'lead_founder_elena';
  const founderName = company.founder_name || company.founder || 'Founder';
  const founderEmail = company.founder_email || 'founder@startup.com';

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const payload: SafeAgreementPayload = {
        companyId: company.id,
        companyName: company.name,
        founderName,
        founderEmail,
        investorId: investor.id,
        investorName: investor.name,
        investorEmail: investor.email,
        checkAmountUsd: checkAmount,
        valuationCapUsd: valCap,
        discountPct: discountPct,
        instrumentType: instrument,
      };

      const result = await issueStandardSafeAgreement(payload);
      const docSigningUrl = result.signingUrl || `https://app.opensignlabs.com/sign/${result.documentId}`;
      setExecutedDocUrl(docSigningUrl);

      const now = new Date().toISOString();

      // 1. Record allocation in investor_portfolio
      await addDoc(collection(db, 'investor_portfolio'), {
        investor_id: investor.id,
        investor_name: investor.name,
        company_id: company.id,
        company_name: company.name,
        founder_id: founderId,
        founder_name: founderName,
        founder_email: founderEmail,
        sector: company.sector || 'AI & SaaS',
        stage: company.stage || 'Seed Round',
        invested_amount: checkAmount,
        valuation_cap: valCap,
        instrument_type: instrument,
        discount_pct: discountPct,
        status: 'Active',
        document_url: docSigningUrl,
        document_id: result.documentId,
        created_at: now,
      }).catch((err) => console.warn('[OneClickSafe] investor_portfolio write err:', err));

      // 2. Record standardized SAFE agreement
      await addDoc(collection(db, 'safes'), {
        investor_id: investor.id,
        founder_id: founderId,
        company_id: company.id,
        company_name: company.name,
        amount: checkAmount,
        val_cap: valCap,
        instrument,
        status: 'pending_signatures',
        doc_id: result.documentId,
        created_at: now,
      }).catch((err) => console.warn('[OneClickSafe] safes write err:', err));

      // 3. Deliver real-time notification to the Founder
      await addDoc(collection(db, 'notifications'), {
        user_id: founderId,
        type: 'safe_offer',
        title: '📜 Standardized SAFE Allocation Issued!',
        body: `${investor.name} has issued a $${checkAmount.toLocaleString()} ${instrument} ($${(valCap / 1000000).toFixed(1)}M Cap) for ${company.name}!`,
        link: '/dashboard/messages',
        read: false,
        created_at: now,
      }).catch((err) => console.warn('[OneClickSafe] notification write err:', err));

      // 4. Start direct message thread between investor and founder
      try {
        const convId = await getOrCreateConversation(
          {
            id: investor.id,
            name: investor.name,
            email: investor.email,
            role: 'investor',
          },
          {
            id: founderId,
            name: founderName,
            email: founderEmail,
            role: 'founder',
            company_name: company.name,
          },
          {
            deal_id: company.id,
            deal_name: company.name,
            target_raise: `$${checkAmount.toLocaleString()}`,
            valuation_cap: `$${(valCap / 1000000).toFixed(1)}M Cap`,
          }
        );

        setCreatedConvId(convId);

        await sendDirectMessage({
          conversationId: convId,
          sender: {
            id: investor.id,
            name: investor.name,
            email: investor.email,
            role: 'investor',
          },
          recipientId: founderId,
          recipientRole: 'founder',
          content: `📜 Official SAFE Issued: I have committed $${checkAmount.toLocaleString()} via ${instrument} ($${(valCap / 1000000).toFixed(1)}M Valuation Cap). The agreement is pre-vetted. Let's align on countersignature and wire settlement.`,
          messageType: 'safe_offer',
          metadata: {
            checkAmount,
            valCap,
            instrument,
            documentUrl: docSigningUrl,
          },
        });
      } catch (chatErr) {
        console.warn('[OneClickSafe] Chat thread initiation warning:', chatErr);
      }

    } catch (err) {
      console.error('Error executing SAFE agreement:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="bg-white rounded-[32px] border border-gray-200 shadow-2xl max-w-xl w-full my-8 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#0D0F12] text-white p-6 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Scale size={20} />
              </div>
              <div>
                <h3 className="font-black text-base tracking-tight text-white flex items-center gap-2">
                  1-Click OpenSign SAFE Execution
                </h3>
                <p className="text-xs text-gray-400">Pre-vetted legal agreement · $0 Legal setup costs</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-7 space-y-5 text-xs text-slate-700 bg-slate-50/50">
            {executedDocUrl ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">Standardized {instrument} Issued!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    The legal contract has been generated on OpenSign for <strong>{company.name}</strong> for ${checkAmount.toLocaleString()} at a ${(valCap / 1000000).toFixed(1)}M Valuation Cap.
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-emerald-900 font-bold text-xs max-w-md mx-auto">
                  🎉 Saved $5,000 in early-stage legal drafting fees!
                </div>

                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  <a
                    href={executedDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 bg-black hover:bg-slate-800 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Open & Sign on OpenSign</span>
                    <ExternalLink size={14} />
                  </a>

                  <button
                    onClick={() => {
                      onClose();
                      navigate(createdConvId 
                        ? `/investor-dashboard/messages?convId=${createdConvId}` 
                        : `/investor-dashboard/messages?to=${founderId}&name=${encodeURIComponent(founderName)}&company=${encodeURIComponent(company.name)}`
                      );
                    }}
                    className="px-6 py-3 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <MessageSquare size={14} />
                    <span>Open Chat with Founder</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Company Mini Card */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="font-black text-slate-900 text-sm">{company.name}</span>
                    <span className="text-slate-400 block text-[11px] font-medium">{company.sector || 'AI & SaaS'} · {company.stage || 'Seed'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Target Round</span>
                    <span className="font-black text-slate-900">${(company.funding_goal || company.raise_amount || 500000).toLocaleString()}</span>
                  </div>
                </div>

                {/* Instrument Selector */}
                <div className="space-y-1.5">
                  <label className="font-black text-slate-800 uppercase text-[10px] tracking-wider">
                    Standardized Legal Template
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInstrument('Post-Money SAFE')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        instrument === 'Post-Money SAFE'
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-black shadow-xs'
                          : 'border-gray-200 bg-white text-slate-600 font-bold'
                      }`}
                    >
                      Post-Money SAFE (YC Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstrument('Token SAFT (Web3)')}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        instrument === 'Token SAFT (Web3)'
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-black shadow-xs'
                          : 'border-gray-200 bg-white text-slate-600 font-bold'
                      }`}
                    >
                      Token SAFT (Web3 Standard)
                    </button>
                  </div>
                </div>

                {/* Check Size Presets */}
                <div className="space-y-1.5">
                  <label className="font-black text-slate-800 uppercase text-[10px] tracking-wider">
                    Investment Check Size (USD)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[25000, 50000, 100000, 250000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCheckAmount(amt)}
                        className={`py-2 px-3 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                          checkAmount === amt
                            ? 'border-black bg-black text-white font-black'
                            : 'border-gray-200 bg-white text-slate-700 font-bold hover:bg-slate-50'
                        }`}
                      >
                        ${amt / 1000}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* Valuation Cap & Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-black text-slate-800 uppercase text-[10px] tracking-wider">
                      Valuation Cap ($)
                    </label>
                    <input
                      type="number"
                      step="500000"
                      value={valCap}
                      onChange={(e) => setValCap(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-black text-slate-800 uppercase text-[10px] tracking-wider">
                      Discount Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={discountPct}
                      onChange={(e) => setDiscountPct(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                {/* Legal Guarantee Notice */}
                <div className="bg-slate-100 rounded-2xl p-4 text-[11px] text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-black text-slate-900">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Instant Execution Standard</span>
                  </div>
                  <p className="leading-relaxed">
                    Uses standardized Y-Combinator / Cooley GO Post-Money SAFE contracts recognized by all top-tier US & global funds. 
                    Both parties sign electronically via OpenSign cryptographic audit trails.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          {!executedDocUrl && (
            <div className="p-4 sm:p-5 bg-white border-t border-gray-200 flex items-center justify-between gap-3">
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <Sparkles size={12} /> $0 Platform Legal Overhead
              </span>
              <button
                onClick={handleExecute}
                disabled={isExecuting || !checkAmount}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isExecuting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Generating Agreement...</span>
                  </>
                ) : (
                  <>
                    <Scale size={14} />
                    <span>Issue & Sign SAFE (${checkAmount.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

