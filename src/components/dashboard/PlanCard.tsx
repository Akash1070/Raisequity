import React from "react";
import { Check, Coins, Sparkles, Zap, ShieldCheck } from "lucide-react";

export interface PlanDetails {
  id: string;
  name: string;
  price: string;
  credits: string;
  features: string[];
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}

interface PlanCardProps {
  plan: PlanDetails;
  isActive: boolean;
  onSelect: () => void;
  loading: boolean;
}

export const PLANS: PlanDetails[] = [
  {
    id: "basic",
    name: "Starter Free",
    price: "$0",
    credits: "50 starter credits",
    features: [
      "50 Free starter credits on registration",
      "Full access to verified directory & deals",
      "Community feed read & interactive comments",
      "Standard platform support"
    ],
    color: "text-slate-600 bg-slate-100 dark:bg-white/10 dark:text-slate-300",
    bg: "bg-white dark:bg-[#141518]",
    border: "border-slate-200 dark:border-white/10",
    icon: <Coins size={16} />
  },
  {
    id: "credit_pack_200",
    name: "Platform Credit Pack",
    price: "$20",
    credits: "200 platform credits",
    features: [
      "200 Spendable Platform Credits (Never Expire)",
      "Direct Outreach & Warm Intro Requests (1 cr/ea)",
      "Community Social Broadcasts & Updates (1 cr/ea)",
      "Agency RFP Bids & Startup Pitches (1 cr/ea)",
      "Partner Diligence Call Bookings (25 cr/ea)",
      "Secured Dodo Payments & Instant Webhook Delivery"
    ],
    color: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    bg: "bg-gradient-to-b from-amber-50/20 via-white to-amber-50/10 dark:from-[#1c1a16] dark:to-[#141518]",
    border: "border-amber-500/40 shadow-md ring-1 ring-amber-500/20",
    icon: <Sparkles size={16} />
  }
];

export default function PlanCard({ plan, isActive, onSelect, loading }: PlanCardProps) {
  return (
    <div
      className={`rounded-3xl border p-6 flex flex-col justify-between transition-all ${plan.bg} ${plan.border} ${
        isActive ? "ring-2 ring-black dark:ring-white" : "hover:border-slate-400 dark:hover:border-white/20"
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              {plan.name}
              {plan.icon && <span className={`${plan.color} p-1.5 rounded-xl`}>{plan.icon}</span>}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold mt-0.5 uppercase tracking-wide">
              {plan.credits}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{plan.price}</span>
            <span className="block text-[10px] font-mono text-slate-400 uppercase">
              {plan.id === "basic" ? "Free Forever" : "USD One-Time"}
            </span>
          </div>
        </div>

        {/* Features List */}
        <ul className="space-y-2.5 pt-2">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={10} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6">
        {isActive ? (
          <div className="w-full text-center py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-mono font-black uppercase text-slate-500 dark:text-slate-400">
            Active Status (50 Free Credits)
          </div>
        ) : (
          <button
            onClick={onSelect}
            disabled={loading}
            className="w-full py-3 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white rounded-2xl text-xs font-mono font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 disabled:opacity-50 shadow-xs"
          >
            {loading ? "Processing..." : `Get 200 Credits ($20)`}
          </button>
        )}
      </div>
    </div>
  );
}