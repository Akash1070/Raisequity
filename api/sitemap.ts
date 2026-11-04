import { listMarkdownRoutes } from '../src/lib/md/registry';

/**
 * Generated XML sitemap. Serves the full static route set, and when the
 * Firebase Admin service account is configured (FIREBASE_SERVICE_ACCOUNT_JSON)
 * it also includes live launches and published blog posts. Falls back to the
 * static core set otherwise — never 500s.
 */

const SITE = 'https://raisequity.com';

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const CORE_URLS: { path: string; freq: string; priority: string }[] = [
  { path: '/', freq: 'daily', priority: '1.0' },
  { path: '/founders', freq: 'daily', priority: '0.9' },
  { path: '/investors', freq: 'daily', priority: '0.9' },
  { path: '/service-providers', freq: 'weekly', priority: '0.8' },
  { path: '/launch', freq: 'hourly', priority: '0.9' },
  { path: '/launch/submit', freq: 'weekly', priority: '0.5' },
  { path: '/blog', freq: 'daily', priority: '0.8' },
  { path: '/terms', freq: 'yearly', priority: '0.2' },
  { path: '/privacy', freq: 'yearly', priority: '0.2' },
];

async function fetchLiveRoutes(): Promise<{ path: string; freq: string; priority: string }[]> {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return [];
  try {
    const admin = await import('firebase-admin');
    if (!admin.apps?.length) {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(json)) });
    }
    const db = admin.firestore();
    const [launchSnap, blogSnap] = await Promise.all([
      db.collection('launches').where('status', '==', 'launched').limit(500).get(),
      db.collection('content_posts').limit(500).get(),
    ]);
    const out: { path: string; freq: string; priority: string }[] = [];
    launchSnap.forEach((d: any) => {
      const slug = d.data().slug;
      if (slug) out.push({ path: `/launch/${slug}`, freq: 'weekly', priority: '0.7' });
    });
    blogSnap.forEach((d: any) => {
      const slug = d.data().slug;
      if (slug) out.push({ path: `/blog/${slug}`, freq: 'weekly', priority: '0.6' });
    });
    return out;
  } catch (err) {
    console.warn('[Sitemap] live route fetch failed, using static set only:', err);
    return [];
  }
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.end();
    return;
  }

  const live = await fetchLiveRoutes();
  const urls = [...CORE_URLS, ...live];

  // Also include any markdown-registry public routes we haven't listed yet
  // (e.g. expert pages discovered dynamically) — capped for safety.
  try {
    const mdRoutes = await listMarkdownRoutes();
    const seen = new Set(urls.map((u) => u.path));
    for (const r of mdRoutes) {
      if (seen.has(r.path)) continue;
      seen.add(r.path);
      if (r.path.startsWith('/launch/') || r.path.startsWith('/blog/') || r.path.startsWith('/expert') || r.path.startsWith('/investors/teaser') || r.path.startsWith('/services/teaser')) {
        urls.push({ path: r.path, freq: 'weekly', priority: '0.6' });
      }
    }
  } catch (_) {}

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url>\n    <loc>${SITE}${xmlEscape(u.path)}</loc>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n') +
    `\n</urlset>\n`;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.end(body);
}
