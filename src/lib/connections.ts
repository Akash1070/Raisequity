import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { InvestorConnection, Sector } from '../types';

/**
 * Declare a founder-to-investor connection in Firestore
 */
export async function declareInvestorConnection(
  founderId: string,
  founderName: string,
  founderCompany: string,
  investorName: string,
  investorFirm: string,
  sectors: Sector[],
  stage: string[],
  ticketSize: string
): Promise<{ success: boolean; connection?: InvestorConnection; error?: string }> {
  try {
    const connRef = collection(db, 'investor_connections');
    const newConnData = {
      founderId,
      founderName,
      founderCompany,
      investorName,
      investorFirm,
      sectors,
      stage,
      ticketSize,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(connRef, newConnData);
    const connection: InvestorConnection = {
      id: docRef.id,
      ...newConnData,
    };

    return { success: true, connection };
  } catch (err: any) {
    console.error('[Connections] Error declaring connection:', err);
    return { success: false, error: err.message || 'Failed to declare investor connection.' };
  }
}

/**
 * Fetch declared investor connections (browse/search for Founders looking for intros)
 */
export async function getInvestorConnections(
  sectorFilter?: string,
  stageFilter?: string
): Promise<InvestorConnection[]> {
  try {
    const connRef = collection(db, 'investor_connections');
    let q = query(connRef, orderBy('createdAt', 'desc'));

    const snap = await getDocs(q);
    let results = snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as InvestorConnection[];

    if (sectorFilter && sectorFilter !== 'all') {
      results = results.filter(c => c.sectors?.includes(sectorFilter as Sector));
    }

    if (stageFilter && stageFilter !== 'all') {
      results = results.filter(c => c.stage?.includes(stageFilter));
    }

    return results;
  } catch (err) {
    console.error('[Connections] Error fetching investor connections:', err);
    return [];
  }
}
