import { rateLimit, readBody, isEmail, str, fetchWithTimeout } from './_lib';

// Creates a Dodo checkout session server-side. Activation ONLY via verified
// webhook (api/dodo-webhook.ts) — never from the browser.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!rateLimit(req, res, 10)) return;
  const key = process.env.DODO_PAYMENTS_API_KEY || process.env.VITE_DODO_PAYMENTS_API_KEY;
  const productId = process.env.DODO_SUBSCRIPTION_PRODUCT_ID || process.env.VITE_DODO_SUBSCRIPTION_PRODUCT_ID;
  if (!key || !productId) return res.status(503).json({ error: 'payments_not_configured' });
  const body = readBody(req);
  if (!body) return res.status(413).json({ error: 'invalid_or_oversized_body' });
  const userId = str(body.userId, 128); const email = body.email;
  if (!userId || !isEmail(email)) return res.status(400).json({ error: 'userId and valid email required' });
  const isLive = (process.env.DODO_PAYMENTS_ENV || process.env.VITE_DODO_PAYMENTS_ENV) === 'live';
  const base = isLive ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';
  const origin = str(req.headers.origin ?? '', 200);
  try {
    const r = await fetchWithTimeout(`${base}/checkouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email },
        metadata: { userId },
        return_url: `${origin}/dashboard/feed?checkout=return`,
      }),
    });
    if (!r.ok) return res.status(502).json({ error: 'provider_error' });
    const data = await r.json().catch(() => ({}));
    const url = data.checkout_url ?? data.url ?? null;
    if (!url) return res.status(502).json({ error: 'no_checkout_url' });
    return res.status(200).json({ checkout_url: url });
  } catch { return res.status(502).json({ error: 'provider_unreachable' }); }
}
