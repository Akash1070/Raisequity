import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';

type MatchStatus = 'pending' | 'interested' | 'passed' | 'intro_requested' | 'connected' | 'accepted' | 'declined';

export function useMutateMatch() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['matches'] });
    queryClient.invalidateQueries({ queryKey: ['deal-feed'] });
    queryClient.invalidateQueries({ queryKey: ['introductions'] });
  };

  const updateStatus = useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: MatchStatus }) => {
      const docRef = doc(db, 'matches', matchId);
      await updateDoc(docRef, { status });
      return { id: matchId, status };
    },
    onSuccess: invalidate,
  });

  const requestIntroduction = useMutation({
    mutationFn: async ({ matchId, message }: { matchId: string; message: string }) => {
      // 1. Create the introduction record
      const introsRef = collection(db, 'introductions');
      const introDoc = await addDoc(introsRef, {
        match_id: matchId,
        message,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      // 2. Update the match status to intro_requested
      const matchRef = doc(db, 'matches', matchId);
      await updateDoc(matchRef, { status: 'intro_requested' });

      return { id: introDoc.id, match_id: matchId, message, status: 'pending' };
    },
    onSuccess: invalidate,
  });

  return {
    updateStatus,
    requestIntroduction,
    isUpdating: updateStatus.isPending,
    isRequesting: requestIntroduction.isPending,
  };
}
