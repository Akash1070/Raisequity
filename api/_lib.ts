// Shared guards for Vercel functions. NOTE on rate limiting: this in-memory
// bucket is per-instance best-effort only (serverless instances don't share
// memory). For launch, put Cloudflare in front (free tier WAF rate-limit
// rules on /api/*) or Upstash Redis — see DEPLOYMENT notes in final report.
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(req: any, res: any, limit = 20, windowMs = 60_000): boolean {
  const ip = String(req.headers['x-forwarded-for'] ?? 'unknown').split(',')[0].trim();
  const key = `${req.url}:${ip}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) { buckets.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (b.count >= limit) { res.status(429).json({ error: 'rate_limited' }); return false; }
  b.count++;
  return true;
}

export function readBody(req: any, maxBytes = 32_768): any | null {
  const body = req.body ?? {};
  if (typeof body === 'string') {
    if (body.length > maxBytes) return null;
    try { return JSON.parse(body); } catch { return null; }
  }
  if (JSON.stringify(body).length > maxBytes) return null;
  return body;
}

export const isEmail = (v: unknown): v is string =>
  typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const str = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.slice(0, max) : '';

export async function fetchWithTimeout(url: string, init: RequestInit, ms = 15_000): Promise<Response> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctl.signal }); } finally { clearTimeout(t); }
}

/**
 * Verify a Firebase ID token (Bearer header) using the Identity Toolkit lookup
 * endpoint. No Admin SDK / service account required. Returns the verified
 * localId or null. Fail-closed: any error or missing env returns null.
 */
export async function verifyIdToken(req: any): Promise<{ uid: string; email?: string } | null> {
  const authHeader = String(req.headers['authorization'] ?? '');
  const m = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!m) return null;
  const key = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  if (!key) return null;
  try {
    const r = await fetchWithTimeout(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: m[1] }) },
      8000,
    );
    if (!r.ok) return null;
    const data = await r.json();
    const u = data?.users?.[0];
    if (!u?.localId) return null;
    return { uid: String(u.localId), email: u.email ? String(u.email) : undefined };
  } catch { return null; }
}

/** Require a valid Firebase session: sets req.uid (or 401/503 on failure). */
export async function requireAuth(req: any, res: any): Promise<boolean> {
  const id = await verifyIdToken(req);
  if (!id) {
    const ok = Boolean(process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY);
    res.status(ok ? 401 : 503).json({ error: ok ? 'unauthorized' : 'auth_not_configured' });
    return false;
  }
  req.uid = id.uid;
  req.userEmail = id.email;
  return true;
}
