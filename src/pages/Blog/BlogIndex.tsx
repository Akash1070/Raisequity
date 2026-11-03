import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Sparkles, Calendar, Tag, ArrowRight, Building2 } from 'lucide-react';
import { getPublishedPosts } from '../../lib/content';
import { ContentPost, PostType } from '../../types/content';

export default function BlogIndex() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    getPublishedPosts(activeType === 'all' ? undefined : (activeType as PostType))
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, [activeType]);

  const filtered = posts.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 font-sans pb-24">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="bg-black text-white rounded-[36px] md:rounded-[48px] p-8 md:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full mb-6 text-purple-400 border border-white/10">
              <Sparkles size={14} /> Raisequity Ecosystem Blog & News
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.05] tracking-[-2px] mb-4">
              Venture Insights, <br />
              <span className="text-purple-400">Funding News & Events.</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 font-medium">
              Official announcements, Web3 funding trends, and founder resources published directly by Raisequity partners.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {['all', 'blog', 'news', 'event'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer whitespace-nowrap ${
                  activeType === t
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t === 'all' ? 'All Updates' : `${t}s`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs font-bold text-gray-400">Loading articles...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-[36px] border border-gray-100 p-16 text-center space-y-4">
            <FileText size={40} className="mx-auto text-gray-300" />
            <h3 className="font-extrabold text-base text-black">No Content Found</h3>
            <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
              Check back soon for new funding news and platform announcements!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {post.cover_image && (
                    <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-4 left-4 bg-black/80 text-white backdrop-blur-md text-[10px] font-black uppercase px-3 py-1 rounded-full">
                        {post.type}
                      </span>
                    </div>
                  )}

                  <div className="p-6 sm:p-8 space-y-3">
                    <h2 className="text-xl font-extrabold text-black group-hover:text-purple-600 transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>
                </div>

                <div className="px-6 sm:px-8 pb-6 pt-2 flex items-center justify-between border-t border-gray-50 text-xs font-bold text-gray-400">
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  <span className="text-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Read Article <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
