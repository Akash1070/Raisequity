import { rateLimit, readBody, isEmail, str, fetchWithTimeout } from './_lib';

// Server-side OpenSign proxy — OPENSIGN_API_KEY stays off the client.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!rateLimit(req, res, 10)) return;
  const key = process.env.OPENSIGN_API_KEY;
  const templateId = process.env.OPENSIGN_TEMPLATE_ID;
  const base = process.env.OPENSIGN_BASE_URL ?? 'https://api.opensignlabs.com/v1';
  if (!key || !templateId) return res.status(503).json({ error: 'esign_not_configured' });
  const body = readBody(req);
  if (!body) return res.status(413).json({ error: 'invalid_or_oversized_body' });
  const founderEmail = body.founderEmail; const founderName = str(body.founderName, 120);
  if (!isEmail(founderEmail) || !founderName) return res.status(400).json({ error: 'valid founderEmail and founderName required' });
  try {
    const r = await fetchWithTimeout(`${base}/templates/${templateId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({
        signers: [{ email: founderEmail, name: founderName, role: 'Founder' }],
        merge_fields: { founder_name: founderName, investor_name: str(body.investorName, 120), deal_reference: str(body.dealRef, 120), date: new Date().toLocaleDateString() },
      }),
    });
    if (!r.ok) return res.status(502).json({ error: 'provider_error' });
    const data = await r.json().catch(() => ({}));
    return res.status(200).json({ documentId: data.documentId ?? data.id, signingUrl: data.signingUrl });
  } catch { return res.status(502).json({ error: 'provider_unreachable' }); }
}
