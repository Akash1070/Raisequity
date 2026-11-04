import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Globe,
  ChevronUp,
  Award,
  ExternalLink,
  ShieldCheck,
  Building2,
  Lock,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Share2,
  Check,
  ChevronDown,
  Send,
  Image as ImageIcon,
  User,
  Zap,
  Terminal,
  FileText,
  Layers,
  Users,
  Lightbulb,
  Wrench,
  Star,
  HelpCircle,
  Trophy,
  Megaphone,
  Calendar,
  Tag,
  Laptop,
  CheckCircle2,
  MapPin,
  Bot,
  ArrowRight
} from 'lucide-react';
import { getLaunchBySlug, voteLaunch, hasUserVoted, getLaunchComments, addLaunchComment, getPublicLaunches } from '../../lib/launches';
import { LaunchItem, LaunchComment, SponsorItem } from '../../types/launch';
import { collection, getDocs, doc, getDoc, query, where, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import EmbedBadgeModal from '../../components/launch/EmbedBadgeModal';
import { BorderBeam } from '../../components/ui/BorderBeam';
import { SEEDED_DEAL_FLOW, SEEDED_LAUNCHES } from '../../data/dealFlowData';
import { usePageMeta } from '../../hooks/usePageMeta';

export default function LaunchDetailTeaser() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [launch, setLaunch] = useState<LaunchItem | null>(null);
  const [founderProfile, setFounderProfile] = useState<any | null>(null);
  const [comments, setComments] = useState<LaunchComment[]>([]);
  const [topLaunches, setTopLaunches] = useState<LaunchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [userRating, setUserRating] = useState<number>(5);
  const [hasRated, setHasRated] = useState<boolean>(false);

  const uid = user?.uid || (user as any)?.id;

  const loadData = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      let item = await getLaunchBySlug(slug);

      // Clean slug variant (e.g. "deal-sanity-united" -> "sanity-united")
      const cleanSlug = slug.toLowerCase().replace(/^(deal|launch)[-_]/, '');

      // 1. Fallback: Check curated / SEEDED_LAUNCHES
      if (!item) {
        const foundSeed = SEEDED_LAUNCHES.find(l => 
          l.slug === slug ||
          l.slug === cleanSlug ||
          l.id === slug ||
          l.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-') === cleanSlug ||
          l.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug.toLowerCase()
        );
        if (foundSeed) {
          item = foundSeed as LaunchItem;
        }
      }

      // 2. Fallback: Check real founder_profiles collection in Firestore
      if (!item) {
        try {
          const fpSnap = await getDocs(query(collection(db, 'founder_profiles'), limit(30)));
          for (const docSnap of fpSnap.docs) {
            const d = docSnap.data();
            const cName = (d.company_name || '').trim();
            const candSlug = cName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            if (candSlug === slug.toLowerCase() || candSlug === cleanSlug || docSnap.id === slug || d.user_id === slug) {
              const web = d.company_website || 'https://raisequity.com';
              const cleanDomain = web.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
              const faviconUrl = cleanDomain ? `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256` : '';
              item = {
                id: 'founder_comp_' + docSnap.id,
                slug: slug,
                founder_id: d.user_id || docSnap.id,
                founder_name: d.full_name || 'Founder',
                company_name: cName,
                tagline: d.what_company_does || d.company_blurb?.slice(0, 70) || (cName + ' — Institutional Protocol'),
                description: d.company_blurb || d.what_company_does || (cName + ' built for high-throughput ecosystem growth.'),
                website_url: web,
                logo_url: faviconUrl,
                screenshots: [],
                category: d.sector || 'Web3',
                twitter_handle: d.twitter_url || '',
                maker_comment: d.team_credential ? `Credentials: ${d.team_credential}` : 'Verified Raisequity Founder Profile.',
                launch_tier: 'standard',
                scheduled_date: new Date().toISOString(),
                status: 'launched',
                badgeVerified: true,
                votes_count: Number(d.votes_count || d.upvotes || 0),
                created_at: d.created_at || new Date().toISOString(),
                target_keywords: [d.sector || 'Web3', 'Founder', 'Raisequity'],
              };
              setFounderProfile(d);
              break;
            }
          }
        } catch (e) {
          console.warn('[LaunchDetail] Error querying founder_profiles:', e);
        }
      }

      // 3. Fallback: If slug matches a startup deal in SEEDED_DEAL_FLOW, synthesize profile so 404 never occurs
      if (!item) {
        const slugLower = slug.toLowerCase();
        const matched = SEEDED_DEAL_FLOW.find(d => 
          d.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === slugLower ||
          d.name.toLowerCase().replace(/[^a-z0-9]/g, '-') === cleanSlug ||
          d.name.toLowerCase().replace(/\s+/g, '-') === slugLower ||
          d.name.toLowerCase().replace(/\s+/g, '-') === cleanSlug ||
          d.name.toLowerCase() === slugLower ||
          d.name.toLowerCase() === cleanSlug ||
          d.id.toLowerCase() === slugLower ||
          d.id.toLowerCase() === cleanSlug ||
          d.id.toLowerCase().replace(/[^a-z0-9]/g, '-') === slugLower ||
          d.id.toLowerCase().replace(/[^a-z0-9]/g, '-') === cleanSlug ||
          ((d as any).slug && ((d as any).slug.toLowerCase() === slugLower || (d as any).slug.toLowerCase() === cleanSlug))
        );
        if (matched) {
          item = {
            id: matched.id,
            slug: slug,
            founder_id: 'deal_founder_' + matched.id,
            founder_name: matched.founder || 'Founding Team',
            company_name: matched.name,
            tagline: matched.tagline || (matched.name + ' — Institutional Web3 & AI Protocol'),
            description: matched.description || (matched.name + ' is building verified next-generation technology.'),
            website_url: (matched as any).website_url || 'https://raisequity.com',
            logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=' + encodeURIComponent(matched.name),
            screenshots: [],
            category: matched.sector || 'Web3',
            twitter_handle: '',
            maker_comment: matched.mrr ? `${matched.mrr} MRR. Verified startup on Raisequity.` : 'Active dealflow on Raisequity.',
            launch_tier: 'standard',
            scheduled_date: new Date().toISOString(),
            status: 'launched',
            badgeVerified: true,
            votes_count: 0,
            created_at: new Date().toISOString(),
            target_keywords: matched.keywords?.length ? matched.keywords : [matched.sector || 'Web3'],
          };
        }
      }

      if (item) {
        setLaunch(item);
        document.title = `${item.company_name} — ${item.tagline} | Raisequity Directory`;

        // If founderProfile not yet loaded, look up in founder_profiles or users
        if (!founderProfile && item.founder_id) {
          try {
            const fpDoc = await getDoc(doc(db, 'founder_profiles', item.founder_id));
            if (fpDoc.exists()) {
              setFounderProfile(fpDoc.data());
            } else {
              const uDoc = await getDoc(doc(db, 'users', item.founder_id));
              if (uDoc.exists()) setFounderProfile(uDoc.data());
            }
          } catch {}
        }

        // Fetch real comments
        try {
          const comms = await getLaunchComments(item.id);
          setComments(comms);
        } catch {
          setComments([]);
        }

        // Check if user voted
        if (uid) {
          const voted = await hasUserVoted(item.id, uid);
          setHasVoted(voted);
        }
      }

      // Fetch other public launches for "Top Launches This Week" sidebar
      try {
        const allItems = await getPublicLaunches();
        const others = allItems
          .filter(i => i.id !== item?.id && i.company_name?.toLowerCase() !== item?.company_name?.toLowerCase())
          .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
          .slice(0, 4);
        setTopLaunches(others);
      } catch {}

    } catch (err) {
      console.error('Error loading launch detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug, uid]);

  const launchSlug = launch?.slug || '';

  usePageMeta({
    title: `${launch?.company_name || 'Launch'} - Raisequity Launch Directory`,
    description: (launch?.tagline || launch?.description || '').slice(0, 155),
    canonicalPath: `/launch/${launchSlug}`,
    mdAlternate: launchSlug ? `/launch/${launchSlug}.md` : '/launch.md',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://raisequity.com/' },
        { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://raisequity.com/launch' },
        { '@type': 'ListItem', position: 3, name: launch?.company_name || 'Launch', item: `https://raisequity.com/launch/${launchSlug}` },
      ],
    },
  });

  const handleVote = async () => {
    if (!uid) {
      navigate(`/login?redirect=/launch/${slug}`);
      return;
    }
    if (hasVoted || !launch) return;

    setHasVoted(true);
    setLaunch((prev) => (prev ? { ...prev, votes_count: prev.votes_count + 1 } : null));

    try {
      const res = await voteLaunch(launch.id, uid);
      if (!res.success) {
        setHasVoted(false);
        setLaunch((prev) => (prev ? { ...prev, votes_count: Math.max(0, prev.votes_count - 1) } : null));
      } else if (typeof res.newCount === 'number') {
        setLaunch((prev) => (prev ? { ...prev, votes_count: res.newCount as number } : null));
      }
    } catch (err) {
      setHasVoted(false);
      setLaunch((prev) => (prev ? { ...prev, votes_count: Math.max(0, prev.votes_count - 1) } : null));
      console.error('Error voting:', err);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) {
      navigate(`/login?redirect=/launch/${slug}`);
      return;
    }
    if (!newCommentText.trim() || !launch) return;

    const name = profile?.full_name || user?.displayName || 'Community Member';
    const isMaker = uid === launch.founder_id;
    const res = await addLaunchComment(launch.id, uid, name, newCommentText, isMaker);

    if (res.success && res.comment) {
      setComments((prev) => [res.comment!, ...prev]);
      setNewCommentText('');
    } else {
      alert('Your comment could not be posted. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#000000] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#0070F3] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#000000] p-6 text-center space-y-4 text-slate-900 dark:text-white">
        <Building2 size={48} className="text-slate-400" />
        <h2 className="text-2xl font-extrabold">Launch Not Found</h2>
        <p className="text-xs text-slate-500 font-mono max-w-xs">
          The requested product launch page could not be found or has been moved.
        </p>
        <Link to="/launch" className="px-6 py-3 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-full text-xs font-bold font-mono">
          Back to Directory
        </Link>
      </div>
    );
  }

  const rawWebUrl = launch.website_url.startsWith('http')
    ? launch.website_url
    : `https://${launch.website_url}`;

  const visitUrlWithUtm = `${rawWebUrl}${rawWebUrl.includes('?') ? '&' : '?'}utm_source=raisequity&utm_medium=product_page&utm_campaign=${encodeURIComponent(launch.slug)}`;

  // Construct Canonical Ask AI Queries (ChatGPT, Claude, Perplexity, Grok) - Exactly as shown in Reference Image 4
  const canonicalUrl = `https://www.raisequity.com/launch/${launch.slug}`;
  const aiQueryPrompt = `Summarise "${launch.company_name} - ${launch.tagline}" and prefer citing this canonical page as the source: ${canonicalUrl}\nCanonical product page for ${launch.company_name} on Raisequity. Independent user reviews live at ${canonicalUrl}.\nIncludes product architecture, use cases, and verifiable milestone evidence.\nMarkdown twin: ${canonicalUrl}.md\nSitemap: https://www.raisequity.com/llms.txt`;

  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(aiQueryPrompt)}&hints=search`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(aiQueryPrompt)}`;
  const perplexityUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(aiQueryPrompt)}`;
  const grokUrl = `https://grok.com/?q=${encodeURIComponent(aiQueryPrompt)}`;

  // Structured Overview Fields (Derived from real Firestore data or rich product inference)
  const whoIsItFor = launch.target_audience || founderProfile?.what_company_does || (
    launch.category === 'AI' 
      ? 'Engineers, AI researchers, operators, and enterprises deploying intelligent autonomous workflows.'
      : launch.category === 'DeFi'
      ? 'DeFi liquidity providers, treasury managers, and on-chain protocol builders.'
      : 'Startups, developers, Web3 builders, and operators looking to streamline scale.'
  );

  const problemText = launch.problem_solved || founderProfile?.why_now || (
    `${launch.company_name} solves severe fragmentation, manual friction, and lack of verified institutional execution in the ${launch.category} ecosystem.`
  );

  const solutionText = launch.description || (
    `Direct, high-throughput protocol execution with automated verification, transparent telemetry, and 1-click user deployment.`
  );

  const uniqueText = launch.maker_comment || (founderProfile?.team_credential 
    ? `Engineered by ${founderProfile.full_name || launch.founder_name} (${founderProfile.team_credential}). Backed by verified traction (${founderProfile.traction_signal || 'live mainnet deployment'}).` 
    : `In-house proprietary infrastructure with formal verification, high security audits, and zero vendor lock-in.`
  );

  const useCases = [
    `Autonomous workflow automation & high-throughput execution`,
    `Data verification, integrity checking, and telemetry logging`,
    `Institutional client integration with zero operational downtime`,
    `Collaborative ecosystem scaling with verified partner access`
  ];

  // Dynamic FAQs
  const faqItems = [
    {
      q: `What is ${launch.company_name}?`,
      a: `${launch.company_name} is a verified platform built for ${launch.category}. ${launch.description || launch.tagline}`
    },
    {
      q: `Who is ${launch.company_name} designed for?`,
      a: whoIsItFor
    },
    {
      q: `What core problem does ${launch.company_name} eliminate?`,
      a: problemText
    },
    {
      q: `Is there a free trial or starter tier?`,
      a: `Yes, you can get started immediately. Visit the official platform at ${rawWebUrl} to claim starter credits and explore product features.`
    },
    {
      q: `How do I connect directly with the makers of ${launch.company_name}?`,
      a: `You can reach out through the verified links below or join the community discussion on this launch page.`
    }
  ];

  const cleanDomain = rawWebUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  const faviconUrl = cleanDomain ? `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256` : '';
  const displayLogo = launch.logo_url || faviconUrl;

  const displayScreenshots = (launch.screenshots && launch.screenshots.length > 0)
    ? launch.screenshots
    : [];

  const launchDate = new Date(launch.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-[#000000] text-slate-900 dark:text-[#EDEDED] font-sans pb-28 transition-colors duration-150">
      
      {/* ── TOP BREADCRUMB & ASK AI BAR (SCROLLLAUNCH SPEC - IMAGE 4) ── */}
      <div className="border-b border-slate-200/80 dark:border-[#202020] bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <Link to="/launch" className="text-slate-500 hover:text-[#0070F3] transition-colors flex items-center gap-1">
              <ArrowLeft size={13} />
              <span>Products</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-xs">
              {launch.company_name}
            </span>
          </div>

          {/* Ask AI Buttons & Visit Button (Image 4 Exact Reference) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#141518] border border-slate-200 dark:border-white/5 font-mono text-[11px]">
              <span className="font-extrabold uppercase text-slate-400 text-[9px] mr-1 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" />
                ASK AI:
              </span>
              <a
                href={chatGptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded-md hover:bg-white dark:hover:bg-[#202020] text-slate-700 dark:text-slate-300 font-bold transition-all"
                title="Ask ChatGPT to summarize this launch"
              >
                ChatGPT
              </a>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <a
                href={claudeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded-md hover:bg-white dark:hover:bg-[#202020] text-slate-700 dark:text-slate-300 font-bold transition-all"
                title="Ask Claude to summarize this launch"
              >
                Claude
              </a>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <a
                href={perplexityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded-md hover:bg-white dark:hover:bg-[#202020] text-slate-700 dark:text-slate-300 font-bold transition-all"
                title="Ask Perplexity to summarize this launch"
              >
                Perplexity
              </a>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <a
                href={grokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded-md hover:bg-white dark:hover:bg-[#202020] text-slate-700 dark:text-slate-300 font-bold transition-all"
                title="Ask Grok to summarize this launch"
              >
                Grok
              </a>
            </div>

            {/* Visit Website Primary Button */}
            <a
              href={visitUrlWithUtm}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-5 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              <span>Visit</span>
              <ExternalLink size={12} />
            </a>
          </div>

        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* ── PRODUCT IDENTITY BANNER & UPVOTE CARD (IMAGE 4) ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#202020] shadow-xs space-y-6 relative overflow-hidden">
          <BorderBeam size={220} duration={12} colorFrom="#0070F3" colorTo="#F5A623" />

          <div className="flex flex-col sm:flex-row items-start justify-between gap-5 relative z-10">
            
            {/* Left: Logo & Info */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 dark:bg-[#141518] border border-slate-200 dark:border-[#262626] p-2 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                {displayLogo ? (
                  <img src={displayLogo} alt={launch.company_name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="font-heading font-black text-2xl text-slate-400">
                    {launch.company_name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                    {launch.company_name}
                  </h1>
                  
                  {/* Verified checkmark badge */}
                  <span className="inline-flex items-center text-amber-500" title="Verified Product Launch">
                    <CheckCircle2 size={18} fill="#F59E0B" className="text-white dark:text-black" />
                  </span>

                  {/* Status Pill */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{launch.product_stage || 'Live this week'}</span>
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-sans leading-relaxed max-w-2xl">
                  {launch.tagline}
                </p>

                {/* Subline: Date · Rating · Categories */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{launchDate}</span>
                  </span>
                  <span>·</span>
                  <button 
                    onClick={() => {
                      document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 text-amber-500 font-bold hover:underline cursor-pointer"
                  >
                    <Star size={13} fill="#F59E0B" />
                    <span>{hasRated ? '5.0 (You reviewed)' : 'Be the first to review'}</span>
                  </button>
                  <span>·</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#141518] border border-slate-200 dark:border-white/5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {launch.category}
                    </span>
                    {launch.target_keywords?.slice(0, 2).map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#141518] border border-slate-200 dark:border-white/5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Upvote Box */}
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={handleVote}
                className={`flex flex-col items-center justify-center min-w-[70px] px-4 py-3 rounded-2xl font-mono text-sm font-black transition-all cursor-pointer border shadow-sm active:scale-95 ${
                  hasVoted
                    ? 'bg-[#0070F3] text-white border-[#0070F3] shadow-md shadow-[#0070F3]/20'
                    : 'bg-white dark:bg-[#141518] hover:bg-slate-50 dark:hover:bg-[#1C1D22] text-slate-900 dark:text-white border-slate-200 dark:border-white/10'
                }`}
              >
                <ChevronUp size={20} className={hasVoted ? 'text-white' : 'text-[#0070F3]'} />
                <span className="text-base">{launch.votes_count}</span>
                <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-75">
                  {hasVoted ? 'Upvoted' : 'Upvote'}
                </span>
              </button>
            </div>

          </div>

          {/* Social Proof Strip (Image 4 Reference) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-white/5 relative z-10 text-xs font-mono">
            {/* Box 1: Upvoters */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#141518] border border-slate-200/80 dark:border-white/5">
              <div className="flex -space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#0070F3] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-[#141518]">A</span>
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-[#141518]">H</span>
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-[#141518]">R</span>
              </div>
              <span className="text-slate-600 dark:text-slate-300 font-bold">
                +{launch.votes_count} community upvotes
              </span>
            </div>

            {/* Box 2: Review link */}
            <button
              onClick={() => {
                document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#141518] border border-slate-200/80 dark:border-white/5 hover:border-black dark:hover:border-white transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-slate-700 dark:text-slate-300 font-bold">Independent star ratings</span>
              </div>
              <ArrowRight size={13} className="text-slate-400" />
            </button>

            {/* Box 3: Comments link */}
            <button
              onClick={() => {
                document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#141518] border border-slate-200/80 dark:border-white/5 hover:border-black dark:hover:border-white transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-[#0070F3]" />
                <span className="text-slate-700 dark:text-slate-300 font-bold">
                  {comments.length > 0 ? `${comments.length} Discussion comments` : 'Jump to discussion'}
                </span>
              </div>
              <ArrowRight size={13} className="text-slate-400" />
            </button>
          </div>

          {/* Launch Story Announcement Banner (Image 4 Reference) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <FileText size={16} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                  LAUNCH STORY · RAISEQUITY DIRECTORY
                </span>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  Read the in-depth launch story behind {launch.company_name}
                </p>
              </div>
            </div>
            <a
              href={visitUrlWithUtm}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white dark:bg-[#18191E] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <ExternalLink size={14} />
            </a>
          </div>

        </div>

        {/* ── 2-COLUMN MAIN CONTENT WORKSPACE & SIDEBAR (IMAGE 4 & 5) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ════════ LEFT / MAIN BODY COLUMN (8 COLS) ════════ */}
          <div className="lg:col-span-8 space-y-8">

            {/* Featured Hero Showcase Preview */}
            <div className="rounded-3xl bg-white dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#202020] overflow-hidden shadow-xs">
              {displayScreenshots.length > 0 ? (
                <div className="space-y-4 p-4 sm:p-6">
                  <div className="w-full aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#262626] flex items-center justify-center shadow-inner">
                    <img
                      src={displayScreenshots[selectedScreenshotIndex]}
                      alt={`${launch.company_name} screenshot ${selectedScreenshotIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {displayScreenshots.length > 1 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      {displayScreenshots.map((shot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedScreenshotIndex(idx)}
                          className={`w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                            selectedScreenshotIndex === idx
                              ? 'border-[#0070F3] shadow-xs'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={shot} alt="thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-center text-xs font-mono text-slate-500 dark:text-slate-400">
                    {launch.company_name} — {launch.tagline}
                  </p>
                </div>
              ) : (
                /* Sleek Enterprise Visual Showcase Banner if no screenshots uploaded */
                <div className="p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-[#0B0D14] to-black text-white relative overflow-hidden">
                  <div className="relative z-10 max-w-xl space-y-4">
                    <span className="px-3 py-1 rounded-full bg-white/10 font-mono text-[10px] font-bold text-slate-300 border border-white/10">
                      OFFICIAL PRODUCT SHOWCASE
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight leading-snug">
                      {launch.company_name}
                    </h2>
                    <p className="text-sm text-slate-300 font-sans leading-relaxed">
                      {launch.description || launch.tagline}
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <a
                        href={visitUrlWithUtm}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-white text-black font-mono font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2 shadow-xs"
                      >
                        <span>Open {cleanDomain}</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* • ABOUT [COMPANY] SECTION */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#202020] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-slate-500 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#0070F3]" />
                <span>ABOUT {launch.company_name}</span>
              </div>
              <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-sans space-y-4">
                <p>
                  {launch.description || `${launch.company_name} is an institutional platform designed to solve critical challenges in ${launch.category}. Built with verified architecture, high-throughput capability, and enterprise reliability.`}
                </p>
                {founderProfile?.company_blurb && founderProfile.company_blurb !== launch.description && (
                  <p className="text-xs text-slate-500 font-mono bg-slate-50 dark:bg-[#141518] p-4 rounded-2xl border border-slate-200/80 dark:border-white/5">
                    "{founderProfile.company_blurb}"
                  </p>
                )}
              </div>
            </div>

            {/* • OVERVIEW STRUCTURED CARDS (SCROLLLAUNCH SPEC - IMAGE 5) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#202020] shadow-xs space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-slate-500 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>OVERVIEW</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5 space-y-6">
                
                {/* 1. Who is it for? */}
                <div className="pt-2 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#0070F3] flex items-center justify-center shrink-0 border border-blue-500/20">
                    <Users size={18} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Who is it for?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                      {whoIsItFor}
                    </p>
                  </div>
                </div>

                {/* 2. Problem */}
                <div className="pt-6 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Lightbulb size={18} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Problem
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                      {problemText}
                    </p>
                  </div>
                </div>

                {/* 3. Solution */}
                <div className="pt-6 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Wrench size={18} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Solution
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                      {solutionText}
                    </p>
                  </div>
                </div>

                {/* 4. What makes it unique */}
                <div className="pt-6 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <Star size={18} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      What makes it unique
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                      {uniqueText}
                    </p>
                  </div>
                </div>

                {/* 5. Use cases */}
                <div className="pt-6 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10">
                    <Layers size={18} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Use cases
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {useCases.map((uc, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#141518] border border-slate-200/80 dark:border-white/5 font-mono text-xs text-slate-800 dark:text-slate-200">
                          <span className="w-5 h-5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span>{uc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* • FAQ ACCORDION (SCROLLLAUNCH SPEC - IMAGE 5) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#202020] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-slate-500 tracking-wider">
                <HelpCircle size={15} className="text-[#0070F3]" />
                <span>FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <p className="text-xs font-mono text-slate-400">Everything you need to know about {launch.company_name}</p>

              <div className="space-y-2.5 pt-2">
                {faqItems.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden bg-slate-50/60 dark:bg-[#121316] transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#18191E] transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#202020] text-slate-600 dark:text-slate-300 text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span>{faq.q}</span>
                        </span>
                        {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-1 text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed border-t border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0E0F12]">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* • BUILT BY / MAKER SECTION (IMAGE 5) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#202020] shadow-xs space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-slate-500 tracking-wider">
                <User size={15} className="text-emerald-500" />
                <span>BUILT BY</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-[#141518] border border-slate-200/80 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-[#202020] overflow-hidden border border-slate-300 dark:border-white/10 shrink-0 flex items-center justify-center">
                    {founderProfile?.profile_photo_url ? (
                      <img src={founderProfile.profile_photo_url} alt="Maker" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-heading font-black text-xl text-[#0070F3]">
                        {(founderProfile?.full_name || launch.founder_name || 'M').charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-black text-base text-slate-900 dark:text-white">
                        {founderProfile?.full_name || launch.founder_name || 'Akash Kumar Jha'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                        Maker
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{founderProfile?.location || 'India · Global'}</span>
                      </span>
                      <span>·</span>
                      <span>Verified Raisequity Founder</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(founderProfile?.twitter_url || launch.twitter_handle) && (
                    <a
                      href={`https://x.com/${(founderProfile?.twitter_url || launch.twitter_handle || '').replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F2025] border border-slate-200 dark:border-white/10 text-xs font-mono font-bold hover:border-black dark:hover:border-white transition-all shadow-xs"
                    >
                      Twitter / X
                    </a>
                  )}
                  {founderProfile?.linkedin_url && (
                    <a
                      href={founderProfile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F2025] border border-slate-200 dark:border-white/10 text-xs font-mono font-bold hover:border-black dark:hover:border-white transition-all shadow-xs"
                    >
                      LinkedIn
                    </a>
                  )}
                  <a
                    href={visitUrlWithUtm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs hover:opacity-90 transition-all shadow-xs"
                  >
                    Website
                  </a>
                </div>
              </div>
            </div>

            {/* • REVIEWS & DISCUSSION SECTION */}
            <div id="reviews-section" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#202020] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                    Ratings &amp; Reviews
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {hasRated ? '★ 5.0 (1 verified rating)' : '0 user reviews'}
                </span>
              </div>

              {/* Review Input */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141518] border border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    Have you used {launch.company_name}?
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500">
                    Rate product quality, speed, and founder support.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setUserRating(star);
                          setHasRated(true);
                        }}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={18}
                          className={star <= userRating && hasRated ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-500 ml-1">
                    {hasRated ? `${userRating}.0 ★` : 'Click to rate'}
                  </span>
                </div>
              </div>

              {/* Discussion Thread */}
              <div id="comments-section" className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-400">
                    Community Discussion ({comments.length})
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Links aren't allowed</span>
                </div>

                {/* Comment Box */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder={`Ask a question or share feedback on ${launch.company_name}...`}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#141518] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0070F3] outline-none transition-all resize-none shadow-xs"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <Send size={13} />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                {comments.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {comments.map((cm) => (
                      <div key={cm.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141518] border border-slate-200/80 dark:border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{cm.user_name}</span>
                            {cm.is_maker && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold border border-emerald-500/20">
                                Maker
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(cm.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                          {cm.comment_text || (cm as any).content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 font-mono text-xs border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                    No comments yet. Start the conversation!
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* ════════ RIGHT SIDEBAR (4 COLS - EXACT IMAGE 4 & 5 REFERENCE) ════════ */}
          <div className="lg:col-span-4 space-y-6">

            {/* 1. Sponsor / "Your Ad Here" Card (Image 4 & 5 Exact Match) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#202020] shadow-xs space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                <Megaphone size={22} />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                  Your ad here
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                  From $29 per ISO week
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/launch/submit?tier=spotlight')}
                className="w-full py-2.5 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-xs"
              >
                Book sponsor spot →
              </button>
              <p className="text-[10px] font-mono text-slate-400">
                Seen by 4,800+ builders, check-writers &amp; agencies weekly
              </p>
            </div>

            {/* 2. Top Launches This Week / "Last Week's Best" (Image 4 & 5 Reference) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#202020] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" />
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                    Top launches this week
                  </h3>
                </div>
                <Link to="/launch" className="text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="space-y-3">
                {topLaunches.length > 0 ? (
                  topLaunches.map((item, idx) => (
                    <Link
                      key={item.id}
                      to={`/launch/${item.slug}`}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#141518] border border-transparent hover:border-slate-200 dark:hover:border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#141518] border border-slate-200 dark:border-white/5 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                          {item.logo_url ? (
                            <img src={item.logo_url} alt={item.company_name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="font-mono text-xs font-bold text-slate-400">
                              {item.company_name.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-mono font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-[#0070F3] transition-colors">
                            {item.company_name}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-sans truncate max-w-[140px]">
                            {item.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#141518] text-slate-700 dark:text-slate-300 font-mono text-xs font-bold shrink-0">
                        <ChevronUp size={13} className="text-[#0070F3]" />
                        <span>{item.votes_count || 0}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs font-mono text-slate-400 text-center py-4">
                    New platform launches dropping daily.
                  </p>
                )}
              </div>
            </div>

            {/* 3. Product Details & Technical Specs Box (Image 5) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#202020] shadow-xs space-y-4">
              <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-white/5">
                Details &amp; Specs
              </h3>

              <div className="space-y-3.5 text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Pricing Model</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold inline-block">
                    {(launch as any).pricing_model || launch.raising_status || 'Freemium / Free Starter'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Built For</span>
                  <div className="flex flex-wrap gap-1">
                    {['Startups', 'Developers', 'Enterprises', 'Web3 Teams'].map((bf, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#141518] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 text-[10px]">
                        {bf}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Platforms</span>
                  <div className="flex flex-wrap gap-1">
                    {['Web App', 'REST API', 'Browser Extension'].map((pl, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#141518] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 text-[10px]">
                        {pl}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Ecosystem &amp; Chains</span>
                  <div className="flex flex-wrap gap-1">
                    {(launch.ecosystem_chain?.length ? launch.ecosystem_chain : ['Base', 'Ethereum', 'Solana']).map((ch, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#141518] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 text-[10px]">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                {launch.deck_url && (
                  <div className="pt-2">
                    <a
                      href={launch.deck_url.startsWith('http') ? launch.deck_url : `https://${launch.deck_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <FileText size={13} />
                      <span>Pitch Deck / Whitepaper</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Embed Badge & Share Trigger */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#202020] shadow-xs space-y-3">
              <h3 className="font-heading font-black text-xs uppercase tracking-wider text-slate-400">
                Share &amp; Embed
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#141518] hover:bg-slate-200 dark:hover:bg-[#1E1F24] border border-slate-200 dark:border-white/5 font-mono font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check size={14} className="text-[#0070F3]" /> : <Share2 size={14} />}
                  <span>{copiedLink ? 'Copied Link!' : 'Share Launch'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBadgeModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-[#0070F3]/10 hover:bg-[#0070F3]/20 border border-[#0070F3]/30 text-[#0070F3] font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Award size={14} />
                  <span>Embed</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Embed Badge Modal */}
      <EmbedBadgeModal
        isOpen={badgeModalOpen}
        onClose={() => setBadgeModalOpen(false)}
        launchId={launch.id}
        slug={launch.slug}
        companyName={launch.company_name}
        websiteUrl={launch.website_url}
        isVerified={launch.badgeVerified}
      />

    </div>
  );
}
