import { db, storage } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  orderBy, 
  where,
  getDoc,
  increment 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { spendCredits } from './credits';
import { sendEmailNotification } from './notifications';

export type PostTag = 'raising' | 'hiring' | 'grant' | 'update' | 'partnership' | 'serviceneeded';

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorRole: string;
  authorAvatar?: string;
  title: string;
  content: string;
  tag: PostTag;
  pitchDeckUrl?: string;
  pitchDeckName?: string;
  likesCount: number;
  likedBy: string[];
  commentsCount: number;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  commentText: string;
  createdAt: string;
}

/**
 * Upload pitch deck PDF to Firebase Storage
 */
export async function uploadPitchDeckPdf(file: File, userId: string): Promise<string> {
  const fileRef = ref(storage, `pitch_decks/${userId}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
}

/**
 * Create a new Community Feed Post (Deducts 1 Credit atomically)
 */
export async function createFeedPost(
  authorId: string,
  authorName: string,
  authorEmail: string,
  authorRole: string,
  title: string,
  content: string,
  tag: PostTag,
  pitchDeckUrl?: string,
  pitchDeckName?: string,
  authorAvatar?: string
): Promise<{ success: boolean; post?: FeedPost; error?: string }> {
  console.log('[Posts] Creating community post for user:', authorId);

  try {
    // 1. Deduct 1 credit via spendCredits friction rule
    const creditRes = await spendCredits(
      authorId,
      'feed_post',
      1,
      'discretionary_addon',
      { title, tag }
    );

    if (!creditRes.success) {
      return { 
        success: false, 
        error: creditRes.error || 'Posting costs 1 credit. Please earn or top up credits.' 
      };
    }

    // 2. Save post document to Firestore `posts` collection
    const postData = {
      authorId,
      authorName,
      authorEmail,
      authorRole,
      authorAvatar: authorAvatar || null,
      title,
      content,
      tag,
      pitchDeckUrl: pitchDeckUrl || null,
      pitchDeckName: pitchDeckName || null,
      likesCount: 0,
      likedBy: [],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'posts'), postData);

    const post: FeedPost = {
      id: docRef.id,
      ...postData,
      pitchDeckUrl: pitchDeckUrl || undefined,
      pitchDeckName: pitchDeckName || undefined,
      authorAvatar: authorAvatar || undefined,
    };

    return { success: true, post };
  } catch (err: any) {
    console.error('[Posts] Error creating post:', err);
    return { success: false, error: err.message || 'Failed to create post.' };
  }
}

/**
 * Fetch all feed posts from Firestore
 */
export async function getFeedPosts(tagFilter?: string): Promise<FeedPost[]> {
  try {
    const postsRef = collection(db, 'posts');
    let q = query(postsRef, orderBy('createdAt', 'desc'));
    
    if (tagFilter && tagFilter !== 'all') {
      q = query(postsRef, where('tag', '==', tagFilter), orderBy('createdAt', 'desc'));
    }

    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as FeedPost[];
  } catch (err) {
    console.error('[Posts] Error fetching feed posts:', err);
    return [];
  }
}

/**
 * Toggle like on a feed post
 */
export async function toggleLikePost(postId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId);
    const snap = await getDoc(postRef);
    if (!snap.exists()) return false;

    const data = snap.data();
    const likedBy: string[] = data.likedBy || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(userId),
        likesCount: increment(-1),
      });
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(userId),
        likesCount: increment(1),
      });
    }

    return true;
  } catch (err) {
    console.error('[Posts] Error toggling post like:', err);
    return false;
  }
}

/**
 * Add a comment to a feed post & trigger Resend email alert to author
 */
export async function addPostComment(
  postId: string,
  authorId: string,
  authorName: string,
  authorRole: string,
  commentText: string
): Promise<PostComment | null> {
  try {
    const commentsRef = collection(db, `posts/${postId}/comments`);
    const commentData = {
      postId,
      authorId,
      authorName,
      authorRole,
      commentText,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(commentsRef, commentData);

    // Increment commentsCount on parent post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(1),
    });

    // Notify author over email via Resend
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      if (postData.authorId !== authorId && postData.authorEmail) {
        await sendEmailNotification(postData.authorId, 'feed_post_received' as any, {
          recipientEmail: postData.authorEmail,
          recipientName: postData.authorName,
          subject: `${authorName} commented on your post: "${postData.title.substring(0, 30)}..."`,
          bodyText: `Hi ${postData.authorName},\n\n${authorName} commented on your Raisequity feed post:\n\n"${commentText}"\n\nView and reply in your Raisequity dashboard.`,
          actionUrl: `${window.location.origin}/services?postId=${postId}`,
        });
      }
    }

    return { id: docRef.id, ...commentData };
  } catch (err) {
    console.error('[Posts] Error adding comment:', err);
    return null;
  }
}

/**
 * Fetch comments for a post
 */
export async function getPostComments(postId: string): Promise<PostComment[]> {
  try {
    const commentsRef = collection(db, `posts/${postId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as PostComment[];
  } catch (err) {
    console.error('[Posts] Error fetching post comments:', err);
    return [];
  }
}

export const togglePostLike = toggleLikePost;
