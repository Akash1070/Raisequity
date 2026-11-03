import React from "react";
import { Link, HelpCircle } from "lucide-react";

export interface ContactFormData {
  investor_name: string;
  investor_type?: "Angel Investor" | "Venture Capital (VC)" | "Accelerator" | "Incubator" | "Family Office" | "Syndicate / DAO" | "Other";
  investor_email: string;
  investor_telegram?: string;
  investor_linkedin: string;
  fund_name: string;
  relationship_description: string;
  sectors_invested_in: string[];
  custom_sector?: string;
  investment_stages?: string[];
  custom_stage?: string;
  check_size_min: string;
  check_size_max: string;
}

interface InvestorContactFormProps {
  index: number;
  data: ContactFormData;
  onChange: (data: ContactFormData) => void;
  onRemove?: () => void;
  founderName?: string;
  companyName?: string;
}

const AVAILABLE_TYPES = ["Angel Investor", "Venture Capital (VC)", "Accelerator", "Incubator", "Family Office", "Syndicate / DAO", "Other"];
const AVAILABLE_SECTORS = ["DeFi", "NFT", "Infrastructure", "AI", "SaaS", "GameFi", "SocialFi", "RWA", "Fintech", "DeSci", "Consumer", "Other"];
const AVAILABLE_STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Pre-IPO", "IPO", "Acquisition", "Other"];

export default function InvestorContactForm({ index, data, onChange, onRemove, founderName, companyName }: InvestorContactFormProps) {
  const setField = (key: keyof ContactFormData, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const toggleSector = (sector: string) => {
    const current = data.sectors_invested_in || [];
    if (current.includes(sector)) {
      setField("sectors_invested_in", current.filter(s => s !== sector));
    } else {
      setField("sectors_invested_in", [...current, sector]);
    }
  };

  const toggleStage = (stage: string) => {
    const current = data.investment_stages || [];
    if (current.includes(stage)) {
      setField("investment_stages", current.filter(s => s !== stage));
    } else {
      setField("investment_stages", [...current, stage]);
    }
  };

  const inputCls = "w-full bg-white border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none transition-all text-sm shadow-sm";
  const labelCls = "text-[10px] font-black uppercase text-gray-400 block mb-1.5 px-0.5";

  const hasOtherSector = data.sectors_invested_in?.includes("Other");
  const hasOtherStage = data.investment_stages?.includes("Other");
  const isContactMissing = !data.investor_email?.trim() && !data.investor_telegram?.trim();
  const inviterInfo = founderName ? `${founderName}${companyName ? ` (${companyName})` : ''}` : 'You';

  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center text-[11px] font-black">
            {index + 1}
          </div>
          <span className="text-[12px] font-black text-gray-400 uppercase tracking-wide">
            Investor Contact
          </span>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
          >
            Remove
          </button>
        )}
      </div>

      {/* Investor Type Selector */}
      <div>
        <label className={labelCls}>Investor Category / Type *</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {AVAILABLE_TYPES.map((type) => {
            const isSelected = (data.investor_type || "Angel Investor") === type;
            return (
              <button
                type="button"
                key={type}
                onClick={() => setField("investor_type", type)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-black text-white"
                    : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Name, Email, Telegram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Investor Name *</label>
          <input
            required
            className={inputCls}
            placeholder="e.g. Marc Andreessen"
            value={data.investor_name}
            onChange={(e) => setField("investor_name", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Investor Email *</label>
          <input
            type="email"
            className={`${inputCls} ${isContactMissing && data.investor_name ? "border-amber-300 bg-amber-50/30" : ""}`}
            placeholder="e.g. marc@a16z.com"
            value={data.investor_email}
            onChange={(e) => setField("investor_email", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Telegram Handle *</label>
          <input
            type="text"
            className={`${inputCls} ${isContactMissing && data.investor_name ? "border-amber-300 bg-amber-50/30" : ""}`}
            placeholder="e.g. @marc_a16z"
            value={data.investor_telegram || ""}
            onChange={(e) => setField("investor_telegram", e.target.value)}
          />
        </div>
      </div>

      {isContactMissing && data.investor_name.trim() && (
        <p className="text-[11px] font-bold text-amber-600 px-1">
          ⚠️ Please provide at least an Email address or Telegram handle so we can send an invitation with your affiliate link.
        </p>
      )}

      {/* Affiliate invite link notification */}
      <div className="bg-purple-50/60 rounded-xl p-3 border border-purple-100 text-xs text-purple-700 flex items-center justify-between">
        <span>🚀 An automated invite email/message from <span className="font-bold text-purple-900">{inviterInfo}</span> will be sent to this investor with your affiliate referral link so they can join & verify on Raisequity!</span>
        <span className="font-black bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] uppercase shrink-0 ml-2">Earn +30 Credits</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>LinkedIn URL</label>
          <input
            className={inputCls}
            placeholder="e.g. linkedin.com/in/..."
            value={data.investor_linkedin}
            onChange={(e) => setField("investor_linkedin", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Fund / Firm Name</label>
          <input
            className={inputCls}
            placeholder="e.g. a16z"
            value={data.fund_name}
            onChange={(e) => setField("fund_name", e.target.value)}
          />
        </div>
      </div>

      {/* Investment Stages Multi-Select */}
      <div>
        <label className={labelCls}>Investment Stages (When they get involved)</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {AVAILABLE_STAGES.map((stage) => {
            const isSelected = data.investment_stages?.includes(stage);
            return (
              <button
                type="button"
                key={stage}
                onClick={() => toggleStage(stage)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-black text-white"
                    : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
                }`}
              >
                {stage}
              </button>
            );
          })}
        </div>
        {hasOtherStage && (
          <input
            className={`${inputCls} mt-2`}
            placeholder="Specify custom investment stage..."
            value={data.custom_stage || ""}
            onChange={(e) => setField("custom_stage", e.target.value)}
          />
        )}
      </div>

      {/* Sectors Multi-Select */}
      <div>
        <label className={labelCls}>Sectors They Invest In</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {AVAILABLE_SECTORS.map((sector) => {
            const isSelected = data.sectors_invested_in?.includes(sector);
            return (
              <button
                type="button"
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-black text-white"
                    : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
                }`}
              >
                {sector}
              </button>
            );
          })}
        </div>
        {hasOtherSector && (
          <input
            className={`${inputCls} mt-2`}
            placeholder="Specify custom sector..."
            value={data.custom_sector || ""}
            onChange={(e) => setField("custom_sector", e.target.value)}
          />
        )}
      </div>

      {/* Check Sizes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Min Check Size (USD)</label>
          <input
            type="number"
            className={inputCls}
            placeholder="e.g. 50000"
            value={data.check_size_min}
            onChange={(e) => setField("check_size_min", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Max Check Size (USD)</label>
          <input
            type="number"
            className={inputCls}
            placeholder="e.g. 500000"
            value={data.check_size_max}
            onChange={(e) => setField("check_size_max", e.target.value)}
          />
        </div>
      </div>

      {/* Relationship description */}
      <div>
        <div className="flex justify-between">
          <label className={labelCls}>How do you know this investor?</label>
          <span className="text-[9px] font-medium text-gray-300">
            {data.relationship_description?.length || 0}/200
          </span>
        </div>
        <textarea
          rows={2}
          maxLength={200}
          className={`${inputCls} resize-none`}
          placeholder="e.g. Led our pre-seed round. Responsive, helpful, talks to us weekly."
          value={data.relationship_description}
          onChange={(e) => setField("relationship_description", e.target.value)}
        />
      </div>
    </div>
  );
}
