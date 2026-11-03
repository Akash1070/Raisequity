import { ExternalLink, Sparkles, TrendingUp, BookOpen, ShieldCheck } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  link: string;
}

const YOUR_WEB3_GUY_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Top Web3 VCs Investment Thesis 2026: AI x Crypto & DePIN Leads',
    category: 'Venture Capital',
    date: 'Aug 18',
    summary: 'A breakdown of sector allocations by Paradigm, A16z Crypto, and Multicoin Capital.',
    link: 'https://yourweb3guy.com/vc-thesis-2026',
  },
  {
    id: '2',
    title: 'How Early-Stage Founders Pitch Tokenomics & Equity Structures',
    category: 'Founder Playbook',
    date: 'Aug 15',
    summary: 'Key SAFTE + Token Warrant templates used by tier-1 Web3 founders to secure seed rounds.',
    link: 'https://yourweb3guy.com/tokenomics-pitching',
  },
  {
    id: '3',
    title: 'DeFi & Privacy Grants Digest: $5M+ Unclaimed Founder Grants',
    category: 'Grants & Ecosystem',
    date: 'Aug 12',
    summary: 'Active grant programs from Solana Foundation, Arbitrum, Base, and Near Protocol.',
    link: 'https://yourweb3guy.com/unclaimed-grants',
  },
];

export default function YourWeb3GuyCard() {
  return (
    <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-[24px] p-5 shadow-xs space-y-4 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 font-mono uppercase">
              YourWeb3Guy Insights
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Curated dealflow &amp; fundraising intelligence</p>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
          Partner Feed
        </span>
      </div>

      <div className="space-y-2.5">
        {YOUR_WEB3_GUY_NEWS.map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-slate-50 dark:bg-[#171717] hover:bg-slate-100 dark:hover:bg-[#202020] border border-slate-200/60 dark:border-[#262626] transition-all group"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                {item.category}
              </span>
              <span className="text-[9px] font-mono text-slate-500">{item.date}</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors leading-snug line-clamp-1">
              {item.title}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {item.summary}
            </p>
          </a>
        ))}
      </div>

      <a
        href="https://yourweb3guy.com"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white pt-2 border-t border-slate-200 dark:border-[#262626] transition-colors"
      >
        <span>Explore All Founder Guides</span>
        <ExternalLink size={11} />
      </a>
    </div>
  );
}
