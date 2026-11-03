import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, Coins, Users, Gift, MessageSquare, AlertCircle, 
  ArrowUpRight, Plus, ThumbsUp, FileText, Send, Sparkles, Filter, CheckCircle2 
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useFounderProfile } from "../../hooks/useFounderProfile";
import { useNotifications } from "../../hooks/useNotifications";
import MissionProgressCard from "../../components/dashboard/MissionProgressCard";
import ReferralCard from "../../components/dashboard/ReferralCard";
import YourWeb3GuyCard from "../../components/dashboard/YourWeb3GuyCard";
import HireInCryptoCard from "../../components/dashboard/HireInCryptoCard";
import CreatePostModal from "../../components/dashboard/CreatePostModal";
import InvestorCRM from "../../components/dashboard/InvestorCRM";
import DashboardNewsWidget from "../../components/dashboard/DashboardNewsWidget";
import GuaranteeSLAWidget from "../../components/dashboard/GuaranteeSLAWidget";
import DueDiligenceMemoModal from "../../components/dashboard/DueDiligenceMemoModal";
import SyndicateAnchorCard from "../../components/dashboard/SyndicateAnchorCard";
import { buildInstitutionalMemo } from "../../lib/institutionalMemo";
import { useFounderStartups } from "../../hooks/useFounderStartups";
import { 
  getFeedPosts, 
  toggleLikePost, 
  addPostComment, 
  getPostComments, 
  FeedPost, 
  PostComment, 
  PostTag 
} from "../../lib/posts";
import { getMonthlyIntroRequestUsage, MonthlyIntroQuotaStatus } from "../../lib/quota";

const TAG_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Posts' },
  { value: 'raising', label: '#raising' },
  { value: 'hiring', label: '#hiring' },
  { value: 'grant', label: '#grant' },
  { value: 'partnership', label: '#partnership' },
  { value: 'serviceneeded', label: '#serviceneeded' },
  { value: 'update', label: '#update' },
];

export default function Feed() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { founderProfile, loading: profileLoading, refetch: refetchProfile } = useFounderProfile();
  const { unreadCount } = useNotifications();

  const [activeTab, setActiveTab] = useState<'community' | 'intros'>('community');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMemoOpen, setIsMemoOpen] = useState(false);

  const { startups } = useFounderStartups();
  const activeStartup = startups[0] || null;
  const memoData = buildInstitutionalMemo(founderProfile, activeStartup);

  // Quota state
  const [quotaStatus, setQuotaStatus] = useState<MonthlyIntroQuotaStatus>({
    usedCount: 0,
    freeCap: 5,
    remainingFree: 5,
    isOverCap: false,
    extraIntroCreditCost: 5,
  });

  // Comments drawer state
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Load feed posts & monthly quota
  const loadPosts = async () => {
    setLoadingPosts(true);
    const data = await getFeedPosts(selectedTagFilter);
    setPosts(data);
    setLoadingPosts(false);
  };

  useEffect(() => {
    loadPosts();
    if (user?.uid) {
      getMonthlyIntroRequestUsage(user.uid).then(setQuotaStatus);
    }
  }, [selectedTagFilter, user?.uid]);

  const handleToggleLike = async (postId: string) => {
    if (!user?.uid) return;
    const success = await toggleLikePost(postId, user.uid);
    if (success) {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const isLiked = p.likedBy?.includes(user.uid);
            const newLikedBy = isLiked
              ? p.likedBy.filter((id) => id !== user.uid)
              : [...(p.likedBy || []), user.uid];
            return {
              ...p,
              likedBy: newLikedBy,
              likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
            };
          }
          return p;
        })
      );
    }
  };

  const handleOpenComments = async (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }
    setActiveCommentPostId(postId);
    if (!commentsMap[postId]) {
      const comments = await getPostComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim() || !user?.uid) return;
    setIsSubmittingComment(true);

    const newComment = await addPostComment(
      postId,
      user.uid,
      profile?.full_name || 'Anonymous Founder',
      profile?.role || 'founder',
      commentInput.trim()
    );

    setIsSubmittingComment(false);

    if (newComment) {
      setCommentInput('');
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
      );
    }
  };

  const userCredits = profile?.credits || 0;

  return (
    <div className="space-y-6 pb-24 text-slate-100 font-sans">
      {/* ── 1. HIREINCRYPTO-STYLE TOP HORIZONTAL PILL BAR ── */}
      <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl bg-white dark:bg-[#111111] px-5 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "Feed & Deals", count: posts.length, path: "/dashboard/feed" },
            { id: "matches", label: "Double-Blind Matches", count: 3, path: "/dashboard/matches" },
            { id: "vcs", label: "Check-Writers", count: "180+", path: "/dashboard/investors" },
            { id: "sla", label: "30-Day SLA", count: "24d left", path: "/dashboard/feed#sla" },
            { id: "grants", label: "Ecosystem Grants", count: 35, path: "/dashboard/grants" },
            { id: "credits", label: "Perks & Credits", count: "$500k", path: "/dashboard/credits" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                if (pill.path.includes("#")) {
                  const el = document.getElementById("sla-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate(pill.path);
                }
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                pill.id === "all"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "bg-neutral-100 dark:bg-[#18191e] text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  pill.id === "all"
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                    : "bg-neutral-200 dark:bg-white/10 text-neutral-500 dark:text-neutral-300"
                }`}
              >
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Welcome & Quota Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-sm mt-1">
            Institutional dealflow feed, warm intro quota, and double-blind ecosystem matchmaking
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsMemoOpen(true)}
            className="bg-white hover:bg-slate-50 dark:bg-[#111111] dark:hover:bg-[#171717] text-slate-800 dark:text-white border border-slate-200 dark:border-[#262626] font-mono font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
            title="Generate institutional 1-page tear sheet accepted by partner VCs"
          >
            <FileText size={15} className="text-[#0070F3]" />
            <span>Institutional 1-Page Memo</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0070F3] hover:bg-[#0060DF] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95 font-mono"
          >
            <Plus size={16} />
            <span>New Post (1 Credit)</span>
          </button>
        </div>
      </div>

      {/* Stats & Quota Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Credit Balance */}
        <div 
          onClick={() => navigate('/dashboard/credits')}
          className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-[#262626] p-5 flex items-center gap-4 shadow-xs hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
            <Coins size={18} />
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400 leading-none">{userCredits}</div>
            <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">
              Spendable Credits
            </div>
          </div>
        </div>

        {/* Stat 2: Monthly Warm Intro Quota */}
        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-[#262626] p-5 flex items-center gap-4 shadow-xs hover:border-[#0070F3]/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center text-[#0070F3]">
            <Gift size={18} />
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-[#0070F3] leading-none">
              {quotaStatus.usedCount} / {quotaStatus.freeCap}
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">
              Monthly Intros ({quotaStatus.remainingFree} Free Left)
            </div>
          </div>
        </div>

        {/* Stat 3: Unread Alerts */}
        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-[#262626] p-5 flex items-center gap-4 shadow-xs hover:border-purple-500/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-purple-600 dark:text-purple-400 leading-none">{unreadCount}</div>
            <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">
              Unread Alerts
            </div>
          </div>
        </div>

        {/* Stat 4: Quota Status Badge */}
        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-[#262626] p-5 flex items-center gap-4 shadow-xs hover:border-emerald-500/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-[#00F5A0]">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-emerald-700 dark:text-[#00F5A0] leading-tight">
              {quotaStatus.isOverCap ? '5 Credits / Extra Intro' : 'Free Tier Active'}
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-1">
              Intro Quota Status
            </div>
          </div>
        </div>
      </div>

      {/* Guaranteed Partner Meeting SLA Widget */}
      <div id="sla-section">
        <GuaranteeSLAWidget
          completedCallsCount={1}
          daysRemaining={24}
          onViewMeetings={() => navigate('/dashboard/bookings')}
          onClaimRefund={() => navigate('/dashboard/settings?tab=billing')}
        />
      </div>

      {/* Investor CRM & Fundraise Progress Board */}
      {user?.uid && (
        <InvestorCRM 
          founderId={user.uid} 
          fundingGoal={
            founderProfile?.funding_goal
              ? parseFloat(String(founderProfile.funding_goal).replace(/[^0-9.]/g, '')) || 500000
              : 500000
          } 
        />
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Community Posts & Tag Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#262626] pb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('community')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'community'
                    ? 'bg-[#0070F3]/15 text-[#0070F3] border border-[#0070F3]/30 shadow-xs'
                    : 'bg-white dark:bg-[#111111] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-200 dark:border-[#262626]'
                }`}
              >
                Community Feed
              </button>
              <button
                onClick={() => navigate('/dashboard/network')}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-[#111111] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-200 dark:border-[#262626] transition-all cursor-pointer shadow-xs"
              >
                Browse Network Intros
              </button>
            </div>
          </div>

          {/* Tag Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter size={14} className="text-slate-400 shrink-0 mr-1" />
            <div className="flex items-center gap-1.5 flex-nowrap">
              {TAG_FILTERS.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setSelectedTagFilter(tf.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedTagFilter === tf.value
                      ? 'bg-[#0070F3]/15 text-[#0070F3] border border-[#0070F3]/30 shadow-xs'
                      : 'bg-white dark:bg-[#111111] text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white border border-slate-200 dark:border-[#262626]'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts List */}
          {loadingPosts ? (
            <div className="flex justify-center py-16 bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-[#262626]">
              <Loader2 size={28} className="animate-spin text-[#0070F3]" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-[#262626] p-12 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 bg-[#0070F3]/10 border border-[#0070F3]/30 rounded-2xl flex items-center justify-center mx-auto text-[#0070F3]">
                <Sparkles size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No posts found in this tag category</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Be the first founder to post a pitch, hiring call, or update to the Raisequity network!
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 bg-[#0070F3] hover:bg-[#0060DF] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer font-mono"
              >
                Create Post (1 Credit)
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const isLiked = user?.uid ? post.likedBy?.includes(user.uid) : false;
                const isCommentsOpen = activeCommentPostId === post.id;
                const comments = commentsMap[post.id] || [];

                return (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl p-6 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-[#383838] transition-all text-slate-900 dark:text-slate-100"
                  >
                    {/* Post Author Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center text-[#0070F3] font-black text-sm uppercase shadow-xs">
                          {post.authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{post.authorName}</span>
                            <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-[#171717] text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-[#262626] font-bold">
                              {post.authorRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Tag Badge */}
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                        #{post.tag}
                      </span>
                    </div>

                    {/* Post Title & Content */}
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white leading-snug">{post.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* Pitch Deck Attachment Link */}
                    {post.pitchDeckUrl && (
                      <div className="bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-2xl p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText size={16} className="text-[#0070F3] shrink-0" />
                          <span className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate max-w-[200px] sm:max-w-xs font-mono">
                            {post.pitchDeckName || 'Pitch_Deck.pdf'}
                          </span>
                        </div>
                        <a
                          href={post.pitchDeckUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#0070F3]/10 hover:bg-[#0070F3]/20 text-[#0070F3] text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-[#0070F3]/25 flex items-center gap-1 transition-all"
                        >
                          View PDF <ArrowUpRight size={13} />
                        </a>
                      </div>
                    )}

                    {/* Post Actions Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#262626] text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                            isLiked ? 'text-[#0070F3]' : 'hover:text-black dark:hover:text-white'
                          }`}
                        >
                          <ThumbsUp size={14} className={isLiked ? 'fill-[#0070F3] text-[#0070F3]' : ''} />
                          <span>{post.likesCount || 0} Likes</span>
                        </button>
                        <button
                          onClick={() => handleOpenComments(post.id)}
                          className="flex items-center gap-1.5 font-bold hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <MessageSquare size={14} />
                          <span>{post.commentsCount || 0} Comments</span>
                        </button>
                      </div>
                    </div>

                    {/* Comments Drawer */}
                    {isCommentsOpen && (
                      <div className="pt-4 border-t border-slate-100 dark:border-[#262626] space-y-4 animate-fadeIn">
                        {/* Comments List */}
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                          {comments.length === 0 ? (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 italic font-mono">No comments yet. Start the conversation!</div>
                          ) : (
                            comments.map((c) => (
                              <div key={c.id} className="bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-xl p-3 text-xs space-y-1">
                                <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
                                  <span className="font-bold text-slate-900 dark:text-white font-mono">{c.authorName} ({c.authorRole})</span>
                                  <span className="font-mono text-slate-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            placeholder="Write a comment..."
                            className="bg-slate-50 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] focus:border-[#0070F3] text-slate-900 dark:text-white placeholder:text-slate-400 text-xs rounded-xl px-3.5 py-2.5 flex-1 focus:outline-none"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={isSubmittingComment || !commentInput.trim()}
                            className="bg-[#0070F3] hover:bg-[#0060DF] disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs font-mono"
                          >
                            <Send size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Mission Progress, News, Syndicate Anchor, YourWeb3Guy & HireInCrypto Widgets */}
        <div className="space-y-6">
          {/* Lead-Check Syndicate Anchor Card */}
          <SyndicateAnchorCard
            readinessScore={92}
            companyName={founderProfile?.company_name || 'Your Startup'}
            onRequestIntake={() => navigate('/dashboard/bookings')}
          />

          <MissionProgressCard
            profileCompleteness={founderProfile?.completeness_pct ?? (founderProfile?.profile_complete ? 100 : 75)}
            missingFields={['pitch_deck', 'raise_amount']}
            contactsCount={founderProfile?.contacts_contributed_count ?? 1}
            onReviewClick={() => navigate('/onboarding')}
            onAddClick={() => navigate('/dashboard/investors')}
          />
          <DashboardNewsWidget />
          <YourWeb3GuyCard />
          <HireInCryptoCard />
          <ReferralCard referralCode={profile?.referral_code || 'RAISEQUITY'} isInline={true} />
        </div>
      </div>

      {/* Institutional Due Diligence Fast-Pass Memo Modal */}
      <DueDiligenceMemoModal
        isOpen={isMemoOpen}
        onClose={() => setIsMemoOpen(false)}
        memo={memoData}
      />

      {/* Create Post Modal */}
      {user?.uid && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={loadPosts}
          authorId={user.uid}
          authorName={profile?.full_name || 'Anonymous Founder'}
          authorEmail={profile?.email || user.email || ''}
          authorRole={profile?.role || 'founder'}
          userCredits={userCredits}
        />
      )}
    </div>
  );
}
