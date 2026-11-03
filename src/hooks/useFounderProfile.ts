import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
      console.log('[useFounderProfile] Fetching Firestore profile for user:', uid);
      const docRef = doc(db, 'founder_profiles', uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data() as FounderProfile;
        if (data.credits === undefined || data.credits === null) {
          data.credits = 150;
        }
        console.log('[useFounderProfile] Profile loaded:', data.id, data.full_name);
        setFounderProfile(data);
      } else {
        console.warn('[useFounderProfile] No founder_profile doc found for:', uid);
        setFounderProfile(null);
      }
    } catch (err: any) {
      console.error('[useFounderProfile] Firestore fetch error:', err?.message || err);
      setError(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<FounderProfile>) => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return { error: 'No authenticated user' };

    try {
      const docRef = doc(db, 'founder_profiles', uid);
      await updateDoc(docRef, updates);
      setFounderProfile((prev) => (prev ? { ...prev, ...updates } : null));
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
      credits: profileData.credits ?? 150,
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
