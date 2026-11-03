import { useQuery } from '@tanstack/react-query';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function useCurrentUser() {
  const { user, profile: authProfile } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['current-user', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      if (!user?.uid) return null;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as any;
      }
      return null;
    },
  });

  const mergedProfile = data || authProfile;

  return {
    profile: mergedProfile ?? null,
    role: mergedProfile?.role ?? null,
    loading: isLoading,
    error,
    refetch,
  };
}
