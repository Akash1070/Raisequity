import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { useFounderProfile } from './useFounderProfile';
import { useAuth } from '../contexts/AuthContext';
import type { FounderInvestorContact } from '../types/founder';

export function useInvestorContacts() {
  const { user } = useAuth();
  const { founderProfile } = useFounderProfile();
  const [contacts, setContacts] = useState<FounderInvestorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeUid = user?.uid || (user as any)?.id || founderProfile?.id;

  const fetchContacts = useCallback(async () => {
    const uid = user?.uid || (user as any)?.id || founderProfile?.id;
    if (!uid) {
      setLoading(false);
      setContacts([]);
      return;
    }

    try {
      const contactsRef = collection(db, 'founder_investor_contacts');
      const q = query(contactsRef, where('founder_id', '==', uid));
      const snap = await getDocs(q);

      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as FounderInvestorContact[];

      setContacts(items);
    } catch (err: any) {
      console.error('[useInvestorContacts] Fetch error:', err);
      setError(err?.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, [user, founderProfile]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contact: Partial<FounderInvestorContact>) => {
    const uid = user?.uid || (user as any)?.id || founderProfile?.id;
    if (!uid) return { error: 'No authenticated founder' };

    try {
      const contactsRef = collection(db, 'founder_investor_contacts');
      const newDoc = {
        founder_id: uid,
        ...contact,
        created_at: new Date().toISOString(),
      };
      const docRef = await addDoc(contactsRef, newDoc);

      const createdItem: FounderInvestorContact = {
        id: docRef.id,
        ...newDoc,
      } as FounderInvestorContact;

      setContacts((prev) => [createdItem, ...prev]);
      return { error: null, id: docRef.id };
    } catch (err: any) {
      console.error('[useInvestorContacts] Add error:', err);
      return { error: err?.message || 'Failed to add contact' };
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const docRef = doc(db, 'founder_investor_contacts', contactId);
      await deleteDoc(docRef);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Failed to delete contact' };
    }
  };

  return { contacts, loading, error, addContact, deleteContact, refetch: fetchContacts };
}
