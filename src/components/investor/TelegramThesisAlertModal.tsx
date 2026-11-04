import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, Bell, ShieldCheck, CheckCircle2, 
  Sparkles, Loader2, X, Sliders, ExternalLink 
} from 'lucide-react';
import { 
  getTelegramAlertConfig, 
  saveTelegramAlertConfig, 
  sendTestTelegramAlert, 
  TelegramAlertConfig 
} from '../../lib/telegramAlerts';

interface TelegramThesisAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  investorName?: string;
  uid?: string;
}

export default function TelegramThesisAlertModal({
  isOpen,
  onClose,
  investorName = 'Investor Partner',
  uid,
}: TelegramThesisAlertModalProps) {
  const [config, setConfig] = useState<TelegramAlertConfig>({
    enabled: true,
    telegramChatId: '',
    webhookUrl: '',
    minimumFitScore: 75,
  });
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getTelegramAlertConfig(uid || '').then((cfg) => {
        setConfig(cfg);
        setTestResult(null);
        setSavedSuccess(false);
      });
    }
  }, [isOpen, uid]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const ok = await saveTelegramAlertConfig(uid || '', config);
    setSavedSuccess(ok);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestAlert = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendTestTelegramAlert(config, investorName);
      setTestResult(res.success ? { kind: 'ok', text: res.message } : { kind: 'err', text: res.message });
    } catch (err: any) {
      setTestResult({ kind: 'err', text: err?.message || 'Unexpected alert delivery failure.' });
    } finally {
      setIsSendingTest(false);
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
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Send size={18} />
              </div>
              <div>
                <h3 className="font-black text-base tracking-tight text-white flex items-center gap-2">
                  Instant Thesis-Match Telegram Bot & Webhook
                </h3>
                <p className="text-xs text-gray-400">Get push notifications the second a high-fit startup signs facilitation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-7 space-y-5 text-xs text-slate-700 bg-slate-50/50">
            {/* Value Prop Banner */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
              <Sparkles size={18} className="text-sky-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-black text-sky-900 text-xs">Zero-Associate Front-Running</div>
                <p className="text-sky-800 leading-relaxed text-[11px]">
                  Eliminate associate deal-hunting lag. Receive an instant alert directly into your private Telegram channel 
                  or firm Slack the second an unlisted founder matching your check size and sector signs a facilitation agreement.
                </p>
              </div>
            </div>

            {/* Telegram Chat ID Input */}
            <div className="space-y-1.5">
              <label className="font-black text-slate-800 block uppercase text-[10px] tracking-wider">
                Telegram Chat ID or Channel (@username or Chat ID)
              </label>
              <div className="relative">
                <Bot className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="e.g. @your_private_deals_bot or -10019283748"
                  value={config.telegramChatId}
                  onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-xs"
                />
              </div>
              <span className="text-[10px] text-slate-400">
                Tip: Invite <strong>@RaisequityAlertBot</strong> to your channel or DM to receive notifications.
              </span>
            </div>

            {/* Webhook URL Input */}
            <div className="space-y-1.5">
              <label className="font-black text-slate-800 block uppercase text-[10px] tracking-wider">
                Custom Webhook URL (Slack / Discord / Zapier)
              </label>
              <input
                type="text"
                placeholder="https://hooks.slack.com/services/..."
                value={config.webhookUrl || ''}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-xs"
              />
            </div>

            {/* Minimum Fit Threshold */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <label className="font-black text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Sliders size={13} /> Minimum Thesis Fit Filter
                </label>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-xs">
                  {config.minimumFitScore}%+ Match Only
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={config.minimumFitScore}
                onChange={(e) => setConfig({ ...config, minimumFitScore: parseInt(e.target.value) })}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>60% (Broad Dealflow)</span>
                <span>80% (High Conviction)</span>
                <span>95% (Exact Spec)</span>
              </div>
            </div>

            {/* Test Alert Feedback */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 border rounded-xl text-xs font-medium flex items-center gap-2 ${
                  testResult.kind === 'ok'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <CheckCircle2 size={16} className={testResult.kind === 'ok' ? 'text-emerald-600 shrink-0' : 'text-red-500 shrink-0'} />
                <span>{testResult.text}</span>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleTestAlert}
              disabled={isSendingTest}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSendingTest ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Send Test Telegram Alert</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSave}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
              >
                {savedSuccess ? '✓ Saved!' : 'Save Telegram Alerts'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

