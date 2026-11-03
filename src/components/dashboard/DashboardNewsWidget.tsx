import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight } from 'lucide-react';
import { getLatestNewsWidget } from '../../lib/content';
import { ContentPost } from '../../types/content';

export default function DashboardNewsWidget() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestNewsWidget()
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || posts.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#111111] rounded-[24px] p-5 border border-slate-200 dark:border-[#262626] shadow-xs space-y-4 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white">
          <Newspaper size={15} className="text-[#0070F3]" />
          <span>Ecosystem News &amp; Updates</span>
        </div>

        <Link
          to="/blog"
          className="text-[10px] font-mono font-bold text-[#0070F3] hover:text-[#0060DF] flex items-center gap-1 transition-colors"
        >
          <span>View All</span> <ArrowRight size={11} />
        </Link>
      </div>

      <div className="space-y-2.5">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="p-3 rounded-xl bg-slate-50 dark:bg-[#171717] hover:bg-slate-100 dark:hover:bg-[#202020] border border-slate-200 dark:border-[#262626] transition-all block group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-mono font-bold uppercase px-2 py-0.5 bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/25 rounded">
                {post.type}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(post.publishedAt).toLocaleDateString()}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#0070F3] transition-colors line-clamp-1">
              {post.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
}
