import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, Info, Lock, Coins, Sparkles, Loader2, ExternalLink, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getGlobalConfig } from '../../lib/config';
import { earnCredits } from '../../lib/credits';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { GlobalConfig } from '../../types';
import { useNavigate } from 'react-router-dom';

interface SubscriptionCheckoutModalProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SubscriptionCheckoutModal({ onSuccess, onCancel }: SubscriptionCheckoutModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testCreditSuccess, setTestCreditSuccess] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      const cfg = await getGlobalConfig();
      setConfig(cfg);
      setLoading(false);
    }
    loadConfig();
  }, []);

  const handleDodoCheckout = async () => {
    const uid = user?.uid || (user as any)?.id;
    const userEmail = user?.email || (user as any)?.user?.email;
    if (!uid || !userEmail || processing) {
      setErrorMessage("Please ensure you are signed in with a valid account.");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      // SECURITY: Creates live session via Dodo Payments API
      const token = user ? await user.getIdToken() : '';
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          userId: uid, 
          email: userEmail,
          returnUrl: window.location.href,
          amountUsd: 20,
          credits: 200
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Checkout endpoint returned HTTP ${res.status}`);
      }

      const { checkout_url } = await res.json();
      if (!checkout_url) throw new Error('No checkout URL received from payment gateway');

      // Immediate redirect to hosted Dodo Payments checkout
      window.location.href = checkout_url;
    } catch (err: any) {
      console.error('[DodoPayments] Subscription checkout error:', err);
      setErrorMessage(err?.message || "Failed to initiate payment session. Please try again.");
      setProcessing(false);
    }
  };

  // Local credit testing simulation (for rapid verification in development)
  const handleTestGrantCredits = async () => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return;
    setProcessing(true);
    try {
      await earnCredits(uid, 'subscription_reward', 100, { note: 'Local Test Credit Simulation' });
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        has_active_subscription: true,
        subscription_status: 'active',
        subscription_tier: 'pro'
      });
      await refreshProfile();
      setTestCreditSuccess(true);
      setTimeout(() => {
        setTestCreditSuccess(false);
        navigate('/dashboard/feed');
      }, 1500);
    } catch (e: any) {
      console.warn('Simulation credit error:', e);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] dark:bg-[#000000] text-slate-900 dark:text-white flex items-center justify-center p-6">
        <Loader2 className="animate-spin text-[#0070F3]" size={32} />
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
    <div className="min-h-screen bg-[#F8FAFB] dark:bg-[#000000] text-[#171717] dark:text-[#EDEDED] flex items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-150">
      <div className="max-w-2xl w-full bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#262626] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0070F3] rounded-xl flex items-center justify-center text-white font-black italic shadow-xs">
              rq
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Raisequity Membership Checkout</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Secured by Dodo Payments Gateway</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-mono font-black text-emerald-600 dark:text-[#00F5A0]">${subPrice}</span>
            <span className="text-xs text-slate-500 font-bold block">/ month</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold">
            {errorMessage}
          </div>
        )}

        {testCreditSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-[#00F5A0] text-xs font-bold flex items-center gap-2">
            <Check size={16} /> +100 Credits added &amp; Subscription activated! Redirecting to feed...
          </div>
        )}

        {/* Required Platform Transparency Breakdown */}
        <div className="space-y-4">
          {/* Irresistible Offer: 3 Guaranteed Partner Meetings SLA */}
          <div className="bg-emerald-500/10 dark:bg-[#041F14] border border-emerald-500/30 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-[#00F5A0] flex items-center justify-center font-black">
                🛡️
              </span>
              <div>
                <span className="text-emerald-800 dark:text-[#00F5A0] font-black text-sm block">
                  3 Guaranteed Partner Intro Calls in 30 Days (or 100% Full Refund)
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300">
                  Backed by algorithmic double-blind matching and verified check-writer preferences.
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-11">
              Unlike PitchBook ($4,000–$10,000/yr for dead cold lists), we tie your membership to real partner calls. 
              If our matching engine does not deliver <strong>at least 3 confirmed intro calls</strong> with check-size and stage-matched VCs within 30 days, 
              claim an <strong>instant 100% automated refund</strong> directly back to your card.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
            <ShieldCheck size={16} /> Platform Transparency Breakdown
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Subscription */}
            <div className="bg-slate-50 dark:bg-[#16171b] border border-slate-200 dark:border-[#262626] rounded-2xl p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                <span>${subPrice}/mo Dashboard Access</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Full access to founder warm intro requests, pitch deck storage, community feed, and fundraise CRM.
              </p>
            </div>

            {/* Card 2: Success Fee */}
            <div className="bg-slate-50 dark:bg-[#16171b] border border-slate-200 dark:border-[#262626] rounded-2xl p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Sparkles size={15} className="text-amber-500 shrink-0" />
                <span>{successFee}% Success Fee ({discountPct}% Off 1st Deal)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Payable only on confirmed closed funding deals. Your 1st closed deal gets a <strong>{discountPct}% fee discount</strong>!
              </p>
            </div>

            {/* Card 3: Credit Rewards */}
            <div className="bg-slate-50 dark:bg-[#16171b] border border-slate-200 dark:border-[#262626] rounded-2xl p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Coins size={15} className="text-emerald-500 shrink-0" />
                <span>+{rewardCredits} Monthly Credits</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Earn {rewardCredits} credits every month. Earn +{referralCredits} credits per verified investor referral.
              </p>
            </div>

            {/* Card 4: Terms */}
            <div className="bg-slate-50 dark:bg-[#16171b] border border-slate-200 dark:border-[#262626] rounded-2xl p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Info size={15} className="text-[#0070F3] shrink-0" />
                <span>Binding 30-Day SLA Protection</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Zero friction, 1-click automated refund if 3 partner intro calls are not scheduled in 30 days.
              </p>
            </div>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="rounded border-slate-300 dark:border-neutral-700 bg-white dark:bg-black text-[#0070F3] focus:ring-[#0070F3] cursor-pointer w-4 h-4"
          />
          <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            I accept the 30-day partner meeting SLA terms, {successFee}% success fee model ({discountPct}% discount on 1st closed deal), and billing rules.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleDodoCheckout}
            disabled={!agreedToTerms || processing}
            className="flex-1 w-full bg-[#0070F3] hover:bg-[#0060DF] disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {processing ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" /> Connecting Dodo Payments...
              </>
            ) : (
              <>
                Pay ${subPrice}/mo via Dodo Payments &amp; Unlock SLA Access <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        {/* Local Test Simulation / Top-Up option */}
        <div className="pt-2 text-center">
          <button
            onClick={handleTestGrantCredits}
            disabled={processing}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
          >
            [Dev Test Option]: Simulate instant webhook verification &amp; add +100 credits
          </button>
        </div>
      </div>
    </div>
  );
}
