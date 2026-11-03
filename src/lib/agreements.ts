import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { sendEmailNotification } from './notifications';

export interface NativeAgreementPayload {
  introRequestId: string;
  signerId: string;
  signerName: string;
  signerEmail: string;
  signerRole: 'founder' | 'investor';
  counterpartyName: string;
  dealRef: string;
  printedLegalName: string;
  signatureDataUrl?: string; // Canvas drawn signature base64
  userIp?: string;
  userAgent?: string;
}

export interface StoredAgreementRecord {
  id: string;
  introRequestId: string;
  signerId: string;
  signerName: string;
  signerEmail: string;
  signerRole: string;
  counterpartyName: string;
  dealRef: string;
  printedLegalName: string;
  signatureDataUrl: string | null;
  feePercentage: number;
  signedAt: string;
  userIp: string;
  userAgent: string;
  agreementVersion: string;
}

/**
 * Record a legally binding in-app e-signature for warm intro facilitation (100% Free, zero third-party fees)
 */
export async function signNativeFacilitationAgreement(
  payload: NativeAgreementPayload
): Promise<{ success: boolean; agreementId?: string }> {
  console.log('[NativeAgreement] Signing in-app agreement for intro request:', payload.introRequestId);

  try {
    const agreementData = {
      introRequestId: payload.introRequestId,
      signerId: payload.signerId,
      signerName: payload.signerName,
      signerEmail: payload.signerEmail,
      signerRole: payload.signerRole,
      counterpartyName: payload.counterpartyName,
      dealRef: payload.dealRef,
      printedLegalName: payload.printedLegalName,
      signatureDataUrl: payload.signatureDataUrl || null,
      feePercentage: 0.05, // Standard 5% success fee
      signedAt: new Date().toISOString(),
      userIp: payload.userIp || 'client_logged',
      userAgent: payload.userAgent || navigator.userAgent,
      agreementVersion: 'v1.0-raisequity-facilitation',
    };

    // 1. Save agreement record in Firestore `agreements` collection
    const agreementRef = await addDoc(collection(db, 'agreements'), agreementData);

    // 2. Update intro_requests document to mark agreement completed & unmask contact details
    const introRef = doc(db, 'intro_requests', payload.introRequestId);
    await updateDoc(introRef, {
      agreementStatus: 'completed',
      facilitationAgreementRef: agreementRef.id,
      signedAt: new Date().toISOString(),
    });

    // 3. Dispatch automated executed agreement email copy via Resend
    try {
      await sendEmailNotification(payload.signerId, 'facilitation_agreement_required', {
        recipientEmail: payload.signerEmail,
        recipientName: payload.printedLegalName,
        subject: `Executed Facilitation Agreement - ${payload.dealRef}`,
        bodyText: `Hi ${payload.printedLegalName},\n\nYour Warm Intro Facilitation Agreement for ${payload.dealRef} has been digitally executed and recorded.\n\nCertificate Ref: ${agreementRef.id}\nSigned At: ${new Date().toUTCString()}\nSuccess Fee: 5% (1st Deal 100% Waived, 30% Credit Offset Cap applicable).\n\nBest regards,\nRaisequity Team`,
        metadata: { agreementId: agreementRef.id },
      });
    } catch (emailErr) {
      console.warn('[NativeAgreement] Non-blocking email error:', emailErr);
    }

    return { success: true, agreementId: agreementRef.id };
  } catch (err) {
    console.error('[NativeAgreement] Failed to record in-app agreement signature:', err);
    return { success: false };
  }
}

/**
 * Verify if facilitation agreement for an intro request is signed
 */
export async function isIntroAgreementSigned(introRequestId: string): Promise<boolean> {
  try {
    const introRef = doc(db, 'intro_requests', introRequestId);
    const snap = await getDoc(introRef);
    if (!snap.exists()) return false;
    const data = snap.data();
    return data.agreementStatus === 'completed' || !!data.facilitationAgreementRef;
  } catch (err) {
    console.error('[NativeAgreement] Failed to check status:', err);
    return false;
  }
}
