import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { FounderProfile, FounderInvestorContact } from '../types/founder';

export async function getFounderProfile(userId: string): Promise<FounderProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'founder_profiles', userId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as FounderProfile;
    }
    return null;
  } catch (err) {
    console.error('[Founders] Error fetching founder profile:', err);
    return null;
  }
}

export async function createFounderProfile(profile: Partial<FounderProfile>): Promise<FounderProfile> {
  try {
    const uid = profile.id || profile.user_id;
    if (!uid) throw new Error('User ID required');
    const profileRef = doc(db, 'founder_profiles', uid);
    const data = { ...profile, id: uid, user_id: uid, updated_at: new Date().toISOString() };
    await setDoc(profileRef, data, { merge: true });
    return data as FounderProfile;
  } catch (err) {
    console.error('[Founders] Error creating founder profile:', err);
    throw err;
  }
}

export async function updateFounderProfile(userId: string, updates: Partial<FounderProfile>): Promise<FounderProfile> {
  try {
    const profileRef = doc(db, 'founder_profiles', userId);
    const data = { ...updates, updated_at: new Date().toISOString() };
    await updateDoc(profileRef, data);
    const updatedSnap = await getDoc(profileRef);
    return { id: updatedSnap.id, ...updatedSnap.data() } as FounderProfile;
  } catch (err) {
    console.error('[Founders] Error updating founder profile:', err);
    throw err;
  }
}

export async function getFounderInvestorContacts(founderId: string): Promise<FounderInvestorContact[]> {
  try {
    const contactsCol = collection(db, 'founder_investor_contacts');
    const q = query(contactsCol, where('founder_id', '==', founderId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FounderInvestorContact));
  } catch (err) {
    console.error('[Founders] Error fetching investor contacts:', err);
    return [];
  }
}

export async function addInvestorContact(contact: Omit<FounderInvestorContact, 'id' | 'created_at' | 'verified'>): Promise<FounderInvestorContact> {
  try {
    const contactsCol = collection(db, 'founder_investor_contacts');
    const data = {
      ...contact,
      verified: true,
      created_at: new Date().toISOString()
    };
    const docRef = await addDoc(contactsCol, data);
    return { id: docRef.id, ...data } as FounderInvestorContact;
  } catch (err) {
    console.error('[Founders] Error adding investor contact:', err);
    throw err;
  }
}

export async function deleteInvestorContact(contactId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'founder_investor_contacts', contactId));
  } catch (err) {
    console.error('[Founders] Error deleting investor contact:', err);
    throw err;
  }
}
