export type PostType = 'blog' | 'news' | 'event';

export interface ContentPost {
  id: string;
  slug: string;
  type: PostType;
  title: string;
  summary: string;
  body: string;
  cover_image?: string;
  publishedAt: string;
  authorAdminId: string;
  authorName: string;
  tags?: string[];
  isPublished: boolean;
  eventDate?: string; // Optional for event posts
}

export interface CreatePostInput {
  type: PostType;
  title: string;
  summary: string;
  body: string;
  cover_image?: string;
  tags?: string[];
  isPublished?: boolean;
  eventDate?: string;
}
