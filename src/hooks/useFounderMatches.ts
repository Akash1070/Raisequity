import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc,
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { useFounderProfile } from './useFounderProfile';
import type { FounderMatch, FounderProfile, FounderMessage } from '../types/founder';

export interface MatchWithFounder extends FounderMatch {
  otherFounder: FounderProfile;
  lastMessage?: FounderMessage;
  unreadCount: number;
}

export function useFounderMatches() {
  const { founderProfile } = useFounderProfile();
  const [matches, setMatches] = useState<MatchWithFounder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!founderProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      const matchesRef = collection(db, 'founder_matches');
      
      // Query where founder_a_id == founderProfile.id OR founder_b_id == founderProfile.id
      const qA = query(matchesRef, where('founder_a_id', '==', founderProfile.id));
      const qB = query(matchesRef, where('founder_b_id', '==', founderProfile.id));

      const [snapA, snapB] = await Promise.all([getDocs(qA), getDocs(qB)]);
      const rawMatches: any[] = [];
      const seen = new Set<string>();

      [...snapA.docs, ...snapB.docs].forEach((d) => {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          rawMatches.push({ id: d.id, ...d.data() });
        }
      });

      const enrichedMatches: MatchWithFounder[] = await Promise.all(
        rawMatches.map(async (m) => {
          const isFounderA = m.founder_a_id === founderProfile.id;
          const otherFounderId = isFounderA ? m.founder_b_id : m.founder_a_id;

          let otherFounderData: any = {};
          if (otherFounderId) {
            const fSnap = await getDoc(doc(db, 'founder_profiles', otherFounderId));
            if (fSnap.exists()) {
              otherFounderData = { id: fSnap.id, ...fSnap.data() };
            }
          }

          return {
            ...m,
            isBlindIntro: false,
            otherFounder: otherFounderData as FounderProfile,
            unreadCount: 0,
          };
        })
      );

      // Fetch Blind Intro Requests (Data Escrow)
      const blindIntrosRef = collection(db, 'intro_requests');
      const qBlind = query(
        blindIntrosRef,
        where('connectingFounderId', '==', founderProfile.id),
        where('type', '==', 'blind')
      );
      const blindSnap = await getDocs(qBlind);
      const blindMatches: MatchWithFounder[] = blindSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          founder_a_id: data.investorRef,
          founder_b_id: data.connectingFounderId,
          status: data.status,
          matched_at: data.createdAt || new Date().toISOString(),
          isBlindIntro: true, // Identify as escrow request
          unreadCount: 0,
          otherFounder: {
             id: data.investorRef,
             full_name: data.investorName,
             company_name: data.investorFirm,
             // explicitly not loading email/telegram for data escrow
          } as FounderProfile
        };
      });

      setMatches([...enrichedMatches, ...blindMatches]);
    } catch (err: any) {
      console.error('[useFounderMatches] Fetch error:', err);
      setError(err?.message || 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, [founderProfile]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const respondToMatch = async (matchId: string, status: 'accepted' | 'declined', isBlindIntro?: boolean) => {
    try {
      const collectionName = isBlindIntro ? 'intro_requests' : 'founder_matches';
      const docRef = doc(db, collectionName, matchId);
      await updateDoc(docRef, { status });
      
      // If accepting a blind intro, automatically inject a system message to break the ice
      // and explain the escrow rules
      if (status === 'accepted' && isBlindIntro) {
        const messagesRef = collection(db, `intro_requests/${matchId}/messages`);
        await addDoc(messagesRef, {
          introRequestId: matchId,
          senderId: 'system',
          senderName: 'Raisequity System',
          text: '🤝 Data Escrow Active: You are now connected. Your direct contact information is currently hidden. You can chat securely here, or share your Telegram/Email whenever you are ready.',
          createdAt: new Date().toISOString(),
        });
      }

      await fetchMatches();
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Failed to update match' };
    }
  };

  return { matches, loading, error, respondToMatch, refetch: fetchMatches };
}
