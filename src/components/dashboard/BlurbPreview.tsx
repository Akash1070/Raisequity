import React, { useState } from "react";
import { Mail, Sparkles, Copy, Check } from "lucide-react";

interface BlurbPreviewProps {
  whatCompanyDoes: string;
  tractionSignal: string;
  opportunityStat: string;
  whyNow: string;
  teamCredential: string;
  companyName?: string;
}

export default function BlurbPreview({
  whatCompanyDoes,
  tractionSignal,
  opportunityStat,
  whyNow,
  teamCredential,
  companyName = "My Startup"
}: BlurbPreviewProps) {
  const [copied, setCopied] = useState(false);

  // Assemble the forwardable blurb
  const blurbText = [
    whatCompanyDoes || "[What Company Does]",
    tractionSignal || "[Traction Signal]",
    opportunityStat || "[Market Opportunity]",
    whyNow || "[Why Now?]",
    teamCredential || "[Team Credential]"
  ].join(". ") + ". I'd love a 15-minute call — would you be open to connecting?";

  const handleCopy = () => {
    navigator.clipboard.writeText(blurbText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[var(--color-clay-bg)] rounded-[24px] border border-[var(--color-clay-border)] p-6 mt-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Mail size={12} className="text-gray-400" />
          Live Pitch Preview (Sent to Investors)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all shadow-xs"
          >
            {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            {copied ? 'Copied!' : 'Copy Forwardable Blurb'}
          </button>
          <span className="bg-[var(--color-clay-lemon)]/10 text-[var(--color-clay-lemon)] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide flex items-center gap-1">
            <Sparkles size={10} />
            Auto Assembled
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative">
        <div className="text-[11px] font-bold text-gray-400 mb-2">
          Subject: Intro: {companyName} — Warm introduction request
        </div>
        <p className="text-[13px] leading-relaxed text-gray-700 font-medium whitespace-pre-line">
          {blurbText}
        </p>
      </div>

      <div className="text-[10px] text-gray-400 mt-3 text-center font-medium">
        💡 This blurb updates in real-time as you fill in your profile.
      </div>
    </div>
  );
}
