/**
 * Edge Middleware for Content Negotiation
 * Rewrites requests with Accept: text/markdown (q > html) to /api/md?path=<path>
 */

function prefersMarkdown(acceptHeader: string | null): boolean {
  if (!acceptHeader || acceptHeader.trim() === '' || acceptHeader === '*/*') {
    return false;
  }

  const parts = acceptHeader.split(',').map(part => {
    const [type, ...params] = part.trim().split(';');
    let q = 1.0;
    for (const p of params) {
      const [k, v] = p.trim().split('=');
      if (k === 'q' && v) {
        const parsed = parseFloat(v);
        if (!isNaN(parsed)) q = parsed;
      }
    }
    return { type: type.trim().toLowerCase(), q };
  });

  const markdownPart = parts.find(p => p.type === 'text/markdown');
  const htmlPart = parts.find(p => p.type === 'text/html' || p.type === 'application/xhtml+xml');

  if (!markdownPart) return false;
  if (!htmlPart) return true;

  return markdownPart.q > htmlPart.q;
}

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Exclude static assets, api endpoints, and manifests
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/assets/') ||
    pathname === '/llms.txt' ||
    pathname === '/llms-full.txt' ||
    pathname === '/ai.txt' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.endsWith('.md') ||
    /\.(png|jpe?g|gif|svg|ico|webp|js|css|woff2?|map|json)$/i.test(pathname)
  ) {
    return;
  }

  const accept = request.headers.get('accept');
  if (prefersMarkdown(accept)) {
    url.pathname = '/api/md';
    url.searchParams.set('path', pathname);
    return Response.redirect(url, 307);
  }
}

export const config = {
  matcher: ['/((?!api|_next|assets|[\\w-]+\\.\\w+).*)'],
};

