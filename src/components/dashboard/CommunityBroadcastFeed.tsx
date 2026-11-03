import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Heart,
  Share2,
  FileText,
  Download,
  Send,
  Sparkles,
  Coins,
  Plus,
  Loader2,
  User,
  Clock,
  Tag,
  UserPlus,
  CheckCircle2,
  ExternalLink,
  Building2
} from 'lucide-react';
import {
  FeedPost,
  PostTag,
  getFeedPosts,
  togglePostLike,
  addPostComment,
  getPostComments,
  PostComment
} from '../../lib/posts';
import { useAuth } from '../../contexts/AuthContext';
import { useFounderProfile } from '../../hooks/useFounderProfile';
import { getOrCreateConversation, sendDirectMessage } from '../../lib/messages';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import CreatePostModal from './CreatePostModal';

interface CommunityBroadcastFeedProps {
  userRole?: 'founder' | 'investor' | 'service_provider' | 'admin';
  userCredits?: number;
  onPostSuccess?: () => void;
}

const TAG_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Broadcasts' },
  { value: 'raising', label: '#raising' },
  { value: 'hiring', label: '#hiring' },
  { value: 'grant', label: '#grant' },
  { value: 'partnership', label: '#partnership' },
  { value: 'serviceneeded', label: '#serviceneeded' },
  { value: 'update', label: '#update' },
];

export default function CommunityBroadcastFeed({
  userRole = 'founder',
  userCredits = 50,
  onPostSuccess,
}: CommunityBroadcastFeedProps) {
  const { user, profile } = useAuth();
  const { founderProfile } = useFounderProfile();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Comments state
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [commentInput, setCommentInput] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [connectingPostId, setConnectingPostId] = useState<string | null>(null);
  const [connectedPostMap, setConnectedPostMap] = useState<Record<string, boolean>>({});
  const [viewingProfilePost, setViewingProfilePost] = useState<FeedPost | null>(null);
  const [notEnoughCredits, setNotEnoughCredits] = useState(false);

  const uid = user?.uid || (user as any)?.id || '';
  const currentCredits = profile?.credit_balance ?? userCredits;
  const userAvatar = founderProfile?.profile_photo_url || profile?.profile_photo_url || profile?.avatar_url || (profile as any)?.photoURL || (user as any)?.photoURL || undefined;

  const handleConnectWithAuthor = async (post: FeedPost) => {
    if (!uid) {
      navigate('/login');
      return;
    }
    if (post.authorId === uid) return;

    if (currentCredits < 1) {
      setNotEnoughCredits(true);
      setTimeout(() => setNotEnoughCredits(false), 4000);
      return;
    }

    setConnectingPostId(post.id);
    try {
      // 1. Deduct 1 credit in Firestore
      try {
        await updateDoc(doc(db, 'users', uid), {
          credit_balance: increment(-1),
          credits: increment(-1),
        });
        if (founderProfile?.id) {
          await updateDoc(doc(db, 'founder_profiles', uid), {
            credits: increment(-1),
          });
        }
      } catch (cErr) {
        console.warn('Could not update credit balance in Firestore:', cErr);
      }

      // 2. Start direct message thread
      const currentPart = {
        id: uid,
        name: profile?.full_name || founderProfile?.full_name || user?.displayName || user?.email?.split('@')[0] || 'Member',
        email: user?.email || '',
        role: (profile?.role as any) || userRole,
        avatar_url: userAvatar,
        company_name: founderProfile?.company_name || profile?.company_name || '',
      };

      const authorPart = {
        id: post.authorId,
        name: post.authorName,
        email: post.authorEmail || `${post.authorName.toLowerCase().replace(/\s+/g, '')}@raisequity.com`,
        role: (post.authorRole as any) || 'founder',
        avatar_url: post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`,
        company_name: post.title,
      };

      const convId = await getOrCreateConversation(currentPart, authorPart, { deal_name: post.title });
      await sendDirectMessage({
        conversationId: convId,
        sender: currentPart,
        recipientId: post.authorId,
        recipientRole: post.authorRole,
        content: `Hi ${post.authorName}, I saw your broadcast "${post.title}" on the Community Feed and connected with 1 credit. Let's chat!`,
        messageType: 'text',
      });

      setConnectedPostMap((prev) => ({ ...prev, [post.id]: true }));
      setTimeout(() => {
        navigate(`/dashboard/messages?convId=${convId}`);
      }, 400);
    } catch (err) {
      console.error('Error connecting with author:', err);
    } finally {
      setConnectingPostId(null);
    }
  };

  const handleSharePost = async (post: FeedPost) => {
    const postUrl = `${window.location.origin}/dashboard/community?post=${post.id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
        setCopiedPostId(post.id);
        setTimeout(() => setCopiedPostId(null), 2500);
      }
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getFeedPosts(activeTag === 'all' ? undefined : activeTag);
      setPosts(data);
    } catch (err) {
      console.error('Error loading community broadcast posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [activeTag]);

  const handleToggleLike = async (postId: string) => {
    if (!uid) return;
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = p.likedBy?.includes(uid);
          return {
            ...p,
            likesCount: isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
            likedBy: isLiked ? p.likedBy.filter((id) => id !== uid) : [...(p.likedBy || []), uid],
          };
        }
        return p;
      })
    );
    await togglePostLike(postId, uid);
  };

  const handleToggleComments = async (postId: string) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      return;
    }
    setOpenCommentsPostId(postId);
    try {
      const cList = await getPostComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: cList }));
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleSendComment = async (postId: string) => {
    if (!commentInput.trim() || !uid) return;
    setSubmittingComment(true);
    try {
      const authorName = profile?.full_name || user?.displayName || user?.email?.split('@')[0] || 'Member';
      const role = profile?.role || userRole;
      const newComment = await addPostComment(postId, uid, authorName, role, commentInput.trim());
      if (newComment) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), newComment],
        }));
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p))
        );
        setCommentInput('');
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'investor':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            💼 Verified Investor
          </span>
        );
      case 'service_provider':
      case 'agency':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            ⚡ Vetted Agency
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            🚀 Founder
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Header & Action Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
              Ecosystem Community Broadcasts
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
              Cross-Platform Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
            Broadcast deal updates, hiring needs, grant allocations, or service requests directly to all founders, investors, and agencies.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-xs font-mono transition-all hover:opacity-90 flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <Plus size={14} />
          <span>New Broadcast (1 Credit)</span>
        </button>
      </div>

      {/* Tag Filters Strip */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {TAG_FILTERS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTag(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer border ${
              activeTag === t.value
                ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs'
                : 'bg-white dark:bg-[#121316] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10">
          <Loader2 size={24} className="animate-spin text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-mono text-slate-400">Loading ecosystem broadcasts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10 space-y-3">
          <MessageSquare size={32} className="text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 font-mono">
            No Broadcasts in {activeTag === 'all' ? 'Ecosystem' : `#${activeTag}`} yet
          </h4>
          <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
            Be the first to share an update, capital round, or request with the community. Costs 1 platform credit.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-mono font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Create First Post</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = post.likedBy?.includes(uid);
            const isCommentsOpen = openCommentsPostId === post.id;
            const comments = commentsMap[post.id] || [];

            return (
              <div
                key={post.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-all hover:border-slate-300 dark:hover:border-white/20"
              >
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-slate-800 dark:text-white font-mono shrink-0 overflow-hidden">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                      ) : (
                        post.authorName?.charAt(0) || 'M'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingProfilePost(post)}
                          className="font-extrabold text-sm text-slate-900 dark:text-white hover:text-[#0070F3] transition-colors cursor-pointer text-left"
                          title="View Profile Details"
                        >
                          {post.authorName}
                        </button>
                        {getRoleBadge(post.authorRole)}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                      #{post.tag}
                    </span>

                    {post.authorId !== uid ? (
                      <button
                        onClick={() => handleConnectWithAuthor(post)}
                        disabled={connectingPostId === post.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                          connectedPostMap[post.id]
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200'
                        }`}
                        title="Connect directly & start chat (costs 1 credit)"
                      >
                        {connectingPostId === post.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : connectedPostMap[post.id] ? (
                          <CheckCircle2 size={12} className="text-emerald-500" />
                        ) : (
                          <UserPlus size={12} className="text-[#0070F3]" />
                        )}
                        <span>{connectedPostMap[post.id] ? 'Connected ✓' : 'Connect (1 Credit)'}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5">
                        Your Post
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Body */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Pitch Deck Attachment (if any) */}
                {post.pitchDeckUrl && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300">
                      <FileText size={16} className="text-[#0070F3]" />
                      <span className="truncate max-w-xs">{post.pitchDeckName || 'Pitch_Deck.pdf'}</span>
                    </div>
                    <a
                      href={post.pitchDeckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-[11px] flex items-center gap-1 hover:opacity-90 transition-all shrink-0 cursor-pointer"
                    >
                      <Download size={12} />
                      <span>View Deck</span>
                    </a>
                  </div>
                )}

                {/* Actions row: Likes, Comments, Share & X Post */}
                <div className="flex items-center gap-4 pt-2.5 border-t border-slate-100 dark:border-white/5 text-xs font-mono">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 ${
                      isLiked ? 'text-rose-500 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Heart size={14} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                    <span>{post.likesCount || 0} Likes</span>
                  </button>

                  <button
                    onClick={() => handleToggleComments(post.id)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <MessageSquare size={14} />
                    <span>{post.commentsCount || 0} Comments</span>
                  </button>

                  <button
                    onClick={() => handleSharePost(post)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 ${
                      copiedPostId === post.id ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                    title="Copy direct link to clipboard"
                  >
                    <Share2 size={14} />
                    <span>{copiedPostId === post.id ? 'Link Copied! ✓' : 'Share'}</span>
                  </button>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this update on Raisequity: "${post.title}"\n\n${post.content.slice(0, 100)}...`)}&url=${encodeURIComponent(`${window.location.origin}/dashboard/community`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-slate-400 hover:text-black dark:hover:text-white transition-colors ml-auto text-[11px] px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-white/5"
                    title="Share to X / Twitter"
                  >
                    <span className="font-bold">𝕏 Post</span>
                  </a>
                </div>

                {/* Comments Drawer */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-3">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {comments.length === 0 ? (
                        <p className="text-[11px] font-mono text-slate-400 italic">No comments yet. Start the conversation!</p>
                      ) : (
                        comments.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-white/5 text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {c.authorName} ({c.authorRole})
                              </span>
                              <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">{c.commentText}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                        placeholder="Write a comment..."
                        className="bg-slate-50 dark:bg-[#18191e] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs rounded-xl px-3.5 py-2.5 flex-1 focus:outline-none focus:border-[#0070F3] font-mono"
                      />
                      <button
                        onClick={() => handleSendComment(post.id)}
                        disabled={submittingComment || !commentInput.trim()}
                        className="bg-[#0070F3] hover:bg-[#0060DF] disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer font-mono shadow-xs active:scale-95"
                      >
                        {submittingComment ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Insufficient Credits Banner */}
      {notEnoughCredits && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-amber-500 text-black font-mono font-bold text-xs rounded-2xl shadow-2xl flex items-center gap-3">
          <span>You need at least 1 credit to connect with this founder. Refill your balance to proceed!</span>
          <button onClick={() => setNotEnoughCredits(false)} className="text-black/60 hover:text-black">✕</button>
        </div>
      )}

      {/* Author Profile Quick View Modal */}
      {viewingProfilePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-white/10 rounded-[28px] max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-base overflow-hidden">
                  {viewingProfilePost.authorAvatar ? (
                    <img src={viewingProfilePost.authorAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    viewingProfilePost.authorName.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-black text-base">{viewingProfilePost.authorName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getRoleBadge(viewingProfilePost.authorRole)}
                    <span className="text-[11px] font-mono text-slate-400">#{viewingProfilePost.tag}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingProfilePost(null)} className="p-1.5 text-slate-400 hover:text-black dark:hover:text-white rounded-lg">✕</button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Startup / Broadcast Title</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{viewingProfilePost.title}</p>
                <p className="text-slate-600 dark:text-slate-300 font-sans text-xs leading-relaxed whitespace-pre-line">{viewingProfilePost.content}</p>
              </div>

              {viewingProfilePost.pitchDeckUrl && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs truncate">
                    <FileText size={15} />
                    <span className="truncate">{viewingProfilePost.pitchDeckName || 'Pitch Deck'}</span>
                  </div>
                  <a href={viewingProfilePost.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-emerald-500 text-black font-bold">
                    <Download size={13} />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setViewingProfilePost(null)}
                className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold text-slate-500 hover:text-black dark:hover:text-white"
              >
                Close
              </button>
              {viewingProfilePost.authorId !== uid && (
                <button
                  onClick={() => {
                    const post = viewingProfilePost;
                    setViewingProfilePost(null);
                    handleConnectWithAuthor(post);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <UserPlus size={13} className="text-[#0070F3]" />
                  <span>Connect &amp; Chat (1 Credit)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Broadcast Modal */}
      {uid && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            loadPosts();
            if (onPostSuccess) onPostSuccess();
          }}
          authorId={uid}
          authorName={profile?.full_name || user?.displayName || user?.email?.split('@')[0] || 'Member'}
          authorEmail={profile?.email || user?.email || ''}
          authorRole={profile?.role || userRole}
          userCredits={currentCredits}
        />
      )}
    </div>
  );
}
