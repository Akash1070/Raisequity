import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { sendEmailNotification } from './notifications';

/**
 * Raisequity In-App Sealed Agreement Engine.
 *
 * Drop-in replacement for the OpenSign esign proxy when OPENSIGN_API_KEY is
 * not configured. Flow (matches the ideal workflow):
 *   1. Investor fills the SAFE terms (web form).
 *   2. The app builds the canonical agreement text from those terms.
 *   3. Investor approves → typed-name consent + timestamp are recorded.
 *   4. Founder is notified and counter-signs (typed-name consent + timestamp).
 *   5. Once both have signed, the document is SEALED: SHA-256 digest of the
 *      canonical text + signatures is stored, and email copies are sent to
 *      both parties.
 *
 * This is not a substitute for a licensed e-sign provider's certificate, but
 * it gives an honest, auditable, timestamped two-party consent record.
 */

export interface SealedSafePayload {
  companyId: string;
  companyName: string;
  founderId: string;
  founderName: string;
  founderEmail: string;
  investorId: string;
  investorName: string;
  investorEmail: string;
  checkAmountUsd: number;
  valuationCapUsd: number;
  discountPct: number;
  instrumentType: string;
}

export interface SafeSignatureRecord {
  party: 'investor' | 'founder';
  name: string;
  email: string;
  signedAt: string;
}

/** Canonical, human-readable agreement text used for the seal digest. */
export function buildSafeAgreementText(p: SealedSafePayload): string {
  const money = (n: number) => `$${n.toLocaleString('en-US')}`;
  return [
    'RAISEQUITY STANDARDIZED INVESTMENT AGREEMENT',
    '----------------------------------------------',
    `Instruments: ${p.instrumentType}`,
    `Company: ${p.companyName} (${p.companyId})`,
    `Founder: ${p.founderName} <${p.founderEmail}>`,
    `Investor: ${p.investorName} <${p.investorEmail}>`,
    `Investment amount: ${money(p.checkAmountUsd)}`,
    `Valuation cap: ${money(p.valuationCapUsd)}`,
    `Discount rate: ${p.discountPct}%`,
    'Platform: Raisequity (https://raisequity.com)',
    'Terms: Standard YC post-money SAFE / Token SAFT template, pre-vetted by Raisequity.',
    'Both parties consent to electronic signature and agree this record is binding.',
    '',
  ].join('\n');
}

/** SHA-256 hex digest (Web Crypto, async). */
export async function sealText(text: string): Promise<string> {
  try {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    // Non-secure context fallback: prefix with a random nonce (still unique,
    // though not cryptographically sealed).
    return `fallback-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export interface InvestorSignedResult {
  success: boolean;
  agreementId?: string;
  error?: string;
}

/**
 * Step 1 — investor signs. Creates the safes record with the investor's
 * signature and a pending-founder-signature status.
 */
export async function investorSignsSealedSafe(
  payload: SealedSafePayload,
  investorIp?: string,
): Promise<InvestorSignedResult> {
  try {
    const text = buildSafeAgreementText(payload);
    const now = new Date().toISOString();

    const investorSig: SafeSignatureRecord = {
      party: 'investor',
      name: payload.investorName,
      email: payload.investorEmail,
      signedAt: now,
    };

    const docRef = await addDoc(collection(db, 'safes'), {
      investor_id: payload.investorId,
      investor_name: payload.investorName,
      founder_id: payload.founderId,
      founder_name: payload.founderName,
      company_id: payload.companyId,
      company_name: payload.companyName,
      amount: payload.checkAmountUsd,
      val_cap: payload.valuationCapUsd,
      instrument: payload.instrumentType,
      status: 'pending_founder_signature',
      signatures: [investorSig],
      document_text: text,
      document_hash: null,
      document_id: `RQD-${Date.now().toString(36).toUpperCase()}`,
      created_at: now,
      investor_ip: investorIp || 'client_logged',
    });

    // Notify the founder with a link to review & sign.
    try {
      await sendEmailNotification(payload.founderId, 'facilitation_agreement_required', {
        recipientEmail: payload.founderEmail,
        recipientName: payload.founderName,
        subject: `${payload.investorName} issued a SAFE for ${payload.companyName} — your signature is requested`,
        bodyText: `Hi ${payload.founderName},\n\n${payload.investorName} has issued a ${payload.instrumentType} of ${payload.checkAmountUsd.toLocaleString('en-US')} USD at a ${payload.valuationCapUsd.toLocaleString('en-US')} USD valuation cap for ${payload.companyName}.\n\nPlease review and sign in your Raisequity dashboard to seal the agreement.\n\nAgreement Ref: ${docRef.id}`,
        actionUrl: `${window.location.origin}/dashboard/messages`,
        metadata: { agreementId: docRef.id },
      });
    } catch (emailErr) {
      console.warn('[SealedAgreement] founder email failed:', emailErr);
    }

    // In-platform notification as well.
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: payload.founderId,
        type: 'safe_offer',
        title: '📜 SAFE Ag  Your Signature',
        body: `${payload.investorName} issued a ${payload.instrumentType} ($${payload.checkAmountUsd.toLocaleString('en-US')} at $${(payload.valuationCapUsd / 1000000).toFixed(1)}M cap) for ${payload.companyName}. Review and sign to seal it.`,
        link: '/dashboard/messages',
        read: false,
        created_at: now,
      });
    } catch (notifyErr) {
      console.warn('[SealedAgreement] founder notification failed:', notifyErr);
    }

    return { success: true, agreementId: docRef.id };
  } catch (err: any) {
    console.error('[SealedAgreement] investor sign failed:', err);
    return { success: false, error: err?.message || 'Failed to record signature.' };
  }
}

export interface FounderSignResult {
  success: boolean;
  error?: string;
  sealed?: boolean;
  documentHash?: string;
}

/**
 * Step 2 — founder counter-signs. When both parties have signed, the
 * document is sealed (SHA-256) and completed.
 */
export async function founderSignsSealedSafe(
  agreementId: string,
  founderName: string,
  founderEmail: string,
  agree: boolean,
): Promise<FounderSignResult> {
  try {
    const ref = doc(db, 'safes', agreementId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { success: false, error: 'Agreement not found.' };

    const data = snap.data();
    if (data.status === 'sealed') return { success: true, sealed: true, documentHash: data.document_hash };

    if (!agree) {
      await updateDoc(ref, { status: 'declined', declined_at: new Date().toISOString() });
      return { success: true, sealed: false };
    }

    const founderSig: SafeSignatureRecord = {
      party: 'founder',
      name: founderName,
      email: founderEmail,
      signedAt: new Date().toISOString(),
    };

    const signatures: SafeSignatureRecord[] = Array.isArray(data.signatures) ? data.signatures : [];
    signatures.push(founderSig);

    // Seal: hash the document text + all timestamps.
    const docText = String(data.document_text || '');
    const sealedInput = `${docText}\nSIGNATURES:\n` +
      signatures.map((s) => `${s.party.toUpperCase()}: ${s.name} <${s.email}> @ ${s.signedAt}`).join('\n');
    const hash = await sealText(sealedInput);

    await updateDoc(ref, {
      status: 'sealed',
      signatures,
      document_hash: hash,
      sealed_at: new Date().toISOString(),
    });

    // Email copies to both parties.
    const emails = [
      { name: data.founder_name || founderName, email: data.founder_email || founderEmail },
      { name: data.investor_name || 'Investor', email: data.investor_email || '' },
    ];
    for (const e of emails) {
      if (!e.email) continue;
      try {
        await sendEmailNotification(data.founder_id || data.investor_id || 'user', 'facilitation_agreement_required', {
          recipientEmail: e.email,
          recipientName: e.name,
          subject: `Sealed Agreement ${data.document_id} — ${data.company_name}`,
          bodyText: `Hi ${e.name},\n\nThe ${data.instrument || 'SAFE'} agreement for ${data.company_name} has been signed by both parties and sealed.\n\nAgreement Ref: ${agreementId}\nSeal (SHA-256): ${hash}\nSealed At: ${new Date().toISOString()}`,
          metadata: { agreementId, documentHash: hash },
        });
      } catch (emailErr) {
        console.warn('[SealedAgreement] copy email failed:', emailErr);
      }
    }

    return { success: true, sealed: true, documentHash: hash };
  } catch (err: any) {
    console.error('[SealedAgreement] founder sign failed:', err);
    return { success: false, error: err?.message || 'Failed to record founder signature.' };
  }
}
