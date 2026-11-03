import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../hooks/useNotifications";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getNotifIcon = (type: string | null) => {
    switch (type) {
      case 'match_request':
      case 'match_accepted':
        return '🤝';
      case 'new_message':
        return '💬';
      case 'intro_approved':
      case 'intro_sent':
        return '🚀';
      case 'referral_earned':
        return '🎁';
      case 'call_accepted':
        return '📞';
      default:
        return '🔔';
    }
  };

  const formatNotifDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Just now";
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-black transition-colors cursor-pointer rounded-xl hover:bg-gray-50"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[var(--color-clay-pomegranate)] rounded-full flex items-center justify-center text-[9px] font-black text-white border border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-[340px] bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
              <h3 className="font-black text-xs uppercase tracking-wider text-gray-400">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-[var(--color-clay-matcha-dark)] hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="text-gray-300" size={20} />
                  </div>
                  <p className="text-xs text-gray-400 font-medium">All caught up!</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => {
                      markAsRead(notif.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50/80 transition-all text-left border-b border-gray-50 last:border-b-0 cursor-pointer ${
                      !notif.read ? "bg-[var(--color-clay-matcha)]/5" : ""
                    }`}
                  >
                    <span className="text-base shrink-0 mt-0.5">{getNotifIcon(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-bold text-black truncate">{notif.title}</span>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-clay-matcha)] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>
                      <span className="text-[9px] text-gray-300 font-bold mt-1 block">
                        {formatNotifDate(notif.created_at)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
