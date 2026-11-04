import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { getLaunchBySlug, voteLaunch, hasUserVoted, getLaunchComments, addLaunchComment, getPublicLaunches } from '../../lib/launches';
import { LaunchItem, LaunchComment } from '../../types/launch';
import { collection, getDocs, doc, getDoc, query, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import EmbedBadgeModal from '../../components/launch/EmbedBadgeModal';
import { SEEDED_DEAL_FLOW, SEEDED_LAUNCHES } from '../../data/dealFlowData';
import { usePageMeta } from '../../hooks/usePageMeta';
import {
  HeaderTopBar,
  ProductIdentityCard,
  HeroShowcase,
  AboutSection,
  OverviewSection,
  FaqAccordion,
  BuiltBySection,
  ReviewsSection,
  SponsorCallout,
  TopLaunchesWidget,
  DetailsSpecsCard,
  ShareEmbedCard,
} from './teaser-sections';

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

      <HeaderTopBar
        companyName={launch.company_name}
        chatGptUrl={chatGptUrl}
        claudeUrl={claudeUrl}
        perplexityUrl={perplexityUrl}
        grokUrl={grokUrl}
        visitUrl={visitUrlWithUtm}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        <ProductIdentityCard
          launch={launch}
          displayLogo={displayLogo}
          launchDate={launchDate}
          hasRated={hasRated}
          hasVoted={hasVoted}
          commentCount={comments.length}
          onVote={handleVote}
          visitUrl={visitUrlWithUtm}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-8 space-y-8">

            <HeroShowcase
              launch={launch}
              screenshots={displayScreenshots}
              selectedIndex={selectedScreenshotIndex}
              onSelectScreenshot={setSelectedScreenshotIndex}
              visitUrl={visitUrlWithUtm}
              cleanDomain={cleanDomain}
            />

            <AboutSection launch={launch} founderProfile={founderProfile} />

            <OverviewSection
              whoIsItFor={whoIsItFor}
              problemText={problemText}
              solutionText={solutionText}
              uniqueText={uniqueText}
              useCases={useCases}
            />

            <FaqAccordion
              companyName={launch.company_name}
              items={faqItems}
              openIndex={openFaqIndex}
              onToggle={(idx) => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
            />

            <BuiltBySection launch={launch} founderProfile={founderProfile} visitUrl={visitUrlWithUtm} />

            <ReviewsSection
              companyName={launch.company_name}
              hasRated={hasRated}
              userRating={userRating}
              onRate={(star) => {
                setUserRating(star);
                setHasRated(true);
              }}
              comments={comments}
              commentText={newCommentText}
              onCommentTextChange={setNewCommentText}
              onSubmitComment={handleAddComment}
            />

          </div>

          <div className="lg:col-span-4 space-y-6">

            <SponsorCallout onBookSponsor={() => navigate('/launch/submit?tier=spotlight')} />

            <TopLaunchesWidget launches={topLaunches} />

            <DetailsSpecsCard launch={launch} />

            <ShareEmbedCard
              copied={copiedLink}
              onShare={handleCopyShare}
              onEmbed={() => setBadgeModalOpen(true)}
            />

          </div>

        </div>

      </div>

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
