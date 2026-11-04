import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { getPublicLaunches, voteLaunch, hasUserVoted } from '../../lib/launches';
import type { LaunchItem } from '../../types/launch';
import { useAuth } from '../../contexts/AuthContext';
import { safeStorage } from '../../lib/storage';
import MyLaunch from '../Dashboard/MyLaunch';
import { LiveActivityMarquee } from '../../components/ui/LiveActivityMarquee';
import { usePageMeta } from '../../hooks/usePageMeta';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SEEDED_LAUNCHES } from '../../data/dealFlowData';
import {
  BentoRowFive,
  BentoRowSix,
  FilterBar,
  GridViewSelectorBar,
  HeroSection,
  LaunchList,
  SidebarWidgets,
} from './directory-sections';

export interface ExtendedLaunchItem extends LaunchItem {
  rating?: number;
  review_count?: number;
  comments_count?: number;
  icon_symbol?: string;
  icon_bg?: string;
  stage?: string;
  chain?: string;
}

export default function LaunchDirectory() {
  usePageMeta({
    title: 'Launch Directory - Raisequity | Discover Top Startups',
    description: 'Vote for the top AI agents, SaaS tools, and Web3 protocols. Winning teams unlock guaranteed partner meetings, $50k angel syndication, and dofollow backlinks.',
    canonicalPath: '/launch',
    mdAlternate: '/launch.md',
  });
  const { user } = useAuth();
  const uid = user?.uid || (user as any)?.id || '';
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const [searchParams, setSearchParams] = useSearchParams();

  const [mainTab, setMainTab] = useState<'browse' | 'my-launch'>(
    searchParams.get('tab') === 'my-launch' ? 'my-launch' : 'browse'
  );
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'votes' | 'trending' | 'recent'>('votes');
  const [selectedStage, setSelectedStage] = useState<string>('All Stages');
  const [selectedChain, setSelectedChain] = useState<string>('All Chains');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [launches, setLaunches] = useState<ExtendedLaunchItem[]>([]);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const publicItems = await getPublicLaunches();
      const combined: ExtendedLaunchItem[] = [];

      for (const item of publicItems) {
        let normalizedStage = item.product_stage || 'Mainnet Live';
        let chain = (item.ecosystem_chain && item.ecosystem_chain[0]) || 'Cross-Chain';
        let votes = Number(item.votes_count ?? (item as any).upvotes ?? 0);

        combined.push({
          ...item,
          product_stage: normalizedStage,
          stage: normalizedStage,
          chain,
          ecosystem_chain: [chain],
          badgeVerified: true,
          rating: 5.0,
          review_count: Math.max(2, votes % 7),
          comments_count: Math.max(1, votes % 4),
          votes_count: votes,
          icon_symbol: item.company_name?.slice(0, 2).toUpperCase() || 'RQ',
          icon_bg: 'bg-black text-white'
        });
      }

      try {
        const fpSnap = await getDocs(query(collection(db, 'founder_profiles'), limit(15)));
        fpSnap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d.company_name && !combined.some(c => c.company_name?.toLowerCase() === d.company_name?.toLowerCase())) {
            const cName = d.company_name.trim();
            const web = d.company_website || 'https://raisequity.com';
            const cleanDomain = web.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
            const faviconUrl = cleanDomain ? `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=256` : '';

            combined.push({
              id: 'founder_comp_' + docSnap.id,
              slug: cName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              founder_id: d.user_id || docSnap.id,
              founder_name: d.full_name || 'Akash Kumar Jha',
              company_name: cName,
              tagline: d.what_company_does || d.company_blurb?.slice(0, 70) || `${cName} — Institutional Protocol`,
              description: d.company_blurb || d.what_company_does || `${cName} built for high-throughput ecosystem growth.`,
              website_url: web,
              logo_url: faviconUrl,
              screenshots: [],
              category: d.sector || 'Web3',
              twitter_handle: d.twitter_url || '',
              maker_comment: d.team_credential ? `Credentials: ${d.team_credential}` : 'Verified Raisequity Founder Profile.',
              launch_tier: 'premium',
              scheduled_date: new Date().toISOString(),
              status: 'launched',
              badgeVerified: true,
              votes_count: (d.votes_count || d.upvotes || 0),
              created_at: d.created_at || new Date().toISOString(),
              target_keywords: [d.sector || 'Web3', 'Founder', 'Raisequity'],
              product_stage: d.stage || 'Seed',
              stage: d.stage || 'Seed',
              chain: 'Ethereum',
              ecosystem_chain: ['Ethereum'],
              rating: 5.0,
              review_count: 4,
              comments_count: 2,
              icon_symbol: cName.slice(0, 2).toUpperCase(),
              icon_bg: 'bg-neutral-900 text-white'
            });
          }
        });
      } catch (fpErr) {
      }

      // 3. Supplement with verified platform startups (SEEDED_LAUNCHES including YourWeb3Guy, HireInCrypto, Fasqon, Sanity United, Ceres Farm, etc.)
      for (const s of SEEDED_LAUNCHES) {
        if (!combined.some(c => c.slug?.toLowerCase() === s.slug?.toLowerCase() || c.company_name?.toLowerCase() === s.company_name?.toLowerCase())) {
          const votes = Number(s.votes_count || 0);
          const normalizedStage = s.product_stage || s.stage || 'Mainnet Live';
          const chain = (s.ecosystem_chain && s.ecosystem_chain[0]) || s.chain || 'Cross-Chain';

          combined.push({
            id: s.id,
            slug: s.slug,
            founder_id: s.founder_id || 'founder_' + s.slug,
            founder_name: s.founder_name || 'Founding Lead',
            company_name: s.company_name,
            tagline: s.tagline,
            description: s.description,
            website_url: s.website_url || 'https://raisequity.com',
            logo_url: s.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(s.company_name)}`,
            screenshots: s.screenshots || [],
            category: s.category || 'Web3',
            twitter_handle: s.twitter_handle || '',
            maker_comment: s.maker_comment || 'Verified launch on Raisequity.',
            launch_tier: s.launch_tier || 'standard',
            scheduled_date: s.scheduled_date || new Date().toISOString(),
            status: 'launched',
            badgeVerified: s.badgeVerified ?? true,
            votes_count: votes,
            created_at: s.created_at || new Date().toISOString(),
            target_keywords: s.target_keywords || [s.category || 'Web3'],
            product_stage: normalizedStage,
            stage: normalizedStage,
            chain,
            ecosystem_chain: [chain],
            rating: 5.0,
            review_count: Math.max(2, votes % 7),
            comments_count: Math.max(1, votes % 4),
            icon_symbol: s.company_name?.slice(0, 2).toUpperCase() || 'RQ',
            icon_bg: 'bg-black text-white'
          });
        }
      }

      combined.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
      setLaunches(combined);

      if (uid) {
        const vMap: Record<string, boolean> = {};
        for (const item of combined.slice(0, 30)) {
          const hasV = await hasUserVoted(item.id, uid);
          vMap[item.id] = hasV;
        }
        setVotedMap(vMap);
      }
    } catch (err) {
      console.error('[LaunchDirectory] Error loading real data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uid]);

  const handleProtectedAction = (destination: string) => {
    if (!uid) {
      navigate(`/login?redirect=${encodeURIComponent(destination)}`);
    } else {
      navigate(destination);
    }
  };

  const handleVote = async (e: React.MouseEvent, launchId: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!uid) {
      const guestKey = `rq_guest_voted_${launchId}`;
      const hasGuestVoted = safeStorage.getItem(guestKey) === 'true';
      if (hasGuestVoted) {
        safeStorage.removeItem(guestKey);
        setVotedMap((prev) => ({ ...prev, [launchId]: false }));
        setLaunches((prev) =>
          prev.map((l) => (l.id === launchId ? { ...l, votes_count: Math.max(0, (l.votes_count || 0) - 1) } : l))
        );
      } else {
        safeStorage.setItem(guestKey, 'true');
        setVotedMap((prev) => ({ ...prev, [launchId]: true }));
        setLaunches((prev) =>
          prev.map((l) => (l.id === launchId ? { ...l, votes_count: (l.votes_count || 0) + 1 } : l))
        );
      }
      return;
    }

    try {
      const currentVoted = votedMap[launchId];
      setVotedMap((prev) => ({ ...prev, [launchId]: !currentVoted }));
      setLaunches((prev) =>
        prev.map((l) =>
          l.id === launchId
            ? { ...l, votes_count: currentVoted ? Math.max(0, (l.votes_count || 0) - 1) : (l.votes_count || 0) + 1 }
            : l
        )
      );

      const success = await voteLaunch(launchId, uid);
      if (!success) {
        setVotedMap((prev) => ({ ...prev, [launchId]: currentVoted }));
        setLaunches((prev) =>
          prev.map((l) =>
            l.id === launchId
              ? { ...l, votes_count: currentVoted ? (l.votes_count || 0) + 1 : Math.max(0, (l.votes_count || 0) - 1) }
              : l
          )
        );
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const getCategoryCount = (narrative: string) => {
    if (narrative === 'All') return launches.length;
    const nLower = narrative.toLowerCase();
    return launches.filter((l) => {
      const catMatch = l.category?.toLowerCase().includes(nLower);
      const kwMatch = l.target_keywords?.some((k) => k.toLowerCase().includes(nLower));
      const tagMatch = l.tagline?.toLowerCase().includes(nLower);
      const descMatch = l.description?.toLowerCase().includes(nLower);
      return catMatch || kwMatch || tagMatch || descMatch;
    }).length;
  };

  const activeFiltersCount = (selectedStage !== 'All Stages' ? 1 : 0) + (selectedChain !== 'All Chains' ? 1 : 0);

  const resetAllFilters = () => {
    setActiveTab('All');
    setSelectedStage('All Stages');
    setSelectedChain('All Chains');
    setSearchQuery('');
    setSortBy('votes');
  };

  const filteredLaunches = useMemo(() => {
    const list = launches.filter((l) => {
      if (activeTab !== 'All') {
        const tabLower = activeTab.toLowerCase();
        const catMatch = l.category?.toLowerCase().includes(tabLower);
        const kwMatch = l.target_keywords?.some((k) => k.toLowerCase().includes(tabLower));
        const tagMatch = l.tagline?.toLowerCase().includes(tabLower);
        const descMatch = l.description?.toLowerCase().includes(tabLower);
        if (!catMatch && !kwMatch && !tagMatch && !descMatch) return false;
      }

      if (selectedStage !== 'All Stages') {
        const stLower = selectedStage.toLowerCase();
        const lStage = `${l.product_stage || ''} ${l.stage || ''}`.toLowerCase();
        if (stLower === 'mainnet live') {
          if (!lStage.includes('live') && !lStage.includes('mainnet') && l.status !== 'launched' && !lStage.includes('otc')) return false;
        } else if (stLower === 'public beta') {
          if (!lStage.includes('beta') && !lStage.includes('mvp') && !lStage.includes('testnet') && !lStage.includes('private')) return false;
        } else if (stLower === 'raising seed') {
          if (!lStage.includes('seed') && !lStage.includes('raising') && !lStage.includes('saft') && !lStage.includes('safe')) return false;
        } else if (stLower === 'pre-seed') {
          if (!lStage.includes('pre') && !lStage.includes('angel')) return false;
        }
      }

      if (selectedChain !== 'All Chains') {
        const chLower = selectedChain.toLowerCase();
        const kw = (l.target_keywords || []).map((k) => k.toLowerCase());
        const chains = (l.ecosystem_chain || []).map((c) => c.toLowerCase());
        const chainField = (l.chain || '').toLowerCase();
        const text = `${l.tagline} ${l.description}`.toLowerCase();

        const matches =
          chains.some((c) => c.includes(chLower)) ||
          chainField.includes(chLower) ||
          kw.some((k) => k.includes(chLower)) ||
          text.includes(chLower);

        if (!matches) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = l.company_name?.toLowerCase().includes(q);
        const tagMatch = l.tagline?.toLowerCase().includes(q);
        const descMatch = l.description?.toLowerCase().includes(q);
        const founderMatch = l.founder_name?.toLowerCase().includes(q);
        const catMatch = l.category?.toLowerCase().includes(q);
        const kwMatch = l.target_keywords?.some((k) => k.toLowerCase().includes(q));

        if (!nameMatch && !tagMatch && !descMatch && !founderMatch && !catMatch && !kwMatch) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...list];
    if (sortBy === 'votes') {
      sorted.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
    } else if (sortBy === 'trending') {
      sorted.sort(
        (a, b) =>
          (b.votes_count || 0) * 1.5 + (b.review_count || 0) -
          ((a.votes_count || 0) * 1.5 + (a.review_count || 0))
      );
    } else if (sortBy === 'recent') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return sorted;
  }, [launches, activeTab, selectedStage, selectedChain, searchQuery, sortBy]);

  const sponsoredIndex = Math.min(2, Math.max(0, filteredLaunches.length - 1));

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#090a0d] text-black dark:text-white font-sans flex flex-col justify-start transition-colors duration-150 selection:bg-[#3bd3fd]">

      {!isDashboard && <LiveActivityMarquee />}

      <main className="w-full max-w-5xl mx-auto px-4 py-6 sm:py-10 flex-1 flex flex-col justify-start space-y-6">

        <GridViewSelectorBar
          mainTab={mainTab}
          onBrowse={() => { setMainTab('browse'); setSearchParams({}); }}
          onMyLaunch={() => { setMainTab('my-launch'); setSearchParams({ tab: 'my-launch' }); }}
          onSubmit={() => handleProtectedAction('/dashboard/launch/submit')}
        />

        {mainTab === 'my-launch' ? (
          <MyLaunch />
        ) : (
          <>
            <HeroSection
              isDashboard={isDashboard}
              totalLaunches={launches.length}
              totalVotes={launches.reduce((sum, item) => sum + (item.votes_count || 0), 0)}
              onSubmit={() => handleProtectedAction('/dashboard/launch/submit')}
            />

            <div id="directory-board" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              <div className="lg:col-span-8 space-y-4">
                <FilterBar
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  getCategoryCount={getCategoryCount}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  showAdvancedFilters={showAdvancedFilters}
                  setShowAdvancedFilters={setShowAdvancedFilters}
                  activeFiltersCount={activeFiltersCount}
                  selectedStage={selectedStage}
                  setSelectedStage={setSelectedStage}
                  selectedChain={selectedChain}
                  setSelectedChain={setSelectedChain}
                  onReset={resetAllFilters}
                />

                <LaunchList
                  loading={loading}
                  launches={filteredLaunches}
                  votedMap={votedMap}
                  sponsoredIndex={sponsoredIndex}
                  onVote={handleVote}
                  onOpen={(slug) => navigate(`/launch/${slug}`)}
                  onReset={resetAllFilters}
                />
              </div>

              <SidebarWidgets
                onOpen={(slug) => navigate(`/launch/${slug}`)}
                onSubmit={() => handleProtectedAction('/dashboard/launch/submit')}
              />

            </div>

            <BentoRowFive onSubmit={() => handleProtectedAction('/dashboard/launch/submit')} />
            <BentoRowSix onSubmit={() => handleProtectedAction('/launch/submit')} />
          </>
        )}

      </main>
    </div>
  );
}
