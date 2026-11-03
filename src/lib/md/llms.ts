import { SITE_CONFIG } from './siteConfig';
import { listMarkdownRoutes } from './registry';
import { toAbsoluteUrl, cleanMarkdown } from './format';

/**
 * Generates llms.txt compliant with the llmstxt.org specification
 */
export async function generateLlmsTxt(): Promise<string> {
  const routes = await listMarkdownRoutes();

  const coreRoutes = routes.filter(r => r.category === 'core');
  const directoryRoutes = routes.filter(r => r.category === 'directory');
  const blogRoutes = routes.filter(r => r.category === 'blog');
  const legalRoutes = routes.filter(r => r.category === 'legal');

  const coreList = coreRoutes
    .map(r => {
      const mdUrl = toAbsoluteUrl(`${r.path === '/' ? '/index' : r.path}.md`);
      return `- [${r.title}](${mdUrl}): ${r.summary}`;
    })
    .join('\n');

  const directoryList = directoryRoutes
    .map(r => {
      const mdUrl = toAbsoluteUrl(`${r.path}.md`);
      return `- [${r.title}](${mdUrl}): ${r.summary}`;
    })
    .join('\n');

  const blogList = blogRoutes
    .map(r => {
      const mdUrl = toAbsoluteUrl(`${r.path}.md`);
      return `- [${r.title}](${mdUrl}): ${r.summary}`;
    })
    .join('\n');

  const legalList = legalRoutes
    .map(r => {
      const mdUrl = toAbsoluteUrl(`${r.path}.md`);
      return `- [${r.title}](${mdUrl}): ${r.summary}`;
    })
    .join('\n');

  const text = `
# ${SITE_CONFIG.name}

> ${SITE_CONFIG.description}

Raisequity was founded in ${SITE_CONFIG.foundedYear} to solve cold outreach noise in Web3 fundraising.
Pricing model: ${SITE_CONFIG.pricingModel}
Primary audience: ${SITE_CONFIG.targetAudience.join(', ')}.
Contact: ${SITE_CONFIG.email} | Founder: ${SITE_CONFIG.founder} (${SITE_CONFIG.founderEmail}).

## Core pages
${coreList}

## Product Launchpad & Directory
${directoryList}

## Venture Insights & Blog
${blogList}

## Machine-readable
- [Full concatenated content](${toAbsoluteUrl('/llms-full.txt')}): Every indexable page concatenated with source comments
- [Markdown route catalog](${toAbsoluteUrl('/api/md/_catalog')}): JSON index of all available markdown endpoints
- [XML Sitemap](${toAbsoluteUrl('/sitemap.xml')}): Standard search engine sitemap
- [AI usage policy](${toAbsoluteUrl('/ai.txt')}): ai-visibility.org.uk v1.1.1 machine policy

## Optional / Legal
${legalList}
`;

  return cleanMarkdown(text);
}

