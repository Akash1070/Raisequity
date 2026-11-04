import { rateLimit, readBody, str } from '../src/lib/api-shared';

/**
 * Lightweight client-side error tracking. The SPA reports unhandled errors /
 * rejections here; we sanitize and store them in Firestore `client_errors`
 * (rate-limited, capped payload, no stack-trace leakage to the client).
 * Returns 204 silently; never exposes internal details.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!rateLimit(req, res, 60)) return;

  const body = readBody(req, 8192);
  if (!body) return res.status(413).json({ error: 'invalid_or_oversized_body' });

  const message = str(body.message, 1000);
  const source = str(body.source, 200);
  const line = Math.max(0, Number(body.line) || 0);
  const col = Math.max(0, Number(body.col) || 0);
  const url = str(body.url, 500);
  const ua = str(body.userAgent, 300);
  if (!message && !source) return res.status(204).end();

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return res.status(204).end(); // silently drop when no Admin SDK

  try {
    const admin = await import('firebase-admin');
    if (!admin.apps?.length) {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(json)) });
    }
    await admin.firestore().collection('client_errors').add({
      message,
      source,
      line,
      col,
      url,
      userAgent: ua,
      reportedAt: new Date().toISOString(),
      ip: String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim().slice(0, 64),
    });
    return res.status(204).end();
  } catch (err) {
    console.error('[ClientLog] store failed:', err);
    return res.status(204).end(); // never fail the page because of logging
  }
}
