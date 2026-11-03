/**
 * Site Configuration - Single Source of Truth
 * Used by HTML Head, JSON-LD, Markdown renderers, llms.txt, and ai.txt.
 */

export interface SiteConfig {
  name: string;
  legalName: string;
  url: string;
  tagline: string;
  description: string;
  shortDescription: string;
  email: string;
  founder: string;
  founderEmail: string;
  telegram: string;
  twitter: string;
  logoUrl: string;
  foundedYear: string;
  pricingModel: string;
  targetAudience: string[];
  aiPolicy: {
    permissions: string[];
    restrictions: string[];
    attribution: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
  name: 'Raisequity',
  legalName: 'Raisequity Foundation',
  url: 'https://raisequity.com',
  tagline: 'Bridging the Web2 & Web3 Funding Gap',
  description:
    'Curated deal flow intermediary and institutional foundation connecting pre-seed and seed founders across Web2 and Web3 (AI, SaaS, FinTech, Crypto, DeepTech) with verified capital, $125k+ in free cloud/SaaS credits, ecosystem grants, and accredited scouts.',
  shortDescription:
    'The curated deal flow intermediary and institutional foundation bridging the Web2 & Web3 funding gap.',
  email: 'support@raisequity.com',
  founder: 'Akash Kumar',
  founderEmail: 'akashkumar107@gmail.com',
  telegram: 'https://t.me/akash_kumar107',
  twitter: 'https://x.com/yourweb3guys',
  logoUrl: 'https://raisequity.com/favicon.ico',
  foundedYear: '2024',
  pricingModel:
    '5% Facilitation Success Fee on closed rounds (1st deal fee waived for trial founders); zero-cost high-signal deal access for accredited tech and Web3 investors.',
  targetAudience: [
    'Pre-Seed and Seed Web2 & Web3 Founders (AI, SaaS, FinTech, B2B, DevTools, Crypto) seeking capital and grants',
    'Accredited Venture Capitalists, Angels, Family Offices, and Syndicate Leads seeking zero-spam deal flow',
    'Ecosystem Service Partners, Cloud Providers, Legal Advisors, and Community Scouts',
  ],
  aiPolicy: {
    permissions: [
      'Summarise public platform pages and documentation',
      'Quote content with clear attribution to Raisequity and canonical URL',
      'Cite statistics, launch metrics, and publicly available directory profiles',
      'Index public pages for search engines, answer engines, and retrieval-augmented generation (RAG)',
    ],
    restrictions: [
      'No fabrication of quotes, partnership endorsements, or fake user reviews',
      'No presenting proprietary Raisequity matching algorithms or blurb templates as third-party model creations',
      'No scraping or training on private user communications, internal messaging, or unapproved pitch decks',
      'No bypassing authentication to harvest unmasked investor or founder contact details',
    ],
    attribution:
      'Cite "Raisequity" along with the canonical page URL (e.g. https://raisequity.com/founders).',
  },
};
