import React from "react";
import { MasterBentoGrid } from "../components/home/MasterBentoGrid";
import { LiveActivityMarquee } from "../components/ui/LiveActivityMarquee";
import { usePageMeta } from "../hooks/usePageMeta";

export default function Home() {
  usePageMeta({
    title: "Raisequity - Institutional Deal Flow Platform for Founders & Investors",
    description: "The curated deal flow intermediary bridging the Web2 & Web3 funding gap. Connect pre-seed and seed founders with verified capital, cloud credits, and ecosystem scouts.",
    aiSummary: "Raisequity is an institutional deal flow platform bridging the Web2 & Web3 funding gap for pre-seed and seed startups (AI, SaaS, FinTech, Crypto), connecting vetted founders with active investors, $125k+ in infrastructure credits, and community scouts.",
    canonicalPath: "/",
    mdAlternate: "/index.md",
  });
  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#090a0d] text-black dark:text-white font-sans flex flex-col justify-start transition-colors duration-150 selection:bg-[#3bd3fd]">
      
      {/* ── LIVE ACTIVITY TICKER ── */}
      <LiveActivityMarquee />

      {/* ── IMAGE 2 BENTO GRID ARCHITECTURE (Spacious, Neo-Organic, High-Converting) ── */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-start">
        <MasterBentoGrid />
      </main>
    </div>
  );
}
