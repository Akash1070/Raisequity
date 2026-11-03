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
import type { FounderInvestorContact } from '../types/founder';

export function useInvestorContacts() {
  const { founderProfile } = useFounderProfile();
  const [contacts, setContacts] = useState<FounderInvestorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!founderProfile?.id) {
      setLoading(false);
      setContacts([]);
      return;
    }

    try {
      const contactsRef = collection(db, 'founder_investor_contacts');
      const q = query(contactsRef, where('founder_id', '==', founderProfile.id));
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
  }, [founderProfile]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contact: Partial<FounderInvestorContact>) => {
    if (!founderProfile?.id) return { error: 'No founder profile' };

    try {
      const contactsRef = collection(db, 'founder_investor_contacts');
      const newDoc = {
        founder_id: founderProfile.id,
        ...contact,
        created_at: new Date().toISOString(),
      };
      const docRef = await addDoc(contactsRef, newDoc);

      const createdItem: FounderInvestorContact = {
        id: docRef.id,
        ...newDoc,
      } as FounderInvestorContact;

      setContacts((prev) => [createdItem, ...prev]);
      return { error: null };
    } catch (err: any) {
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
