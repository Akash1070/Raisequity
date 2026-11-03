import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useFounderProfile } from './useFounderProfile';
import type { Startup } from '../types/founder';

export function useFounderStartups() {
  const { founderProfile } = useFounderProfile();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStartups = useCallback(async () => {
    if (!founderProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      const ref = collection(db, 'startups');
      const q = query(ref, where('founder_id', '==', founderProfile.id));
      const snap = await getDocs(q);

      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Startup[];

      setStartups(items);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch startups');
    } finally {
      setLoading(false);
    }
  }, [founderProfile]);

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  const createStartup = async (startupData: Partial<Startup>) => {
    if (!founderProfile?.id) return { error: 'No founder profile', data: null };

    try {
      const ref = collection(db, 'startups');
      const newDoc = {
        founder_id: founderProfile.id,
        ...startupData,
        created_at: new Date().toISOString(),
      };
      const docRef = await addDoc(ref, newDoc);

      const createdItem = { id: docRef.id, ...newDoc } as Startup;
      setStartups(prev => [createdItem, ...prev]);
      return { error: null, data: createdItem };
    } catch (err: any) {
      return { error: err?.message || 'Failed to create startup', data: null };
    }
  };

  return { startups, loading, error, createStartup, refetch: fetchStartups };
}
