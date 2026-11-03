import { useQuery } from '@tanstack/react-query';
import { db } from '../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

export function useGrants() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['grants'],
    queryFn: async () => {
      const ref = collection(db, 'grants');
      const snap = await getDocs(ref);
      return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
    },
  });

  return {
    grants: data ?? [],
    loading: isLoading,
    error,
    refetch,
  };
}
