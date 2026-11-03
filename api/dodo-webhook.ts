// Dodo webhook receiver. FAIL-CLOSED by design: until Firebase Admin is
// configured (FIREBASE_SERVICE_ACCOUNT_JSON) this returns 501 and grants
// nothing. To finish: verify the webhook signature with Dodo's signing
// secret, then with Admin SDK set users/{metadata.userId}:
//   has_active_subscription=true, subscription_status='active'
// and write the +200 credit ledger entry in the same transaction.
// Never activate subscriptions from the browser.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!process.env.DODO_WEBHOOK_SECRET) return res.status(501).json({ error: 'webhook_secret_not_configured' });
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return res.status(501).json({ error: 'firebase_admin_not_configured' });
  // TODO(owner): signature verification + Admin SDK activation (see header).
  return res.status(501).json({ error: 'webhook_handler_not_implemented' });
}
