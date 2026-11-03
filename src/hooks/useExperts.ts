import { useQuery } from '@tanstack/react-query';
import { db } from '../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

interface UseExpertsOptions {
  category?: string;
}

export function useExperts(options: UseExpertsOptions = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['experts', options],
    queryFn: async () => {
      const ref = collection(db, 'experts');
      const snap = await getDocs(ref);

      let items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      if (options.category) {
        items = items.filter((e: any) => e.category === options.category);
      }

      return items;
    },
  });

  return {
    experts: data ?? [],
    loading: isLoading,
    error,
    refetch,
  };
}
