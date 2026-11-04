import { generateLlmsTxt } from '../src/lib/md/llms';
import { generateLlmsFullTxt } from '../src/lib/md/llms-full';
import { generateAiTxt } from '../src/lib/md/ai-txt';

/**
 * Single serverless function serving the three public AI/LLM manifests:
 *   /llms.txt      -> doc=llms
 *   /llms-full.txt -> doc=llms-full
 *   /ai.txt        -> doc=ai
 * (rewritten here from /api/manifests?doc=...)
 */
const DOCS: Record<string, { gen: () => Promise<string> | string; maxAge: string }> = {
  llms: { gen: generateLlmsTxt, maxAge: 'public, s-maxage=3600, stale-while-revalidate=86400' },
  'llms-full': { gen: generateLlmsFullTxt, maxAge: 'public, s-maxage=86400, stale-while-revalidate=604800' },
  ai: { gen: generateAiTxt, maxAge: 'public, s-maxage=3600, stale-while-revalidate=86400' },
};

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.end();
    return;
  }

  const doc = String(req.query?.doc || '').replace(/\.txt$/, '');
  const def = DOCS[doc];
  if (!def) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not found');
    return;
  }

  try {
    const content = await def.gen();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', def.maxAge);
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(content);
  } catch (err: any) {
    console.error('[API /api/manifests Error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('# Error generating manifest');
  }
}
