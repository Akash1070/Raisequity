import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  limit, 
  increment,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  Conversation, 
  ConversationParticipant, 
  DirectMessage, 
  ConversationDealContext,
  DirectMessageType 
} from '../types/messages';

/**
 * Deterministic conversation ID for two users.
 */
export function getConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

/**
 * Get or create a 1-on-1 direct conversation channel.
 */
export async function getOrCreateConversation(
  currentUser: ConversationParticipant,
  targetUser: ConversationParticipant,
  dealContext?: ConversationDealContext | null
): Promise<string> {
  const convId = getConversationId(currentUser.id, targetUser.id);
  const convRef = doc(db, 'conversations', convId);

  try {
    const snap = await getDoc(convRef);
    if (!snap.exists()) {
      const now = new Date().toISOString();
      const initialData: Conversation = {
        id: convId,
        participant_ids: [currentUser.id, targetUser.id],
        participants: {
          [currentUser.id]: currentUser,
          [targetUser.id]: targetUser,
        },
        last_message: '',
        last_message_at: now,
        last_sender_id: '',
        unread_count: {
          [currentUser.id]: 0,
          [targetUser.id]: 0,
        },
        deal_context: dealContext || null,
        created_at: now,
        updated_at: now,
      };
      await setDoc(convRef, initialData);
    } else {
      // Update participant info if changed
      await updateDoc(convRef, {
        [`participants.${currentUser.id}`]: currentUser,
        [`participants.${targetUser.id}`]: targetUser,
        ...(dealContext ? { deal_context: dealContext } : {}),
        updated_at: new Date().toISOString(),
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('[messages.ts] Error in getOrCreateConversation:', err);
  }

  return convId;
}

/**
 * Send a direct message in a conversation.
 */
export async function sendDirectMessage(params: {
  conversationId: string;
  sender: ConversationParticipant;
  recipientId: string;
  recipientRole?: string;
  content: string;
  messageType?: DirectMessageType;
  metadata?: Record<string, any>;
}): Promise<{ id: string; error: string | null }> {
  const { conversationId, sender, recipientId, recipientRole, content, messageType = 'text', metadata = {} } = params;

  if (!content.trim()) return { id: '', error: 'Message cannot be empty' };

  try {
    const now = new Date().toISOString();
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    
    const messageDoc: Omit<DirectMessage, 'id'> = {
      conversation_id: conversationId,
      sender_id: sender.id,
      sender_name: sender.name,
      sender_role: sender.role,
      sender_avatar: sender.avatar_url || '',
      recipient_id: recipientId,
      content: content.trim(),
      message_type: messageType,
      metadata,
      created_at: now,
      read: false,
    };

    const docRef = await addDoc(messagesRef, messageDoc);

    // Update conversation parent metadata
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      last_message: content.trim(),
      last_message_at: now,
      last_sender_id: sender.id,
      updated_at: now,
      [`unread_count.${recipientId}`]: increment(1),
    }).catch(async () => {
      // If unread_count map doesn't exist yet, setDoc merge
      await setDoc(convRef, {
        last_message: content.trim(),
        last_message_at: now,
        last_sender_id: sender.id,
        updated_at: now,
        unread_count: { [recipientId]: 1 },
      }, { merge: true }).catch(() => {});
    });

    // Deliver instant real-time notification to the recipient
    try {
      const notifRef = collection(db, 'notifications');
      const targetPath = recipientRole === 'investor' 
        ? '/investor-dashboard/messages' 
        : recipientRole === 'service_provider' 
        ? '/agency-dashboard/messages' 
        : '/dashboard/messages';

      await addDoc(notifRef, {
        user_id: recipientId,
        type: 'message',
        title: `💬 New Message from ${sender.name} (${(sender.role || 'Member').toUpperCase()})`,
        body: content.length > 80 ? content.slice(0, 80) + '...' : content,
        link: `${targetPath}?convId=${conversationId}`,
        read: false,
        created_at: now,
      });
    } catch (notifErr) {
      console.warn('[messages.ts] Failed to create recipient notification:', notifErr);
    }

    return { id: docRef.id, error: null };
  } catch (err: any) {
    console.error('[messages.ts] Error sending direct message:', err);
    return { id: '', error: err.message || 'Failed to send message' };
  }
}

/**
 * Mark all messages in conversation as read for the current user.
 */
export async function markConversationRead(conversationId: string, currentUserId: string): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      [`unread_count.${currentUserId}`]: 0,
    }).catch(() => {});

    // Batch update unread messages where recipient is current user
    const msgRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(msgRef, where('recipient_id', '==', currentUserId), where('read', '==', false), limit(50));
    const snap = await getDocs(q);
    const updates = snap.docs.map(d => updateDoc(doc(db, 'conversations', conversationId, 'messages', d.id), { read: true }));
    await Promise.all(updates);
  } catch (err) {
    console.warn('[messages.ts] Error marking conversation as read:', err);
  }
}

/**
 * Subscribe to all conversations for a user.
 */
export function subscribeToUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe {
  const convRef = collection(db, 'conversations');
  const q = query(convRef, where('participant_ids', 'array-contains', userId));

  return onSnapshot(q, (snap) => {
    const convs = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as Conversation[];

    // Sort by last_message_at descending in memory
    convs.sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime());
    callback(convs);
  }, (err) => {
    console.warn('[messages.ts] Snapshot error for user conversations:', err);
    callback([]);
  });
}

/**
 * Subscribe to direct messages within a conversation in real time.
 */
export function subscribeToConversationMessages(
  conversationId: string,
  callback: (messages: DirectMessage[]) => void
): Unsubscribe {
  const msgRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(msgRef, orderBy('created_at', 'asc'));

  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as DirectMessage[];
    callback(msgs);
  }, (err) => {
    console.warn('[messages.ts] Snapshot error for messages:', err);
    callback([]);
  });
}

/**
 * Fetch directory members to start new direct messages.
 */
export async function fetchDirectoryMembers(currentUserId: string): Promise<ConversationParticipant[]> {
  const results: ConversationParticipant[] = [];

  try {
    // 1. Fetch from 'users'
    const usersSnap = await getDocs(query(collection(db, 'users'), limit(50)));
    usersSnap.docs.forEach(docSnap => {
      const u = docSnap.data();
      if (docSnap.id !== currentUserId && u.email) {
        results.push({
          id: docSnap.id,
          name: u.full_name || u.email.split('@')[0],
          email: u.email,
          role: u.role || 'founder',
          avatar_url: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(u.full_name || u.email).split(' ')[0]}`,
          company_name: u.company_name || 'Active Member',
          headline: u.bio || `${u.role || 'Member'} at Raisequity`,
        });
      }
    });

    // 2. Fetch from 'founder_profiles' if available
    const founderSnap = await getDocs(query(collection(db, 'founder_profiles'), limit(30)));
    founderSnap.docs.forEach(docSnap => {
      const f = docSnap.data();
      const uid = f.user_id || docSnap.id;
      if (uid !== currentUserId && !results.some(r => r.id === uid)) {
        results.push({
          id: uid,
          name: f.full_name || 'Founder',
          email: f.email || `${f.company_name?.toLowerCase().replace(/\s+/g, '') || 'founder'}@startup.io`,
          role: 'founder',
          avatar_url: f.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(f.full_name || 'Founder').split(' ')[0]}`,
          company_name: f.company_name || 'Stealth Startup',
          headline: f.what_company_does || f.tagline || 'Building the future',
        });
      }
    });

    // 3. Fallback institutional peers if database is fresh
    if (results.length < 3) {
      results.push(
        {
          id: 'lead_investor_apex',
          name: 'Sarah Lin',
          email: 'sarah.lin@apexventures.vc',
          role: 'investor',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          company_name: 'Apex Syndicate & Ventures',
          headline: 'General Partner · AI Infrastructure & DePIN Checks ($100k-$1M)',
        },
        {
          id: 'lead_founder_elena',
          name: 'Elena Rostova',
          email: 'elena@neurochain.ai',
          role: 'founder',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
          company_name: 'NeuroChain AI',
          headline: 'Founder & CEO · Autonomous Multi-Agent Orchestration ($1.5M Seed)',
        },
        {
          id: 'lead_agency_audit',
          name: 'Marcus Vance',
          email: 'marcus@secantx.io',
          role: 'service_provider',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
          company_name: 'Trailblazer Security & Audits',
          headline: 'Managing Director · Tier-1 Smart Contract Formal Verification',
        }
      );
    }
  } catch (err) {
    console.warn('[messages.ts] Error fetching directory members:', err);
  }

  return results;
}
