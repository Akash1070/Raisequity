import { rateLimit, readBody, str, requireAuth } from '../src/lib/api-shared';

/**
 * Server-authoritative credit ledger.
 *
 * WHY: Firestore rules previously allowed a user to self-write
 * `users.{uid}.credit_balance`, so on an open-source codebase anyone could
 * mint unlimited credits. This endpoint is the ONLY place balances can
 * change (besides the Dodo webhook). The client library functions in
 * src/lib/credits.ts call this endpoint with a verified Firebase ID token.
 *
 * Earn is restricted to server-verifiable events:
 *   - referral: proof.contactId must reference a real
 *     founder_investor_contacts doc owned by the caller, not yet rewarded.
 *   - package_purchase: only when VITE_ENABLE_DEMO_TOPUP=true (sandbox).
 * Spend is capped per action (SPEND_CAPS) and always checked against the
 * current balance inside a Firestore transaction.
 */

const SPEND_CAPS: Record<string, number> = {
  extra_intro: 5,
  boosted_bid: 10,
  feed_post: 1,
  diligence_call: 25,
  contact_unlock: 1,
  warm_intro_request: 160,
  launch_tier: 390,
  success_fee_offset: 5000,
  promoted_dealflow: 20,
  directory_featured: 50,
};

const EARN_MAX = 500;

async function getAdmin() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return null;
  const admin = await import('firebase-admin');
  if (!admin.apps?.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(json)) });
  }
  return admin;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!rateLimit(req, res, 30)) return;
  if (!(await requireAuth(req, res))) return;

  const admin = await getAdmin();
  if (!admin) return res.status(503).json({ error: 'credits_service_not_configured' });

  const body = readBody(req);
  if (!body) return res.status(413).json({ error: 'invalid_or_oversized_body' });

  const action = str(body.action, 16);
  const source = str(body.source, 48);
  const amount = Number(body.amount);
  if ((action !== 'earn' && action !== 'spend') || !source || !Number.isInteger(amount) || amount <= 0 || amount > 10000) {
    return res.status(400).json({ error: 'invalid_request' });
  }
  const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};
  const uid = req.uid;
  const db = admin.firestore();
  const userRef = db.doc(`users/${uid}`);

  try {
    if (action === 'earn') {
      if (amount > EARN_MAX) return res.status(400).json({ error: 'amount_exceeds_max' });

      if (source === 'package_purchase') {
        if (process.env.VITE_ENABLE_DEMO_TOPUP !== 'true') {
          return res.status(403).json({ error: 'earn_source_forbidden' });
        }
      } else if (source === 'referral') {
        const contactId = str(metadata?.proof?.contactId, 128);
        if (!contactId) return res.status(400).json({ error: 'proof_required' });
        const contactSnap = await db.doc(`founder_investor_contacts/${contactId}`).get().catch(() => null);
        if (!contactSnap?.exists) return res.status(400).json({ error: 'proof_invalid' });
        if (contactSnap.data().founder_id !== uid) return res.status(403).json({ error: 'proof_not_owned' });
        if (contactSnap.data().rewarded_at) return res.status(409).json({ error: 'already_rewarded' });
      } else {
        // Only verified earn sources are accepted from clients.
        return res.status(403).json({ error: 'earn_source_forbidden' });
      }

      const claimId = source === 'referral'
        ? `tx_claim_${uid}_referral_${str(metadata?.proof?.contactId, 128)}`
        : null;

      const result = await db.runTransaction(async (tx: any) => {
        if (claimId) {
          const claimRef = db.doc(`credit_transactions/${claimId}`);
          const claimSnap = await tx.get(claimRef);
          if (claimSnap.exists) throw new Error('already_rewarded');
        }
        const userSnap = await tx.get(userRef);
        const current = Number(userSnap.exists ? userSnap.data().credit_balance || 0 : 0);
        const next = current + amount;

        tx.update(userRef, { credit_balance: next, credits: next });
        tx.set(db.doc(`founder_profiles/${uid}`), { credits: next, updated_at: new Date().toISOString() }, { merge: true });
        tx.set(db.doc(`credit_transactions/${claimId || `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`}`), {
          userId: uid,
          type: 'earn',
          source,
          amount,
          balanceAfter: next,
          timestamp: new Date().toISOString(),
          metadata,
        });

        if (source === 'referral' && claimId) {
          tx.update(db.doc(`founder_investor_contacts/${metadata.proof.contactId}`), { rewarded_at: new Date().toISOString() });
        }
        return next;
      });

      return res.status(200).json({ success: true, newBalance: result });
    }

    // ---- spend ----
    const cap = SPEND_CAPS[source] || 390;
    if (amount > cap) return res.status(400).json({ error: 'amount_exceeds_action_cap' });

    const result = await db.runTransaction(async (tx: any) => {
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error('user_not_found');
      const current = Number(userSnap.data().credit_balance || 0);
      if (current < amount) throw new Error(`insufficient_balance:${current}`);
      const next = current - amount;

      tx.update(userRef, { credit_balance: next, credits: next });
      tx.set(db.doc(`founder_profiles/${uid}`), { credits: next, updated_at: new Date().toISOString() }, { merge: true });
      tx.set(db.doc(`credit_transactions/tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`), {
        userId: uid,
        type: 'spend',
        source,
        amount,
        balanceAfter: next,
        timestamp: new Date().toISOString(),
        metadata,
      });
      return next;
    });

    return res.status(200).json({ success: true, newBalance: result });
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg === 'already_rewarded') return res.status(409).json({ error: 'already_rewarded' });
    if (msg.startsWith('insufficient_balance')) {
      return res.status(200).json({ success: false, newBalance: Number(msg.split(':')[1] || 0), error: 'Insufficient credits.' });
    }
    console.error('[Credits API] error:', err);
    return res.status(500).json({ error: 'credit_processing_failed' });
  }
}
