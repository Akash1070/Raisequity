import { useQuery } from '@tanstack/react-query';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

interface UseMatchesOptions {
  statusFilter?: string;
  scoreMin?: number;
}

export function useMatches(options: UseMatchesOptions = {}) {
  const { user, profile } = useAuth();
  const role = profile?.role;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['matches', user?.uid, role, options],
    enabled: !!user?.uid,
    queryFn: async () => {
      if (!user?.uid) return [];
      
      const matchesRef = collection(db, 'matches');
      let q = query(matchesRef);

      if (role === 'founder') {
        q = query(matchesRef, where('founder_id', '==', user.uid));
      } else if (role === 'investor') {
        q = query(matchesRef, where('investor_id', '==', user.uid));
      }

      const snap = await getDocs(q);
      let items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      if (options.statusFilter) {
        items = items.filter((m: any) => m.status === options.statusFilter);
      }

      if (options.scoreMin !== undefined) {
        items = items.filter((m: any) => (m.score || 0) >= options.scoreMin!);
      }

      return items;
    },
  });

  return {
    matches: data ?? [],
    loading: isLoading,
    error,
    refetch,
  };
}
