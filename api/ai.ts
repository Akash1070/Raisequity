import { rateLimit, readBody, str, fetchWithTimeout, requireAuth } from './_lib';

// Server-side Gemini proxy. The browser never receives an AI key (previously
// VITE_GEMINI_API_KEY shipped in the bundle). Prompts are built HERE from a
// fixed task enum — clients cannot use this as a free-form AI proxy.
// Cost controls: auth required, per-IP rate limit, input caps,
// maxOutputTokens, timeout. Also set a hard spend cap in Google AI Studio.
const TASKS: Record<string, (b: any) => string> = {
  check_fit: (b) => `You are a venture capital analyst. Score this match 0.0-5.0 and explain in 2 paragraphs.\nBLURB: ${str(b.companyBlurb, 2000)}\nSECTOR: ${str(b.sector, 100)}\nSTAGE: ${str(b.stage, 50)}\nRAISE: ${Number(b.raiseAmount) || 0}\nINVESTOR: ${str(b.investorJson, 2000)}\nPREFS: ${str(b.investorPrefsJson, 2000)}\nReturn JSON only: {"score": 4.2, "reason_paragraph_1": "...", "reason_paragraph_2": "..."}`,
  scan_website: (b) => `You are a startup analyst. Given this website URL: "${str(b.websiteUrl, 300)}", extract: what_company_does (<=100 chars), traction_signal, opportunity_stat, why_now, team_credential. Return JSON only with those keys.`,
  score_startup: (b) => `You are a venture capital matching engine. Score this startup 0-100 for this investor thesis.\nSTARTUP: ${str(b.startupJson, 3000)}\nTHESIS: ${str(b.prefsJson, 3000)}\nReturn JSON only: {"score": 82, "reason": "...", "sectors_aligned": [], "stage_aligned": true, "check_size_aligned": true}`,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!rateLimit(req, res, 10)) return;
  if (!(await requireAuth(req, res))) return;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'ai_not_configured' });
  const body = readBody(req);
  const build = body && TASKS[String(body.task)];
  if (!body || !build) return res.status(400).json({ error: 'unknown task' });
  try {
    const r = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: build(body) }] }], generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 1024 } }) },
      20_000,
    );
    if (!r.ok) return res.status(502).json({ error: 'provider_error' });
    const data = await r.json().catch(() => ({}));
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    try { return res.status(200).json(JSON.parse(text)); }
    catch { return res.status(502).json({ error: 'bad_provider_response' }); }
  } catch { return res.status(502).json({ error: 'provider_unreachable' }); }
}
