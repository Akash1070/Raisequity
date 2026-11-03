import { Briefcase, ExternalLink, Flame, MapPin } from 'lucide-react';

interface CryptoJob {
  id: string;
  role: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  tag: string;
}

const HIRE_IN_CRYPTO_JOBS: CryptoJob[] = [
  {
    id: '1',
    role: 'Lead Rust / Solana Core Engineer',
    company: 'Solana Ecosystem Labs',
    location: 'Remote',
    type: 'Full-time',
    salary: '$140k - $220k + Equity',
    tag: 'Hot',
  },
  {
    id: '2',
    role: 'Head of Growth & Tokenomics',
    company: 'DePIN Protocol',
    location: 'Remote / NYC',
    type: 'Full-time',
    salary: '$120k - $180k + Tokens',
    tag: 'Executive',
  },
  {
    id: '3',
    role: 'Smart Contract Auditor (Solidity/Vyper)',
    company: 'Web3 Audit Collective',
    location: 'Remote',
    type: 'Contract',
    salary: '$100 - $160 / hr',
    tag: 'Contract',
  },
];

export default function HireInCryptoCard() {
  return (
    <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-[24px] p-5 shadow-xs space-y-4 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Briefcase size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 font-mono uppercase">
              HireInCrypto Talent
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Verified Web3 engineering &amp; leadership roles</p>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded">
          Hiring Feed
        </span>
      </div>

      <div className="space-y-2.5">
        {HIRE_IN_CRYPTO_JOBS.map((job) => (
          <a
            key={job.id}
            href="https://hireincrypto.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-slate-50 dark:bg-[#171717] hover:bg-slate-100 dark:hover:bg-[#202020] border border-slate-200/60 dark:border-[#262626] transition-all group"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
                {job.tag}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">{job.salary}</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors leading-snug line-clamp-1">
              {job.role}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              <span>{job.company}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <MapPin size={9} /> {job.location}
              </span>
            </div>
          </a>
        ))}
      </div>

      <a
        href="https://hireincrypto.com"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white pt-2 border-t border-slate-200 dark:border-[#262626] transition-colors"
      >
        <span>Post a Role on HireInCrypto</span>
        <ExternalLink size={11} />
      </a>
    </div>
  );
}
