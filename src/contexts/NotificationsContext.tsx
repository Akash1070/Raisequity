import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDocs 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import type { Notification } from '../types/founder';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refetch: () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = collection(db, 'notifications');
    const q = query(
      ref, 
      where('user_id', '==', user.uid), 
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Notification[];

      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.read).length);
      setLoading(false);
    }, (err) => {
      console.warn('[Notifications] Snapshot warning:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, { read: true });

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[Notifications] Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;
    try {
      const ref = collection(db, 'notifications');
      const q = query(ref, where('user_id', '==', user.uid), where('read', '==', false));
      const snap = await getDocs(q);

      const promises = snap.docs.map((d) => updateDoc(doc(db, 'notifications', d.id), { read: true }));
      await Promise.all(promises);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[Notifications] Error marking all as read:', err);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{ 
        notifications, 
        unreadCount, 
        loading, 
        markAsRead, 
        markAllAsRead, 
        refetch: () => {} 
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  return useContext(NotificationsContext);
}
