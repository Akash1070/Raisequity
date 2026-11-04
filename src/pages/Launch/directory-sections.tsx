import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Rocket,
  Search,
  SlidersHorizontal,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';
import { NumberTicker } from '../../components/ui/NumberTicker';
import type { ExtendedLaunchItem } from './LaunchDirectory';

const EXTENDED_NARRATIVES = [
  'All',
  'Web3',
  'AI',
  'DeFi',
  'Fintech',
  'Infrastructure',
  'SaaS',
  'DePIN',
  'Consumer',
  'Security'
];

const PRODUCT_STAGES = [
  'All Stages',
  'Mainnet Live',
  'Public Beta',
  'Raising Seed',
  'Pre-Seed'
];

const ECOSYSTEM_CHAINS = [
  'All Chains',
  'Ethereum',
  'Solana',
  'Base',
  'Arbitrum',
  'Cross-Chain',
  'BNB Chain'
];

const REAL_LAST_WEEKS_BEST = [
  {
    name: 'Yourweb3guy',
    slug: 'yourweb3guy',
    medal: '🥇',
    tagline: 'Verified 60-word updates for 100k+ Web3 users',
    votes: 48,
    icon: '🌐',
    bg: 'bg-indigo-50 dark:bg-[#1a1b33] text-indigo-600'
  },
  {
    name: 'HireInCrypto',
    slug: 'hireincrypto',
    medal: '🥈',
    tagline: 'Automated job applications across 500+ Web3 protocols',
    votes: 42,
    icon: '💼',
    bg: 'bg-emerald-50 dark:bg-[#132b20] text-emerald-600'
  },
  {
    name: 'Fasqon',
    slug: 'deal_fasqon',
    medal: '🥉',
    tagline: 'Crypto-native neobank for freelancers ($1.3M seed)',
    votes: 39,
    icon: '⚡',
    bg: 'bg-amber-50 dark:bg-[#2c2013] text-amber-600'
  }
];

const REAL_CREDITS = [
  { company: "Google Cloud", value: "Up to $350k", desc: "Cloud & Gemini AI Credits" },
  { company: "AWS Activate", value: "$100,000", desc: "Compute, Bedrock & Architecture" },
  { company: "Deel Global", value: "20% Off", desc: "International Payroll & Compliance" },
  { company: "Cloudflare", value: "Up to $250k", desc: "Workers, Pages & Enterprise Security" },
];

interface GridViewSelectorBarProps {
  mainTab: 'browse' | 'my-launch';
  onBrowse: () => void;
  onMyLaunch: () => void;
  onSubmit: () => void;
}

export function GridViewSelectorBar({ mainTab, onBrowse, onMyLaunch, onSubmit }: GridViewSelectorBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 rounded-full p-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] gap-3">
      <div className="flex items-center gap-1.5">
        <button
          onClick={onBrowse}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-mono text-xs font-black transition-all cursor-pointer ${
            mainTab === 'browse'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <LayoutGrid size={14} /> Directory Showcase
        </button>
        <button
          onClick={onMyLaunch}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-mono text-xs font-black transition-all cursor-pointer ${
            mainTab === 'my-launch'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'text-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <BarChart3 size={14} /> My Launch &amp; Analytics
        </button>
      </div>

      <button
        onClick={onSubmit}
        className="flex items-center justify-center gap-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-6 py-2.5 rounded-full font-extrabold text-xs transition-all cursor-pointer font-sans shadow-xs active:scale-95"
      >
        <Rocket size={14} /> Submit Startup →
      </button>
    </div>
  );
}

interface HeroSectionProps {
  isDashboard: boolean;
  totalLaunches: number;
  totalVotes: number;
  onSubmit: () => void;
}

export function HeroSection({ isDashboard, totalLaunches, totalVotes, onSubmit }: HeroSectionProps) {
  if (isDashboard) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#e8e6df] dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-black uppercase tracking-wider mb-2">
            <Rocket size={12} className="text-[#0070F3]" />
            <span>VETTED PRODUCT LAUNCHES &amp; LEADERBOARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-black dark:text-white">
            Product Launches &amp; Leaderboard
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Explore live product launches built by vetted founders. Vote on top products or launch your own to get discoverable by 180+ partner VCs and earn 50 credits.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onSubmit}
            className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Rocket size={14} />
            <span>Submit Launch (+50 Credits)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-7 sm:p-10 md:p-12 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
      <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-bl from-purple-200/50 via-cyan-200/30 dark:from-purple-900/20 dark:via-cyan-900/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-100/60 dark:bg-amber-900/10 rounded-full blur-2xl pointer-events-none" />

      <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-[1.5px] mb-6 shadow-xs">
            <span>WEEKLY PRODUCT LAUNCHPAD • COHORT #42</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[58px] font-heading font-black tracking-[-1.5px] leading-[1.05] text-black dark:text-white mb-4">
            Discover Top Startups. <br />
            <span className="bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#3b82f6] bg-clip-text text-transparent inline-block">
              Built by Vetted Founders.
            </span>
          </h1>

          <p className="text-neutral-500 dark:text-neutral-400 text-base sm:text-lg font-medium leading-relaxed max-w-xl mb-8">
            Vote for the top AI agents, SaaS tools, and Web3 protocols. Winning teams unlock guaranteed partner meetings, $50k angel syndication, and dofollow backlinks.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onSubmit}
              className="px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Submit Your Launch (+50 Credits)</span>
              <ArrowRight size={15} />
            </button>

            <a
              href="#directory-board"
              className="px-6 py-3 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-2xs"
            >
              Browse Leaderboard ↓
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#18191e] rounded-[24px] p-6 sm:p-7 border border-neutral-200/80 dark:border-white/10 shadow-xs space-y-3.5">
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-200/80 dark:border-white/10">
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <Rocket size={20} className="text-[#38bdf8]" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-black dark:text-white">Cohort Telemetry</h3>
              <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Weekly Voting Window</p>
            </div>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
              <span className="text-neutral-500">Active Startups:</span>
              <span className="font-black text-black dark:text-white">{totalLaunches} Startups</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
              <span className="text-neutral-500">Votes Cast:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                {totalVotes} Upvotes
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
              <span className="text-neutral-500">Guaranteed Prize:</span>
              <span className="text-[#0070F3] font-black">3 Partner Meetings</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#121316] rounded-xl border border-neutral-200/80 dark:border-white/5 flex justify-between items-center">
              <span className="text-neutral-500">Backlink Power:</span>
              <span className="font-black text-black dark:text-white">100% Dofollow Authority Backlink</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  getCategoryCount: (narrative: string) => number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: 'votes' | 'trending' | 'recent';
  setSortBy: (s: 'votes' | 'trending' | 'recent') => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (v: boolean) => void;
  activeFiltersCount: number;
  selectedStage: string;
  setSelectedStage: (s: string) => void;
  selectedChain: string;
  setSelectedChain: (c: string) => void;
  onReset: () => void;
}

export function FilterBar({
  activeTab,
  setActiveTab,
  getCategoryCount,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  showAdvancedFilters,
  setShowAdvancedFilters,
  activeFiltersCount,
  selectedStage,
  setSelectedStage,
  selectedChain,
  setSelectedChain,
  onReset,
}: FilterBarProps) {
  return (
    <div className="bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 rounded-[24px] p-3.5 shadow-xs space-y-3">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {EXTENDED_NARRATIVES.map((narrative) => {
          const count = getCategoryCount(narrative);
          const isSelected = activeTab === narrative;
          return (
            <button
              key={narrative}
              onClick={() => setActiveTab(narrative)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                  : 'bg-neutral-50 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-white/5 hover:border-black/50 dark:hover:border-white/30'
              }`}
            >
              <span>{narrative === 'All' ? 'All Narratives' : narrative}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected
                  ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                  : 'bg-neutral-200/70 dark:bg-[#25262e] text-neutral-600 dark:text-neutral-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-neutral-100 dark:border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={13} />
          <input
            type="text"
            placeholder="Search by name, tagline, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 rounded-full text-xs font-mono text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white text-xs font-mono p-1 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 rounded-full p-1 text-xs font-mono">
            <button
              onClick={() => setSortBy('votes')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                sortBy === 'votes'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Top
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                sortBy === 'trending'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                sortBy === 'recent'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Recent
            </button>
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                : 'bg-neutral-50 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-white/5 hover:border-black/50'
            }`}
            title="Toggle Stage & Ecosystem Filters"
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown size={12} className={`transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="pt-3 border-t border-neutral-100 dark:border-white/5 space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-neutral-400 font-bold uppercase text-[10px]">STAGE:</span>
              {PRODUCT_STAGES.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStage(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    selectedStage === st
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                      : 'bg-neutral-50 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-white/5 hover:border-black/40'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={onReset}
                className="text-red-500 hover:text-red-600 font-bold text-[11px] underline cursor-pointer shrink-0"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-neutral-400 font-bold uppercase text-[10px]">CHAIN:</span>
            {ECOSYSTEM_CHAINS.map((chain) => (
              <button
                key={chain}
                onClick={() => setSelectedChain(chain)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                  selectedChain === chain
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                    : 'bg-neutral-50 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-white/5 hover:border-black/40'
                }`}
              >
                {chain}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export interface SponsorRow {
  name: string;
  href: string;
  headline: string;
  subline: string;
  accent: 'orange' | 'emerald';
}

const SPONSOR_STYLES = {
  orange: {
    wrapper: 'bg-gradient-to-r from-[#fff7f0] via-[#fef4ea] to-[#fffaf5] dark:from-[#1e1915] dark:via-[#261f1a] dark:to-[#1a1714] border border-[#f5d7b5] dark:border-amber-500/20 hover:border-[#ea580c]',
    label: 'text-amber-700/80 dark:text-amber-400 border-amber-300/40 dark:border-amber-500/20',
    labelMobile: 'bg-amber-500/10 text-amber-600',
    heading: 'group-hover:text-orange-600 dark:group-hover:text-orange-400',
    iconBox: 'bg-gradient-to-br from-[#ff6b4a] to-[#ff3b20] shadow-orange-500/25',
  },
  emerald: {
    wrapper: 'bg-gradient-to-r from-[#f0fdf4] via-[#e8fbf0] to-[#f4fdf8] dark:from-[#132219] dark:via-[#172b20] dark:to-[#111f17] border border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-500',
    label: 'text-emerald-700/80 dark:text-emerald-400 border-emerald-300/40 dark:border-emerald-500/20',
    labelMobile: 'bg-emerald-500/10 text-emerald-600',
    heading: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25',
  },
} as const;

/** Data-driven sponsor banner (replaces hardcoded spots when real sponsors exist). */
export function DataSponsorBanner({ sponsor }: { sponsor: SponsorRow }) {
  const s = SPONSOR_STYLES[sponsor.accent];
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer"
      className={`rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:shadow-md cursor-pointer group ${s.wrapper}`}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <span className={`font-mono text-[9px] font-black uppercase tracking-[2px] [writing-mode:vertical-lr] rotate-180 hidden sm:block border-r pr-2 select-none ${s.label}`}>
          SPONSORED
        </span>

        <div className="min-w-0">
          <div className="sm:hidden mb-1">
            <span className={`font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${s.labelMobile}`}>
              SPONSORED
            </span>
          </div>
          <h3 className={`font-heading font-black text-sm sm:text-base text-black dark:text-white leading-tight mb-1 transition-colors ${s.heading}`}>
            {sponsor.headline}
          </h3>
          <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            — {sponsor.name} <span className="hidden sm:inline">• {sponsor.subline}</span>
          </p>
        </div>
      </div>

      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform ${s.iconBox}`}>
        {sponsor.accent === 'orange' ? <Rocket size={24} strokeWidth={2.5} /> : <Briefcase size={22} strokeWidth={2.5} />}
      </div>
    </a>
  );
}

export const DEFAULT_SPONSORS: SponsorRow[] = [
  {
    name: 'YOURWEB3GUY',
    href: 'https://yourweb3guy.com',
    headline: 'Dedicated PR blitz, tier-1 media coverage & 60-word updates for 100k+ Web3 builders.',
    subline: 'Book PR & Media Blitz → 100k+ founders & angels',
    accent: 'orange',
  },
  {
    name: 'HIREINCRYPTO',
    href: 'https://www.hireincrypto.com',
    headline: 'Hire vetted Web3 engineers, token designers & protocol leads on proof of work.',
    subline: 'Post a Web3 role or hire elite talent → 500+ Protocols',
    accent: 'emerald',
  },
];

export function SponsoredBannerYourWeb3Guy() {
  return <DataSponsorBanner sponsor={DEFAULT_SPONSORS[0]} />;
}

export function SponsoredBannerHireInCrypto() {
  return <DataSponsorBanner sponsor={DEFAULT_SPONSORS[1]} />;
}

export const SponsoredBanner = SponsoredBannerYourWeb3Guy;

interface LaunchCardProps {
  item: ExtendedLaunchItem;
  rankNumber: number;
  hasVoted: boolean;
  onOpen: () => void;
  onVote: (e: React.MouseEvent) => void;
}

export function LaunchCard({ item, rankNumber, hasVoted, onOpen, onVote }: LaunchCardProps) {
  const isTop1 = rankNumber === 1;
  const isTop2 = rankNumber === 2;
  const isTop3 = rankNumber === 3;

  return (
    <div
      onClick={onOpen}
      className="rounded-2xl bg-white dark:bg-[#121316] border border-neutral-200/80 dark:border-white/5 hover:border-black/30 dark:hover:border-white/20 p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)] group cursor-pointer"
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="shrink-0 w-7 sm:w-8 flex items-center justify-center">
          {isTop1 ? (
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/40 flex items-center justify-center font-mono font-black text-xs" title="#1 Weekly Leader">
              👑 1
            </span>
          ) : isTop2 ? (
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200/80 text-slate-500 border border-slate-300 flex items-center justify-center font-mono font-black text-xs" title="#2 Runner Up">
              🥈 2
            </span>
          ) : isTop3 ? (
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-600/15 text-amber-600 border border-amber-600/30 flex items-center justify-center font-mono font-black text-xs" title="#3 Finalist">
              🥉 3
            </span>
          ) : (
            <span className="font-mono text-xs font-bold text-neutral-400">
              #{rankNumber}
            </span>
          )}
        </div>

        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.icon_bg || 'bg-neutral-100 dark:bg-[#1c1d22] text-black dark:text-white'} border border-neutral-200/80 dark:border-white/5 overflow-hidden shrink-0 flex items-center justify-center font-heading font-black text-base shadow-2xs`}>
          {item.logo_url && !item.logo_url.includes('unsplash') ? (
            <img src={item.logo_url} alt={item.company_name} className="w-full h-full object-cover" onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }} />
          ) : item.icon_symbol ? (
            <span className="text-base font-black">{item.icon_symbol}</span>
          ) : (
            <span>{item.company_name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="font-heading font-black text-sm sm:text-base text-black dark:text-white group-hover:text-[#4f46e5] dark:group-hover:text-[#38bdf8] transition-colors truncate">
              {item.company_name}
            </span>
            {item.badgeVerified && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-black shrink-0" title="Verified Product">
                <Check size={10} strokeWidth={3.5} />
              </span>
            )}
            {(item.product_stage || item.stage) && (
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-md bg-neutral-100 dark:bg-[#1e1f26] text-neutral-500 hidden sm:inline">
                {item.product_stage || item.stage}
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 font-medium leading-relaxed mb-1.5">
            {item.tagline}
          </p>

          <div className="flex items-center gap-2.5 text-[11px] font-mono text-neutral-400 flex-wrap">
            <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span>{item.rating ? item.rating.toFixed(1) : '5.0'}</span>
              <span>·</span>
              <span>{item.review_count || 3}</span>
            </span>

            <span className="flex items-center gap-1">
              <MessageSquare size={11} />
              <span>{item.comments_count || 1}</span>
            </span>

            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">|</span>
            <span className="text-[10px] text-neutral-400 truncate max-w-[200px]">
              {item.target_keywords?.slice(0, 3).join(', ') || item.category}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onVote}
        className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[54px] py-2 sm:py-2.5 px-3 rounded-2xl border font-mono transition-all cursor-pointer shrink-0 ${
          hasVoted
            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
            : 'bg-white dark:bg-[#18191e] hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-200/90 dark:border-white/10 text-neutral-700 dark:text-neutral-200'
        }`}
      >
        <ChevronUp size={16} strokeWidth={2.5} className={hasVoted ? 'text-emerald-400' : 'text-current'} />
        <span className="text-xs sm:text-sm font-black">{item.votes_count}</span>
      </button>
    </div>
  );
}

interface LaunchListProps {
  loading: boolean;
  launches: ExtendedLaunchItem[];
  votedMap: Record<string, boolean>;
  sponsoredIndex: number;
  sponsors?: SponsorRow[];
  onVote: (e: React.MouseEvent, id: string) => void;
  onOpen: (slug: string) => void;
  onReset: () => void;
}

export function LaunchList({ loading, launches, votedMap, sponsoredIndex, sponsors = DEFAULT_SPONSORS, onVote, onOpen, onReset }: LaunchListProps) {
  return (
    <div className="space-y-3">
      {loading && launches.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-[#121316] rounded-2xl border border-neutral-200/80 dark:border-white/5">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-black dark:border-white border-t-transparent mb-2" />
          <p className="font-mono text-xs text-neutral-400">Loading verified launches from Firestore...</p>
        </div>
      ) : launches.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#121316] rounded-2xl border border-neutral-200/80 dark:border-white/5 p-6">
          <p className="text-neutral-500 dark:text-neutral-400 font-mono text-sm mb-3">
            No launches match your current filters.
          </p>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        launches.map((item, idx) => {
          const hasVoted = votedMap[item.id];
          const rankNumber = idx + 1;

          return (
            <React.Fragment key={item.id}>
              {idx === sponsoredIndex && sponsors[0] && <DataSponsorBanner sponsor={sponsors[0]} />}
              {idx === 6 && sponsors[1] && <DataSponsorBanner sponsor={sponsors[1]} />}

              <LaunchCard
                item={item}
                rankNumber={rankNumber}
                hasVoted={hasVoted}
                onOpen={() => onOpen(item.slug)}
                onVote={(e) => onVote(e, item.id)}
              />
            </React.Fragment>
          );
        })
      )}
    </div>
  );
}

interface SidebarWidgetsProps {
  onOpen: (slug: string) => void;
  onSubmit: () => void;
}

export function SidebarWidgets({ onOpen, onSubmit }: SidebarWidgetsProps) {
  return (
    <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
      <div className="rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-[#1a1b20] border border-neutral-200 dark:border-white/10 flex items-center justify-center mx-auto mb-3 text-neutral-800 dark:text-neutral-200 shadow-2xs">
          <Megaphone size={20} />
        </div>
        <h3 className="font-heading font-black text-base text-black dark:text-white mb-1">
          Your ad here
        </h3>
        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-4">
          From $29 per ISO week
        </p>
        <a
          href="https://t.me/akash_kumar107"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-xs transition-all active:scale-95 shadow-xs"
        >
          <span>Book Sponsor Spot</span>
          <ArrowUpRight size={14} />
        </a>
      </div>

      <div className="rounded-[24px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-neutral-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <h3 className="font-heading font-black text-sm text-black dark:text-white">
              Last week's best
            </h3>
          </div>
          <a
            href="#directory-board"
            className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer text-sm"
          >
            →
          </a>
        </div>

        <div className="space-y-3.5">
          {REAL_LAST_WEEKS_BEST.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onOpen(item.slug)}
              className="flex items-center justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 rounded-xl ${item.bg} border border-neutral-200/80 dark:border-white/5 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs`}>
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-black text-xs text-black dark:text-white group-hover:text-[#4f46e5] dark:group-hover:text-[#38bdf8] transition-colors truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px]">{item.medal}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {item.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400 shrink-0">
                <Flame size={13} className="text-orange-500 fill-orange-500" />
                <span>{item.votes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/10 p-5 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80 dark:border-white/5">
          <span className="font-bold text-neutral-500">Weekly Voting Prize</span>
          <span className="text-emerald-500 font-black">Live</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">#1 Winner:</span>
            <span className="font-black text-black dark:text-white">3 VC Partner Meetings</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">SEO Value:</span>
            <span className="font-black text-black dark:text-white">100% Dofollow Backlink</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Fast-Pass SLA:</span>
            <span className="text-[#0070F3] font-black">Under 24 Hours</span>
          </div>
        </div>
        <button
          onClick={onSubmit}
          className="w-full mt-2 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-xs transition-all active:scale-95 cursor-pointer block text-center"
        >
          Submit Your Launch (+50 Credits)
        </button>
      </div>
    </div>
  );
}

interface BentoRowFiveProps {
  onSubmit: () => void;
}

export function BentoRowFive({ onSubmit }: BentoRowFiveProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
      <div className="lg:col-span-2 rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-md">
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-mono text-[9px] font-black uppercase tracking-wider mb-2">
              VERIFIED DEALFLOW ENGINE
            </div>
            <h2 className="text-2xl sm:text-[26px] font-heading font-black text-black dark:text-white tracking-tight mb-2 leading-tight">
              Submit Your Startup Deal
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-4">
              Get your project directly in front of 180+ verified check-writers. Earn guaranteed dofollow backlinks, community upvotes, and automated Fast-Pass investor syndication.
            </p>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">AK</div>
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">DC</div>
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white dark:border-[#121316]">ER</div>
                <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-[#121316]">+99</div>
              </div>
              <span className="font-mono text-xs text-neutral-400">99+ Live Deals in Active Cohort</span>
            </div>
          </div>

          <div className="w-full sm:w-auto p-5 sm:p-6 rounded-[22px] bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/10 text-center shrink-0 min-w-[150px] shadow-xs">
            <div className="text-2xl sm:text-3xl font-heading font-black text-black dark:text-white tracking-tight leading-none">
              $<NumberTicker value={14} />B+
            </div>
            <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 mt-1.5">
              PIPELINE MANAGED
            </div>
          </div>
        </div>

        <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
          <span className="font-mono text-xs text-neutral-400">Fast-Pass SLA: <strong className="text-black dark:text-white">3 Partner Calls in 30 Days</strong></span>
          <button
            onClick={onSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <span>Submit Startup Deal</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xl font-heading font-black text-black dark:text-white tracking-tight">
              Free Credits
            </h3>
            <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-500 flex items-center justify-center">
              <Star size={13} fill="currentColor" />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {REAL_CREDITS.map((c, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-black text-xs text-black dark:text-white truncate">{c.company}</div>
                  <div className="text-[10px] font-mono text-neutral-400 truncate">{c.desc}</div>
                </div>
                <span className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[9px] font-bold text-center">
                  {c.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/founders"
          className="w-full py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
        >
          Claim $500k+ Perks →
        </Link>
      </div>
    </div>
  );
}

interface BentoRowSixProps {
  onSubmit: () => void;
}

export function BentoRowSix({ onSubmit }: BentoRowSixProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
      <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
        <div>
          <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/5 flex items-center justify-center text-black dark:text-white mb-3">
            <Megaphone size={18} />
          </div>

          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-[9px] font-black uppercase tracking-wider mb-2">
            3,000+ READERS
          </div>

          <h3 className="text-lg font-heading font-black text-black dark:text-white tracking-tight mb-2">
            Market your Web3 product
          </h3>

          <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-4">
            Get in front of a highly targeted audience of builders, check-writers, and ecosystem scouts.
          </p>
        </div>

        <a
          href="https://akashkumarjha.substack.com/"
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
        >
          Sponsor Now ↗
        </a>
      </div>

      <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
        <div>
          <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/5 flex items-center justify-center text-black dark:text-white mb-3">
            <Briefcase size={18} />
          </div>

          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1e1f26] text-neutral-600 dark:text-neutral-300 font-mono text-[9px] font-black uppercase tracking-wider mb-2">
            TALENT RECRUITING
          </div>

          <h3 className="text-lg font-heading font-black text-black dark:text-white tracking-tight mb-2">
            Hire in Web3
          </h3>

          <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-4">
            Access vetted crypto engineers, token designers, and full-stack growth leads for your protocol.
          </p>
        </div>

        <a
          href="https://www.hireincrypto.com"
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 rounded-full bg-white dark:bg-[#1a1b20] border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-black dark:text-white font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block"
        >
          Hire in Web3 ↗
        </a>
      </div>

      <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-black/30 dark:hover:border-white/20">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#4f46e5] dark:text-[#805ad5] font-black">
              SEO Indexing
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1e1f26] text-black dark:text-white">
              Permanent Dofollow
            </span>
          </div>

          <h3 className="text-lg font-heading font-black text-black dark:text-white tracking-tight mb-2">
            Dofollow Authority Backlinks
          </h3>

          <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-4">
            Every approved project on Raisequity receives permanent dofollow authority backlinks, indexed directly by search engines.
          </p>
        </div>

        <button
          onClick={onSubmit}
          className="w-full py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-extrabold text-xs text-center transition-all active:scale-95 cursor-pointer block shadow-xs"
        >
          Launch Now (+50 Credits) →
        </button>
      </div>
    </div>
  );
}
