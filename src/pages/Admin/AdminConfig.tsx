import React, { useEffect, useState } from "react";
import { Sliders, Save, RefreshCw, Check, AlertCircle, DollarSign, Percent, Gift, Clock, ShieldCheck, Activity, CheckCircle2, XCircle } from "lucide-react";
import { getGlobalConfig, updateGlobalConfig, clearConfigCache } from "../../lib/config";
import { GlobalConfig } from "../../types";

export default function AdminConfig() {
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Telemetry state
  const [healthData, setHealthData] = useState<any>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const fetchHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const d = await res.json();
        setHealthData(d);
      }
    } catch (e) {
      console.warn('[AdminConfig] Health check ping error:', e);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        clearConfigCache();
        const cfg = await getGlobalConfig();
        setConfig(cfg);
        fetchHealth();
      } catch (err) {
        console.error("Error loading config:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await updateGlobalConfig(config);
      setSuccessMsg("Platform fee & trial configuration updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update configuration.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof GlobalConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
  };

  const updateCreditCost = (key: keyof GlobalConfig['credit_costs'], value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      credit_costs: {
        ...config.credit_costs,
        [key]: value,
      },
    });
  };

  if (loading || !config) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <RefreshCw size={28} className="animate-spin text-black" />
        <p className="text-xs font-mono font-bold text-gray-400">Loading Firestore config/fees...</p>
      </div>
    );
  }

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black font-extrabold focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all";
  const labelCls = "text-[10px] font-black uppercase text-gray-400 block mb-1 font-mono tracking-wider";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-black text-black tracking-tight font-heading flex items-center gap-3">
            <Sliders className="w-8 h-8 text-black" /> Platform Fee & Trial Config
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Dynamic platform parameters synchronized live across Firestore <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">config/fees</code>
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <Check size={16} className="text-emerald-600" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <AlertCircle size={16} className="text-red-600" /> {errorMsg}
        </div>
      )}

      {/* System Health Telemetry Dashboard */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider font-mono">
            <Activity size={18} className="text-emerald-600" /> System Integration Telemetry
          </div>
          <button
            type="button"
            onClick={fetchHealth}
            disabled={checkingHealth}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black cursor-pointer bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200"
          >
            <RefreshCw size={12} className={checkingHealth ? "animate-spin" : ""} /> Check Health
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
            <span className="text-[10px] uppercase font-mono text-gray-400 block font-black">Resend Email</span>
            <div className="flex items-center gap-1.5 mt-1">
              {healthData?.services?.email ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="font-bold text-emerald-800">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle size={14} className="text-amber-500" />
                  <span className="font-bold text-gray-600">Pending Key</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
            <span className="text-[10px] uppercase font-mono text-gray-400 block font-black">Dodo Payments</span>
            <div className="flex items-center gap-1.5 mt-1">
              {healthData?.services?.payments ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="font-bold text-emerald-800">Active</span>
                </>
              ) : (
                <>
                  <AlertCircle size={14} className="text-amber-500" />
                  <span className="font-bold text-gray-600">Test / Inactive</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
            <span className="text-[10px] uppercase font-mono text-gray-400 block font-black">OpenSign eSign</span>
            <div className="flex items-center gap-1.5 mt-1">
              {healthData?.services?.esign ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="font-bold text-emerald-800">Ready</span>
                </>
              ) : (
                <>
                  <AlertCircle size={14} className="text-amber-500" />
                  <span className="font-bold text-gray-600">Config Needed</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
            <span className="text-[10px] uppercase font-mono text-gray-400 block font-black">Gemini AI</span>
            <div className="flex items-center gap-1.5 mt-1">
              {healthData?.services?.ai ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="font-bold text-emerald-800">Online</span>
                </>
              ) : (
                <>
                  <AlertCircle size={14} className="text-amber-500" />
                  <span className="font-bold text-gray-600">Fallback Mode</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Core Fee & Trial Parameters */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider font-mono border-b border-gray-100 pb-3">
            <Percent size={18} className="text-emerald-600" /> Core Platform Fees & Free Trial
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Free Trial Length (Days)</label>
              <input
                type="number"
                min={1}
                className={inputCls}
                value={config.trial_days || 15}
                onChange={(e) => updateField('trial_days', parseInt(e.target.value) || 15)}
              />
              <span className="text-[10px] text-gray-400 block mt-1">
                Founders and service providers receive this free trial on signup.
              </span>
            </div>

            <div>
              <label className={labelCls}>Trial Starter Credits</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={config.trial_starter_credits || 100}
                onChange={(e) => updateField('trial_starter_credits', parseInt(e.target.value) || 0)}
              />
              <span className="text-[10px] text-gray-400 block mt-1">
                Credits awarded automatically to new accounts upon signup.
              </span>
            </div>

            <div>
              <label className={labelCls}>Monthly Subscription Price (USD)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={config.subscription_monthly_usd || 20}
                onChange={(e) => updateField('subscription_monthly_usd', parseFloat(e.target.value) || 20)}
              />
              <span className="text-[10px] text-gray-400 block mt-1">
                Recurring price past trial expiry.
              </span>
            </div>

            <div>
              <label className={labelCls}>Subscription Monthly Reward Credits</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={config.subscription_reward_credits || 200}
                onChange={(e) => updateField('subscription_reward_credits', parseInt(e.target.value) || 200)}
              />
              <span className="text-[10px] text-gray-400 block mt-1">
                Credits awarded upon each $20 subscription renewal.
              </span>
            </div>

            <div>
              <label className={labelCls}>Success Fee Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={100}
                className={inputCls}
                value={config.platform_fee_pct || 5}
                onChange={(e) => updateField('platform_fee_pct', parseFloat(e.target.value) || 5)}
              />
              <span className="text-[10px] text-gray-400 block mt-1">
                Standard success fee charged on closed funding deals.
              </span>
            </div>

            <div>
              <label className={labelCls}>First Deal Fee Discount (%)</label>
              <input
                type="number"
                step="1"
                min={0}
                max={100}
                className={inputCls}
                value={config.first_deal_discount_pct || 50}
                onChange={(e) => updateField('first_deal_discount_pct', parseFloat(e.target.value) || 50)}
              />
              <span className="text-[10px] text-gray-400 block mt-1">
                Percentage discount applied to founder's first closed deal (e.g. 50% discount = 2.5% fee).
              </span>
            </div>

            <div>
              <label className={labelCls}>Verified Investor Referral Reward Credits</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={config.investor_referral_credits || 30}
                onChange={(e) => updateField('investor_referral_credits', parseInt(e.target.value) || 30)}
              />
              <span className="text-[10px] text-gray-400 block mt-1">
                Credits awarded to referrer when their invited investor gets verified.
              </span>
            </div>

            <div>
              <label className={labelCls}>Success Fee Credit Offset Cap (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                className={inputCls}
                value={config.success_fee_credit_cap_pct || 30}
                onChange={(e) => updateField('success_fee_credit_cap_pct', parseInt(e.target.value) || 30)}
              />
              <span className="text-[10px] text-gray-400 block mt-1">
                Maximum percentage of success fee invoice that can be offset using credits.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Dynamic Credit Costs */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-black text-black uppercase tracking-wider font-mono border-b border-gray-100 pb-3">
            <Gift size={18} className="text-amber-600" /> Platform Action Credit Costs
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Feed Post Cost (Credits)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={config.credit_costs.feed_post}
                onChange={(e) => updateCreditCost('feed_post', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className={labelCls}>Extra Warm Intro Request (Credits)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={config.credit_costs.extra_intro}
                onChange={(e) => updateCreditCost('extra_intro', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className={labelCls}>Boosted Service Bid (Credits)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={config.credit_costs.boosted_bid}
                onChange={(e) => updateCreditCost('boosted_bid', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className={labelCls}>Promoted Dealflow Spot (Credits / Week)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={config.credit_costs.promoted_dealflow}
                onChange={(e) => updateCreditCost('promoted_dealflow', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-black hover:bg-emerald-600 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg transition-all text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving Changes..." : "Save Platform Config"}
          </button>
        </div>
      </form>
    </div>
  );
}
