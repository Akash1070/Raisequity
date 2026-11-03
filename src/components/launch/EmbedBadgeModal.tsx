import React, { useState } from 'react';
import { Award, X, Copy, Check, ExternalLink, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import { verifyFounderBadge } from '../../lib/badgeVerification';

interface EmbedBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  launchId: string;
  slug: string;
  companyName: string;
  websiteUrl: string;
  isVerified?: boolean;
}

export default function EmbedBadgeModal({
  isOpen,
  onClose,
  launchId,
  slug,
  companyName,
  websiteUrl,
  isVerified = false,
}: EmbedBadgeModalProps) {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationState, setVerificationState] = useState<boolean | null>(isVerified);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const launchUrl = `https://raisequity.com/launch/${slug}`;
  const badgeImgUrl = `https://raisequity.com/badges/featured.svg`;

  const htmlSnippet = `<a href="${launchUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeImgUrl}" alt="Featured on Raisequity Launch" width="220" height="54" /></a>`;
  const mdSnippet = `[![Featured on Raisequity Launch](${badgeImgUrl})](${launchUrl})`;

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleCopyMd = () => {
    navigator.clipboard.writeText(mdSnippet);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleRunVerification = async () => {
    setVerifying(true);
    setVerificationMessage(null);
    const result = await verifyFounderBadge(launchId, websiteUrl);
    setVerifying(false);
    setVerificationState(result.verified);

    if (result.verified) {
      setVerificationMessage('Badge verified! Your listing is now counted in public verified metrics.');
    } else {
      setVerificationMessage(
        result.error || 'Badge not detected yet. Please ensure the code snippet is pasted into your website HTML and try again.'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-[#111111] rounded-[32px] max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-[#262626] relative text-slate-900 dark:text-white transition-colors duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-[#262626] flex items-center justify-between bg-slate-50 dark:bg-[#171717]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Embed Launch Badge</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Showcase {companyName} on your website</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#202020] transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Badge Preview */}
        <div className="p-6 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white flex flex-col items-center justify-center gap-4 text-center border border-slate-200 dark:border-[#262626] shadow-xs">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Badge Visual Preview</span>

            <a
              href={launchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white dark:bg-[#171717] border border-slate-200 dark:border-[#333333] text-slate-900 dark:text-white hover:border-[#0070F3]/50 transition-all group shadow-sm"
            >
              <div className="w-7 h-7 rounded-xl bg-[#0070F3] text-white flex items-center justify-center font-black text-sm">
                R
              </div>
              <div className="text-left font-mono">
                <div className="text-[10px] text-[#0070F3] uppercase tracking-widest font-bold">Featured on</div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                  Raisequity Launch <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>
          </div>

          {/* Verification Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 font-mono ${
              verificationState
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={22} className={verificationState ? 'text-emerald-600 dark:text-[#00F5A0]' : 'text-amber-600 dark:text-amber-400'} />
              <div>
                <div className="text-xs font-bold uppercase">
                  Status: {verificationState ? 'Verified Badge' : 'Pending Verification'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  {verificationMessage ||
                    (verificationState
                      ? 'Verified on your domain'
                      : 'Place snippet on website to enable automated verification')}
                </p>
              </div>
            </div>

            <button
              onClick={handleRunVerification}
              disabled={verifying}
              className="px-3.5 py-2 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-xs font-mono"
            >
              {verifying ? <Loader2 size={13} className="animate-spin text-white" /> : <RefreshCw size={13} />}
              <span>Verify Now</span>
            </button>
          </div>

          {/* HTML Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <span>HTML Embed Snippet</span>
              <button
                onClick={handleCopyHtml}
                className="text-[#0070F3] hover:underline flex items-center gap-1 text-[11px] font-bold cursor-pointer font-mono"
              >
                {copiedHtml ? <Check size={13} /> : <Copy size={13} />}
                {copiedHtml ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-50 dark:bg-[#171717] text-[#0070F3] border border-slate-200 dark:border-[#262626] rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap select-all">
              {htmlSnippet}
            </pre>
          </div>

          {/* Markdown Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <span>Markdown Snippet (README / Docs)</span>
              <button
                onClick={handleCopyMd}
                className="text-[#0070F3] hover:underline flex items-center gap-1 text-[11px] font-bold cursor-pointer font-mono"
              >
                {copiedMd ? <Check size={13} /> : <Copy size={13} />}
                {copiedMd ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-50 dark:bg-[#171717] text-purple-600 dark:text-purple-300 border border-slate-200 dark:border-[#262626] rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap select-all">
              {mdSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
