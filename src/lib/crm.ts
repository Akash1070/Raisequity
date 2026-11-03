import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { PipelineEntry, CRMStage } from '../types';

export interface FundraiseProgress {
  fundingGoal: number;
  totalCommitted: number;
  percentCommitted: number;
  activeCount: number;
  termSheetCount: number;
  closedCount: number;
  stageCounts: Record<CRMStage, number>;
}

/**
 * Fetch all pipeline entries for a founder's CRM board.
 * Includes both direct CRM pipeline entries and contacts contributed during onboarding.
 */
export async function getPipelineEntries(founderId: string): Promise<PipelineEntry[]> {
  if (!founderId) return [];

  try {
    const crmRef = collection(db, 'pipeline_entries');
    const q = query(crmRef, where('founderId', '==', founderId));
    const snap = await getDocs(q);

    const pipelineList: PipelineEntry[] = snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as PipelineEntry[];

    // Also fetch investor contacts added during onboarding (Give to Get)
    try {
      const contactsRef = collection(db, 'founder_investor_contacts');
      const qContacts = query(contactsRef, where('founder_id', '==', founderId));
      const snapContacts = await getDocs(qContacts);

      snapContacts.docs.forEach(cSnap => {
        const c = cSnap.data();
        const exists = pipelineList.some(p => p.investorName?.toLowerCase() === c.investor_name?.toLowerCase());
        if (!exists && c.investor_name) {
          pipelineList.push({
            id: cSnap.id,
            founderId: founderId,
            investorName: c.investor_name,
            investorFirm: c.fund_name || c.investor_type || 'Angel Investor',
            stage: (c.custom_stage as CRMStage) || 'contacted',
            targetAmount: parseFloat(c.check_size_min) || 50000,
            committedAmount: 0,
            notes: c.relationship_description || '',
            isPlatformConnection: true,
            updatedAt: c.created_at || new Date().toISOString(),
          });
        }
      });
    } catch (cErr) {
      console.warn('[CRM] Warning fetching founder_investor_contacts:', cErr);
    }

    return pipelineList;
  } catch (err) {
    console.error('[CRM] Error fetching pipeline entries:', err);
    return [];
  }
}

/**
 * Add a new investor entry to the CRM board
 */
export async function createPipelineEntry(
  founderId: string,
  investorName: string,
  investorFirm: string,
  stage: CRMStage = 'researching',
  targetAmount: number = 0,
  committedAmount: number = 0,
  notes: string = '',
  isPlatformConnection: boolean = false
): Promise<{ success: boolean; entry?: PipelineEntry; error?: string }> {
  try {
    const crmRef = collection(db, 'pipeline_entries');
    const newEntryData = {
      founderId,
      investorName,
      investorFirm,
      stage,
      targetAmount,
      committedAmount,
      notes,
      isPlatformConnection,
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(crmRef, newEntryData);
    const entry: PipelineEntry = { id: docRef.id, ...newEntryData };

    return { success: true, entry };
  } catch (err: any) {
    console.error('[CRM] Error creating pipeline entry:', err);
    return { success: false, error: err.message || 'Failed to add investor to pipeline.' };
  }
}

/**
 * Update CRM entry stage (Kanban Drag & Drop movement)
 */
export async function updatePipelineStage(
  entryId: string,
  stage: CRMStage,
  committedAmount?: number,
  notes?: string
): Promise<boolean> {
  try {
    const entryRef = doc(db, 'pipeline_entries', entryId);
    const updateData: Record<string, any> = {
      stage,
      updatedAt: new Date().toISOString(),
    };

    if (committedAmount !== undefined) updateData.committedAmount = committedAmount;
    if (notes !== undefined) updateData.notes = notes;

    await updateDoc(entryRef, updateData);
    return true;
  } catch (err) {
    console.error('[CRM] Error updating pipeline stage:', err);
    return false;
  }
}

/**
 * Delete a CRM entry
 */
export async function deletePipelineEntry(entryId: string): Promise<boolean> {
  try {
    const entryRef = doc(db, 'pipeline_entries', entryId);
    await deleteDoc(entryRef);
    return true;
  } catch (err) {
    console.error('[CRM] Error deleting pipeline entry:', err);
    return false;
  }
}

/**
 * Calculate Fundraise Progress metrics for founder dashboard header
 */
export function calculateFundraiseProgress(
  entries: PipelineEntry[],
  fundingGoal: number = 500000
): FundraiseProgress {
  const stageCounts: Record<CRMStage, number> = {
    researching: 0,
    contacted: 0,
    in_conversation: 0,
    term_sheet: 0,
    closed: 0,
    passed: 0,
  };

  let totalCommitted = 0;

  entries.forEach(e => {
    if (stageCounts[e.stage] !== undefined) {
      stageCounts[e.stage]++;
    }
    if (e.stage === 'closed' || e.committedAmount) {
      totalCommitted += e.committedAmount || e.targetAmount || 0;
    }
  });

  const percentCommitted = fundingGoal > 0 ? Math.min(100, Math.round((totalCommitted / fundingGoal) * 100)) : 0;
  const activeCount = stageCounts.contacted + stageCounts.in_conversation + stageCounts.term_sheet;

  return {
    fundingGoal,
    totalCommitted,
    percentCommitted,
    activeCount,
    termSheetCount: stageCounts.term_sheet,
    closedCount: stageCounts.closed,
    stageCounts,
  };
}
