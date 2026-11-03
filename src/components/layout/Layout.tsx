import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Menu, X, ArrowRight, FileCode, Sparkles } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import { Logo } from "../ui/Logo";
import { ThemeToggle } from "../ui/ThemeToggle";

const ROUTE_SUMMARIES: Record<string, string> = {
  "/": "Raisequity is an institutional deal flow platform and curation intermediary for pre-seed and seed Web2 and Web3 startups (AI, SaaS, FinTech, Crypto), connecting vetted founders with active investors, $125k+ in infrastructure credits, and community scouts.",
  "/founders": "Zero-cold outreach fundraising platform for Web2 & Web3 founders with algorithmic investor matching, 100-pt raise readiness scoring, forwardable blurbs, and $125k+ in free infrastructure credits.",
  "/investors": "Curated, zero-spam Web2 & Web3 deal flow matching investor thesis, ticket size ($25k-$2M+), and sector focus with AI deal memos and double-blind facilitation.",
  "/service-providers": "Institutional directory of verified tech partners, cloud providers, auditors, market makers, legal advisors, and talent recruiters with perk distribution.",
  "/launch": "Curated weekly launchpad and public directory for early-stage Web2 & Web3 products, AI agents, SaaS apps, and protocols with verified embed badges.",
  "/launch/submit": "Submission guidelines, verification badge criteria, and free/premium tiers for launching a product on Raisequity.",
  "/blog": "Official announcements, tech and Web3 funding trends, and founder venture resources published by Raisequity partners.",
  "/terms": "Raisequity facilitation terms, 5% success fee structure, 1st deal waiver for trial founders, and anti-circumvention rules.",
  "/privacy": "Raisequity data protection statement detailing contact masking, double-blind intro requests, and encrypted storage.",
};

export default function Layout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Founders", href: "/founders" },
    { name: "Investors", href: "/investors" },
    { name: "Service Providers", href: "/service-providers" },
    { name: "Directory", href: "/launch" },
  ];

  // Dynamically synchronize head tags for AI agents and search crawlers
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const path = location.pathname;
    const cleanPath = path === '/' ? '/index' : path;
    const mdHref = `https://raisequity.com${cleanPath}.md`;
    const summary = ROUTE_SUMMARIES[path] || "Raisequity is an institutional deal flow platform connecting vetted Web3 founders with active check-writers and credits.";

    let metaAi = document.querySelector('meta[name="ai-summary"]') as HTMLMetaElement | null;
    if (!metaAi) {
      metaAi = document.createElement('meta');
      metaAi.name = 'ai-summary';
      document.head.appendChild(metaAi);
    }
    metaAi.content = summary;

    let linkMd = document.querySelector('link[rel="alternate"][type="text/markdown"]') as HTMLLinkElement | null;
    if (!linkMd) {
      linkMd = document.createElement('link');
      linkMd.rel = 'alternate';
      linkMd.type = 'text/markdown';
      document.head.appendChild(linkMd);
    }
    linkMd.href = mdHref;
  }, [location.pathname]);

  const mdUrl = `${location.pathname === '/' ? '/index' : location.pathname}.md`;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f7] dark:bg-[#000000] text-black dark:text-[#EDEDED] font-sans selection:bg-[#3bd3fd]/30 selection:text-black transition-colors duration-150">
      <header className="sticky top-0 z-50 w-full border-b border-[#dad4c8] dark:border-[#262626] bg-[#faf9f7]/90 dark:bg-[#090a0d]/95 backdrop-blur-md transition-colors duration-150">
        <div className="container mx-auto px-4 h-[58px] flex items-center justify-between max-w-[1400px]">
          <Link to="/" className="font-heading font-black text-[22px] md:text-[24px] tracking-tight flex items-center gap-2.5 text-black dark:text-white hover:text-[#43089f] dark:hover:text-[#3bd3fd] transition-colors">
            <Logo className="w-8 h-8 shrink-0" />
            <span>Raisequity</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-[1.2px] text-[#078a52] dark:text-[#84e7a5] bg-[#84e7a5]/15 border border-[#84e7a5]/30 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#078a52] dark:bg-[#84e7a5] animate-pulse" /> Live Institutional
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[1.2px]">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "transition-all px-4 py-1.5 rounded-full relative group whitespace-nowrap",
                  location.pathname === item.href 
                    ? "text-[#078a52] dark:text-[#84e7a5] bg-[#84e7a5]/20 border border-[#84e7a5]/40 shadow-xs font-black" 
                    : "text-black/60 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-[#171717]"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle showLabel={false} />
            <Link 
              to="/login" 
              className="bg-black text-white hover:bg-[#43089f] px-6 py-2.5 rounded-full font-black text-xs transition-all hover:-translate-y-0.5 hover:shadow-[-3px_3px_0_#84e7a5] active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              Enter App <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle showLabel={false} />
            <button 
              className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-[#262626] bg-white dark:bg-[#0A0A0A] shadow-xl">
            <div className="px-4 py-4 space-y-3 font-mono text-xs uppercase tracking-wider font-bold">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "block px-3 py-2 rounded-xl transition-colors",
                    location.pathname === item.href 
                      ? "text-[#0070F3] bg-[#0070F3]/10 border border-[#0070F3]/30" 
                      : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#171717]"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2">
                <Link 
                  to="/login" 
                  className="w-full bg-[#0070F3] hover:bg-[#0060DF] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Enter App <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-[#dad4c8] dark:border-[#262626] py-10 md:py-12 mt-12 bg-[#faf9f7] dark:bg-[#0A0A0A] transition-colors duration-150">
          <div className="container mx-auto px-4 max-w-[1240px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-1 lg:col-span-2">
                <Link to="/" className="font-heading font-black text-[24px] tracking-tight flex items-center gap-2.5 text-black dark:text-white mb-6">
                  <Logo className="w-8 h-8 shrink-0" />
                  <span>Raisequity</span>
                </Link>
                <p className="text-[14px] text-[#9f9b93] font-medium max-w-sm leading-relaxed mb-6">
                  The institutional foundation for Web2 &amp; Web3 builders. 
                  Connecting pre-seed and seed founders with capital, credits, and verified community scouts.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#171717] border border-[#dad4c8] dark:border-[#333333] text-[11px] font-mono text-black dark:text-slate-300 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#078a52] dark:bg-[#84e7a5] animate-pulse" />
                  <span>Telemetry Active • High-Conviction Dealflow</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-[1.4px] text-black dark:text-slate-200 mb-5 font-mono">Platform</h4>
                <ul className="space-y-3.5 text-[13px] font-medium text-black/70 dark:text-slate-400">
                  <li><Link to="/founders" className="hover:text-black dark:hover:text-white transition-colors">For Founders</Link></li>
                  <li><Link to="/investors" className="hover:text-black dark:hover:text-white transition-colors">For Investors</Link></li>
                  <li><Link to="/service-providers" className="hover:text-black dark:hover:text-white transition-colors">For Service Providers</Link></li>
                  <li><Link to="/launch" className="hover:text-black dark:hover:text-white transition-colors">Launchpad Directory</Link></li>
                  <li><Link to="/blog" className="hover:text-black dark:hover:text-white transition-colors">Ecosystem Blog</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-black uppercase tracking-[1.4px] text-black dark:text-slate-200 mb-5 font-mono">Support &amp; AI</h4>
                <ul className="space-y-3.5 text-[13px] font-medium text-black/70 dark:text-slate-400">
                  <li><a href="mailto:akashkumar107@gmail.com?subject=Listing Request" className="hover:text-black dark:hover:text-white transition-colors">Listing / Partner Request</a></li>
                  <li><a href="https://t.me/akash_kumar107" target="_blank" rel="noreferrer" className="hover:text-[#0070F3] transition-colors">Technical Support</a></li>
                  <li><a href="https://x.com/yourweb3guys" target="_blank" rel="noreferrer" className="hover:text-[#0070F3] transition-colors">Twitter (X)</a></li>
                  <li><a href="/llms.txt" className="hover:text-[#0070F3] transition-colors font-mono text-xs">/llms.txt (AI Index)</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-200 dark:border-[#262626] flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-[12px] font-mono text-slate-500">
                © {new Date().getFullYear()} Raisequity Foundation. All rights reserved.
              </div>
              <div className="flex items-center gap-6 text-[12px] font-mono">
                <a href={mdUrl} target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-[#0070F3] flex items-center gap-1.5 transition-colors">
                  <FileCode size={13} /> View as Markdown
                </a>
                <a href="/privacy.md" className="text-slate-600 dark:text-slate-400 hover:text-[#0070F3] transition-colors">Privacy</a>
                <a href="/terms.md" className="text-slate-600 dark:text-slate-400 hover:text-[#0070F3] transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
}
