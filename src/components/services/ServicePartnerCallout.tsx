import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServicePartnerCalloutProps {
  className?: string;
}

export function ServicePartnerCallout({ className = '' }: ServicePartnerCalloutProps) {
  return (
    <div className={`w-full rounded-[36px] border border-[#078a52] bg-[#84e7a5] p-8 sm:p-12 md:p-14 text-center space-y-6 text-black clay-shadow transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[-7px_7px_0px_#000] ${className}`}>
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white font-mono text-[11px] uppercase font-black tracking-[1.4px]">
        <Sparkles size={14} className="text-[#84e7a5]" />
        <span>Institutional Ecosystem Directory</span>
      </div>

      <p className="text-base sm:text-lg md:text-xl text-black font-black max-w-2xl mx-auto leading-relaxed font-heading">
        Join the institutional ecosystem directory. Register as a verified service partner to receive 150 starter credits and direct founder RFPs.
      </p>

      <div>
        <Link
          to="/login?role=agency"
          className="inline-flex items-center gap-2.5 bg-black text-white hover:bg-[#43089f] px-9 py-4 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-[-5px_5px_0_#fbbd41] active:scale-95 cursor-pointer font-sans"
        >
          <span>Create Partner Account (150 Credits Free)</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default ServicePartnerCallout;
