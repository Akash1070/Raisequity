import { SITE_CONFIG } from './siteConfig';
import { listMarkdownRoutes, renderMarkdownForRoute } from './registry';
import { toAbsoluteUrl, cleanMarkdown } from './format';

/**
 * Generates llms-full.txt concatenating all indexable pages with source references
 */
export async function generateLlmsFullTxt(): Promise<string> {
  const routes = await listMarkdownRoutes();
  const eligibleRoutes = routes.filter(r => r.includeInLlmsFull);

  const sections: string[] = [
    `# ${SITE_CONFIG.name} - Full Documentation & Content`,
    `> ${SITE_CONFIG.description}`,
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
  ];

  for (const r of eligibleRoutes) {
    try {
      const result = await renderMarkdownForRoute(r.path);
      if (result.status === 200) {
        sections.push('---');
        sections.push(`<!-- source: ${toAbsoluteUrl(r.path)} -->`);
        sections.push(result.markdown.trim());
        sections.push('');
      }
    } catch (err) {
      console.warn(`[llms-full] Error rendering route ${r.path}:`, err);
    }
  }

  const combined = cleanMarkdown(sections.join('\n'));

  // Safety check on size
  if (combined.length > 500000) {
    console.warn(`[llms-full] Warning: concatenated content is ${combined.length} characters (exceeds recommended 500k ceiling)`);
  }

  return combined;
}

