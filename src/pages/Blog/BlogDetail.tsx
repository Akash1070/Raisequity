import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Calendar, Tag, Share2, Check, User } from 'lucide-react';
import { getPostBySlug } from '../../lib/content';
import { ContentPost } from '../../types/content';
import { usePageMeta } from '../../hooks/usePageMeta';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<ContentPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getPostBySlug(slug)
      .then((data) => {
        if (data) {
          setPost(data);
          document.title = `${data.title} | Raisequity Insights`;
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  usePageMeta({
    title: post ? `${post.title} - Raisequity Blog` : 'Raisequity Blog',
    description: post?.summary,
    canonicalPath: post ? `/blog/${post.slug}` : '/blog',
    jsonLd: post
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          datePublished: post.publishedAt,
          author: { '@type': 'Person', name: post.authorName || 'Raisequity' },
        }
      : undefined,
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        Loading article...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center space-y-4 font-sans">
        <FileText size={48} className="text-gray-300" />
        <h2 className="text-2xl font-black text-black">Article Not Found</h2>
        <p className="text-xs text-gray-500 font-medium">The post you are looking for does not exist or has been removed.</p>
        <Link to="/blog" className="px-6 py-3 bg-black text-white rounded-full text-xs font-black">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 font-sans pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black">
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <button
            onClick={handleShare}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-black rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>

        <article className="bg-white rounded-[36px] p-8 sm:p-12 border border-gray-100 shadow-xl space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                {post.type}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {new Date(post.publishedAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight leading-tight">
              {post.title}
            </h1>

            {post.summary && (
              <p className="text-base text-gray-500 font-medium leading-relaxed">
                {post.summary}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2 text-xs font-bold text-gray-600 border-t border-gray-100">
              <User size={15} className="text-gray-400" />
              <span>By {post.authorName}</span>
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="w-full h-80 rounded-3xl overflow-hidden border border-gray-100">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Body */}
          <div className="prose max-w-none text-sm text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
            {post.body}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <Tag size={14} className="text-gray-400" />
              {post.tags.map((tag) => (
                <span key={tag} className="text-[11px] font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
