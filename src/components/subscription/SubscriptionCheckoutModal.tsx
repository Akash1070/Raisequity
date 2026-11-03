import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, Info, Lock, Coins, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getGlobalConfig } from '../../lib/config';
import { earnCredits } from '../../lib/credits';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { GlobalConfig } from '../../types';

interface SubscriptionCheckoutModalProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SubscriptionCheckoutModal({ onSuccess, onCancel }: SubscriptionCheckoutModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      const cfg = await getGlobalConfig();
      setConfig(cfg);
      setLoading(false);
    }
    loadConfig();
  }, []);

  const handleDodoCheckout = async () => {
    if (!user || processing) return;
    setProcessing(true);
    try {
      // SECURITY: the previous flow granted an active subscription + 200
      // credits directly from the browser with NO payment at all. Now the
      // browser only obtains a hosted checkout URL from /api/create-checkout;
      // activation happens exclusively in the verified Dodo webhook.
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      if (!res.ok) throw new Error(`Checkout unavailable (HTTP ${res.status})`);
      const { checkout_url } = await res.json();
      if (!checkout_url) throw new Error('Checkout unavailable (no URL)');
      window.location.href = checkout_url;
    } catch (err) {
      console.error('[DodoPayments] Subscription checkout error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#0D0F12] text-white flex items-center justify-center p-6">
        <Loader2 className="animate-spin text-emerald-400" size={32} />
      </div>
    );
  }

  const subPrice = (config as any).subscription_price_usd || 20;
  const successFee = config.platform_fee_pct || 5;
  const rewardCredits = config.subscription_reward_credits || 200;
  const referralCredits = config.investor_referral_credits || 30;
  const creditCap = config.success_fee_credit_cap_pct || 30;
  const discountPct = config.first_deal_discount_pct || 50;

  return (
    <div className="min-h-screen bg-[#0D0F12] text-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-[#161920] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black border border-white/10 rounded-xl flex items-center justify-center text-white font-black italic">
              rq
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Raisequity Membership Checkout</h2>
              <p className="text-xs text-gray-400 font-medium">Clear, transparent platform terms</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400">${subPrice}</span>
            <span className="text-xs text-gray-400 font-bold block">/ month</span>
          </div>
        </div>

        {/* Required Platform Transparency Breakdown */}
        <div className="space-y-4">
          {/* Irresistible Offer: 3 Guaranteed Partner Meetings SLA */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                🛡️
              </span>
              <div>
                <span className="text-emerald-400 font-black text-sm block">
                  3 Guaranteed Partner Intro Calls in 30 Days (or 100% Full Refund)
                </span>
                <span className="text-[11px] text-gray-300">
                  Backed by algorithmic double-blind matching and verified check-writer preferences.
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed pl-11">
              Unlike PitchBook ($4,000–$10,000/yr for dead cold lists), we tie your membership to real partner calls. 
              If our matching engine does not deliver <strong>at least 3 confirmed intro calls</strong> with check-size and stage-matched VCs within 30 days, 
              claim an <strong>instant 100% automated refund</strong> directly back to your card.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400 tracking-wider">
            <ShieldCheck size={16} /> Platform Transparency Breakdown
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Subscription */}
            <div className="bg-[#1C202B] border border-gray-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                <span>${subPrice}/mo Dashboard Access</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Full access to founder warm intro requests, pitch deck storage, community feed, and fundraise CRM.
              </p>
            </div>

            {/* Card 2: Success Fee */}
            <div className="bg-[#1C202B] border border-gray-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles size={16} className="text-amber-400 shrink-0" />
                <span>{successFee}% Success Fee ({discountPct}% Off 1st Deal)</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Payable only on confirmed closed funding deals. Your 1st closed deal gets a <strong>{discountPct}% fee discount</strong>!
              </p>
            </div>

            {/* Card 3: Credit Rewards */}
            <div className="bg-[#1C202B] border border-gray-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Coins size={16} className="text-emerald-400 shrink-0" />
                <span>+{rewardCredits} Monthly Credits</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Earn {rewardCredits} credits every month. Earn +{referralCredits} credits per verified investor referral. Offset up to {creditCap}% of success fees.
              </p>
            </div>

            {/* Card 4: Terms & Dispute Policy */}
            <div className="bg-[#1C202B] border border-gray-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Info size={16} className="text-blue-400 shrink-0" />
                <span>Admin Dispute Disclosure</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Scout Admins may review intro communications strictly for dispute resolution and fee verification.
              </p>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300 flex items-center gap-2 font-medium">
            <Lock size={14} className="shrink-0" />
            <span>Note: Credits CANNOT be applied toward recurring subscription charges.</span>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer w-4 h-4"
          />
          <label htmlFor="terms" className="text-xs text-gray-300 cursor-pointer">
            I understand and accept the platform terms, {successFee}% success fee model ({discountPct}% waived on 1st deal), and credit rules.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-4 rounded-xl border border-gray-700 text-gray-400 font-bold text-xs hover:text-white hover:border-gray-500 transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleDodoCheckout}
            disabled={!agreedToTerms || processing}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-black py-4 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {processing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing Payment...
              </>
            ) : (
              <>
                Pay ${subPrice}/mo via Dodo Payments & Unlock Access
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
