import { generateLlmsTxt } from '../src/lib/md/llms';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.end();
    return;
  }

  try {
    const content = await generateLlmsTxt();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    res.end(content);
  } catch (err: any) {
    console.error('[API /api/llms-txt Error]:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('# Error generating llms.txt');
  }
}

