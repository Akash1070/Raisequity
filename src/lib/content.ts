import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { ContentPost, CreatePostInput, PostType } from '../types/content';

export function generatePostSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  return base || `post-${Date.now().toString(36)}`;
}

/**
 * Creates a new content post
 */
export async function createPost(
  authorId: string,
  authorName: string,
  data: CreatePostInput
): Promise<{ success: boolean; post?: ContentPost; error?: string }> {
  if (!data.title || !data.body) {
    return { success: false, error: 'Title and content body are required.' };
  }

  const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const slug = generatePostSlug(data.title);
  const now = new Date().toISOString();

  const postObj: ContentPost = {
    id: postId,
    slug,
    type: data.type || 'news',
    title: data.title.trim(),
    summary: data.summary ? data.summary.trim() : data.body.substring(0, 160).trim(),
    body: data.body.trim(),
    cover_image: data.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    publishedAt: now,
    authorAdminId: authorId,
    authorName: authorName || 'Raisequity Editorial',
    tags: data.tags || [],
    isPublished: data.isPublished !== undefined ? data.isPublished : true,
    eventDate: data.eventDate || '',
  };

  try {
    const docRef = doc(db, 'content_posts', postId);
    await setDoc(docRef, postObj);
    return { success: true, post: postObj };
  } catch (err: any) {
    console.error('[ContentService] Error creating post:', err);
    return { success: false, error: err.message || 'Failed to create post.' };
  }
}

/**
 * Updates an existing content post
 */
export async function updatePost(
  postId: string,
  data: Partial<CreatePostInput>
): Promise<{ success: boolean; error?: string }> {
  if (!postId) return { success: false, error: 'Post ID required.' };
  try {
    const docRef = doc(db, 'content_posts', postId);
    const updates: any = { ...data };
    if (data.title) {
      updates.slug = generatePostSlug(data.title);
    }
    await updateDoc(docRef, updates);
    return { success: true };
  } catch (err: any) {
    console.error('[ContentService] Error updating post:', err);
    return { success: false, error: err.message || 'Failed to update post.' };
  }
}

/**
 * Deletes a post
 */
export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  if (!postId) return { success: false, error: 'Post ID required.' };
  try {
    await deleteDoc(doc(db, 'content_posts', postId));
    return { success: true };
  } catch (err: any) {
    console.error('[ContentService] Error deleting post:', err);
    return { success: false, error: err.message || 'Failed to delete post.' };
  }
}

/**
 * Fetches all posts for Admin view (including drafts)
 */
export async function getAllPostsAdmin(): Promise<ContentPost[]> {
  try {
    const q = query(collection(db, 'content_posts'));
    const snap = await getDocs(q);
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ContentPost[];
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return posts;
  } catch (err) {
    console.error('[ContentService] Error fetching admin posts:', err);
    return [];
  }
}

/**
 * Fetches published posts for public blog
 */
export async function getPublishedPosts(type?: PostType): Promise<ContentPost[]> {
  try {
    const q = query(collection(db, 'content_posts'));
    const snap = await getDocs(q);
    let posts = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ContentPost[];
    posts = posts.filter((p) => p.isPublished !== false);

    if (type) {
      posts = posts.filter((p) => p.type === type);
    }

    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return posts;
  } catch (err) {
    console.error('[ContentService] Error fetching published posts:', err);
    return [];
  }
}

/**
 * Fetches a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<ContentPost | null> {
  if (!slug) return null;
  try {
    const q = query(collection(db, 'content_posts'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as ContentPost;
    }
    return null;
  } catch (err) {
    console.error('[ContentService] Error fetching post by slug:', err);
    return null;
  }
}

/**
 * Fetches top 3 published posts for dashboard news widget
 */
export async function getLatestNewsWidget(): Promise<ContentPost[]> {
  try {
    const posts = await getPublishedPosts();
    return posts.slice(0, 3);
  } catch (err) {
    return [];
  }
}
