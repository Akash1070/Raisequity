import { SITE_CONFIG } from './siteConfig';

/**
 * Ensures a path is rendered as an absolute canonical URL
 */
export function toAbsoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return SITE_CONFIG.url;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
}

/**
 * Approximates token count using the industry-standard ~4 chars per token rule
 */
export function estimateTokens(markdown: string): number {
  if (!markdown) return 0;
  return Math.ceil(markdown.length / 4);
}

/**
 * Standard Markdown Page Header
 */
export function renderHeader(title: string, summary: string, canonicalPath: string, lastUpdated?: string): string {
  const dateStr = lastUpdated || new Date().toISOString().split('T')[0];
  const canonicalUrl = toAbsoluteUrl(canonicalPath);

  return [
    `# ${title}`,
    '',
    `> ${summary}`,
    '',
    `Canonical: ${canonicalUrl}`,
    `Last updated: ${dateStr}`,
    '',
  ].join('\n');
}

/**
 * Formats a clean GitHub Flavored Markdown table
 */
export function renderTable(headers: string[], rows: (string | number)[][]): string {
  if (!headers.length || !rows.length) return '';
  const headerRow = `| ${headers.map(h => String(h).replace(/\|/g, '\\|')).join(' | ')} |`;
  const dividerRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map(row => {
    return `| ${row.map(cell => String(cell ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`;
  });

  return [headerRow, dividerRow, ...dataRows].join('\n');
}

/**
 * Formats a list of related links
 */
export function renderRelated(links: { title: string; url: string; description?: string }[]): string {
  if (!links.length) return '';
  const lines = links.map(l => {
    const desc = l.description ? ` — ${l.description}` : '';
    return `- [${l.title}](${toAbsoluteUrl(l.url)})${desc}`;
  });
  return ['## Related', ...lines].join('\n');
}

/**
 * Formats bullet list
 */
export function renderBulletList(items: string[]): string {
  return items.map(i => `- ${i}`).join('\n');
}

/**
 * Clean up extra whitespace and trailing newlines
 */
export function cleanMarkdown(markdown: string): string {
  return markdown.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

