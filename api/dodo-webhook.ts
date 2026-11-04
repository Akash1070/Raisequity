import crypto from 'crypto';
import { readBody } from '../src/lib/api-shared';

/**
 * Dodo Payments webhook receiver — Standard Webhooks specification.
 *
 * Headers: webhook-id, webhook-timestamp (unix seconds), webhook-signature
 * (space-separated `v1,<base64>` signatures).
 * Signed content: `${webhook-id}.${webhook-timestamp}.${rawBody}`.
 * Secret: if it starts with `whsec_`, strip the prefix and base64-decode the
 * remainder to obtain the signing key.
 *
 * Activation is atomic and idempotent (webhook-id stored in Firestore):
 *  - users/{userId}: has_active_subscription=true, subscription_status='active'
 *  - +200 subscription reward credits via a ledger entry (credit_transactions)
 *  - transactions record for audit
 *
 * Fail-closed: without FIREBASE_SERVICE_ACCOUNT_JSON (Admin SDK) the handler
 * returns 501 and grants nothing. Signature failures return 401.
 */

const CREDIT_REWARD = 200;

function safeEqual(a: Buffer, b: Buffer): boolean {
  try { return crypto.timingSafeEqual(a, b); } catch { return false; }
}

async function getRawBody(req: any): Promise<string> {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);

  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve(''));
  });
}

function verifySignature(rawBody: string, headers: any): boolean {
  const id = String(headers['webhook-id'] ?? headers['Webhook-Id'] ?? '');
  const ts = String(headers['webhook-timestamp'] ?? headers['Webhook-Timestamp'] ?? '');
  const sigHeader = String(headers['webhook-signature'] ?? headers['Webhook-Signature'] ?? '');
  if (!id || !ts || !sigHeader) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(nowSec - tsNum) > 300) return false;

  const secret = (process.env.DODO_WEBHOOK_SECRET ?? '').trim();
  if (!secret) return false;
  let key: Buffer;
  if (secret.startsWith('whsec_')) {
    key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  } else {
    key = Buffer.from(secret, 'utf8');
  }

  const signedContent = `${id}.${ts}.${rawBody}`;
  const digest = crypto.createHmac('sha256', key).update(signedContent, 'utf8').digest();
  const expected = digest.toString('base64');

  return sigHeader.split(' ').some((part) => {
    const m = /^v1,(.+)$/.exec(part.trim());
    if (!m) return false;
    let provided: Buffer;
    try { provided = Buffer.from(m[1], 'base64'); } catch { return false; }
    return safeEqual(provided, Buffer.from(expected, 'base64'));
  });
}

function parseServiceAccount(raw: string) {
  let cleaned = raw.trim();
  if (!cleaned.startsWith('{')) {
    try {
      cleaned = Buffer.from(cleaned, 'base64').toString('utf8');
    } catch {
      // not base64, continue
    }
  }
  const parsed = JSON.parse(cleaned);
  if (parsed.private_key && typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  return parsed;
}

async function getAdmin() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  // Deferred require so the package is only needed in production envs.
  const admin = await import('firebase-admin');
  if (!admin.apps?.length) {
    const cert = parseServiceAccount(json);
    admin.initializeApp({
      credential: admin.credential.cert(cert),
    });
  }
  return admin;
}

async function activateSubscription(admin: any, userId: string, paymentId: string, metadata: any) {
  const db = admin.firestore();
  const webhookEventId = String(metadata?.webhookId ?? '');
  const userRef = db.doc(`users/${userId}`);

  await db.runTransaction(async (tx: any) => {
    const snap = await tx.get(userRef);
    if (!snap.exists) throw new Error('user_not_found');

    // Idempotent ledger key: one reward per payment.
    const ledgerId = `tx_dodo_${paymentId}`;
    const ledgerRef = db.doc(`credit_transactions/${ledgerId}`);
    const existing = await tx.get(ledgerRef);
    if (existing.exists) return; // already credited

    const currentBalance = Number(snap.data().credit_balance || snap.data().credits || 0);
    const newBalance = currentBalance + CREDIT_REWARD;

    tx.update(userRef, {
      has_active_subscription: true,
      subscription_status: 'active',
      credit_balance: newBalance,
      credits: newBalance,
      last_dodo_payment_id: paymentId,
      subscription_updated_at: new Date().toISOString(),
    });

    // Also sync founder_profiles if the document exists
    const founderRef = db.doc(`founder_profiles/${userId}`);
    const founderSnap = await tx.get(founderRef);
    if (founderSnap.exists) {
      tx.update(founderRef, {
        credits: newBalance,
        plan: 'pro',
        updated_at: new Date().toISOString(),
      });
    }

    tx.set(ledgerRef, {
      userId,
      type: 'earn',
      source: 'subscription_reward',
      amount: CREDIT_REWARD,
      balanceAfter: newBalance,
      timestamp: new Date().toISOString(),
      metadata: { paymentId, packageId: metadata.packageId, webhookEventId },
    });

    // Paid directory listing: record the entitlement so the team can list
    // the founder's product in the Substack + directory audience.
    const isDirectoryOrLaunch = metadata.packageId === 'directory_listing' || String(metadata.packageId || '').startsWith('launch_');
    if (isDirectoryOrLaunch) {
      const dirRef = db.doc(`directory_listings/${userId}`);
      tx.set(dirRef, {
        userId,
        paymentId,
        packageId: metadata.packageId || 'directory_listing',
        amountUsd: Number(metadata.amountUsd) || 20,
        paidAt: new Date().toISOString(),
        status: 'paid',
        webhookEventId,
      }, { merge: true });
      tx.update(userRef, { directory_listing_paid: true, last_directory_listing_payment_id: paymentId });
    }

    tx.set(db.doc(`transactions/${paymentId}`), {
      userId,
      type: isDirectoryOrLaunch ? 'directory_listing' : 'subscription',
      amount: Number(metadata?.amountUsd) || 20,
      currency: 'USD',
      platform_fee_pct: 0,
      status: 'completed',
      collectionMethod: 'dodo',
      dodoPaymentId: paymentId,
      createdAt: new Date().toISOString(),
    });
  });

  // Record idempotency marker for the raw webhook delivery.
  if (webhookEventId) {
    await db.doc(`webhook_events/${webhookEventId}`).set({
      processedAt: new Date().toISOString(),
      userId,
      paymentId,
      handled: true,
    }).catch(() => {});
  }
  return { userId, balanceDelta: CREDIT_REWARD };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!process.env.DODO_WEBHOOK_SECRET) return res.status(501).json({ error: 'webhook_secret_not_configured' });
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return res.status(501).json({ error: 'firebase_admin_not_configured' });

  // Read raw body (handles string, Buffer, stream, or parsed object fallback)
  const rawBody = await getRawBody(req);
  if (!rawBody) {
    return res.status(400).json({ error: 'empty_body' });
  }

  if (!verifySignature(rawBody, req.headers)) {
    return res.status(401).json({ error: 'invalid_signature' });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'invalid_json' });
  }

  const webhookId = String(req.headers['webhook-id'] ?? req.headers['Webhook-Id'] ?? '');
  const type = String(body.type ?? '');
  const data = body.data ?? {};

  // Let Dodo know we received it; processing is async but awaited here for
  // deterministic ordering — Vercel allows up to 30s for webhook handlers.
  try {
    const admin = await getAdmin();
    if (!admin) return res.status(501).json({ error: 'firebase_admin_not_configured' });

    // Skip already-processed events.
    if (webhookId) {
      const db = admin.firestore();
      const seen = await db.doc(`webhook_events/${webhookId}`).get().catch(() => null);
      if (seen?.exists) return res.status(200).json({ received: true, duplicate: true });
    }

    // Extract userId from any metadata surface Dodo returns.
    const meta = data.metadata ?? data.checkout?.metadata ?? data.customer?.metadata ?? data.payment?.metadata ?? {};
    const userId = String(meta.userId ?? '');
    const paymentId = String(data.payment_id ?? data.id ?? data.checkout_id ?? webhookId);

    if (type === 'payment.succeeded' || type === 'subscription.active' || type === 'subscription.updated' || type === 'checkout.completed') {
      if (!userId) {
        return res.status(200).json({ received: true, ignored: 'no_user_metadata' });
      }
      const result = await activateSubscription(admin, userId, paymentId || webhookId, {
        ...meta,
        webhookId,
      });
      return res.status(200).json({ received: true, ...result });
    }

    // Acknowledge all other events without action.
    return res.status(200).json({ received: true, type });
  } catch (err: any) {
    console.error('[DodoWebhook] processing error:', err);
    // Return non-2xx so Dodo retries.
    return res.status(500).json({ error: 'processing_failed' });
  }
}
