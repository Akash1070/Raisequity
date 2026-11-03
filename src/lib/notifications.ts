import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export type NotificationType = 
  | 'intro_request_received' 
  | 'intro_accepted' 
  | 'facilitation_agreement_required' 
  | 'deal_outcome_nudge' 
  | 'subscription_reward' 
  | 'weekly_dealflow_digest'
  | 'feed_post_received'
  | 'intro_quota_warning';

export interface NotificationPayload {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  bodyText: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  payload: NotificationPayload;
  sentAt: string;
  status: 'queued' | 'sent' | 'failed';
}

// Email is sent ONLY via /api/send-email (server holds RESEND_API_KEY).
// A real Resend key was previously hard-coded here as a fallback and shipped
// to every browser — it must be rotated; see AUDIT notes in final report.

/**
 * Dispatch an immediate email notification via Resend API
 */
export async function sendEmailNotification(
  userId: string,
  type: NotificationType,
  payload: NotificationPayload
): Promise<{ success: boolean; id?: string }> {
  console.log(`[Notifications] Queueing ${type} email to ${payload.recipientEmail}`);

  try {
    const notificationsRef = collection(db, 'notifications');
    let status: 'queued' | 'sent' | 'failed' = 'queued';

    // Serverless proxy only. If the API route is unavailable (local dev
    // without `vercel dev`), the record stays honestly 'queued' — previously
    // the stub lied and marked unsent mail as 'sent'.
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: payload.recipientEmail, subject: payload.subject, bodyText: payload.bodyText, actionUrl: payload.actionUrl }),
      });
      status = response.ok ? 'sent' : 'failed';
    } catch {
      status = 'queued';
    }

    const docRef = await addDoc(notificationsRef, {
      userId,
      type,
      payload,
      sentAt: new Date().toISOString(),
      status,
    });

    return { success: status === 'sent' || status === 'queued', id: docRef.id };
  } catch (err) {
    console.error('[Notifications] Failed to send notification:', err);
    return { success: false };
  }
}

/**
 * Trigger automated deal-outcome nudge email after 2-3 weeks of inactivity on accepted intro
 */
export async function triggerInactivityDealNudge(
  introRequestId: string,
  founderId: string,
  founderEmail: string,
  founderName: string,
  investorName: string
): Promise<void> {
  const subject = `Update on your warm intro with ${investorName}`;
  const bodyText = `Hi ${founderName},\n\nIt's been a few weeks since your warm intro request with ${investorName} was accepted.\nDid your discussions lead to a closed deal, grant, or partnership?\n\nPlease take 30 seconds to report your deal outcome on Raisequity. Note: Your first closed deal success fee (5%) is 100% waived!\n\nBest,\nThe Raisequity Team`;

  await sendEmailNotification(founderId, 'deal_outcome_nudge', {
    recipientEmail: founderEmail,
    recipientName: founderName,
    subject,
    bodyText,
    actionUrl: `${window.location.origin}/dashboard/matches`,
    metadata: { introRequestId },
  });
}
