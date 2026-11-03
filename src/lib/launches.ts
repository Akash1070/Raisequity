import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  increment,
  limit,
  deleteDoc,
} from 'firebase/firestore';
import { LaunchItem, LaunchSubmissionData, LaunchComment, LaunchVote } from '../types/launch';

/**
 * Creates a unique URL slug from a company name
 */
export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  return base || `launch-${Date.now().toString(36)}`;
}

/**
 * Creates a new launch submission
 */
export async function createLaunch(
  founderId: string,
  founderName: string,
  data: LaunchSubmissionData
): Promise<{ success: boolean; launch?: LaunchItem; error?: string }> {
  if (!founderId || !data.company_name || !data.website_url) {
    return { success: false, error: 'Missing required launch details.' };
  }

  // Format & sanitize tagline
  let sanitizedTagline = data.tagline.trim();
  if (sanitizedTagline.endsWith('.')) {
    sanitizedTagline = sanitizedTagline.slice(0, -1);
  }
  if (sanitizedTagline.length > 70) {
    sanitizedTagline = sanitizedTagline.substring(0, 67) + '...';
  }

  const slug = generateSlug(data.company_name);
  const launchId = `launch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const launchItem: LaunchItem = {
    id: launchId,
    slug,
    founder_id: founderId,
    founder_name: founderName || 'Founder',
    company_name: data.company_name.trim(),
    tagline: sanitizedTagline,
    description: data.description.substring(0, 600).trim(),
    website_url: data.website_url.trim(),
    logo_url: data.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    screenshots: data.screenshots || [],
    category: data.category || 'Tech',
    twitter_handle: data.twitter_handle || '',
    maker_comment: data.maker_comment || '',
    launch_tier: data.launch_tier || 'standard',
    scheduled_date: data.scheduled_date || now,
    status: data.launch_tier === 'standard' ? 'queue' : 'launched',
    badgeVerified: false,
    votes_count: 1, // Maker auto-vote
    created_at: now,
    target_keywords: data.target_keywords || [],
    raising_status: data.raising_status || 'not_raising',
    target_raise: data.target_raise || '',
    valuation_cap: data.valuation_cap || '',
    demo_url: data.demo_url || '',
    github_url: data.github_url || '',
    telegram_url: data.telegram_url || '',
    traction_metric: data.traction_metric || '',
  };

  try {
    const docRef = doc(db, 'launches', launchId);
    await setDoc(docRef, launchItem);

    // If maker comment exists, store it as first pinned comment
    if (data.maker_comment) {
      const commentId = `comment_${Date.now()}`;
      const commentRef = doc(db, 'launch_comments', commentId);
      const makerCommentObj: LaunchComment = {
        id: commentId,
        launch_id: launchId,
        user_id: founderId,
        user_name: founderName || 'Maker',
        comment_text: data.maker_comment,
        is_maker: true,
        created_at: now,
      };
      await setDoc(commentRef, makerCommentObj);
    }

    return { success: true, launch: launchItem };
  } catch (err: any) {
    console.error('[Launches] Error creating launch:', err);
    return { success: false, error: err.message || 'Failed to submit launch.' };
  }
}

/**
 * Retrieves public launches with optional filtering and sorting
 */
export async function getPublicLaunches(
  category?: string,
  sortBy: 'votes' | 'recent' | 'tier' = 'votes'
): Promise<LaunchItem[]> {
  try {
    const q = query(collection(db, 'launches'));
    const snap = await getDocs(q);
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as LaunchItem[];

    // Category filter
    if (category && category !== 'All') {
      items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }

    // Sort items
    items.sort((a, b) => {
      // Premium / Spotlight tiered items prioritized top if tier sorting
      if (sortBy === 'tier') {
        const tierRank = { spotlight: 3, premium: 2, standard: 1 };
        const rankDiff = (tierRank[b.launch_tier] || 1) - (tierRank[a.launch_tier] || 1);
        if (rankDiff !== 0) return rankDiff;
      }
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // Default: votes_count
      return b.votes_count - a.votes_count;
    });

    return items;
  } catch (err) {
    console.error('[Launches] Error fetching launches:', err);
    return [];
  }
}

/**
 * Fetches a single launch by URL slug
 */
export async function getLaunchBySlug(slug: string): Promise<LaunchItem | null> {
  if (!slug) return null;
  try {
    const q = query(collection(db, 'launches'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as LaunchItem;
    }
    return null;
  } catch (err) {
    console.error('[Launches] Error fetching launch by slug:', err);
    return null;
  }
}

/**
 * Checks if a user has voted for a launch
 */
export async function hasUserVoted(launchId: string, userId: string): Promise<boolean> {
  if (!launchId || !userId) return false;
  try {
    const voteId = `${launchId}_${userId}`;
    const voteRef = doc(db, 'launch_votes', voteId);
    const snap = await getDoc(voteRef);
    return snap.exists();
  } catch (err) {
    return false;
  }
}

/**
 * Casts a vote for a launch
 */
export async function voteLaunch(
  launchId: string,
  userId: string
): Promise<{ success: boolean; newCount?: number; error?: string }> {
  if (!launchId || !userId) {
    return { success: false, error: 'Login required to vote.' };
  }

  const voteId = `${launchId}_${userId}`;
  const voteRef = doc(db, 'launch_votes', voteId);
  const launchRef = doc(db, 'launches', launchId);

  try {
    const voteSnap = await getDoc(voteRef);
    if (voteSnap.exists()) {
      return { success: false, error: 'You have already voted for this project.' };
    }

    const now = new Date().toISOString();
    await setDoc(voteRef, { id: voteId, launch_id: launchId, user_id: userId, created_at: now });
    await updateDoc(launchRef, { votes_count: increment(1) });

    const updatedSnap = await getDoc(launchRef);
    const newCount = updatedSnap.exists() ? (updatedSnap.data().votes_count || 1) : 1;

    return { success: true, newCount };
  } catch (err: any) {
    console.error('[Launches] Error voting for launch:', err);
    return { success: false, error: err.message || 'Failed to submit vote.' };
  }
}

/**
 * Returns the auto-computed live count of currently verified launch projects (badgeVerified === true)
 */
export async function getVerifiedLaunchCount(): Promise<number> {
  try {
    const q = query(collection(db, 'launches'), where('badgeVerified', '==', true));
    const snap = await getDocs(q);
    return snap.size;
  } catch (err) {
    console.error('[Launches] Error counting verified launches:', err);
    return 0;
  }
}

/**
 * Adds a comment to a launch
 */
export async function addLaunchComment(
  launchId: string,
  userId: string,
  userName: string,
  commentText: string,
  isMaker: boolean = false
): Promise<{ success: boolean; comment?: LaunchComment; error?: string }> {
  if (!launchId || !userId || !commentText.trim()) {
    return { success: false, error: 'Missing comment content.' };
  }

  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
  const commentRef = doc(db, 'launch_comments', commentId);
  const now = new Date().toISOString();

  const commentObj: LaunchComment = {
    id: commentId,
    launch_id: launchId,
    user_id: userId,
    user_name: userName || 'Community Member',
    comment_text: commentText.trim(),
    is_maker: isMaker,
    created_at: now,
  };

  try {
    await setDoc(commentRef, commentObj);
    return { success: true, comment: commentObj };
  } catch (err: any) {
    console.error('[Launches] Error adding comment:', err);
    return { success: false, error: err.message || 'Failed to post comment.' };
  }
}

/**
 * Fetches all comments for a launch
 */
export async function getLaunchComments(launchId: string): Promise<LaunchComment[]> {
  if (!launchId) return [];
  try {
    const q = query(collection(db, 'launch_comments'), where('launch_id', '==', launchId));
    const snap = await getDocs(q);
    const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as LaunchComment[];
    comments.sort((a, b) => {
      // Maker comments first, then recent
      if (a.is_maker && !b.is_maker) return -1;
      if (!a.is_maker && b.is_maker) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return comments;
  } catch (err) {
    console.error('[Launches] Error fetching launch comments:', err);
    return [];
  }
}

/**
 * Fetches all launches submitted by a specific founder
 */
export async function getFounderLaunches(founderId: string): Promise<LaunchItem[]> {
  if (!founderId) return [];
  try {
    const q = query(collection(db, 'launches'), where('founder_id', '==', founderId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as LaunchItem[];
  } catch (err) {
    console.error('[Launches] Error fetching founder launches:', err);
    return [];
  }
}

/**
 * Updates an existing launch
 */
export async function updateLaunch(launchId: string, updates: Partial<LaunchItem>): Promise<{ success: boolean; error?: string }> {
  try {
    const launchRef = doc(db, 'launches', launchId);
    await updateDoc(launchRef, updates);
    return { success: true };
  } catch (err: any) {
    console.error('[Launches] Error updating launch:', err);
    return { success: false, error: err.message || 'Failed to update launch' };
  }
}

/**
 * Deletes a launch project
 */
export async function deleteLaunch(launchId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const launchRef = doc(db, 'launches', launchId);
    await deleteDoc(launchRef);
    return { success: true };
  } catch (err: any) {
    console.error('[Launches] Error deleting launch:', err);
    return { success: false, error: err.message || 'Failed to delete launch' };
  }
}
