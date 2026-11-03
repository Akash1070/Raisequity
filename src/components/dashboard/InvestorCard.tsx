import React, { useState } from "react";
import { Sparkles, Key, Lock, Calendar, MessageSquare, ShieldAlert } from "lucide-react";
import { checkInvestorFit, CheckFitResponse } from "../../lib/gemini";
import type { FounderInvestorContact, FounderProfile } from "../../types/founder";

interface InvestorCardProps {
  investor: FounderInvestorContact;
  founderProfile: FounderProfile | null;
  onBookCall: (investor: FounderInvestorContact) => void;
  onRequestIntro: (investor: FounderInvestorContact) => void;
  onUpgradeClick: () => void;
}

export default function InvestorCard({
  investor,
  founderProfile,
  onBookCall,
  onRequestIntro,
  onUpgradeClick
}: InvestorCardProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [fitResult, setFitResult] = useState<CheckFitResponse | null>(null);

  const plan = founderProfile?.plan || "basic";
  const isPremium = plan !== "basic";

  const handleCheckFit = async () => {
    if (!founderProfile) return;
    setAnalyzing(true);
    try {
      const res = await checkInvestorFit(
        founderProfile.company_blurb || "",
        founderProfile.sector || "",
        founderProfile.stage || "",
        founderProfile.arr || 0,
        investor,
        {
          preferred_sectors: investor.sectors_invested_in || [],
          check_size_min: investor.check_size_min,
          check_size_max: investor.check_size_max,
        }
      );
      setFitResult(res);
    } catch (err) {
      console.error("Error analyzing fit:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return "text-green-600 bg-green-50";
    if (score >= 3.0) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4 hover:shadow-md transition-all relative overflow-hidden">
      {/* Top Sector Badge and Name */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-[15px] font-black text-black leading-tight">
            {investor.investor_name}
          </h4>
          <p className="text-[11px] text-gray-400 font-bold uppercase mt-0.5">
            {investor.fund_name || "Angel Investor"}
          </p>
        </div>

        {/* Sectors */}
        <div className="flex flex-wrap gap-1 max-w-[50%] justify-end">
          {investor.sectors_invested_in?.slice(0, 2).map((s, i) => (
            <span key={i} className="bg-gray-50 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-md">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Check sizes and linkedin */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50/50 rounded-2xl p-4 border border-gray-50/50">
        <div>
          <span className="text-[9px] font-black uppercase text-gray-400 block">Check Range</span>
          <span className="text-xs font-black text-black">
            {investor.check_size_min ? `$${(investor.check_size_min / 1000)}K` : "$50K"} -{" "}
            {investor.check_size_max ? `$${(investor.check_size_max / 1000)}K` : "$500K"}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-black uppercase text-gray-400 block">LinkedIn</span>
          {investor.investor_linkedin ? (
            <a
              href={investor.investor_linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-[var(--color-clay-matcha-dark)] hover:underline truncate block"
            >
              View Profile
            </a>
          ) : (
            <span className="text-xs font-medium text-gray-400">Not linked</span>
          )}
        </div>
      </div>

      {/* PREMIUM GATE FOR FIT ANALYSIS */}
      <div className="border-t border-gray-50 pt-4 space-y-3">
        {!isPremium ? (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
            <Lock size={16} className="text-purple-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h5 className="text-[11px] font-black text-purple-950 uppercase tracking-wide">
                Unlock AI Fit Score & Intro Requests
              </h5>
              <p className="text-[10px] text-purple-700 leading-normal mt-0.5">
                Upgrade to Premium to check mutual fit with Gemini AI, request warm introductions, and book direct calls.
              </p>
              <button
                onClick={onUpgradeClick}
                className="mt-2.5 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* AI Check Fit Button */}
            {!fitResult ? (
              <button
                onClick={handleCheckFit}
                disabled={analyzing}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-[11px] font-black uppercase tracking-wide cursor-pointer transition-all shadow-sm disabled:opacity-50"
              >
                <Sparkles size={13} className="text-[var(--color-clay-lemon)]" />
                {analyzing ? "Gemini analyzing..." : "Analyze Fit Score"}
              </button>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-1">
                    <Sparkles size={11} className="text-[var(--color-clay-lemon)]" />
                    Gemini AI Assessment
                  </span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md ${getScoreColor(fitResult.score)}`}>
                    Fit Score: {fitResult.score} / 5.0
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 leading-normal font-medium">
                  {fitResult.reason_paragraph_1}
                </p>
                <p className="text-[10px] text-gray-500 leading-normal italic">
                  {fitResult.reason_paragraph_2}
                </p>
              </div>
            )}

            {/* Direct Connect Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onRequestIntro(investor)}
                className="flex items-center justify-center gap-1 py-2 rounded-xl border border-gray-100 hover:border-black text-[11px] font-bold text-gray-600 hover:text-black cursor-pointer transition-all bg-white"
              >
                <MessageSquare size={13} />
                Intro Request
              </button>
              <button
                onClick={() => onBookCall(investor)}
                className="flex items-center justify-center gap-1 py-2 rounded-xl bg-[var(--color-clay-matcha)] hover:bg-[var(--color-clay-matcha-dark)] text-white text-[11px] font-black uppercase tracking-wide cursor-pointer transition-all shadow-sm"
              >
                <Calendar size={13} />
                Book Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
