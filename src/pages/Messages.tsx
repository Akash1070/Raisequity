import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Send, 
  Loader2, 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  Building2, 
  Check, 
  Clock, 
  ArrowLeft, 
  Scale, 
  Calendar, 
  MessageSquare,
  DollarSign,
  User,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFounderProfile } from '../hooks/useFounderProfile';
import { 
  subscribeToUserConversations, 
  subscribeToConversationMessages, 
  sendDirectMessage, 
  markConversationRead, 
  getOrCreateConversation, 
  fetchDirectoryMembers 
} from '../lib/messages';
import type { 
  Conversation, 
  DirectMessage, 
  ConversationParticipant,
  DirectMessageType 
} from '../types/messages';
import OneClickSafeModal from '../components/investor/OneClickSafeModal';

export default function Messages() {
  const { user, profile } = useAuth();
  const { founderProfile } = useFounderProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  
  // New Message Modal State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [directoryMembers, setDirectoryMembers] = useState<ConversationParticipant[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // SAFE Modal from within chat
  const [showSafeModal, setShowSafeModal] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Current participant profile
  const currentParticipant: ConversationParticipant = {
    id: user?.uid || 'guest_user',
    name: profile?.full_name || founderProfile?.full_name || user?.email?.split('@')[0] || 'Member',
    email: user?.email || '',
    role: (profile?.role as any) || 'founder',
    avatar_url: profile?.avatar_url || founderProfile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'user'}`,
    company_name: founderProfile?.company_name || profile?.company_name || '',
  };

  // 1. Subscribe to User's Conversations
  useEffect(() => {
    if (!user?.uid) {
      setIsLoadingConvs(false);
      return;
    }

    const unsubscribe = subscribeToUserConversations(user.uid, (convList) => {
      setConversations(convList);
      setIsLoadingConvs(false);

      // Auto-select conversation if query param or none selected
      const queryConvId = searchParams.get('convId');
      if (queryConvId && convList.some(c => c.id === queryConvId)) {
        setSelectedConvId(queryConvId);
      } else if (!selectedConvId && convList.length > 0 && !searchParams.get('to')) {
        setSelectedConvId(convList[0].id);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 2. Handle 'to' query parameter (e.g. from DealFeed or Matches)
  useEffect(() => {
    const targetUid = searchParams.get('to');
    const targetName = searchParams.get('name');
    const targetRole = searchParams.get('role');
    const targetCompany = searchParams.get('company');
    const dealName = searchParams.get('deal');

    if (targetUid && user?.uid && targetUid !== user.uid) {
      const targetUser: ConversationParticipant = {
        id: targetUid,
        name: targetName || 'Directory Member',
        email: `${targetName?.toLowerCase().replace(/\s+/g, '') || 'partner'}@raisequity.com`,
        role: (targetRole as any) || 'founder',
        company_name: targetCompany || dealName || '',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUid}`,
      };

      getOrCreateConversation(currentParticipant, targetUser, dealName ? { deal_name: dealName } : null)
        .then((convId) => {
          setSelectedConvId(convId);
          // Clean up query params to keep URL tidy
          setSearchParams({ convId });
        });
    }
  }, [searchParams, user?.uid]);

  // 3. Subscribe to Messages of the Selected Conversation
  useEffect(() => {
    if (!selectedConvId || !user?.uid) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    markConversationRead(selectedConvId, user.uid);

    const unsubscribe = subscribeToConversationMessages(selectedConvId, (msgList) => {
      setMessages(msgList);
      setIsLoadingMessages(false);
      markConversationRead(selectedConvId, user.uid);
    });

    return () => unsubscribe();
  }, [selectedConvId, user?.uid]);

  // 4. Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. Load directory members when opening "New Conversation" modal
  const handleOpenNewChatModal = async () => {
    setShowNewChatModal(true);
    if (directoryMembers.length === 0 && user?.uid) {
      setIsLoadingMembers(true);
      const members = await fetchDirectoryMembers(user.uid);
      setDirectoryMembers(members);
      setIsLoadingMembers(false);
    }
  };

  const handleStartChatWithMember = async (member: ConversationParticipant) => {
    setShowNewChatModal(false);
    const convId = await getOrCreateConversation(currentParticipant, member);
    setSelectedConvId(convId);
    setSearchParams({ convId });
  };

  // 6. Send Message handler
  const handleSendMessage = async (e?: React.FormEvent, customContent?: string, type: DirectMessageType = 'text') => {
    if (e) e.preventDefault();
    const content = customContent || messageInput;
    if (!content.trim() || !selectedConvId || !user?.uid || isSending) return;

    const currentConv = conversations.find(c => c.id === selectedConvId);
    const otherParticipantId = currentConv?.participant_ids.find(id => id !== user.uid) || '';
    const otherParticipant = currentConv?.participants[otherParticipantId];

    setIsSending(true);
    if (!customContent) setMessageInput('');

    const res = await sendDirectMessage({
      conversationId: selectedConvId,
      sender: currentParticipant,
      recipientId: otherParticipantId,
      recipientRole: otherParticipant?.role,
      content,
      messageType: type,
    });

    setIsSending(false);
    if (res.error && !customContent) {
      setMessageInput(content);
      setMessageError(`Message failed: ${res.error}`);
      setTimeout(() => setMessageError(null), 5000);
    }
  };

  // Selected conversation counterparty details
  const activeConversation = conversations.find(c => c.id === selectedConvId);
  const counterpartyId = activeConversation?.participant_ids.find(id => id !== user?.uid);
  const counterparty = counterpartyId ? activeConversation?.participants[counterpartyId] : null;

  const filteredConversations = conversations.filter(c => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const otherId = c.participant_ids.find(id => id !== user?.uid);
    const other = otherId ? c.participants[otherId] : null;
    return (
      other?.name?.toLowerCase().includes(q) ||
      other?.company_name?.toLowerCase().includes(q) ||
      c.last_message?.toLowerCase().includes(q)
    );
  });

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'investor':
        return (
          <span className="font-mono text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            INVESTOR
          </span>
        );
      case 'service_provider':
        return (
          <span className="font-mono text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            AGENCY
          </span>
        );
      case 'founder':
      default:
        return (
          <span className="font-mono text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/30">
            FOUNDER
          </span>
        );
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col font-sans text-[#171717] dark:text-[#EDEDED]">
      
      {/* ── TOP HEADER / SUITE TITLE ── */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200 dark:border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#0070F3]">
              LIVE DIRECT MESSAGING
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-black text-black dark:text-white tracking-tight">
            Counterparty Communications
          </h1>
        </div>

        <button
          onClick={handleOpenNewChatModal}
          className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-mono text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus size={14} />
          <span>New Conversation</span>
        </button>
      </div>

      {/* ── MAIN 2-PANE CHAT CONTAINER ── */}
      <div className="flex-1 flex bg-white dark:bg-[#121316] rounded-[28px] border border-[#e8e6df] dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden min-h-0">
        
        {/* ── LEFT PANE: CONVERSATION LIST (320px) ── */}
        <div className="w-full md:w-[320px] lg:w-[360px] border-r border-[#e8e6df] dark:border-white/10 flex flex-col shrink-0">
          
          {/* Search Bar */}
          <div className="p-3.5 border-b border-[#e8e6df] dark:border-white/10 bg-slate-50/50 dark:bg-[#15161b]">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search conversations & founders..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-[#1c1d22] border border-neutral-200/80 dark:border-white/5 rounded-xl text-xs font-mono text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#0070F3] transition-all"
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-white/5">
            {isLoadingConvs ? (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-400 font-mono text-xs gap-2">
                <Loader2 size={20} className="animate-spin text-[#0070F3]" />
                <span>Loading active channels...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center mx-auto text-neutral-400">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-black dark:text-white">No Conversations Yet</h4>
                  <p className="text-xs text-neutral-500 font-mono mt-1">
                    Connect directly with founders, verified investors, and accredited Web3 service partners.
                  </p>
                </div>
                <button
                  onClick={handleOpenNewChatModal}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0070F3] text-white font-mono text-xs font-bold hover:bg-[#0060DF] transition-all cursor-pointer shadow-xs"
                >
                  Start First Chat
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherId = conv.participant_ids.find(id => id !== user?.uid);
                const other = otherId ? conv.participants[otherId] : null;
                const isSelected = conv.id === selectedConvId;
                const unread = user?.uid && conv.unread_count ? (conv.unread_count[user.uid] || 0) : 0;

                const avatar = other?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.name?.split(' ')[0] || 'Member'}`;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setSearchParams({ convId: conv.id });
                    }}
                    className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 group relative ${
                      isSelected
                        ? 'bg-neutral-100/80 dark:bg-[#18191e] border-l-4 border-l-[#0070F3]'
                        : 'hover:bg-neutral-50 dark:hover:bg-[#15161b]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden border border-neutral-300 dark:border-white/10">
                        <img src={avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#121316]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-xs font-heading font-black truncate ${
                          isSelected ? 'text-[#0070F3] dark:text-[#38bdf8]' : 'text-black dark:text-white'
                        }`}>
                          {other?.name || 'Counterparty'}
                        </span>
                        <span className="font-mono text-[9px] text-neutral-400 shrink-0">
                          {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1.5">
                        {getRoleBadge(other?.role)}
                        {other?.company_name && (
                          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate">
                            · {other.company_name}
                          </span>
                        )}
                      </div>

                      <p className={`text-xs font-mono truncate leading-snug ${
                        unread > 0 ? 'font-bold text-black dark:text-white' : 'text-neutral-500 dark:text-neutral-400'
                      }`}>
                        {conv.last_message || 'Draft initialized...'}
                      </p>
                    </div>

                    {unread > 0 && (
                      <span className="bg-[#0070F3] text-white text-[10px] font-mono font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shrink-0 shadow-xs self-center">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANE: ACTIVE CHAT VIEWPORT ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#0c0d10]">
          {selectedConvId && counterparty ? (
            <>
              {/* Chat Viewport Top Bar */}
              <div className="p-4 sm:px-6 bg-white dark:bg-[#121316] border-b border-[#e8e6df] dark:border-white/10 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-300 dark:border-white/10 shrink-0 bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={counterparty.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${counterparty.name.split(' ')[0]}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-black text-sm sm:text-base text-black dark:text-white truncate">
                        {counterparty.name}
                      </h3>
                      {getRoleBadge(counterparty.role)}
                    </div>
                    <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate">
                      {counterparty.company_name || 'Raisequity Verified Member'} · <span className="text-emerald-600 dark:text-emerald-400 font-bold">Encrypted Channel</span>
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons on Top Bar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const msg = `📅 Hi ${counterparty.name.split(' ')[0]}, let's schedule a 20-minute diligence call. What days work best for you?`;
                      handleSendMessage(undefined, msg, 'call_request');
                    }}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-white/10 hover:border-black dark:hover:border-white text-neutral-700 dark:text-neutral-200 text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    <Calendar size={13} className="text-purple-500" />
                    <span>Book 20m Call</span>
                  </button>

                  <button
                    onClick={() => setShowSafeModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Scale size={13} />
                    <span>Issue SAFE ↗</span>
                  </button>
                </div>
              </div>

              {/* Deal Context Header Card (If available) */}
              {activeConversation?.deal_context && (
                <div className="px-6 py-2.5 bg-gradient-to-r from-purple-500/10 to-[#0070F3]/10 border-b border-purple-500/20 flex items-center justify-between gap-3 text-xs font-mono shrink-0">
                  <div className="flex items-center gap-2 truncate">
                    <Sparkles size={13} className="text-[#0070F3] shrink-0" />
                    <span className="font-bold text-black dark:text-white truncate">
                      Deal Room Context: {activeConversation.deal_context.deal_name}
                    </span>
                    {activeConversation.deal_context.target_raise && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        · {activeConversation.deal_context.target_raise}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full shrink-0">
                    Active Negotiation
                  </span>
                </div>
              )}

              {/* Message Feed Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {isLoadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-400 font-mono text-xs gap-2">
                    <Loader2 size={24} className="animate-spin text-[#0070F3]" />
                    <span>Loading verified messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-base text-black dark:text-white">
                        Channel Ready with {counterparty.name}
                      </h4>
                      <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 max-w-sm mt-1 leading-relaxed">
                        Start your confidential direct conversation. Coordinate investment terms, review pitch decks, or exchange syndicate allocations.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.uid;
                    const isSafeOffer = msg.message_type === 'safe_offer';
                    const isCallReq = msg.message_type === 'call_request';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-neutral-400">
                          <span className="font-bold text-neutral-600 dark:text-neutral-300">
                            {isMe ? 'You' : msg.sender_name}
                          </span>
                          <span>•</span>
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            <Check size={11} className={msg.read ? 'text-emerald-500' : 'text-neutral-400'} />
                          )}
                        </div>

                        {/* Special Banner Message Cards */}
                        {isSafeOffer ? (
                          <div className={`p-4 rounded-2xl border max-w-md space-y-2 shadow-xs ${
                            isMe 
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-900 dark:text-emerald-200' 
                              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-950 dark:text-emerald-100'
                          }`}>
                            <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                              <Scale size={16} />
                              <span>Standardized SAFE Commitment</span>
                            </div>
                            <p className="text-xs font-mono leading-relaxed">{msg.content}</p>
                            <div className="pt-2 flex items-center gap-2">
                              <button
                                onClick={() => setShowSafeModal(true)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] font-bold cursor-pointer transition-all"
                              >
                                View SAFE Document
                              </button>
                            </div>
                          </div>
                        ) : isCallReq ? (
                          <div className={`p-4 rounded-2xl border max-w-md space-y-2 shadow-xs ${
                            isMe 
                              ? 'bg-purple-950/20 border-purple-500/40 text-purple-900 dark:text-purple-200' 
                              : 'bg-purple-50 dark:bg-purple-950/40 border-purple-500/50 text-purple-950 dark:text-purple-100'
                          }`}>
                            <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-purple-600 dark:text-purple-400">
                              <Calendar size={16} />
                              <span>Diligence Meeting Request</span>
                            </div>
                            <p className="text-xs font-mono leading-relaxed">{msg.content}</p>
                          </div>
                        ) : (
                          <div
                            className={`px-4 py-2.5 rounded-2xl max-w-[85%] sm:max-w-md text-xs font-mono leading-relaxed break-words shadow-2xs ${
                              isMe
                                ? 'bg-[#0070F3] text-white rounded-br-xs'
                                : 'bg-white dark:bg-[#1a1b20] text-black dark:text-white border border-[#e8e6df] dark:border-white/10 rounded-bl-xs'
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Quick-Action Suggestion Pills */}
              {messageError && (
                <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold flex items-center justify-between">
                  <span>{messageError}</span>
                  <button onClick={() => setMessageError(null)} className="text-rose-500 hover:text-rose-700">✕</button>
                </div>
              )}
              {(() => {
                const myRole = currentParticipant.role;
                const counterRole = counterparty?.role;

                let quickReplies: { label: string; text: string }[] = [];

                if (myRole === 'founder') {
                  if (counterRole === 'service_provider') {
                    quickReplies = [
                      { label: "Discuss deliverables & scope", text: "🚀 Hi! I'd like to discuss the scope of deliverables, milestones, and timeline for our project." },
                      { label: "Request portfolio & pricing", text: "📊 Could you please share your agency portfolio, previous client case studies, and pricing packages?" },
                      { label: "Book intro call", text: "📅 Let's hop on a 15-min call to discuss alignment and next steps." }
                    ];
                  } else {
                    // Talking to investor or peer
                    quickReplies = [
                      { label: "Sharing deck & data room", text: "📊 Here is our latest investor pitch deck and verified data room metrics." },
                      { label: "Book 15-min partner call", text: "📅 Happy to hop on a quick 15-min call to walk through our traction and round details." },
                      { label: "Send cap table & SAFE terms", text: "🤝 We're raising on a standard post-money SAFE. Excited to align on terms." }
                    ];
                  }
                } else if (myRole === 'service_provider') {
                  quickReplies = [
                    { label: "Share service portfolio", text: "💼 Shared our agency portfolio, verified client outcomes, and service scope." },
                    { label: "Schedule kickoff call", text: "📅 Let's schedule a 20-min technical kickoff call to finalize milestone deliverables." },
                    { label: "Escrow milestone terms", text: "⚡ Ready to begin execution once 100% pre-funded milestone escrow is confirmed." }
                  ];
                } else {
                  // Investor
                  quickReplies = [
                    { label: "Reviewing cap table & deck", text: "📜 We are reviewing your cap table & deck. Let's align on terms." },
                    { label: "Request tear-sheet & metrics", text: "📊 Could you please share your latest revenue tear-sheet and metrics?" },
                    { label: "Proceed to SAFE signature", text: "🤝 Excited about this opportunity. Let's proceed to SAFE signature." }
                  ];
                }

                return (
                  <div className="px-4 py-2 bg-slate-50 dark:bg-[#14151a] border-t border-[#e8e6df] dark:border-white/10 flex items-center gap-2 overflow-x-auto text-[11px] font-mono text-neutral-500 shrink-0">
                    <span className="font-bold shrink-0 text-neutral-400 text-[10px] uppercase">Quick replies:</span>
                    {quickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(undefined, qr.text)}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1c1d22] border border-neutral-200 dark:border-white/5 hover:border-black dark:hover:border-white shrink-0 text-black dark:text-white transition-all cursor-pointer whitespace-nowrap"
                      >
                        "{qr.label}"
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white dark:bg-[#121316] border-t border-[#e8e6df] dark:border-white/10 flex items-center gap-2.5 shrink-0"
              >
                <input
                  type="text"
                  placeholder={`Write a message to ${counterparty.name.split(' ')[0]}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#0070F3] transition-all"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim() || isSending}
                  className="px-4 py-2.5 bg-[#0070F3] hover:bg-[#0060DF] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-400">
                <MessageSquare size={28} />
              </div>
              <h3 className="font-heading font-black text-lg text-black dark:text-white">
                Select a Conversation
              </h3>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
                Choose a channel from the left or launch a new conversation with any founder, investor, or agency.
              </p>
              <button
                onClick={handleOpenNewChatModal}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-mono text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-xs"
              >
                + Start New Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: START NEW CONVERSATION WITH PLATFORM MEMBER ── */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121316] border border-neutral-200 dark:border-white/10 rounded-[28px] max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-white/5">
              <div>
                <h3 className="font-heading font-black text-lg text-black dark:text-white">
                  Start New Conversation
                </h3>
                <p className="text-xs font-mono text-neutral-500">
                  Select a verified founder, investor, or accredited partner.
                </p>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Member Search input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search member name, role, firm..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-[#18191e] border border-neutral-200/80 dark:border-white/5 rounded-xl text-xs font-mono text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#0070F3]"
              />
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-white/5 pr-1">
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-12 text-neutral-400 font-mono text-xs gap-2">
                  <Loader2 size={20} className="animate-spin text-[#0070F3]" />
                  <span>Loading platform members...</span>
                </div>
              ) : (
                directoryMembers
                  .filter(m => {
                    if (!memberSearchQuery) return true;
                    const q = memberSearchQuery.toLowerCase();
                    return (
                      m.name.toLowerCase().includes(q) ||
                      m.role.toLowerCase().includes(q) ||
                      m.company_name?.toLowerCase().includes(q)
                    );
                  })
                  .map(member => (
                    <div
                      key={member.id}
                      onClick={() => handleStartChatWithMember(member)}
                      className="p-3.5 hover:bg-neutral-50 dark:hover:bg-[#18191e] rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200 dark:border-white/10 shrink-0">
                          <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-heading font-black text-xs text-black dark:text-white truncate group-hover:text-[#0070F3] transition-colors">
                              {member.name}
                            </span>
                            {getRoleBadge(member.role)}
                          </div>
                          <p className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                            {member.company_name} · {member.headline}
                          </p>
                        </div>
                      </div>

                      <ChevronRight size={14} className="text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0" />
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: 1-CLICK SAFE COMMITMENT ── */}
      {showSafeModal && counterparty && (
        <OneClickSafeModal
          isOpen={showSafeModal}
          onClose={() => setShowSafeModal(false)}
          company={{
            id: counterparty.id,
            name: counterparty.company_name || `${counterparty.name}'s Startup`,
            founder_name: counterparty.name,
            founder_email: counterparty.email,
            founder_id: counterparty.id,
            valuation_cap: 8000000,
          }}
          investor={{
            id: user?.uid || 'investor_partner',
            name: currentParticipant.name,
            email: currentParticipant.email,
          }}
        />
      )}

    </div>
  );
}

