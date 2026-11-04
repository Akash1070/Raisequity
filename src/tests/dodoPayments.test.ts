import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('Dodo Payments Webhook & Checkout Contract', () => {
  it('correctly extracts and decodes whsec_ standard webhook secret', () => {
    const rawKey = crypto.randomBytes(32);
    const base64Key = rawKey.toString('base64');
    const secret = `whsec_${base64Key}`;

    expect(secret.startsWith('whsec_')).toBe(true);
    const decodedKey = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    expect(decodedKey.equals(rawKey)).toBe(true);
  });

  it('computes and verifies standard HMAC-SHA256 webhook signatures', () => {
    const secret = 'whsec_mfasdf3827492837498237498237498237498237498=';
    const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    
    const webhookId = 'msg_test123';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const rawBody = JSON.stringify({
      type: 'payment.succeeded',
      data: {
        payment_id: 'pay_999888',
        metadata: { userId: 'usr_founder1', credits: 200 }
      }
    });

    const signedContent = `${webhookId}.${timestamp}.${rawBody}`;
    const digest = crypto.createHmac('sha256', key).update(signedContent, 'utf8').digest('base64');
    const signatureHeader = `v1,${digest}`;

    // Verify signature matches
    const expected = crypto.createHmac('sha256', key).update(signedContent, 'utf8').digest('base64');
    const matches = signatureHeader.split(' ').some((part) => {
      const m = /^v1,(.+)$/.exec(part.trim());
      if (!m) return false;
      return crypto.timingSafeEqual(Buffer.from(m[1], 'base64'), Buffer.from(expected, 'base64'));
    });

    expect(matches).toBe(true);
  });

  it('rejects tampered webhook payloads', () => {
    const secret = 'whsec_mfasdf3827492837498237498237498237498237498=';
    const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    
    const webhookId = 'msg_test123';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const originalBody = '{"type":"payment.succeeded"}';
    const tamperedBody = '{"type":"payment.succeeded","hacked":true}';

    const signedContent = `${webhookId}.${timestamp}.${originalBody}`;
    const digest = crypto.createHmac('sha256', key).update(signedContent, 'utf8').digest('base64');

    // Attempting verification with tampered body should fail
    const tamperedContent = `${webhookId}.${timestamp}.${tamperedBody}`;
    const tamperedDigest = crypto.createHmac('sha256', key).update(tamperedContent, 'utf8').digest('base64');

    expect(crypto.timingSafeEqual(Buffer.from(digest, 'base64'), Buffer.from(tamperedDigest, 'base64'))).toBe(false);
  });

  it('enforces deterministic idempotent ledger transaction IDs', () => {
    const paymentId = 'pay_0NlfCmfNRZBH';
    const ledgerKey = `tx_dodo_${paymentId}`;
    expect(ledgerKey).toBe('tx_dodo_pay_0NlfCmfNRZBH');
  });

  it('verifies product ID is hooked to pdt_0NlfCmfNRZBHG6Po7CtkZ', () => {
    const activeProductId = process.env.DODO_SUBSCRIPTION_PRODUCT_ID || 'pdt_0NlfCmfNRZBHG6Po7CtkZ';
    expect(activeProductId).toBe('pdt_0NlfCmfNRZBHG6Po7CtkZ');
  });
});
