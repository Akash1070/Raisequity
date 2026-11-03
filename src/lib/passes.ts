import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

export type PassReason = 
  | 'out_of_thesis' 
  | 'too_early' 
  | 'check_size_mismatch' 
  | 'cap_table_crowded' 
  | 'competitive_conflict'
  | 'other';

export const PASS_REASON_LABELS: Record<PassReason, string> = {
  out_of_thesis: 'Out of Sector / Thesis',
  too_early: 'Too Early / Pre-Traction',
  check_size_mismatch: 'Check Size / Valuation Mismatch',
  cap_table_crowded: 'Cap Table / Round Full',
  competitive_conflict: 'Portfolio Conflict',
  other: 'Not a Fit Right Now',
};

export interface InvestorPass {
  id?: string;
  investorId: string;
  companyId: string;
  companyName?: string;
  reason: PassReason;
  note?: string;
  timestamp: string;
}

/**
 * Record an investor declining/passing on a deal with a structured reason
 */
export async function recordInvestorPass(
  investorId: string,
  companyId: string,
  reason: PassReason,
  companyName?: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  if (!investorId || !companyId) {
    return { success: false, error: 'investorId and companyId required' };
  }

  try {
    const passDocRef = doc(db, 'investor_passes', `${investorId}_${companyId}`);
    await setDoc(passDocRef, {
      investorId,
      companyId,
      companyName: companyName || '',
      reason,
      note: note || '',
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Passes] Error recording investor pass:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch set of company IDs that this investor has passed on (to filter out of feed)
 */
export async function getInvestorPassedCompanyIds(investorId: string): Promise<Set<string>> {
  if (!investorId) return new Set();

  try {
    const q = query(
      collection(db, 'investor_passes'),
      where('investorId', '==', investorId)
    );
    const snap = await getDocs(q);
    const set = new Set<string>();
    snap.docs.forEach((d) => {
      const data = d.data();
      if (data.companyId) set.add(data.companyId);
    });
    return set;
  } catch (err) {
    console.warn('[Passes] Error loading passed company IDs:', err);
    return new Set();
  }
}

/**
 * Aggregate anonymized feedback for a startup across all investor passes
 */
export async function getStartupPassReasonsSummary(
  companyId: string
): Promise<{ totalPasses: number; breakdown: Record<string, number> }> {
  if (!companyId) return { totalPasses: 0, breakdown: {} };

  try {
    const q = query(
      collection(db, 'investor_passes'),
      where('companyId', '==', companyId)
    );
    const snap = await getDocs(q);
    const breakdown: Record<string, number> = {};

    snap.docs.forEach((d) => {
      const reason = d.data().reason || 'other';
      breakdown[reason] = (breakdown[reason] || 0) + 1;
    });

    return {
      totalPasses: snap.size,
      breakdown,
    };
  } catch (err) {
    console.warn('[Passes] Error loading startup pass summary:', err);
    return { totalPasses: 0, breakdown: {} };
  }
}

