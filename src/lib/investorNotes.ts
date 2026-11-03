import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { InvestorNote } from '../types/investor';

/**
 * Fetch an investor's private note for a specific founder/startup
 */
export async function getInvestorNote(
  investorId: string,
  founderId: string
): Promise<InvestorNote | null> {
  if (!investorId || !founderId) return null;
  try {
    const noteDocId = `${investorId}_${founderId}`;
    const noteRef = doc(db, 'investor_notes', noteDocId);
    const snap = await getDoc(noteRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as InvestorNote;
    }
    return null;
  } catch (err) {
    console.error('[InvestorNotes] Error reading note:', err);
    return null;
  }
}

/**
 * Save or update an investor's private CRM note for a founder/startup
 */
export async function saveInvestorNote(
  investorId: string,
  founderId: string,
  noteText: string,
  startupId?: string
): Promise<{ success: boolean; note?: InvestorNote; error?: any }> {
  if (!investorId || !founderId) {
    return { success: false, error: 'Missing investor or founder ID' };
  }

  const now = new Date().toISOString();
  const noteDocId = `${investorId}_${founderId}`;
  const noteRef = doc(db, 'investor_notes', noteDocId);

  const payload: InvestorNote = {
    id: noteDocId,
    investor_id: investorId,
    founder_id: founderId,
    startup_id: startupId || null,
    note_text: noteText,
    updated_at: now,
  };

  try {
    await setDoc(noteRef, payload, { merge: true });
    return { success: true, note: payload };
  } catch (err) {
    console.error('[InvestorNotes] Error saving note:', err);
    return { success: false, error: err };
  }
}

/**
 * Fetch all private notes for an investor
 */
export async function getAllInvestorNotes(investorId: string): Promise<InvestorNote[]> {
  if (!investorId) return [];
  try {
    const q = query(
      collection(db, 'investor_notes'),
      where('investor_id', '==', investorId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as InvestorNote[];
  } catch (err) {
    console.error('[InvestorNotes] Error fetching all notes:', err);
    return [];
  }
}
