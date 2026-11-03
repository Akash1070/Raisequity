import { SITE_CONFIG } from './siteConfig';
import { cleanMarkdown } from './format';

/**
 * Generates ai.txt conforming to the ai-visibility.org.uk v1.1.1 specification
 */
export function generateAiTxt(): string {
  const dateStr = new Date().toISOString().split('T')[0];

  const text = `
# ai.txt - Machine Usage & Crawler Visibility Policy
# Conforming to ai-visibility.org.uk specification v1.1.1
# Keep in sync with /robots.txt and /llms.txt

[identity]
name: ${SITE_CONFIG.name}
legal_name: ${SITE_CONFIG.legalName}
url: ${SITE_CONFIG.url}
description: ${SITE_CONFIG.description}
contact: ${SITE_CONFIG.email}

[permissions]
summarise: allowed
quote: allowed (with clear attribution and canonical link)
cite: allowed
search_indexing: allowed
rag_retrieval: allowed

[restrictions]
commercial_training_on_private_data: prohibited
fake_reviews_or_quotes: prohibited
scraping_unmasked_contacts: prohibited
misrepresenting_proprietary_scoring: prohibited

[attribution]
format: ${SITE_CONFIG.aiPolicy.attribution}

[scope]
included_paths:
  - /
  - /founders
  - /investors
  - /service-providers
  - /launch
  - /launch/*
  - /blog
  - /blog/*
  - /terms
  - /privacy
  - /expert/*
  - /experts/category/*
  - /investors/teaser/*
  - /services/teaser/*

excluded_paths:
  - /api/*
  - /admin/*
  - /dashboard/*
  - /investor-dashboard/*
  - /login
  - /onboarding
  - /investor-onboarding
  - /checkout

[contact]
email: ${SITE_CONFIG.email}
security_contact: ${SITE_CONFIG.founderEmail}
last_updated: ${dateStr}
`;

  return cleanMarkdown(text);
}

