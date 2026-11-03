import { rateLimit, readBody, isEmail, str, fetchWithTimeout } from './_lib';

// Server-side only: RESEND_API_KEY (non-VITE) in Vercel env.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!rateLimit(req, res, 20)) return;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) return res.status(503).json({ error: 'email_not_configured' });
  const body = readBody(req);
  if (!body) return res.status(413).json({ error: 'invalid_or_oversized_body' });
  const to = body.to; const subject = str(body.subject, 200); const bodyText = str(body.bodyText, 10_000);
  const actionUrl = str(body.actionUrl, 500);
  if (!isEmail(to) || !subject || !bodyText) return res.status(400).json({ error: 'valid to, subject, bodyText required' });
  if (actionUrl && !actionUrl.startsWith('https://')) return res.status(400).json({ error: 'actionUrl must be https' });
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  try {
    const r = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: `Raisequity <${from}>`, to, subject,
        html: `<div style="font-family:sans-serif;padding:20px;max-width:600px"><h2>${esc(subject)}</h2><p>${esc(bodyText).replace(/\n/g, '<br/>')}</p>${actionUrl ? `<p><a href="${esc(actionUrl)}">View in Raisequity</a></p>` : ''}</div>`,
      }),
    });
    if (!r.ok) return res.status(502).json({ error: 'provider_error' });
    const data = await r.json().catch(() => ({}));
    return res.status(200).json({ id: data.id ?? null });
  } catch { return res.status(502).json({ error: 'provider_unreachable' }); }
}
