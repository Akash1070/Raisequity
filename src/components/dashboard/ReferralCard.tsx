import React, { useState } from "react";
import { Gift, Copy, Check, Share2, Mail, Linkedin, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReferralCardProps {
  referralCode: string;
  onClose?: () => void; // If provided, renders as a modal/dialog
  isInline?: boolean;   // If true, renders as an inline card
}

export default function ReferralCard({ referralCode, onClose, isInline = false }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
  const message = `Founders: I joined Raisequity — a founder-to-founder network for warm investor intros. Join here: ${referralLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, "_blank");
  };

  const shareEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent("Join Raisequity")}&body=${encodeURIComponent(message)}`, "_blank");
  };

  const cardContent = (
    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--color-clay-matcha)] via-[var(--color-clay-lemon)] to-[var(--color-clay-ube)]" />

      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-[var(--color-clay-matcha)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Gift size={28} className="text-[var(--color-clay-matcha-dark)]" />
        </div>
        <h2 className="text-[20px] font-black text-black">Earn 50 Credits</h2>
        <p className="text-gray-500 font-medium text-xs mt-1">
          Refer founders and earn <span className="font-black text-[var(--color-clay-matcha-dark)]">50 credits</span> for each signup.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 px-1">Your Referral Link</label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={referralLink}
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-mono text-gray-600 truncate outline-none"
            />
            <button
              onClick={handleCopy}
              className={`p-3 rounded-xl transition-all cursor-pointer ${
                copied
                  ? "bg-[var(--color-clay-matcha)] text-white"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="bg-[var(--color-clay-bg)] rounded-2xl p-4 border border-[var(--color-clay-border)]">
          <div className="text-[10px] font-black uppercase text-gray-400 mb-2 text-center">Your Referral Code</div>
          <div className="text-center">
            <span className="font-mono font-black text-xl tracking-[0.25em] text-black">{referralCode}</span>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <button
            onClick={handleCopy}
            title="Copy Message"
            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-gray-600 hover:text-black cursor-pointer"
          >
            <Copy size={16} />
            <span className="text-[9px] font-bold mt-1">Copy</span>
          </button>
          <button
            onClick={shareWhatsApp}
            title="Share on WhatsApp"
            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-gray-100 hover:bg-green-50/50 transition-colors text-green-600 cursor-pointer"
          >
            <MessageSquare size={16} />
            <span className="text-[9px] font-bold mt-1">WhatsApp</span>
          </button>
          <button
            onClick={shareLinkedIn}
            title="Share on LinkedIn"
            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-gray-100 hover:bg-blue-50/50 transition-colors text-blue-600 cursor-pointer"
          >
            <Linkedin size={16} />
            <span className="text-[9px] font-bold mt-1">LinkedIn</span>
          </button>
          <button
            onClick={shareEmail}
            title="Share via Email"
            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-gray-100 hover:bg-red-50/50 transition-colors text-red-500 cursor-pointer"
          >
            <Mail size={16} />
            <span className="text-[9px] font-bold mt-1">Email</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all mt-4 cursor-pointer"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );

  if (isInline) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {cardContent}
      </motion.div>
    </div>
  );
}
