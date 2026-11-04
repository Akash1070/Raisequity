import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { FounderProfile } from '../types/founder';

export function useFounderProfile() {
  const { user } = useAuth();
  const [founderProfile, setFounderProfile] = useState<FounderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) {
      setLoading(false);
      setFounderProfile(null);
      return;
    }

    try {
      const docRef = doc(db, 'founder_profiles', uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data() as FounderProfile;
        if (data.credits === undefined || data.credits === null) {
          data.credits = 50;
        }
        setFounderProfile(data);
      } else {
        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);
        const userData = userSnap.exists() ? userSnap.data() : null;

        const fallbackProfile: FounderProfile = {
          id: uid,
          user_id: uid,
          full_name: userData?.full_name || user?.displayName || user?.email?.split('@')[0] || 'Founder',
          email: user?.email || '',
          company_name: userData?.company_name || '',
          linkedin_url: userData?.linkedin_url || '',
          credits: userData?.credit_balance ?? 50,
          plan: userData?.subscription_status === 'active' ? 'pro' : 'basic',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as unknown as FounderProfile;

        try {
          await setDoc(docRef, fallbackProfile, { merge: true });
        } catch (e) {
          console.warn('[useFounderProfile] fallback setDoc warning:', e);
        }
        setFounderProfile(fallbackProfile);
      }
    } catch (err: any) {
      console.error('[useFounderProfile] Firestore fetch error:', err?.message || err);
      setError(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) {
      setLoading(false);
      setFounderProfile(null);
      return;
    }

    // Initial load
    fetchProfile();

    // Real-time listener on founder_profiles document
    const docRef = doc(db, 'founder_profiles', uid);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as FounderProfile;
        setFounderProfile((prev) => ({
          ...(prev || {}),
          ...data,
          credits: data.credits ?? prev?.credits ?? 50,
        } as FounderProfile));
      }
    }, (err) => {
      console.warn('[useFounderProfile] live snapshot warning:', err);
    });

    // Real-time event listener for immediate UI responsiveness
    const handleCreditUpdate = (e: any) => {
      if (e?.detail?.newBalance !== undefined) {
        setFounderProfile((prev) => prev ? { ...prev, credits: e.detail.newBalance } : prev);
      }
    };
    window.addEventListener('rq_credits_updated', handleCreditUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('rq_credits_updated', handleCreditUpdate);
    };
  }, [user, fetchProfile]);

  const updateProfile = async (updates: Partial<FounderProfile>) => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return { error: 'No authenticated user' };

    try {
      const docRef = doc(db, 'founder_profiles', uid);
      await setDoc(docRef, updates, { merge: true });
      setFounderProfile((prev) => (prev ? { ...prev, ...updates } : updates as FounderProfile));
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Failed to update profile' };
    }
  };

  const createProfile = async (profileData: Partial<FounderProfile>) => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return { error: 'Not authenticated', data: null };

    const referralCode = `RQ-${uid.slice(0, 6).toUpperCase()}`;
    const newProfile: FounderProfile = {
      id: uid,
      user_id: uid,
      referral_code: referralCode,
      credits: profileData.credits ?? 50,
      ...profileData,
    } as FounderProfile;

    try {
      const docRef = doc(db, 'founder_profiles', uid);
      await setDoc(docRef, newProfile, { merge: true });
      setFounderProfile(newProfile);
      return { error: null, data: newProfile };
    } catch (err: any) {
      return { error: err?.message || 'Failed to create profile', data: null };
    }
  };

  return {
    founderProfile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    createProfile,
  };
}
