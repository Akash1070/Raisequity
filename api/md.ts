import { renderMarkdownForRoute, listMarkdownRoutes } from '../src/lib/md/registry';
import { buildMarkdownResponse, prefersMarkdown } from '../src/lib/md/http';

export default async function handler(req: any, res: any) {
  const method = req.method || 'GET';

  // Support preflight OPTIONS
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.end();
    return;
  }

  // Extract path from query params, URL path, or custom header
  let path = '';
  if (req.query && req.query.path) {
    path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
  } else {
    const rawUrl = req.url || '';
    const cleanUrl = rawUrl.split('?')[0];
    if (cleanUrl.startsWith('/api/md/')) {
      path = cleanUrl.replace('/api/md/', '');
    } else if (cleanUrl.startsWith('/api/md')) {
      path = '';
    } else {
      path = cleanUrl;
    }
  }

  // Catalog endpoint (kept inside the same function to save a Lambda).
  if (path === '_catalog') {
    try {
      const routes = await listMarkdownRoutes();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (method === 'HEAD') {
        res.end();
        return;
      }
      res.end(JSON.stringify({ routes, total: routes.length }));
    } catch (err: any) {
      console.error('[API /api/md/_catalog Error]:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Failed to generate markdown route catalog' }));
    }
    return;
  }

  const acceptHeader = req.headers ? (req.headers['accept'] || req.headers['Accept']) : null;
  const isNegotiated = prefersMarkdown(acceptHeader);

  try {
    const renderResult = await renderMarkdownForRoute(path);
    const httpResponse = buildMarkdownResponse(renderResult, {
      isNegotiated,
      method,
    });

    res.statusCode = httpResponse.statusCode;
    for (const [k, v] of Object.entries(httpResponse.headers)) {
      res.setHeader(k, v);
    }

    if (method === 'HEAD') {
      res.end();
      return;
    }

    res.end(httpResponse.body);
  } catch (err: any) {
    console.error('[API /api/md Error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.end('# 500 Internal Server Error\n\nFailed to render markdown representation.');
  }
}

