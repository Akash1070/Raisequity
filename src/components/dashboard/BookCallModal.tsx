import React, { useState } from "react";
import { Calendar, Clock, X, Check, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createCallBooking } from "../../lib/bookings";
import type { FounderInvestorContact, FounderProfile } from "../../types/founder";

interface BookCallModalProps {
  investor: FounderInvestorContact;
  founderProfile: FounderProfile | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookCallModal({
  investor,
  founderProfile,
  onClose,
  onSuccess
}: BookCallModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [calendlyLink, setCalendlyLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!founderProfile) return;
    if (!scheduledDate || !scheduledTime) {
      setError("Please select both a date and a time slot.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      
      await createCallBooking({
        founder_id: founderProfile.id,
        investor_id: investor.id,
        startup_id: null, // optionally wire to a startup ID if available
        calendly_link: calendlyLink || `https://calendly.com/raisequity/${(investor.investor_name || 'investor').toLowerCase().replace(/\s+/g, '-')}`,
        message_from_founder: message,
        blurb_sent: founderProfile.company_blurb,
        payment_amount: 150, // default fee for mock platform call
        scheduled_at: scheduledDateTime
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to book call. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:ring-1.5 focus:ring-black text-xs font-medium transition-all shadow-sm";
  const labelCls = "text-[9px] font-black uppercase text-gray-400 block mb-1 px-0.5";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[32px] p-6 max-w-md w-full relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--color-clay-matcha)] via-[var(--color-clay-lemon)] to-[var(--color-clay-ube)]" />
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-gray-400 hover:text-black rounded-lg cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[var(--color-clay-matcha)]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Calendar size={24} className="text-[var(--color-clay-matcha-dark)]" />
          </div>
          <h3 className="text-lg font-black text-black">Book a Call</h3>
          <p className="text-gray-500 font-medium text-xs mt-0.5">
            Schedule a 15-minute pitch call with <span className="font-bold text-black">{investor.investor_name}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Date & Time Select */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Select Date *</label>
              <input
                required
                type="date"
                className={inputCls}
                min={new Date().toISOString().split("T")[0]}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Select Time Slot *</label>
              <select
                required
                className={inputCls}
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              >
                <option value="">Choose slot...</option>
                <option value="09:00:00">09:00 AM EST</option>
                <option value="11:30:00">11:30 AM EST</option>
                <option value="14:00:00">02:00 PM EST</option>
                <option value="16:30:00">04:30 PM EST</option>
              </select>
            </div>
          </div>

          {/* Calendly URL Fallback */}
          <div>
            <label className={labelCls}>Or use your Calendly link (Optional)</label>
            <input
              type="url"
              className={inputCls}
              placeholder="e.g. calendly.com/your-startup/pitch"
              value={calendlyLink}
              onChange={(e) => setCalendlyLink(e.target.value)}
            />
          </div>

          {/* Message text */}
          <div>
            <label className={labelCls}>Add a brief note</label>
            <textarea
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Tell the investor what you want to cover in this call..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Cost display */}
          <div className="bg-[var(--color-clay-bg)] rounded-2xl p-4 border border-[var(--color-clay-border)] flex items-center justify-between text-xs">
            <span className="font-bold text-gray-500">Booking Cost:</span>
            <span className="bg-white border border-gray-100 px-3 py-1 rounded-xl font-black text-black">
              150 Credits
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={13} />
                  Scheduling...
                </>
              ) : (
                <>
                  <Check size={13} />
                  Confirm Call
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
