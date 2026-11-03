import { useQuery } from '@tanstack/react-query';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function useFounderCompany() {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['founder-company', user?.uid],
    enabled: !!user?.uid,
    queryFn: async () => {
      if (!user?.uid) return null;
      const ref = collection(db, 'companies');
      const q = query(ref, where('founder_id', '==', user.uid));
      const snap = await getDocs(q);

      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() };
    },
  });

  return {
    company: data ?? null,
    loading: isLoading,
    error,
    refetch,
  };
}
