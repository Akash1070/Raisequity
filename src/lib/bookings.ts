import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { CallBooking } from '../types/founder';

/**
 * Fetch all call bookings for a founder from Firestore
 */
export async function getCallBookings(founderId: string): Promise<CallBooking[]> {
  try {
    const ref = collection(db, 'call_bookings');
    const q = query(ref, where('founder_id', '==', founderId), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as CallBooking[];
  } catch (err) {
    console.error('[Bookings] Error fetching call bookings:', err);
    return [];
  }
}

/**
 * Create a new call booking in Firestore
 */
export async function createCallBooking(
  booking: Omit<CallBooking, 'id' | 'created_at' | 'status' | 'payment_status'>
): Promise<CallBooking> {
  const ref = collection(db, 'call_bookings');
  const bookingData = {
    ...booking,
    status: 'pending',
    payment_status: 'unpaid',
    created_at: new Date().toISOString(),
  };

  const docRef = await addDoc(ref, bookingData);
  return {
    id: docRef.id,
    ...bookingData,
  } as CallBooking;
}
