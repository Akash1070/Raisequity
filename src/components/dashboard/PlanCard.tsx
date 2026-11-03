import React from "react";
import { Check, Crown, Sparkles, Zap } from "lucide-react";

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
    name: "Basic",
    price: "$0",
    credits: "50 credits / mo",
    features: [
      "Access to basic matches",
      "Contribute contacts to earn credits",
      "Standard support"
    ],
    color: "text-gray-600 bg-gray-50",
    bg: "bg-white",
    border: "border-gray-100",
    icon: null
  },
  {
    id: "premium",
    name: "Premium",
    price: "$99/mo",
    credits: "500 credits / mo",
    features: [
      "Unlock Curated Investor Directory",
      "Check Fit scoring with Gemini AI",
      "Request Warm Introductions",
      "Standard support"
    ],
    color: "text-[var(--color-clay-lemon)] bg-[var(--color-clay-lemon)]/10",
    bg: "bg-white",
    border: "border-[var(--color-clay-lemon)]/20",
    icon: <Crown size={16} />
  },
  {
    id: "pro",
    name: "Pro",
    price: "$249/mo",
    credits: "1,500 credits / mo",
    features: [
      "Everything in Premium",
      "AI website scanner to prefill profiles",
      "Priority introduction approval",
      "Priority customer support"
    ],
    color: "text-[var(--color-clay-ube-dark)] bg-[var(--color-clay-ube)]/10",
    bg: "bg-gradient-to-b from-white to-[var(--color-clay-ube)]/5",
    border: "border-[var(--color-clay-ube-dark)]/30 shadow-md",
    icon: <Sparkles size={16} />
  },
  {
    id: "concierge",
    name: "Concierge",
    price: "$999/mo",
    credits: "Unlimited credits",
    features: [
      "Dedicated Deal Flow Partner",
      "Warm intros sent on your behalf",
      "Stripe payment integration included",
      "Custom investor outreach list",
      "24/7 dedicated account manager"
    ],
    color: "text-[var(--color-clay-matcha-dark)] bg-[var(--color-clay-matcha)]/10",
    bg: "bg-white",
    border: "border-[var(--color-clay-matcha)]/20",
    icon: <Zap size={16} />
  }
];

export default function PlanCard({ plan, isActive, onSelect, loading }: PlanCardProps) {
  return (
    <div
      className={`rounded-3xl border p-6 flex flex-col justify-between transition-all ${plan.bg} ${plan.border} ${
        isActive ? "ring-2 ring-black" : "hover:border-gray-300"
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-black text-black flex items-center gap-2">
              {plan.name}
              {plan.icon && <span className={`${plan.color} p-1 rounded-lg`}>{plan.icon}</span>}
            </h4>
            <p className="text-xs text-gray-400 font-bold mt-0.5 uppercase tracking-wide">
              {plan.credits}
            </p>
          </div>
          <span className="text-[20px] font-black text-black">{plan.price}</span>
        </div>

        {/* Features List */}
        <ul className="space-y-2.5 pt-2">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-600 font-medium">
              <span className="w-4 h-4 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={10} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6">
        {isActive ? (
          <div className="w-full text-center py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black uppercase text-gray-400">
            Active Plan
          </div>
        ) : (
          <button
            onClick={onSelect}
            disabled={loading}
            className="w-full py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : `Select ${plan.name}`}
          </button>
        )}
      </div>
    </div>
  );
}
