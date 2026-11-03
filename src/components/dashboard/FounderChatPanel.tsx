import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Send, Loader2, ExternalLink } from "lucide-react";
import { useFounderMessages } from "../../hooks/useFounderMessages";
import { useAuth } from "../../contexts/AuthContext";
import type { MatchWithFounder } from "../../hooks/useFounderMatches";

interface FounderChatPanelProps {
  match: MatchWithFounder;
}

export default function FounderChatPanel({ match }: FounderChatPanelProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useFounderMessages(match.id, (match as any).isBlindIntro);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const text = inputText;
    setInputText("");
    
    const res = await sendMessage(text);
    setIsSending(false);
    
    if (res?.error) {
      // Revert if error
      setInputText(text);
      console.error("Failed to send message:", res.error);
    }
  };

  // Format message time
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const otherFounder = match.otherFounder || {
    full_name: "Unknown Founder",
    company_name: "Stealth Startup",
    profile_photo_url: null
  };
  const otherAvatar = otherFounder.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherFounder.full_name?.split(" ")[0] || "Founder"}`;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-3xl overflow-hidden shadow-xs transition-colors duration-150">
      {/* Header Info */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-[#262626] bg-slate-50 dark:bg-[#171717]">
        <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-[#333333] shadow-xs shrink-0 bg-slate-100 dark:bg-[#202020]">
          <img src={otherAvatar} alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
            {otherFounder.full_name}
          </h4>
          <span className="text-[10px] font-mono text-[#0070F3] block mt-0.5 font-bold">
            Founder @ {otherFounder.company_name || "Stealth Startup"}
          </span>
        </div>
        <Link
          to={`/dashboard/messages?to=${match.otherFounder?.id || (match.otherFounder as any)?.user_id || 'peer_founder'}&name=${encodeURIComponent(otherFounder.full_name || 'Founder')}&company=${encodeURIComponent(otherFounder.company_name || '')}`}
          className="ml-auto text-[11px] font-mono font-bold text-[#0070F3] hover:underline flex items-center gap-1 bg-[#0070F3]/10 px-2.5 py-1 rounded-lg border border-[#0070F3]/20"
        >
          <span>Full Chat</span>
          <ExternalLink size={11} />
        </Link>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-[#0A0A0A]/70">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Loader2 className="animate-spin mb-2 text-[#0070F3]" size={24} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Decrypting conversation channel...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500 dark:text-slate-400">
            <span className="text-2xl mb-2">🤝</span>
            <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">Channel Initialized</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[220px] mt-1 leading-relaxed">
              Say hello to {otherFounder.full_name?.split(" ")[0] || "founder"} and start collaborating on rounds.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSystem = msg.sender_id === 'system';
            const isMe = msg.sender_id === user?.id;
            
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-mono px-4 py-2 rounded-xl shadow-xs max-w-[85%] text-center leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 mt-1 shadow-xs border border-slate-200 dark:border-[#333333] bg-slate-100 dark:bg-[#202020]">
                    <img src={otherAvatar} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="space-y-1 min-w-[60px]">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? "bg-[#0070F3] text-white font-semibold rounded-tr-none shadow-xs"
                        : "bg-white dark:bg-[#171717] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#262626] rounded-tl-none font-normal"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span
                    className={`text-[9px] font-mono text-slate-400 dark:text-slate-500 block ${
                      isMe ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-[#262626] flex gap-2 bg-slate-50 dark:bg-[#171717]">
        <input
          type="text"
          className="flex-1 bg-white dark:bg-[#111111] border border-slate-200 dark:border-[#262626] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#0070F3] font-mono transition-all text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs"
          placeholder={`Message ${otherFounder.full_name?.split(" ")[0] || "founder"}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-4 bg-[#0070F3] hover:bg-[#0060DF] text-white rounded-xl cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center font-bold shadow-xs active:scale-95"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
