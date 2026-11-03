import { useInfiniteQuery } from '@tanstack/react-query';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  limit, 
  startAfter, 
  getDocs,
  DocumentSnapshot 
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const PAGE_SIZE = 12;

interface UseDealFeedOptions {
  industryFilter?: string;
  stageFilter?: string;
  searchQuery?: string;
}

interface DealFeedPage {
  items: any[];
  lastVisibleDoc: DocumentSnapshot | null;
}

export function useDealFeed(options: UseDealFeedOptions = {}) {
  const { user } = useAuth();

  const queryResult = useInfiniteQuery({
    queryKey: ['deal-feed', user?.uid, options.industryFilter, options.stageFilter, options.searchQuery],
    enabled: !!user?.uid,
    initialPageParam: null as DocumentSnapshot | null,
    staleTime: 5 * 60 * 1000, // 5 min cache: prevents burning Firestore read quotas
    getNextPageParam: (lastPage: DealFeedPage) => {
      if (!lastPage || lastPage.items.length < PAGE_SIZE || !lastPage.lastVisibleDoc) {
        return undefined;
      }
      return lastPage.lastVisibleDoc;
    },
    queryFn: async ({ pageParam = null }): Promise<DealFeedPage> => {
      const companiesRef = collection(db, 'companies');

      try {
        const constraints: any[] = [];

        // Apply Firestore filter when specified
        if (options.stageFilter) {
          constraints.push(where('stage', '==', options.stageFilter));
        }

        // Apply pagination cursor if provided
        if (pageParam) {
          constraints.push(startAfter(pageParam));
        }

        // Bounded read limit (prevents unbounded scans on 100k records)
        constraints.push(limit(PAGE_SIZE));

        const q = query(companiesRef, ...constraints);
        const snap = await getDocs(q);

        let items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Memory filters for text search and array-industry fields
        if (options.searchQuery) {
          const qStr = options.searchQuery.toLowerCase();
          items = items.filter((c: any) => c.name?.toLowerCase().includes(qStr));
        }
        if (options.industryFilter) {
          items = items.filter((c: any) =>
            Array.isArray(c.industry)
              ? c.industry.includes(options.industryFilter)
              : c.industry === options.industryFilter || c.sector === options.industryFilter
          );
        }

        const lastVisibleDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

        return {
          items,
          lastVisibleDoc,
        };
      } catch (err) {
        console.warn('[useDealFeed] Paginated query error, attempting safe fallback:', err);
        // Fallback for missing compound index
        const fallbackQ = query(companiesRef, limit(PAGE_SIZE));
        const snap = await getDocs(fallbackQ);
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        return {
          items,
          lastVisibleDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
        };
      }
    },
  });

  const companies = queryResult.data?.pages.flatMap((p) => p.items) ?? [];

  return {
    companies,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: Boolean(queryResult.hasNextPage),
    loading: queryResult.isLoading,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    error: queryResult.error,
  };
}
