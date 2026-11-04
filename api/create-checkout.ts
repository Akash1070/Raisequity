import { rateLimit, readBody, isEmail, str, fetchWithTimeout, requireAuth } from '../src/lib/api-shared';

// Creates a Dodo checkout session server-side. Activation ONLY via verified
// webhook (api/dodo-webhook.ts) — never from the browser. Requires an
// authenticated Firebase session so a checkout can never be opened for
// someone else's userId (the verified uid is used, never client-supplied).
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!rateLimit(req, res, 10)) return;
  if (!(await requireAuth(req, res))) return;
  const key = process.env.DODO_PAYMENTS_API_KEY;
  const body = readBody(req);
  if (!body) return res.status(413).json({ error: 'invalid_or_oversized_body' });

  // Product selection: packageId determines which Dodo product is charged.
  const packageId = str(body.packageId, 64) || 'pack_200_credits';
  const PRODUCTS: Record<string, string | undefined> = {
    pack_200_credits: process.env.DODO_SUBSCRIPTION_PRODUCT_ID,
    subscription: process.env.DODO_SUBSCRIPTION_PRODUCT_ID,
    directory_listing: process.env.DODO_DIRECTORY_PRODUCT_ID,
  };
  const productId = PRODUCTS[packageId] || process.env.DODO_SUBSCRIPTION_PRODUCT_ID;
  if (!key) return res.status(503).json({ error: 'payments_not_configured' });
  if (!productId) {
    return res.status(503).json({ error: `product_not_configured:${packageId}` });
  }
  const email = req.userEmail ?? body.email;
  if (!isEmail(email)) return res.status(400).json({ error: 'valid email required' });
  const isLive = process.env.DODO_PAYMENTS_ENV === 'live';
  const base = isLive ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';
  const origin = str(req.headers.origin ?? '', 200);
  const defaultReturn = packageId === 'directory_listing'
    ? `${origin}/launch?checkout=return`
    : `${origin}/dashboard/feed?checkout=return`;
  const returnUrl = (typeof body.returnUrl === 'string' && body.returnUrl.startsWith('http'))
    ? body.returnUrl
    : defaultReturn;

  try {
    const r = await fetchWithTimeout(`${base}/checkouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email },
        metadata: { 
          userId: req.uid, 
          packageId, 
          credits: Number(body.credits) || (packageId === 'directory_listing' ? 0 : 200), 
          amountUsd: Number(body.amountUsd) || (packageId === 'directory_listing' ? 20 : 20) 
        },
        return_url: returnUrl,
      }),
    });
    if (!r.ok) {
      const errData = await r.json().catch(() => ({}));
      console.error('[DodoCheckout] Provider error:', r.status, errData);
      return res.status(502).json({ error: errData.message || 'provider_error' });
    }
    const data = await r.json().catch(() => ({}));
    const url = data.checkout_url ?? data.url ?? data.payment_link ?? null;
    if (!url) return res.status(502).json({ error: 'no_checkout_url' });
    return res.status(200).json({ checkout_url: url });
  } catch (err: any) { 
    console.error('[DodoCheckout] Connection failed:', err);
    return res.status(502).json({ error: 'provider_unreachable' }); 
  }
}
