import { SITE_CONFIG } from './siteConfig';
import { renderHeader, renderTable, renderRelated, renderBulletList, cleanMarkdown, estimateTokens, toAbsoluteUrl } from './format';
import { getPublicLaunches, getLaunchBySlug } from '../launches';
import { getPublishedPosts } from '../content';
import { getInvestorProfile } from '../investors';
import { projects } from '../../data/projects';
import { EXPERTS, EXPERT_CATEGORIES } from '../../data/experts';

export interface RouteMeta {
  path: string;
  title: string;
  summary: string;
  lastUpdated?: string;
  category: 'core' | 'docs' | 'directory' | 'blog' | 'legal';
  includeInLlmsFull: boolean;
}

export interface RenderResult {
  markdown: string;
  canonicalUrl: string;
  tokens: number;
  status: number;
  lastUpdated?: string;
  title: string;
  summary: string;
}

export type RouteRenderer = (params: Record<string, string>) => Promise<RenderResult | null>;

/**
 * 404 Markdown response generator
 */
export function render404(path: string, reason = 'Page not found or private.'): RenderResult {
  const canonicalUrl = toAbsoluteUrl(path);
  const markdown = cleanMarkdown(`
# 404 - Not Found

> The requested page does not exist or requires authentication.

Canonical: ${canonicalUrl}
Status: 404

## Information
- Reason: ${reason}
- If you are an AI agent, refer to [/llms.txt](${SITE_CONFIG.url}/llms.txt) for indexable public documentation.
- Browse public deal flow at [Launch Directory](${SITE_CONFIG.url}/launch).
- Explore platform capabilities at [For Founders](${SITE_CONFIG.url}/founders) and [For Investors](${SITE_CONFIG.url}/investors).
`);

  return {
    markdown,
    canonicalUrl,
    tokens: estimateTokens(markdown),
    status: 404,
    title: '404 - Not Found',
    summary: reason,
  };
}

// ============================================================================
// STATIC PAGE RENDERERS
// ============================================================================

async function renderHome(): Promise<RenderResult> {
  const sampleDeals = projects.slice(0, 5).map(p => [
    p.name,
    p.sector,
    p.stage,
    p.raiseRange || 'Undisclosed',
    p.fundingDetails?.raised ? `$${p.fundingDetails.raised}` : '$0',
  ]);

  const body = [
    renderHeader(
      'Raisequity - Bridging the Web2 & Web3 Funding Gap',
      'The highest-signal aggregator of pre-seed and seed resources, matching high-potential Web2 & Web3 founders (AI, SaaS, FinTech, Crypto) with elite capital, credits, and community scouts.',
      '/'
    ),
    '## Platform Overview',
    SITE_CONFIG.description,
    '',
    '## The Three Ecosystem Pillars',
    '- **Founders**: Pre-seed and Seed Web2 and Web3 startups (AI, SaaS, FinTech, Crypto, DevTools) looking for funding, launch support, and warm introductions to active investors. Receive up to $125k+ in free infrastructure credits, 1-on-1 coaching, and an algorithmic raise-readiness score.',
    '- **Investors**: Venture Capitalists, Angels, Family Offices, and Syndicates seeking curated deal flow. Receive pre-screened founders, 100% verified traction metrics, and zero-spam double-blind facilitation.',
    '- **Service Providers & Scouts**: Verified ecosystem agencies, cloud providers, legal advisors, smart contract auditors, and community scouts earning reputation and carry for sourcing institutional startups.',
    '',
    '## Featured Deal Flow Sample',
    renderTable(['Project Name', 'Sector', 'Stage', 'Funding Goal', 'Funds Raised'], sampleDeals),
    '',
    '## Core Values',
    renderBulletList([
      '**Curated & High Signal**: Every founder undergoes structured pre-screening and algorithmic scoring.',
      '**Double Opt-In Privacy**: Contact information is masked until both parties consent to connect.',
      '**Value Creation**: Over $125k in partner credits (AWS Startups, Google Cloud, Alchemy, Stripe), ecosystem grants, and expert coaching.',
    ]),
    '',
    renderRelated([
      { title: 'For Founders', url: '/founders', description: 'Fundraising tools, pitch blurbs, and match scoring' },
      { title: 'For Investors', url: '/investors', description: 'Zero-spam thesis-driven deal flow' },
      { title: 'For Service Providers', url: '/service-providers', description: 'Partner network & lead handoffs' },
      { title: 'Product Launch Directory', url: '/launch', description: 'Weekly curated Web2 & Web3 launches' },
      { title: 'Ecosystem Blog', url: '/blog', description: 'Venture insights & funding announcements' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl('/'),
    tokens: estimateTokens(body),
    status: 200,
    title: 'Raisequity - Bridging the Web2 & Web3 Funding Gap',
    summary: SITE_CONFIG.shortDescription,
  };
}

async function renderFounders(): Promise<RenderResult> {
  const body = [
    renderHeader(
      'For Web2 & Web3 Founders - Zero-Cold Outreach Fundraising',
      'Connect with active check-writers, access $125K+ in infrastructure credits, and get vetted investor introductions with 0 spam.',
      '/founders'
    ),
    '## Why Raisequity for Founders',
    'Founders waste hundreds of hours sending cold DMs and generic emails that end up in spam. Raisequity operates a double-blind facilitation marketplace where your startup is algorithmically matched to active check-writers whose saved thesis, ticket size, and sector focus match your exact round across both Web2 (AI, SaaS, FinTech, B2B) and Web3.',
    '',
    '## Key Founder Features',
    renderBulletList([
      '**Algorithmic Match Scoring**: Evaluated across 6 dimensions: Sector alignment (30 pts), Stage fit (20 pts), Check-size compatibility (20 pts), Geography (10 pts), Thesis keywords (10 pts), and Profile quality (10 pts).',
      '**Raise Readiness Index (100-pt Checklist)**: Complete your pitch deck, financials, and traction signals to earn up to a 1.25x match multiplier in investor deal feeds.',
      '**1-Click Forwardable Blurb**: Auto-assembled 60-word high-conviction pitch blurb ready for investor forwards without manual rewriting.',
      '**$125K+ Free Founder Credits**: Immediate access to AWS Startups ($100k), Google Cloud ($200k), Alchemy ($25k), and Stripe fee waivers.',
      '**1st Deal Success Fee Waived**: All trial founders get their first facilitation success fee waived upon closing their round.',
    ]),
    '',
    '## Partner Capital Sample',
    renderTable(
      ['Firm', 'Type', 'Sectors', 'Match Fit'],
      [
        ['Polychain Capital', 'Venture Capital', 'DeFi • Infrastructure • L1/L2', '4.9 / 5.0'],
        ['Dragonfly Capital', 'Venture Capital', 'AI x Crypto • Consumer • Gaming', '4.8 / 5.0'],
        ['Pantera Capital', 'Venture Capital', 'RWA • Fintech • SocialFi', '4.7 / 5.0'],
      ]
    ),
    '',
    renderRelated([
      { title: 'Launch Your Product', url: '/launch/submit', description: 'Submit your product to the Raisequity directory' },
      { title: 'Browse Investor Thesis', url: '/investors', description: 'How investors evaluate deal memos' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl('/founders'),
    tokens: estimateTokens(body),
    status: 200,
    title: 'For Web3 Founders - Raisequity',
    summary: 'Zero-cold outreach fundraising and algorithmic investor matching for Web3 founders.',
  };
}

async function renderInvestors(): Promise<RenderResult> {
  const body = [
    renderHeader(
      'For Web2 & Web3 Investors - High-Conviction, Zero-Spam Dealflow',
      'Deploy capital into vetted pre-seed and seed startups across AI, SaaS, FinTech, and Web3 matching your exact thesis, ticket size, and sector criteria.',
      '/investors'
    ),
    '## The Problem with Modern Deal Sourcing',
    'Investors receive hundreds of unvetted pitch decks, cold Telegram DMs, and irrelevant decks that waste partner bandwidth. Raisequity filters and qualifies founders beforehand.',
    '',
    '## Core Investor Capabilities',
    renderBulletList([
      '**Zero Noise, 100% Verified Deals**: Every listed startup comes with verified traction metrics, code integrity, and parsed round size.',
      '**Double-Blind Facilitation**: Contact details are protected until you explicitly accept an intro request.',
      '**1-Click Pass with Reason**: Quickly decline off-thesis deals with constructive feedback ("Too early", "Check size mismatch", "Cap table crowded") which suppresses the startup and continuously refines your deal feed.',
      '**Quiet Mode**: Conceal your profile from public directory search while maintaining active connection feeds with high-fit founders.',
      '**Syndicate Co-Investing**: Share due diligence memos with top-tier tech & crypto funds and fill funding allocations seamlessly.',
    ]),
    '',
    '## Capital Classes Supported',
    renderTable(
      ['Capital Class', 'Check Size Range', 'Focus'],
      [
        ['Venture Capital & Family Offices', '$100k - $2M+', 'Lead or follow-on equity / SAFE / SAFT seed rounds'],
        ['Ecosystem & Developer Grants', '$10k - $250k', 'Non-dilutive ecosystem grants for open-source & dev tooling'],
        ['Angel Syndicates', '$5k - $50k', 'Fast-moving operator checks and strategic advice'],
      ]
    ),
    '',
    renderRelated([
      { title: 'Explore Launch Directory', url: '/launch', description: 'Publicly active early-stage products' },
      { title: 'Platform Terms & Model', url: '/terms', description: 'Raisequity facilitation fee structure' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl('/investors'),
    tokens: estimateTokens(body),
    status: 200,
    title: 'For Web2 & Web3 Investors - Raisequity',
    summary: 'High-conviction, zero-noise dealflow matching your exact investment thesis.',
  };
}

async function renderServiceProviders(): Promise<RenderResult> {
  const categories = [
    ['Smart Contract Audits', 'CertiK, Halborn, Trail of Bits, Formal Verification'],
    ['Market Making & Liquidity', 'Liquidity Provision, Algorithmic Trading, DEX/CEX Spread'],
    ['Web3 Legal, Tax & Entity Setup', 'Tokenomics Legal, Cayman/BVI Foundations, SAFT / SAFE'],
    ['Web3 Talent & Recruitment', 'Solidity/Rust Engineers, CTO Hiring, Headhunting'],
    ['Cloud & Infrastructure', 'AWS Credits, Google Cloud, Alchemy Nodes, QuickNode'],
  ];

  const body = [
    renderHeader(
      'For Service Providers & Scouts - Raisequity Partner Network',
      'Distribute perks, receive pre-qualified founder handoffs, and earn verified partner reputation across the Web3 ecosystem.',
      '/service-providers'
    ),
    '## Partner Opportunities',
    renderBulletList([
      '**Distribute Perks & Credits**: Grant cloud credits, audit discounts, and developer passes directly to high-growth Web3 founders.',
      '**Direct Founder Handoffs**: Receive pre-screened inbound requests for smart contract audits, token listings, recruiting, and legal setup.',
      '**Verified Ecosystem Partner Badge**: Stand out with verified credentials and founder recommendation ratings.',
    ]),
    '',
    '## Key Service Categories',
    renderTable(['Category', 'Specialties & Focus'], categories),
    '',
    renderRelated([
      { title: 'For Founders', url: '/founders', description: 'How founders access service credits' },
      { title: 'Homepage', url: '/', description: 'Return to Raisequity platform home' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl('/service-providers'),
    tokens: estimateTokens(body),
    status: 200,
    title: 'For Service Providers - Raisequity',
    summary: 'Join the institutional Web3 service network and distribute founder perks.',
  };
}

async function renderLaunchDirectory(): Promise<RenderResult> {
  const launches = await getPublicLaunches(undefined, 'votes');
  const launchRows = launches.slice(0, 15).map(l => [
    `[${l.company_name}](${toAbsoluteUrl(`/launch/${l.slug}`)})`,
    l.category,
    l.launch_tier.toUpperCase(),
    `${l.votes_count} votes`,
    l.tagline,
  ]);

  const body = [
    renderHeader(
      'Raisequity Launch - Web3 Product Launchpad & Directory',
      'Discover the most innovative early-stage Web3 products, DeFi protocols, AI agents, and developer tooling.',
      '/launch'
    ),
    '## Weekly Launch Cycle',
    'Raisequity runs a competitive weekly launch directory where verified products earn upvotes, community feedback, and investor visibility.',
    '',
    '## Active Verified Launches',
    renderTable(['Product', 'Category', 'Tier', 'Tally', 'Tagline'], launchRows),
    '',
    '## How to Launch',
    'Founders can submit their product at [/launch/submit](' + SITE_CONFIG.url + '/launch/submit). Embed the official verification badge to earn `badgeVerified: true` status.',
    '',
    renderRelated([
      { title: 'Submit Your Launch', url: '/launch/submit', description: 'Free & premium launch queue submission' },
      { title: 'For Founders', url: '/founders', description: 'Fundraising tools & warm introductions' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl('/launch'),
    tokens: estimateTokens(body),
    status: 200,
    title: 'Raisequity Launch - Web3 Product Launchpad & Directory',
    summary: 'Curated weekly showcase of early-stage Web3 products, protocols, and AI tooling.',
  };
}

async function renderLaunchSubmit(): Promise<RenderResult> {
  const body = [
    renderHeader(
      'Submit Product Launch - Guidelines & Tiers',
      'Rules, formatting guidelines, and tiers for submitting your Web3 product to the Raisequity Launch Directory.',
      '/launch/submit'
    ),
    '## Submission Requirements',
    renderBulletList([
      '**Tagline**: Max 70 characters, clear value proposition, no trailing periods.',
      '**Description**: Max 600 characters describing target users, architecture, and current traction.',
      '**Website URL**: Live product or working dApp URL.',
      '**Verification Badge**: An HTML/SVG badge embed that confirms your official affiliation.',
    ]),
    '',
    '## Launch Tiers',
    renderTable(
      ['Tier', 'Cost / Credits', 'Perks'],
      [
        ['Standard', 'Free / 0 credits', 'Standard weekly queue submission with community voting'],
        ['Premium', '$29 / 20 credits', 'Queue-skip and prioritized top-of-board pinning'],
        ['Spotlight', '$79 / 50 credits', 'Target keyword optimization & featured newsletter drop'],
      ]
    ),
    '',
    renderRelated([
      { title: 'View Launch Directory', url: '/launch', description: 'Current live launch listings' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl('/launch/submit'),
    tokens: estimateTokens(body),
    status: 200,
    title: 'Submit Product Launch - Raisequity',
    summary: 'Guidelines, criteria, and tiers for launching your product on Raisequity.',
  };
}

async function renderBlogIndex(): Promise<RenderResult> {
  const posts = await getPublishedPosts();
  const postRows = posts.map(p => [
    `[${p.title}](${toAbsoluteUrl(`/blog/${p.slug}`)})`,
    p.type.toUpperCase(),
    p.publishedAt.split('T')[0],
    p.summary,
  ]);

  const body = [
    renderHeader(
      'Raisequity Ecosystem Blog & Venture Insights',
      'Official announcements, Web3 funding trends, and founder resources published directly by Raisequity partners.',
      '/blog'
    ),
    '## Latest Articles & Announcements',
    postRows.length ? renderTable(['Title', 'Type', 'Published', 'Summary'], postRows) : 'No articles published yet.',
    '',
    renderRelated([
      { title: 'Homepage', url: '/', description: 'Return to platform home' },
      { title: 'For Founders', url: '/founders', description: 'Founder guides and tools' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl('/blog'),
    tokens: estimateTokens(body),
    status: 200,
    title: 'Raisequity Ecosystem Blog & News',
    summary: 'Web3 venture insights, founder resources, and funding trend reports.',
  };
}

async function renderTerms(): Promise<RenderResult> {
  const body = [
    renderHeader(
      'Raisequity Terms of Service & Facilitation Agreement',
      'Legal terms governing platform usage, matchmaking facilitation, success fee models, and user obligations.',
      '/terms'
    ),
    '## 1. Introduction and Scope',
    'These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "Founder", "Investor") and the Raisequity Foundation ("Raisequity", "we", "us"). By accessing https://raisequity.com or utilizing our matching facilitation services, you agree to comply with these terms.',
    '',
    '## 2. Matchmaking & Facilitation Fee Model',
    renderBulletList([
      '**Success Fee**: Raisequity charges a 5% Facilitation Success Fee calculated on capital successfully closed through platform-facilitated introductions.',
      '**First Deal Fee Waiver**: Verified trial founders receive a 100% waiver of the facilitation success fee on their first successfully closed round through the platform.',
      '**Double Opt-In Integrity**: Neither party is bound until an introduction request is mutually approved.',
    ]),
    '',
    '## 3. Contact Protection & Anti-Circumvention',
    'Founders and investors agree not to circumvent the Raisequity facilitation platform to avoid fees. All investor contact details unlocked via credits remain strictly confidential and protected under mutual non-disclosure.',
    '',
    '## 4. Contact Information',
    `For legal inquiries or agreement execution: ${SITE_CONFIG.email}`,
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl('/terms'),
    tokens: estimateTokens(body),
    status: 200,
    title: 'Terms of Service - Raisequity',
    summary: 'Platform facilitation terms, 5% fee model, and anti-circumvention obligations.',
  };
}

async function renderPrivacy(): Promise<RenderResult> {
  const body = [
    renderHeader(
      'Raisequity Privacy Policy & Data Protection Statement',
      'How Raisequity safeguards founder pitch data, investor theses, contact masking, and encrypted storage.',
      '/privacy'
    ),
    '## 1. Information We Collect',
    'We collect company profiles, pitch deck metadata, funding parameters, and user contact details strictly to facilitate investment matching.',
    '',
    '## 2. Double-Blind Masking & Zero-Spam Architecture',
    renderBulletList([
      '**Contact Masking**: Investor emails and Telegram handles are completely masked in the public directory and stored in server-protected private subcollections.',
      '**Double-Blind Handshake**: Founders cannot spam investors directly; introductions are reviewed and require mutual opt-in before contact information is revealed.',
      '**Quiet Mode**: Investors have full control to toggle quiet mode, removing themselves from search directories while retaining curated deal flow access.',
    ]),
    '',
    '## 3. AI & Data Usage Policy',
    renderBulletList(SITE_CONFIG.aiPolicy.permissions.concat(SITE_CONFIG.aiPolicy.restrictions)),
    '',
    '## 4. Contact Us',
    `Privacy officer: ${SITE_CONFIG.founderEmail}`,
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl('/privacy'),
    tokens: estimateTokens(body),
    status: 200,
    title: 'Privacy Policy - Raisequity',
    summary: 'Data protection standards, contact masking, and double-blind facilitation privacy.',
  };
}

// ============================================================================
// DYNAMIC PATTERN RENDERERS
// ============================================================================

async function renderLaunchDetail(slug: string): Promise<RenderResult | null> {
  const launch = await getLaunchBySlug(slug);
  if (!launch) return null;

  const body = [
    renderHeader(
      `${launch.company_name} - ${launch.tagline}`,
      launch.description,
      `/launch/${launch.slug}`,
      launch.created_at ? launch.created_at.split('T')[0] : undefined
    ),
    '## Product Overview',
    launch.description,
    '',
    '## Product Metrics & Details',
    renderTable(
      ['Attribute', 'Value'],
      [
        ['Company Name', launch.company_name],
        ['Category', launch.category],
        ['Launch Tier', launch.launch_tier.toUpperCase()],
        ['Community Upvotes', String(launch.votes_count)],
        ['Verification Status', launch.badgeVerified ? 'Verified Badge Active' : 'Pending Verification'],
        ['Website', `[Visit Website](${launch.website_url})`],
        ['Twitter', launch.twitter_handle ? `@${launch.twitter_handle}` : 'Not provided'],
        ['Founder / Maker', launch.founder_name],
      ]
    ),
    '',
    launch.maker_comment ? `## Maker Comment\n> "${launch.maker_comment}"\n` : '',
    renderRelated([
      { title: 'All Launches', url: '/launch', description: 'Browse all active Web3 launches' },
      { title: 'Submit Your Product', url: '/launch/submit', description: 'Launch your product on Raisequity' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl(`/launch/${launch.slug}`),
    tokens: estimateTokens(body),
    status: 200,
    title: `${launch.company_name} - ${launch.tagline}`,
    summary: launch.description,
    lastUpdated: launch.created_at ? launch.created_at.split('T')[0] : undefined,
  };
}

async function renderBlogDetail(slug: string): Promise<RenderResult | null> {
  const posts = await getPublishedPosts();
  const post = posts.find(p => p.slug === slug);
  if (!post) return null;

  const body = [
    renderHeader(
      post.title,
      post.summary,
      `/blog/${post.slug}`,
      post.publishedAt ? post.publishedAt.split('T')[0] : undefined
    ),
    `**Author:** ${post.authorName}  `,
    `**Category:** ${post.type.toUpperCase()}  `,
    `**Published:** ${post.publishedAt.split('T')[0]}  `,
    '',
    '---',
    '',
    post.body,
    '',
    '---',
    '',
    renderRelated([
      { title: 'Ecosystem Blog & Insights', url: '/blog', description: 'View all articles' },
      { title: 'For Founders', url: '/founders', description: 'Fundraising resources' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl(`/blog/${post.slug}`),
    tokens: estimateTokens(body),
    status: 200,
    title: post.title,
    summary: post.summary,
    lastUpdated: post.publishedAt ? post.publishedAt.split('T')[0] : undefined,
  };
}

async function renderInvestorTeaser(id: string): Promise<RenderResult | null> {
  const res = await getInvestorProfile(id);
  const profile = res.data;
  if (!profile || profile.quiet_mode) return null;

  const sectors = (profile.preferred_sectors || []).join(', ') || 'Web3, AI, Infrastructure';
  const stages = (profile.preferred_stages || []).join(', ') || 'Pre-Seed, Seed';

  const body = [
    renderHeader(
      `${profile.full_name} - ${profile.fund_name || 'Venture Partner'}`,
      `Verified ${profile.investor_type || 'Venture Capitalist'} specializing in ${sectors}.`,
      `/investors/teaser/${id}`
    ),
    '## Investor Profile Summary',
    renderTable(
      ['Field', 'Details'],
      [
        ['Investor Name', profile.full_name],
        ['Fund / Organization', profile.fund_name || 'Independent Syndicate'],
        ['Investor Type', (profile.investor_type || 'Venture Capital').replace('_', ' ')],
        ['Preferred Sectors', sectors],
        ['Investment Stages', stages],
        ['Typical Check Size', `$${profile.min_check_size || '25k'} - $${profile.max_check_size || '250k'}`],
        ['Verification Status', 'Verified Institutional Check-Writer'],
      ]
    ),
    '',
    '## How to Request Introduction',
    'Raisequity operates a double-blind introduction model. Authenticated founders can request an introduction directly via the Raisequity Founder Dashboard.',
    '',
    renderRelated([
      { title: 'For Founders', url: '/founders', description: 'How founder matching works' },
      { title: 'For Investors', url: '/investors', description: 'Platform capabilities for investors' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl(`/investors/teaser/${id}`),
    tokens: estimateTokens(body),
    status: 200,
    title: `${profile.full_name} - Investor Teaser`,
    summary: `Verified investor profile on Raisequity.`,
  };
}

async function renderServiceTeaser(id: string): Promise<RenderResult | null> {
  const formattedName = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const body = [
    renderHeader(
      `${formattedName} - Verified Service Partner`,
      'Specialized Web3 service provider delivering audit reports, token design, and go-to-market acceleration.',
      `/services/teaser/${id}`
    ),
    '## Partner Capabilities',
    renderBulletList([
      'Pre-negotiated discounts and credit bundles for Raisequity founders.',
      'Escrow-protected milestone proposals.',
      'Verified delivery track record and client founder recommendations.',
    ]),
    '',
    renderRelated([
      { title: 'For Service Providers', url: '/service-providers', description: 'Partner directory overview' },
      { title: 'For Founders', url: '/founders', description: 'Founder perks and partner discounts' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl(`/services/teaser/${id}`),
    tokens: estimateTokens(body),
    status: 200,
    title: `${formattedName} - Service Partner`,
    summary: 'Verified service partner on Raisequity.',
  };
}

async function renderExpertProfile(id: string): Promise<RenderResult | null> {
  const expert = EXPERTS.find(e => e.id === id);
  if (!expert) return null;

  const body = [
    renderHeader(expert.name + ' - ' + expert.title, expert.bio, `/expert/${expert.id}`),
    '## About the Advisor',
    expert.aboutMe,
    '',
    '## Core Expertise & Bringings',
    renderBulletList(expert.bringing),
    '',
    '## Areas of Advice',
    renderBulletList(expert.adviceOn),
    '',
    '## Advisory Session Rate',
    `**Rate:** $${expert.price} / hour  `,
    `**Member Rating:** ${expert.rating} / 5.0 (${expert.reviews} reviews)`,
    '',
    renderRelated([
      { title: 'For Founders', url: '/founders', description: 'Founder coaching and community' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl(`/expert/${expert.id}`),
    tokens: estimateTokens(body),
    status: 200,
    title: `${expert.name} - Advisor Profile`,
    summary: expert.bio,
  };
}

async function renderExpertCategory(categoryId: string): Promise<RenderResult | null> {
  const category = EXPERT_CATEGORIES[categoryId];
  if (!category) return null;

  const expertRows = category.experts.map(e => [
    `[${e.name}](${toAbsoluteUrl(`/expert/${e.id}`)})`,
    e.title,
    `$${e.price}/hr`,
    `${e.rating} ★`,
    `${e.sessions} sessions`,
  ]);

  const body = [
    renderHeader(
      `${category.title} Experts & Mentors`,
      `${category.tagline} ${category.description}`,
      `/experts/category/${categoryId}`
    ),
    '## Featured Mentors',
    renderTable(['Mentor Name', 'Title', 'Rate', 'Rating', 'Sessions Completed'], expertRows),
    '',
    renderRelated([
      { title: 'For Founders', url: '/founders', description: 'Founder acceleration programs' },
    ]),
  ].join('\n');

  return {
    markdown: cleanMarkdown(body),
    canonicalUrl: toAbsoluteUrl(`/experts/category/${categoryId}`),
    tokens: estimateTokens(body),
    status: 200,
    title: `${category.title} Mentors - Raisequity`,
    summary: category.tagline,
  };
}

// ============================================================================
// MAIN DISPATCHER & CATALOG LISTER
// ============================================================================

/**
 * Returns list of public routes suitable for catalogs, sitemaps, and llms.txt
 */
export async function listMarkdownRoutes(): Promise<RouteMeta[]> {
  const routes: RouteMeta[] = [
    {
      path: '/',
      title: 'Raisequity Homepage',
      summary: 'Institutional platform for Web3 founders and investors',
      category: 'core',
      includeInLlmsFull: true,
    },
    {
      path: '/founders',
      title: 'For Founders',
      summary: 'Zero-cold outreach fundraising and algorithmic matching',
      category: 'core',
      includeInLlmsFull: true,
    },
    {
      path: '/investors',
      title: 'For Investors',
      summary: 'High-conviction deal flow and AI-scored memos',
      category: 'core',
      includeInLlmsFull: true,
    },
    {
      path: '/service-providers',
      title: 'For Service Providers',
      summary: 'Partner directory, founder credits, and lead handoffs',
      category: 'core',
      includeInLlmsFull: true,
    },
    {
      path: '/launch',
      title: 'Product Launch Directory',
      summary: 'Weekly showcase of verified early-stage Web3 protocols',
      category: 'directory',
      includeInLlmsFull: true,
    },
    {
      path: '/launch/submit',
      title: 'Submit Launch',
      summary: 'Submission criteria, verification badge rules, and launch tiers',
      category: 'directory',
      includeInLlmsFull: true,
    },
    {
      path: '/blog',
      title: 'Ecosystem Blog & News',
      summary: 'Venture trends, funding updates, and announcements',
      category: 'blog',
      includeInLlmsFull: true,
    },
    {
      path: '/terms',
      title: 'Terms of Service',
      summary: 'Platform facilitation terms, 5% fee model, and anti-circumvention',
      category: 'legal',
      includeInLlmsFull: true,
    },
    {
      path: '/privacy',
      title: 'Privacy Policy',
      summary: 'Double-blind contact masking and encrypted data protection',
      category: 'legal',
      includeInLlmsFull: true,
    },
  ];

  // Dynamically include top launches
  try {
    const launches = await getPublicLaunches(undefined, 'votes');
    for (const l of launches.slice(0, 10)) {
      routes.push({
        path: `/launch/${l.slug}`,
        title: `${l.company_name} - ${l.tagline}`,
        summary: l.description,
        category: 'directory',
        includeInLlmsFull: true,
      });
    }
  } catch (_) {}

  // Dynamically include published blog posts
  try {
    const posts = await getPublishedPosts();
    for (const p of posts.slice(0, 5)) {
      routes.push({
        path: `/blog/${p.slug}`,
        title: p.title,
        summary: p.summary,
        category: 'blog',
        includeInLlmsFull: true,
      });
    }
  } catch (_) {}

  return routes;
}

/**
 * Renders Markdown for any addressable path
 */
export async function renderMarkdownForRoute(rawPath: string): Promise<RenderResult> {
  let clean = rawPath.trim();
  if (clean.endsWith('.md')) clean = clean.slice(0, -3);
  if (!clean.startsWith('/')) clean = `/${clean}`;
  if (clean.length > 1 && clean.endsWith('/')) clean = clean.slice(0, -1);

  // Check aliases and redirects
  if (clean === '/about') clean = '/';
  if (clean === '/scouts' || clean === '/network') clean = '/founders';
  if (clean === '/partnerships') clean = '/service-providers';
  if (clean === '/index') clean = '/';

  // Explicitly deny private / auth / admin routes
  if (
    clean.startsWith('/dashboard') ||
    clean.startsWith('/investor-dashboard') ||
    clean.startsWith('/admin') ||
    clean === '/login' ||
    clean === '/checkout' ||
    clean.startsWith('/onboarding') ||
    clean.startsWith('/investor-onboarding')
  ) {
    return render404(clean, 'This path requires authentication and is not accessible as public markdown.');
  }

  // Exact static routes
  if (clean === '/') return renderHome();
  if (clean === '/founders') return renderFounders();
  if (clean === '/investors') return renderInvestors();
  if (clean === '/service-providers') return renderServiceProviders();
  if (clean === '/launch') return renderLaunchDirectory();
  if (clean === '/launch/submit') return renderLaunchSubmit();
  if (clean === '/blog') return renderBlogIndex();
  if (clean === '/terms') return renderTerms();
  if (clean === '/privacy') return renderPrivacy();

  // Dynamic route matching
  if (clean.startsWith('/launch/')) {
    const slug = clean.replace('/launch/', '');
    const res = await renderLaunchDetail(slug);
    if (res) return res;
    return render404(clean, `Launch product "${slug}" not found.`);
  }

  if (clean.startsWith('/blog/')) {
    const slug = clean.replace('/blog/', '');
    const res = await renderBlogDetail(slug);
    if (res) return res;
    return render404(clean, `Blog post "${slug}" not found or unpublished.`);
  }

  if (clean.startsWith('/investors/teaser/')) {
    const id = clean.replace('/investors/teaser/', '');
    const res = await renderInvestorTeaser(id);
    if (res) return res;
    return render404(clean, `Investor profile "${id}" not found or operating in quiet mode.`);
  }

  if (clean.startsWith('/services/teaser/')) {
    const id = clean.replace('/services/teaser/', '');
    const res = await renderServiceTeaser(id);
    if (res) return res;
    return render404(clean, `Service partner "${id}" not found.`);
  }

  if (clean.startsWith('/expert/')) {
    const id = clean.replace('/expert/', '');
    const res = await renderExpertProfile(id);
    if (res) return res;
    return render404(clean, `Expert "${id}" not found.`);
  }

  if (clean.startsWith('/experts/category/')) {
    const id = clean.replace('/experts/category/', '');
    const res = await renderExpertCategory(id);
    if (res) return res;
    return render404(clean, `Expert category "${id}" not found.`);
  }

  return render404(clean, 'Route not recognized.');
}
