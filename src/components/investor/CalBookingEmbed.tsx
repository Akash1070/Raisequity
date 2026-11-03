import React, { useState } from 'react';
import { Calendar, X, ExternalLink, Loader2, CheckCircle2, DollarSign } from 'lucide-react';
import { formatCalendarEmbedUrl } from '../../lib/cal';

interface CalBookingEmbedProps {
  isOpen: boolean;
  onClose: () => void;
  investorName: string;
  calendarLink: string;
  callFeeUsd?: number;
}

export default function CalBookingEmbed({
  isOpen,
  onClose,
  investorName,
  calendarLink,
  callFeeUsd = 0,
}: CalBookingEmbedProps) {
  const [loading, setLoading] = useState(true);

  if (!isOpen) return null;

  const rawUrl = calendarLink.trim().startsWith('http')
    ? calendarLink.trim()
    : `https://${calendarLink.trim()}`;

  const embedUrl = formatCalendarEmbedUrl(calendarLink);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-[32px] max-w-3xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-black text-lg text-black">Schedule Call with Mentor / Investor</h3>
              <p className="text-xs text-gray-500 font-medium">Book directly with {investorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {callFeeUsd > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/60 rounded-full text-xs font-bold text-amber-700">
                <DollarSign size={13} />
                <span>${callFeeUsd} / session</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Action Strip */}
        <div className="px-6 py-3 bg-emerald-50/50 border-b border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <span className="font-bold text-emerald-900">
            {callFeeUsd > 0 ? `Mentorship Call ($${callFeeUsd})` : 'Free Mentorship / Intro Call'}
          </span>
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <span>Open Booking Page</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Embed Frame */}
        <div className="flex-1 relative bg-gray-50/30">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-xs z-10">
              <Loader2 size={32} className="animate-spin text-emerald-500" />
              <span className="text-xs font-bold text-gray-400">Loading booking page...</span>
            </div>
          )}

          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-none"
              onLoad={() => setLoading(false)}
              title={`Schedule with ${investorName}`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <Calendar size={40} className="text-gray-300" />
              <p className="text-sm text-gray-500 font-medium">No valid call booking link configured by investor.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Use any booking tool (Calendly, Cal.com, Google Calendar, etc.)</span>
          </div>

          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-black hover:underline flex items-center gap-1"
            >
              Open in new tab <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
