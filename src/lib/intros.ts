import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { IntroRequest, IntroMessage } from '../types';
import { validateAndDeductIntroQuota } from './quota';
import { sendEmailNotification } from './notifications';

/**
 * Request a Blind Intro (Data Escrow)
 * From Investor -> Founder
 */
export async function requestBlindIntro(
  investorId: string,
  investorName: string,
  investorFirm: string,
  founderId: string,
  founderName: string
): Promise<{ success: boolean; introId?: string; error?: string }> {
  try {
    const introsRef = collection(db, 'intro_requests');
    const newIntro = {
      investorRef: investorId,
      investorName,
      investorFirm,
      connectingFounderId: founderId, // In a direct blind intro, the connecting founder is the target founder
      connectingFounderName: founderName,
      requestingFounderId: investorId, // Use investorId here to track who initiated
      requestingFounderName: investorName,
      type: 'blind',
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    const docRef = await addDoc(introsRef, newIntro);
    
    // Trigger email to Founder that they have a blind intro request
    // We need their email, so we fetch their profile first
    const fSnap = await getDoc(doc(db, 'founder_profiles', founderId));
    let founderEmail = 'founder@raisequity.com'; // fallback
    if (fSnap.exists()) {
      founderEmail = fSnap.data().email || founderEmail;
    }

    await sendEmailNotification(founderId, 'intro_request_received', {
      recipientEmail: founderEmail,
      recipientName: founderName,
      subject: `New Blind Intro Request from ${investorFirm}`,
      bodyText: `Hi ${founderName},\n\nGreat news! ${investorName} from ${investorFirm} has requested a blind intro with you on Raisequity.\n\nYour contact information is currently hidden in escrow. Log in to your dashboard to review their profile and Accept or Decline the request.\n\nIf you accept, a private in-app chat will open for you both.`,
      actionUrl: `${window.location.origin}/dashboard/matches`,
    });

    return { success: true, introId: docRef.id };
  } catch (err: any) {
    console.error('[Intros] Error requesting blind intro:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Create a new Founder-to-Founder Warm Intro Request
 * Enforces 5 free monthly cap + 5 credit deduction for 6th+ intro
 */
export async function createIntroRequest(
  requestingFounderId: string,
  requestingFounderName: string,
  requestingFounderEmail: string,
  connectingFounderId: string,
  connectingFounderName: string,
  connectingFounderEmail: string,
  investorRef: string,
  investorName: string,
  investorFirm: string
): Promise<{ success: boolean; introRequest?: IntroRequest; error?: string }> {
  try {
    // 1. Quota Check & Credit Deduction (First 5 free, 6th+ 5 credits)
    const quotaRes = await validateAndDeductIntroQuota(requestingFounderId);
    if (!quotaRes.canProceed) {
      return { success: false, error: quotaRes.error || 'Monthly intro quota limit reached.' };
    }

    // 2. Create Intro Request Document
    const introsRef = collection(db, 'intro_requests');
    const newIntro = {
      requestingFounderId,
      requestingFounderName,
      requestingFounderEmail,
      connectingFounderId,
      connectingFounderName,
      connectingFounderEmail,
      investorRef,
      investorName,
      investorFirm,
      status: 'pending' as const,
      facilitationAgreementRef: null,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    const docRef = await addDoc(introsRef, newIntro);
    const introRequest: IntroRequest = { id: docRef.id, ...newIntro };

    // 3. Dispatch Resend Email Alert to Connecting Founder
    await sendEmailNotification(connectingFounderId, 'intro_request_received', {
      recipientEmail: connectingFounderEmail,
      recipientName: connectingFounderName,
      subject: `New Warm Intro Request for ${investorName} from ${requestingFounderName}`,
      bodyText: `Hi ${connectingFounderName},\n\n${requestingFounderName} has requested a warm intro to your contact ${investorName} (${investorFirm}) on Raisequity.\n\nPlease log in to accept or decline this connection request.`,
      actionUrl: `${window.location.origin}/dashboard/matches?introId=${docRef.id}`,
    });

    return { success: true, introRequest };
  } catch (err: any) {
    console.error('[Intros] Error creating intro request:', err);
    return { success: false, error: err.message || 'Failed to create intro request.' };
  }
}

/**
 * Respond to an intro request (accept or decline)
 */
export async function respondToIntroRequest(
  introRequestId: string,
  status: 'accepted' | 'declined'
): Promise<boolean> {
  try {
    const introRef = doc(db, 'intro_requests', introRequestId);
    await updateDoc(introRef, {
      status,
      lastActivityAt: new Date().toISOString(),
    });

    // Fetch details to send email notification
    const snap = await getDoc(introRef);
    if (snap.exists()) {
      const data = snap.data() as IntroRequest;
      if (status === 'accepted') {
        await sendEmailNotification(data.requestingFounderId, 'intro_accepted', {
          recipientEmail: data.requestingFounderEmail,
          recipientName: data.requestingFounderName,
          subject: `${data.connectingFounderName} accepted your intro request to ${data.investorName}!`,
          bodyText: `Great news! ${data.connectingFounderName} accepted your intro request to ${data.investorName} (${data.investorFirm}).\n\nYou can now chat directly in your Raisequity dashboard to coordinate the investor handoff.`,
          actionUrl: `${window.location.origin}/dashboard/matches?introId=${introRequestId}`,
        });
      }
    }

    return true;
  } catch (err) {
    console.error('[Intros] Error responding to intro request:', err);
    return false;
  }
}

/**
 * Send in-platform chat message under intro_requests/{introRequestId}/messages
 */
export async function sendIntroMessage(
  introRequestId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<IntroMessage | null> {
  try {
    const messagesRef = collection(db, `intro_requests/${introRequestId}/messages`);
    const messageData = {
      introRequestId,
      senderId,
      senderName,
      text,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(messagesRef, messageData);

    // Update last activity timestamp on main intro_request
    const introRef = doc(db, 'intro_requests', introRequestId);
    await updateDoc(introRef, {
      lastActivityAt: new Date().toISOString(),
    });

    return { id: docRef.id, ...messageData };
  } catch (err) {
    console.error('[Intros] Error sending message:', err);
    return null;
  }
}

/**
 * Fetch paginated messages for an intro conversation thread
 */
export async function getIntroMessages(
  introRequestId: string,
  messageLimit: number = 50
): Promise<IntroMessage[]> {
  try {
    const messagesRef = collection(db, `intro_requests/${introRequestId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(messageLimit));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as IntroMessage[];
  } catch (err) {
    console.error('[Intros] Error fetching messages:', err);
    return [];
  }
}

/**
 * Trigger Investor Handoff via Masked Relay Email (8093akash+intro-{introRequestId}@gmail.com)
 * Requires OpenSign facilitation agreement to be signed first!
 */
export async function triggerInvestorHandoff(
  introRequestId: string,
  investorEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const introRef = doc(db, 'intro_requests', introRequestId);
    const snap = await getDoc(introRef);

    if (!snap.exists()) {
      return { success: false, error: 'Intro request not found.' };
    }

    const data = snap.data() as IntroRequest;

    // Check OpenSign Facilitation Agreement Gate
    if (!data.facilitationAgreementRef) {
      return { 
        success: false, 
        error: 'OpenSign Facilitation Agreement is required before handoff. Please click "Sign Facilitation Agreement" first.' 
      };
    }

    const relayFromEmail = `8093akash+intro-${introRequestId}@gmail.com`;

    // Send masked relay email via Resend notification service
    await sendEmailNotification(data.requestingFounderId, 'intro_request_received', {
      recipientEmail: investorEmail,
      recipientName: data.investorName,
      subject: `Warm Intro: ${data.requestingFounderName} -> ${data.investorName}`,
      bodyText: `Dear ${data.investorName},\n\n${data.connectingFounderName} has initiated a warm introduction for ${data.requestingFounderName} on Raisequity.\n\nFounder: ${data.requestingFounderName}\nContact: ${data.requestingFounderEmail}\n\nYou can reply directly to this email or review details on Raisequity.\n\nBest regards,\nRaisequity Relay Service (${relayFromEmail})`,
      actionUrl: `${window.location.origin}/network`,
      metadata: { relayFromEmail, introRequestId },
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Intros] Error triggering investor handoff:', err);
    return { success: false, error: err.message || 'Failed to trigger investor handoff.' };
  }
}
