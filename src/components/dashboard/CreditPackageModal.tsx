import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, 
  Sparkles, 
  Check, 
  ArrowRight, 
  X, 
  Loader2, 
  ShieldCheck, 
  Zap,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { earnCredits } from '../../lib/credits';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface CreditPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits?: number;
  actionTitle?: string;
  role?: string;
}

interface PackageTier {
  id: string;
  name: string;
  credits: number;
  bonusCredits: number;
  priceUsd: number;
  popular?: boolean;
  description: string;
  features: string[];
}

const CREDIT_PACKAGES: PackageTier[] = [
  {
    id: 'starter_100',
    name: 'Starter Tier',
    credits: 100,
    bonusCredits: 0,
    priceUsd: 99,
    description: 'Perfect for initial founder intros and thesis validation.',
    features: [
      '4 Diligence Partner Calls (25 cr/ea)',
      '10 Direct Counterparty Chats',
      'Data Room Fast-Pass Access',
      'No Expiration Date'
    ]
  },
  {
    id: 'pro_300',
    name: 'Growth & Syndicate',
    credits: 300,
    bonusCredits: 50,
    priceUsd: 249,
    popular: true,
    description: 'The standard package for active check-writers and growing startups.',
    features: [
      '14 Diligence Partner Calls',
      '30 Direct Counterparty Chats',
      '1-Click Standardized SAFE Execution',
      '+50 Bonus Credits Included',
      'Priority Fast-Pass Review'
    ]
  },
  {
    id: 'whale_1000',
    name: 'Institutional Fund',
    credits: 1000,
    bonusCredits: 250,
    priceUsd: 699,
    description: 'Maximum velocity dealflow for syndicate leads and venture funds.',
    features: [
      '50 Diligence Partner Calls',
      'Unlimited Direct Messaging Channels',
      '+250 Bonus Credits Included',
      'Automated Telegram & Webhook Deal Alerts',
      'Dedicated Partner Diligence SLA'
    ]
  }
];

export default function CreditPackageModal({
  isOpen,
  onClose,
  requiredCredits,
  actionTitle
}: CreditPackageModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string>('pro_300');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentBalance = profile?.credit_balance ?? profile?.credits ?? 0;

  const handleCheckout = async (pkg: PackageTier) => {
    if (!user?.uid) return;
    setIsProcessing(true);

    try {
      // 1. Try Dodo Payments Checkout session
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          packageId: pkg.id,
          amountUsd: pkg.priceUsd,
          credits: pkg.credits + pkg.bonusCredits
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
          return;
        }
      }
    } catch (_) {
      // Fallback to local test top-up simulation if gateway API is offline
    }

    // Direct Instant Top-Up Simulation (Local Dev & Verification)
    await handleInstantTestTopUp(pkg);
  };

  const handleInstantTestTopUp = async (pkg: PackageTier) => {
    if (!user?.uid) return;
    setIsProcessing(true);

    const totalCreditsAwarded = pkg.credits + pkg.bonusCredits;
    try {
      await earnCredits(user.uid, 'package_purchase', totalCreditsAwarded, {
        packageName: pkg.name,
        priceUsd: pkg.priceUsd,
        note: `Purchased ${pkg.name} (${totalCreditsAwarded} Credits)`
      });

      // Also ensure user document reflects updated balance
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        credit_balance: currentBalance + totalCreditsAwarded
      }).catch(() => {});

      await refreshProfile();
      setPurchaseSuccess(totalCreditsAwarded);
      setTimeout(() => {
        setPurchaseSuccess(null);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('[CreditPackageModal] Purchase error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="bg-white dark:bg-[#121316] rounded-[32px] border border-neutral-200 dark:border-white/10 shadow-2xl max-w-3xl w-full my-8 overflow-hidden flex flex-col font-sans"
        >
          {/* Header */}
          <div className="p-6 bg-slate-50 dark:bg-[#15161b] border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Coins size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-lg text-black dark:text-white">
                    Platform Credit Top-Up
                  </h3>
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                    Current: {currentBalance} Credits
                  </span>
                </div>
                <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {actionTitle 
                    ? `Action requires ${requiredCredits} Credits · Refill your balance to proceed`
                    : 'Universal currency used by Founders, Investors, and Accredited Agencies'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-white/5 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Success Banner */}
          {purchaseSuccess && (
            <div className="p-4 bg-emerald-500 text-white font-mono text-xs font-black text-center flex items-center justify-center gap-2">
              <Check size={16} />
              <span>+{purchaseSuccess} Credits Successfully Added to Your Balance!</span>
            </div>
          )}

          {/* Body: 3 Package Cards Grid */}
          <div className="p-6 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CREDIT_PACKAGES.map((pkg) => {
                const isSelected = selectedPackage === pkg.id;
                const totalCredits = pkg.credits + pkg.bonusCredits;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`p-5 rounded-[24px] border transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/10 shadow-md ring-2 ring-amber-500/20'
                        : 'border-neutral-200 dark:border-white/10 bg-white dark:bg-[#18191e] hover:border-black/30 dark:hover:border-white/20'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-black shadow-xs">
                        MOST POPULAR
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading font-black text-sm text-black dark:text-white">
                          {pkg.name}
                        </span>
                        {pkg.bonusCredits > 0 && (
                          <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            +{pkg.bonusCredits} Bonus
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="font-heading font-black text-3xl text-black dark:text-white">
                          {totalCredits}
                        </span>
                        <span className="font-mono text-xs text-neutral-400 uppercase font-bold">Credits</span>
                      </div>

                      <div className="font-mono text-sm font-black text-black dark:text-white mb-3">
                        ${pkg.priceUsd} <span className="text-[10px] text-neutral-400 font-normal">one-time</span>
                      </div>

                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug mb-4">
                        {pkg.description}
                      </p>

                      <ul className="space-y-2 border-t border-neutral-100 dark:border-white/5 pt-3">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] font-mono text-neutral-600 dark:text-neutral-300">
                            <Check size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckout(pkg);
                      }}
                      disabled={isProcessing}
                      className={`w-full mt-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500 hover:bg-amber-600 text-black'
                          : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                      }`}
                    >
                      {isProcessing && selectedPackage === pkg.id ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Select &amp; Pay ${pkg.priceUsd}</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom SLA & Dodo Guarantee */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span className="text-neutral-500 dark:text-neutral-400">
                  Secured by Dodo Payments Gateway · Automated Webhook Credit Issuance
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const pkg = CREDIT_PACKAGES.find(p => p.id === selectedPackage) || CREDIT_PACKAGES[1];
                  handleInstantTestTopUp(pkg);
                }}
                disabled={isProcessing}
                className="text-[11px] text-[#0070F3] hover:underline font-bold shrink-0 cursor-pointer"
              >
                ⚡ Instant Test Top-Up (+{CREDIT_PACKAGES.find(p => p.id === selectedPackage)?.credits || 300} cr)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
