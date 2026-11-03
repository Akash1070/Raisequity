import React from "react";
import { Star, CheckCircle2 } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  firm: string;
  badge: string;
  avatar: string;
  bgClass: string;
  badgeClass: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "We closed our $750k pre-seed within 21 days of activating the SLA. Having our GitHub commits and cap table verified in the 1-Page Memo completely eliminated the first 3 screening calls.",
    author: "Elena Rostova",
    role: "Founder & CEO",
    firm: "SecantX AI",
    badge: "Founder · $750k Closed",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bgClass: "bg-white dark:bg-[#111111] border-[#dad4c8] dark:border-[#262626] text-black dark:text-white",
    badgeClass: "bg-[#84e7a5] text-[#078a52] border border-[#078a52]/30",
  },
  {
    quote: "The 7-Day Pre-Launch front-run window gives our syndicate proprietary deal flow before anyone on Twitter sees the announcement. The 1-click YC SAFE signed in 2 minutes.",
    author: "David Miller",
    role: "General Partner",
    firm: "MH Ventures",
    badge: "Investor · Lead Check Writer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bgClass: "bg-[#c1b0ff] border-[#43089f] text-black",
    badgeClass: "bg-[#43089f] text-white border border-[#43089f]",
  },
  {
    quote: "Pre-funded milestone escrow is a game changer for our dev studio. Zero unpaid invoices and clients are pre-qualified with real budgets immediately after closing their round.",
    author: "Marcus Chen",
    role: "Technical Partner",
    firm: "Protocol Audit Studio",
    badge: "Agency · $140k Escrow Processed",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bgClass: "bg-[#84e7a5] border-[#078a52] text-black",
    badgeClass: "bg-black text-white border border-black",
  },
];

export function TestimonialWall() {
  return (
    <div className="w-full">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-[1.4px] bg-black text-white px-4 py-1.5 rounded-full inline-block mb-3">
          Verified Feedback
        </span>
        <h3 className="text-3xl sm:text-5xl font-black text-black dark:text-white tracking-[-2px] leading-tight font-heading">
          Backed by High-Growth Builders &amp; Check-Writers
        </h3>
        <p className="text-[#9f9b93] text-sm sm:text-base mt-2 font-medium">
          Real institutional outcomes from verified founders, lead syndicates, and ecosystem service partners.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, idx) => (
          <div
            key={idx}
            className={`${t.bgClass} rounded-[32px] border p-8 clay-shadow flex flex-col justify-between hover:-translate-y-2 hover:shadow-[-7px_7px_0px_#000] transition-all duration-300`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className={`font-mono text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full ${t.badgeClass}`}>
                  {t.badge}
                </span>
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>

              <p className="text-sm leading-relaxed mb-6 font-medium italic opacity-90">
                "{t.quote}"
              </p>
            </div>

            <div className="flex items-center gap-3.5 pt-4 border-t border-black/10 dark:border-white/10">
              <img
                src={t.avatar}
                alt={t.author}
                className="w-11 h-11 rounded-full object-cover border-2 border-black/10 dark:border-white/20"
              />
              <div>
                <div className="text-sm font-black flex items-center gap-1.5 font-heading">
                  <span>{t.author}</span>
                  <CheckCircle2 size={15} className="text-[#078a52] dark:text-[#84e7a5]" />
                </div>
                <div className="text-xs font-mono font-medium opacity-75">
                  {t.role} · <span className="font-bold">{t.firm}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestimonialWall;
