import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { FounderMessage } from '../types/founder';

export function useFounderMessages(matchId: string | null, isBlindIntro?: boolean) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<FounderMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!matchId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    let ref;
    let q;
    
    if (isBlindIntro) {
      ref = collection(db, `intro_requests/${matchId}/messages`);
      q = query(ref, orderBy('createdAt', 'asc')); // Note: createdAt vs created_at
    } else {
      ref = collection(db, 'founder_messages');
      q = query(ref, where('match_id', '==', matchId), orderBy('created_at', 'asc'));
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          // Normalize blind intro message schema to founder message schema
          created_at: data.created_at || data.createdAt,
          sender_id: data.sender_id || data.senderId,
          content: data.content || data.text,
        };
      }) as FounderMessage[];

      setMessages(items);
      setLoading(false);
    }, (err) => {
      console.error('[useFounderMessages] Snapshot error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [matchId, isBlindIntro]);

  const sendMessage = async (content: string) => {
    if (!user || !matchId) return { error: 'Not ready' };

    try {
      if (isBlindIntro) {
        // Send to blind intro escrow channel
        const ref = collection(db, `intro_requests/${matchId}/messages`);
        const newMsg = {
          introRequestId: matchId,
          senderId: user.uid,
          senderName: user.displayName || 'User',
          text: content,
          createdAt: new Date().toISOString(),
        };
        const docRef = await addDoc(ref, newMsg);
        
        // Also update lastActivityAt on parent doc
        const introRef = doc(db, 'intro_requests', matchId);
        await updateDoc(introRef, { lastActivityAt: new Date().toISOString() });

        return { error: null, data: { id: docRef.id, match_id: matchId, read: false, created_at: newMsg.createdAt, sender_id: newMsg.senderId, content: newMsg.text } as FounderMessage };
      } else {
        const ref = collection(db, 'founder_messages');
        const newMsg = {
          match_id: matchId,
          sender_id: user.uid,
          content,
          read: false,
          created_at: new Date().toISOString(),
        };
        const docRef = await addDoc(ref, newMsg);

        return { error: null, data: { id: docRef.id, ...newMsg } as FounderMessage };
      }
    } catch (err: any) {
      return { error: err?.message || 'Failed to send message' };
    }
  };

  return { messages, loading, sendMessage };
}
