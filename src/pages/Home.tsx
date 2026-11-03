import React from "react";
import { MasterBentoGrid } from "../components/home/MasterBentoGrid";
import { LiveActivityMarquee } from "../components/ui/LiveActivityMarquee";

export default function Home() {
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
