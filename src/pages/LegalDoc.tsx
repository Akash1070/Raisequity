import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { Loader2, ArrowLeft } from 'lucide-react';

interface LegalDocProps {
  doc: 'terms' | 'privacy';
}

/**
 * Renders the Terms of Service / Privacy Policy as a simple styled HTML page.
 * Content is sourced from the same markdown registry used by the AI-readable
 * endpoints, so there is exactly one source of truth.
 */
export default function LegalDoc({ doc }: LegalDocProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const title = doc === 'terms' ? 'Terms of Service' : 'Privacy Policy';

  usePageMeta({
    title: `${title} - Raisequity`,
    description: doc === 'terms'
      ? 'Raisequity platform facilitation terms, 5% success fee model, and anti-circumvention policy.'
      : 'Raisequity privacy policy: double-blind contact masking and encrypted data protection.',
    canonicalPath: `/${doc}`,
    mdAlternate: `/${doc}.md`,
  });

  useEffect(() => {
    let active = true;
    fetch(`/api/md?path=/${doc}`)
      .then((r) => r.text())
      .then((text) => { if (active) setContent(text); })
      .catch(() => { if (active) setContent('The document could not be loaded. Please try again later.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [doc]);

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#090a0d] text-black dark:text-white font-sans">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-500 hover:text-black dark:hover:text-white mb-6 cursor-pointer">
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="rounded-[28px] bg-white dark:bg-[#121316] border border-[#e8e6df] dark:border-white/10 p-6 sm:p-10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-neutral-400">
              <Loader2 className="animate-spin text-emerald-500" size={28} />
              <span className="text-xs font-mono">Loading {title.toLowerCase()}...</span>
            </div>
          ) : (
            <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-4">
              <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight">{title}</h1>
              {content.split('\n').map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={i} className="h-3" />;
                if (trimmed.startsWith('# ')) return <h1 key={i} className="text-2xl font-black mt-6">{trimmed.slice(2)}</h1>;
                if (trimmed.startsWith('## ')) return <h2 key={i} className="text-lg font-black mt-5">{trimmed.slice(3)}</h2>;
                if (trimmed.startsWith('### ')) return <h3 key={i} className="text-base font-black mt-4">{trimmed.slice(4)}</h3>;
                if (trimmed.startsWith('- ')) return <li key={i} className="ml-5 list-disc text-sm text-neutral-600 dark:text-neutral-300">{trimmed.slice(2)}</li>;
                return <p key={i} className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{trimmed}</p>;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
