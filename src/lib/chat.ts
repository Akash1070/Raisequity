import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy } from 'firebase/firestore';
import { FounderMessage } from '../types/founder';

/**
 * Fetch chat messages for a match from Firestore
 */
export async function getMessages(matchId: string): Promise<FounderMessage[]> {
  try {
    const messagesRef = collection(db, 'founder_messages');
    const q = query(messagesRef, where('match_id', '==', matchId), orderBy('created_at', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as FounderMessage[];
  } catch (err) {
    console.error('[Chat] Error fetching messages:', err);
    return [];
  }
}

/**
 * Send a chat message in Firestore
 */
export async function sendMessage(matchId: string, senderId: string, content: string): Promise<FounderMessage> {
  const messagesRef = collection(db, 'founder_messages');
  const msgData = {
    match_id: matchId,
    sender_id: senderId,
    content,
    read: false,
    created_at: new Date().toISOString(),
  };

  const docRef = await addDoc(messagesRef, msgData);
  return {
    id: docRef.id,
    ...msgData,
  } as FounderMessage;
}

/**
 * Mark messages as read in Firestore
 */
export async function markMessagesAsRead(matchId: string, readerUserId: string): Promise<void> {
  try {
    const messagesRef = collection(db, 'founder_messages');
    const q = query(messagesRef, where('match_id', '==', matchId), where('read', '==', false));
    const snap = await getDocs(q);

    const updatePromises = snap.docs
      .filter((docSnap) => docSnap.data().sender_id !== readerUserId)
      .map((docSnap) => updateDoc(doc(db, 'founder_messages', docSnap.id), { read: true }));

    await Promise.all(updatePromises);
  } catch (err) {
    console.error('[Chat] Error marking messages as read:', err);
  }
}
