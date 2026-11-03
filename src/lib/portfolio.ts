import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { PortfolioItem } from '../types/investor';

/**
 * Fetch an investor's portfolio of closed platform deals
 */
export async function getInvestorPortfolio(investorId: string): Promise<PortfolioItem[]> {
  if (!investorId) return [];
  try {
    const q = query(
      collection(db, 'investor_portfolio'),
      where('investor_id', '==', investorId)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as PortfolioItem[];

    // Hydrate with founder details if available
    const hydrated = await Promise.all(
      items.map(async (item) => {
        if (item.founder_id) {
          const fDoc = await getDoc(doc(db, 'founder_profiles', item.founder_id));
          if (fDoc.exists()) {
            item.founder = { id: fDoc.id, ...fDoc.data() } as any;
          }
        }
        return item;
      })
    );

    return hydrated;
  } catch (err) {
    console.error('[Portfolio] Error fetching investor portfolio:', err);
    return [];
  }
}

/**
 * Add a closed deal to an investor's portfolio
 */
export async function addDealToPortfolio(
  investorId: string,
  founderId: string,
  startupId?: string,
  dealAmountUsd?: number,
  notes?: string
): Promise<{ success: boolean; item?: PortfolioItem; error?: any }> {
  if (!investorId || !founderId) {
    return { success: false, error: 'Missing investor or founder ID' };
  }

  const itemId = `${investorId}_${founderId}`;
  const itemRef = doc(db, 'investor_portfolio', itemId);
  const now = new Date().toISOString();

  const payload: PortfolioItem = {
    id: itemId,
    investor_id: investorId,
    founder_id: founderId,
    startup_id: startupId || founderId,
    closed_at: now,
    deal_amount_usd: dealAmountUsd || 50000,
    notes: notes || 'Platform sourced investment',
  };

  try {
    await setDoc(itemRef, payload, { merge: true });
    return { success: true, item: payload };
  } catch (err) {
    console.error('[Portfolio] Error adding deal to portfolio:', err);
    return { success: false, error: err };
  }
}
