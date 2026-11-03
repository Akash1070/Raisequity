import { RenderResult } from './registry';
import { SITE_CONFIG } from './siteConfig';
import { toAbsoluteUrl } from './format';

export interface HttpResponseOptions {
  isNegotiated?: boolean;
  method?: string;
}

/**
 * Builds standard HTTP headers and body for Markdown responses
 */
export function buildMarkdownResponse(
  result: RenderResult,
  options: HttpResponseOptions = {}
): {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
} {
  const method = (options.method || 'GET').toUpperCase();
  const canonicalHtmlUrl = result.canonicalUrl;

  const headers: Record<string, string> = {
    'Content-Type': 'text/markdown; charset=utf-8',
    'X-Markdown-Tokens': String(result.tokens),
    'X-Robots-Tag': 'noindex, follow',
    'Content-Location': canonicalHtmlUrl,
    'Link': `<${canonicalHtmlUrl}>; rel="canonical", <${toAbsoluteUrl('/llms.txt')}>; rel="describedby", <${toAbsoluteUrl('/ai.txt')}>; rel="describedby"`,
    'Cache-Control': result.status === 200 
      ? 'public, s-maxage=3600, stale-while-revalidate=86400' 
      : 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
  };

  if (options.isNegotiated) {
    headers['Vary'] = 'Accept';
  }

  if (result.lastUpdated) {
    try {
      headers['Last-Modified'] = new Date(result.lastUpdated).toUTCString();
    } catch (_) {}
  }

  // Preflight OPTIONS
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // HEAD method returns headers only
  if (method === 'HEAD') {
    return {
      statusCode: result.status,
      headers,
      body: '',
    };
  }

  return {
    statusCode: result.status,
    headers,
    body: result.markdown,
  };
}

/**
 * Helper to determine if an Accept header prefers text/markdown over text/html
 */
export function prefersMarkdown(acceptHeader?: string | null): boolean {
  if (!acceptHeader || acceptHeader.trim() === '' || acceptHeader === '*/*') {
    return false;
  }

  const parts = acceptHeader.split(',').map(part => {
    const [type, ...paramList] = part.trim().split(';');
    let q = 1.0;
    for (const p of paramList) {
      const [k, v] = p.trim().split('=');
      if (k === 'q' && v) {
        const parsedQ = parseFloat(v);
        if (!isNaN(parsedQ)) q = parsedQ;
      }
    }
    return { type: type.trim().toLowerCase(), q };
  });

  const markdownPart = parts.find(p => p.type === 'text/markdown');
  const htmlPart = parts.find(p => p.type === 'text/html' || p.type === 'application/xhtml+xml');

  if (!markdownPart) return false;
  if (!htmlPart) return true; // Has markdown but no html requested

  return markdownPart.q > htmlPart.q;
}

