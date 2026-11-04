import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  arrayUnion,
  increment,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { Web3Investor } from '../types/investor';
import { spendCredits } from './credits';

const COLLECTION_NAME = 'web3_investors';

/**
 * Helper to mask sensitive string (email / telegram)
 */
function maskText(text: string, type: 'email' | 'telegram' = 'email'): string {
  if (!text) return '';
  if (type === 'email') {
    const [name, domain] = text.split('@');
    if (!domain) return 'e***@vc.com';
    return `${name.charAt(0)}***@${domain}`;
  }
  const clean = text.replace(/^@/, '');
  return `@${clean.charAt(0)}***`;
}

/**
 * Automatically resolves investor avatar URL from explicitly saved photo, Twitter handle, domain logo, or UI initials
 */
export function getInvestorAvatarUrl(inv: Partial<Web3Investor>): string {
  if (inv.avatar_url && inv.avatar_url.trim()) return inv.avatar_url.trim();

  // 1. Try Twitter handle avatar via unavatar
  if (inv.twitter && inv.twitter.trim()) {
    const handle = inv.twitter
      .trim()
      .replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '')
      .replace(/\/.*$/, '')
      .replace(/^@/, '');
    if (handle) {
      return `https://unavatar.io/twitter/${handle}`;
    }
  }

  // 2. Try website domain logo via unavatar
  if (inv.website && inv.website.trim()) {
    const domain = inv.website
      .trim()
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/.*$/, '');
    if (domain) {
      return `https://unavatar.io/domain/${domain}`;
    }
  }

  // 3. Fallback to initials avatar
  const name = inv.name || inv.firm || 'Investor';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=fff&bold=true`;
}

/**
 * Fetch Web3 investors from Firestore with Anti-Scraping Data Protection.
 * Unlocked items display real emails/telegrams (read from secured private subcollection);
 * locked items receive strictly masked text.
 */
export async function getWeb3Investors(
  unlockedIds: string[] = [],
  isAdmin: boolean = false,
  options?: { limit?: number; sector?: string }
): Promise<Web3Investor[]> {
  try {
    const maxLimit = options?.limit ?? 5000;
    const colRef = collection(db, COLLECTION_NAME);
    let q = query(colRef, limit(maxLimit));

    const snap = await getDocs(q);
    const investors = snap.docs.map(d => {
      const data = d.data();
      const isUnlocked = unlockedIds.includes(d.id) || isAdmin;

      return {
        id: d.id,
        name: data.name || 'Web3 Investor',
        firm: data.firm || 'VC Fund',
        category: data.category || 'VC Fund',
        role: data.role || 'Partner',
        sectors: data.sectors || ['Web3'],
        stage: data.stage || 'Seed',
        check_size: data.check_size || '$100k',
        location: data.location || 'Global',
        // Anti-Scraping Protection: Locked items are strictly masked in payload
        email: isUnlocked ? (data.email || '') : maskText(data.email || '', 'email'),
        telegram: isUnlocked ? (data.telegram || '') : maskText(data.telegram || '', 'telegram'),
        twitter: data.twitter || '',
        linkedin: data.linkedin || '',
        website: data.website || '',
        verified: data.verified ?? true,
        know_count: data.know_count || 0,
      } as Web3Investor;
    });

    // For unlocked investors, if contacts were migrated to private subcollection, fetch them
    if (unlockedIds.length > 0) {
      await Promise.all(
        investors
          .filter(inv => unlockedIds.includes(inv.id) && (inv.email.includes('***') || !inv.email))
          .map(async inv => {
            try {
              const privSnap = await getDoc(doc(db, COLLECTION_NAME, inv.id, 'private', 'contact'));
              if (privSnap.exists()) {
                const privData = privSnap.data();
                if (privData.email) inv.email = privData.email;
                if (privData.telegram) inv.telegram = privData.telegram;
              }
            } catch (privErr) {
              // Gracefully keep current display if private doc unavailable
            }
          })
      );
    }

    return investors;
  } catch (err) {
    console.error('[Web3Investors] Error fetching investors:', err);
    return [];
  }
}

/**
 * Create a new investor profile
 */
export async function createWeb3Investor(data: Omit<Web3Investor, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      know_count: data.know_count || 0,
      verified: data.verified ?? true,
      created_at: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error('[Web3Investors] Error creating investor:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing investor profile
 */
export async function updateWeb3Investor(id: string, data: Partial<Web3Investor>): Promise<{ success: boolean; error?: string }> {
  try {
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, {
      ...data,
      updated_at: new Date().toISOString(),
    });
    return { success: true };
  } catch (err: any) {
    console.error('[Web3Investors] Error updating investor:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete an investor entry
 */
export async function deleteWeb3Investor(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  } catch (err: any) {
    console.error('[Web3Investors] Error deleting investor:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Bulk import an array of investors (high-performance Firestore writeBatch)
 * Automatically splits public data (masked contacts) and private contacts subcollection.
 */
export async function bulkImportWeb3Investors(
  investorsList: Omit<Web3Investor, 'id'>[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let imported = 0;
    const CHUNK_SIZE = 200; // 200 investors = 400 document writes, well below Firestore 500 limit

    for (let i = 0; i < investorsList.length; i += CHUNK_SIZE) {
      const chunk = investorsList.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      for (const item of chunk) {
        const docRef = doc(collection(db, COLLECTION_NAME));
        const rawEmail = (item.email || '').trim().toLowerCase();
        const rawTelegram = (item.telegram || '').trim();
        const rawLinkedIn = (item.linkedin || '').trim();

        // 1. Public document: Contacts strictly masked for anti-scraping
        batch.set(docRef, {
          name: item.name || 'Anonymous Investor',
          firm: item.firm || 'Angel / Independent',
          category: item.category || 'VC Fund',
          role: item.role || 'Partner',
          sectors: Array.isArray(item.sectors) ? item.sectors : ['Web3', 'DeFi'],
          stage: item.stage || 'Seed',
          check_size: item.check_size || '$50k - $250k',
          location: item.location || 'Global',
          email: rawEmail ? maskText(rawEmail, 'email') : '',
          telegram: rawTelegram ? maskText(rawTelegram, 'telegram') : '',
          twitter: item.twitter || '',
          linkedin: item.linkedin || '',
          website: item.website || '',
          has_contact: Boolean(rawEmail || rawTelegram),
          contacts_migrated: true,
          verified: true,
          know_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // 2. Private subcollection document: Raw contacts protected behind auth & paid credit unlocks
        if (rawEmail || rawTelegram || rawLinkedIn) {
          const privRef = doc(db, COLLECTION_NAME, docRef.id, 'private', 'contact');
          batch.set(privRef, {
            investorId: docRef.id,
            email: rawEmail,
            telegram: rawTelegram,
            linkedin: rawLinkedIn,
            migratedAt: new Date().toISOString(),
          });
        }

        imported++;
      }

      await batch.commit();
    }

    return { success: true, count: imported };
  } catch (err: any) {
    console.error('[Web3Investors] Bulk import error:', err);
    let errMsg = err.message || 'Unknown error during import.';
    if (err.code === 'permission-denied' || errMsg.includes('insufficient permissions')) {
      errMsg = 'Firestore Permission Denied. Please open Firebase Console -> Firestore Database -> Rules tab and allow read/write access to "web3_investors" collection.';
    }
    return { success: false, count: 0, error: errMsg };
  }
}

/**
 * Unlock contact details for a founder using 1 credit.
 * Credit deduction goes through spendCredits (atomic, ledger-backed) — the
 * balance is never mutated with a raw updateDoc here.
 */
export async function unlockInvestorContact(
  userId: string,
  investorId: string,
  currentCredits: number
): Promise<{ success: boolean; error?: string; remainingCredits?: number; unlockedData?: { email: string; telegram: string } }> {
  if (currentCredits < 1) {
    return { success: false, error: 'Insufficient credits. You need 1 credit to unlock contact details.' };
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'User profile not found.' };
    }

    const userData = userSnap.data();
    const unlockedList: string[] = userData.unlocked_investors || [];

    // 1. Check if already unlocked
    if (unlockedList.includes(investorId)) {
      let email = '';
      let telegram = '';
      try {
        const privSnap = await getDoc(doc(db, COLLECTION_NAME, investorId, 'private', 'contact'));
        if (privSnap.exists()) {
          email = privSnap.data().email || '';
          telegram = privSnap.data().telegram || '';
        }
      } catch (e) {}

      if (!email && !telegram) {
        const invSnap = await getDoc(doc(db, COLLECTION_NAME, investorId));
        const invData = invSnap.exists() ? invSnap.data() : {};
        email = invData.email || '';
        telegram = invData.telegram || '';
      }

      return {
        success: true,
        remainingCredits: currentCredits,
        unlockedData: { email, telegram },
      };
    }

    // 2. Spend 1 credit atomically via the ledger-backed spendCredits flow.
    const spend = await spendCredits(userId, 'contact_unlock', 1, 'discretionary_addon', { investorId });
    if (!spend.success) {
      return { success: false, error: spend.error || 'Failed to deduct credit for unlock.' };
    }
    const newCredits = spend.newBalance;

    // Record the unlock on the user doc (non-monetary state).
    await updateDoc(userRef, {
      unlocked_investors: arrayUnion(investorId),
    });

    // 3. Retrieve real contact from secured private subcollection (fallback to main doc)
    let email = '';
    let telegram = '';
    try {
      const privSnap = await getDoc(doc(db, COLLECTION_NAME, investorId, 'private', 'contact'));
      if (privSnap.exists()) {
        email = privSnap.data().email || '';
        telegram = privSnap.data().telegram || '';
      }
    } catch (e) {}

    if (!email && !telegram) {
      const invSnap = await getDoc(doc(db, COLLECTION_NAME, investorId));
      const invData = invSnap.exists() ? invSnap.data() : {};
      email = invData.email || '';
      telegram = invData.telegram || '';
    }

    return {
      success: true,
      remainingCredits: newCredits,
      unlockedData: { email, telegram },
    };
  } catch (err: any) {
    console.error('[Web3Investors] Unlock error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Declare personal connection to an investor ("I know them personally")
 */
export async function declarePersonalInvestorBridge(
  userId: string,
  userName: string,
  userCompany: string,
  investor: Web3Investor
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Increment know_count on investor
    const invRef = doc(db, COLLECTION_NAME, investor.id);
    await updateDoc(invRef, {
      know_count: increment(1),
    });

    // 2. Create entry in investor_connections
    await addDoc(collection(db, 'investor_connections'), {
      founderId: userId,
      founderName: userName,
      founderCompany: userCompany,
      investorName: investor.name,
      investorFirm: investor.firm,
      ticketSize: investor.check_size || '$100k',
      sectors: investor.sectors || ['Web3'],
      status: 'verified',
      created_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Web3Investors] Declare bridge error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch single investor profile by ID (from users or web3_investors collection)
 */
export async function getInvestorProfile(id: string): Promise<{ data?: any; error?: string }> {
  try {
    // 1. Try web3_investors collection
    const invSnap = await getDoc(doc(db, 'web3_investors', id));
    if (invSnap.exists()) {
      const data = invSnap.data();
      return {
        data: {
          id: invSnap.id,
          full_name: data.name,
          fund_name: data.firm,
          investor_type: data.category,
          bio: `${data.role || 'Investor'} at ${data.firm}. Investing in ${data.sectors?.join(', ') || 'Web3'}.`,
          quiet_mode: false,
          preferred_sectors: data.sectors,
          min_check_size: 50000,
          max_check_size: 500000,
        },
      };
    }

    // 2. Fallback to users collection
    const userSnap = await getDoc(doc(db, 'users', id));
    if (userSnap.exists()) {
      const uData = userSnap.data();
      return {
        data: {
          id: userSnap.id,
          full_name: uData.full_name || uData.name || 'Investor',
          fund_name: uData.company_name || uData.firm_name || 'Venture Partner',
          investor_type: uData.investor_type || 'vc',
          bio: uData.bio || 'Venture investor.',
          quiet_mode: false,
          preferred_sectors: uData.sectors || ['Web3', 'DeFi'],
          min_check_size: 25000,
          max_check_size: 250000,
        },
      };
    }

    return { error: 'Investor not found' };
  } catch (err: any) {
    console.error('[Web3Investors] getInvestorProfile error:', err);
    return { error: err.message };
  }
}

/**
 * Fetch investor preferences by UID
 */
export async function getInvestorPreferences(uid: string): Promise<{ data?: any; error?: string }> {
  try {
    const prefSnap = await getDoc(doc(db, 'investor_preferences', uid));
    if (prefSnap.exists()) {
      return { data: prefSnap.data() };
    }
    return { data: null };
  } catch (err: any) {
    console.error('[Web3Investors] getInvestorPreferences error:', err);
    return { error: err.message };
  }
}

/**
 * Upsert investor profile and preferences during onboarding
 */
export async function upsertInvestorProfile(uid: string, formData: any): Promise<{ success: boolean; error?: any }> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      role: 'investor',
      full_name: formData.full_name,
      linkedin_url: formData.linkedin_url,
      investor_type: formData.investor_type,
      company_name: formData.fund_name,
      fund_website: formData.fund_website,
      bio: formData.bio,
      calendly_link: formData.calendly_link || formData.cal_link,
      cal_link: formData.cal_link || formData.calendly_link,
      quiet_mode: formData.quiet_mode,
      call_fee_usd: Number(formData.call_fee_usd || 0),
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }, { merge: true });

    const prefRef = doc(db, 'investor_preferences', uid);
    await setDoc(prefRef, {
      userId: uid,
      preferred_sectors: formData.preferred_sectors || [],
      preferred_stages: formData.preferred_stages || [],
      min_check_size: Number(formData.min_check_size || 0),
      max_check_size: Number(formData.max_check_size || 0),
      geography: formData.geography || 'Global',
      thesis_description: formData.thesis_description || '',
      updated_at: new Date().toISOString(),
    }, { merge: true });

    return { success: true };
  } catch (err: any) {
    console.error('[Web3Investors] upsertInvestorProfile error:', err);
    return { success: false, error: err };
  }
}


