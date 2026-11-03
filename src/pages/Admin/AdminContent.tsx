import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  X,
  Loader2,
  Calendar,
  Sparkles,
  Tag,
  Globe,
} from 'lucide-react';
import { getAllPostsAdmin, createPost, updatePost, deletePost } from '../../lib/content';
import { ContentPost, PostType } from '../../types/content';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminContent() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: 'blog' as PostType,
    title: '',
    summary: '',
    body: '',
    cover_image: '',
    tags: '',
    isPublished: true,
    eventDate: '',
  });

  const uid = user?.uid || (user as any)?.id;
  const adminName = profile?.full_name || user?.displayName || 'Admin Editor';

  const loadPosts = async () => {
    setLoading(true);
    const data = await getAllPostsAdmin();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingPostId(null);
    setForm({
      type: 'blog',
      title: '',
      summary: '',
      body: '',
      cover_image: '',
      tags: '',
      isPublished: true,
      eventDate: '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: ContentPost) => {
    setEditingPostId(post.id);
    setForm({
      type: post.type,
      title: post.title,
      summary: post.summary,
      body: post.body,
      cover_image: post.cover_image || '',
      tags: post.tags ? post.tags.join(', ') : '',
      isPublished: post.isPublished !== false,
      eventDate: post.eventDate || '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and Body are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingPostId) {
      const res = await updatePost(editingPostId, {
        type: form.type,
        title: form.title,
        summary: form.summary,
        body: form.body,
        cover_image: form.cover_image,
        tags: tagsArray,
        isPublished: form.isPublished,
        eventDate: form.eventDate,
      });
      if (res.success) {
        setIsModalOpen(false);
        loadPosts();
      } else {
        setError(res.error || 'Failed to update post.');
      }
    } else {
      const res = await createPost(uid, adminName, {
        type: form.type,
        title: form.title,
        summary: form.summary,
        body: form.body,
        cover_image: form.cover_image,
        tags: tagsArray,
        isPublished: form.isPublished,
        eventDate: form.eventDate,
      });
      if (res.success) {
        setIsModalOpen(false);
        loadPosts();
      } else {
        setError(res.error || 'Failed to create post.');
      }
    }
    setIsSaving(false);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    const res = await deletePost(id);
    if (res.success) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  const inputCls =
    'w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-black outline-none transition-all';
  const labelCls = 'block text-[11px] font-black uppercase text-gray-500 mb-1.5 tracking-wider';

  return (
    <div className="space-y-8 font-sans pb-24">
      {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">Content & News Publishing</h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Publish news, blog posts, and event announcements directly to the public blog and user dashboards.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-3 bg-black text-white rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-md cursor-pointer shrink-0"
          >
            <Plus size={16} /> Publish New Content
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['all', 'blog', 'news', 'event'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t === 'all' ? 'All Content' : `${t}s`}
            </button>
          ))}
        </div>

        {/* Posts Table / Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-gray-400">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-gray-100 p-12 text-center space-y-4">
            <FileText size={40} className="mx-auto text-gray-300" />
            <h3 className="font-extrabold text-base text-black">No Content Posts Published</h3>
            <p className="text-xs text-gray-500 font-medium">Create your first blog post or news announcement above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-[28px] border border-gray-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden"
              >
                <div>
                  {/* Image */}
                  {post.cover_image && (
                    <div className="w-full h-36 bg-gray-100 rounded-2xl overflow-hidden mb-4 border border-gray-100">
                      <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Header badges */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        post.type === 'event'
                          ? 'bg-purple-100 text-purple-800'
                          : post.type === 'news'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {post.type}
                    </span>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        post.isPublished !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {post.isPublished !== false ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-black line-clamp-2 mb-1">{post.title}</h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-4">{post.summary}</p>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(post)}
                      className="p-2 text-gray-500 hover:text-black rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-red-500 hover:text-red-700 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-gray-100 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="font-black text-lg text-black">
                  {editingPostId ? 'Edit Content Post' : 'Publish New Content Post'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold">{error}</div>
              )}

              <form onSubmit={handleSavePost} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Content Type *</label>
                    <select
                      className={inputCls}
                      value={form.type}
                      onChange={(e: any) => setForm((p) => ({ ...p, type: e.target.value }))}
                    >
                      <option value="blog">Blog Post</option>
                      <option value="news">News Announcement</option>
                      <option value="event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Status</label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isPublished}
                          onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span>Publish Immediately</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Title *</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Raisequity Welcomes 15 New VC Partners in Q3"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>Summary / Subtitle</label>
                  <input
                    className={inputCls}
                    placeholder="Brief 1-2 sentence preview for search index and widgets"
                    value={form.summary}
                    onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>Content Body (Markdown Supported) *</label>
                  <textarea
                    className={`${inputCls} h-40 resize-none font-mono text-xs`}
                    placeholder="Write your article, news update, or event announcement..."
                    value={form.body}
                    onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Cover Image URL</label>
                    <input
                      className={inputCls}
                      placeholder="https://images.unsplash.com/..."
                      value={form.cover_image}
                      onChange={(e) => setForm((p) => ({ ...p, cover_image: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Tags (Comma separated)</label>
                    <input
                      className={inputCls}
                      placeholder="web3, venture, announcement"
                      value={form.tags}
                      onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                    />
                  </div>
                </div>

                {form.type === 'event' && (
                  <div>
                    <label className={labelCls}>Event Date</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.eventDate}
                      onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
                    />
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 bg-gray-100 text-gray-700 rounded-2xl text-xs font-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-black text-white rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    {isSaving && <Loader2 size={14} className="animate-spin" />}
                    <span>{editingPostId ? 'Save Changes' : 'Publish Content'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
