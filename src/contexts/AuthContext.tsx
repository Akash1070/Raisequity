import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole, UserProfile } from '../types';
import { safeStorage } from '../lib/storage';

export type AuthUser = (FirebaseUser & { id: string }) | null;

type AuthContextType = {
  user: AuthUser;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role: UserRole, fullName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (preferredRole?: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  getIdToken: async () => '',
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);


  // Subscribe to Firestore user profile document
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    // Safety timeout: Ensure app mounts within 1.5s even if Firebase network calls are delayed/blocked
    const safetyTimeout = setTimeout(() => {
      console.warn('[AuthContext] Auth resolution timeout reached. Defaulting loading to false.');
      setLoading(false);
    }, 1500);

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(safetyTimeout);
      console.log('[AuthContext] Firebase auth state changed:', currentUser?.uid);
      if (currentUser) {
        // Attach id while strictly preserving all Firebase User prototype methods (getIdToken, reload, etc.)
        Object.defineProperty(currentUser, 'id', {
          value: currentUser.uid,
          writable: true,
          enumerable: true,
          configurable: true,
        });
        setUser(currentUser as unknown as AuthUser);
      } else {
        setUser(null);
      }

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        
        // Listen to live updates on user profile (credit balance, approval status, etc.)
        unsubscribeProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            if (adminEmail && data.email?.toLowerCase() === adminEmail.toLowerCase()) {
              data.role = 'admin';
            }
            const isLocalCompleted = Boolean(safeStorage.getItem(`rq_onboarding_completed_${currentUser.uid}`));
            if (isLocalCompleted) {
              data.onboarding_completed = true;
            }
            setProfile(data);
          } else {
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            const isLocalCompleted = Boolean(safeStorage.getItem(`rq_onboarding_completed_${currentUser.uid}`));
            const isAdmin = Boolean(adminEmail && currentUser.email?.toLowerCase() === adminEmail.toLowerCase());

            const autoProfile: UserProfile = isAdmin ? {
              id: currentUser.uid,
              email: currentUser.email || adminEmail,
              role: 'admin',
              full_name: 'Super Admin',
              avatar_url: null,
              bio: null,
              linkedin_url: null,
              onboarding_completed: true,
              is_approved: true,
              first_deal_fee_waived: true,
              credit_balance: 0,
              created_at: new Date().toISOString(),
            } : {
              id: currentUser.uid,
              email: currentUser.email || '',
              role: 'founder',
              full_name: currentUser.displayName || null,
              avatar_url: currentUser.photoURL || null,
              bio: null,
              linkedin_url: null,
              onboarding_completed: isLocalCompleted,
              is_approved: true,
              first_deal_fee_waived: false,
              trial_ends_at: new Date(Date.now() + 15 * 86400000).toISOString(),
              has_active_subscription: false,
              subscription_status: 'trial',
              credit_balance: 0,
              created_at: new Date().toISOString(),
            };

            setProfile(autoProfile);
            setDoc(userRef, autoProfile, { merge: true }).catch((err) => {
              console.warn('[AuthContext] Auto-healing user document failed:', err);
            });
          }
          setLoading(false);
        }, (err) => {
          console.error('[AuthContext] Firestore profile listener error:', err);
          setLoading(false);
        });
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);


  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        if (adminEmail && data.email?.toLowerCase() === adminEmail.toLowerCase()) {
          data.role = 'admin';
        }
        const isLocalCompleted = Boolean(safeStorage.getItem(`rq_onboarding_completed_${uid}`));
        if (isLocalCompleted) {
          data.onboarding_completed = true;
        }
        setProfile(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error('[AuthContext] fetchProfile error:', err);
      return null;
    }
  }, []);

  // Sign in with email + password (or passwordless email link)
  const signIn = async (email: string, password?: string) => {
    try {
      if (password) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Passwordless magic link sign-in
        const actionCodeSettings = {
          url: `${window.location.origin}/login`,
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        safeStorage.setItem('emailForSignIn', email);
      }
      return { error: null };
    } catch (err: any) {
      console.error('[AuthContext] signIn error:', err);
      return { error: err };
    }
  };

  // Sign up with role & profile creation (Strictly non-admin public registration)
  const signUp = async (email: string, password: string, role: UserRole, fullName: string) => {
    try {
      // Prevent public registration from assigning admin role
      const publicRole: UserRole = (role === 'admin' || role === 'scout_admin') ? 'founder' : role;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Send the real verification email (the signup UI promises one).
      sendEmailVerification(newUser).catch((verErr) => {
        console.warn('[AuthContext] sendEmailVerification failed:', verErr);
      });

      // Investors require manual admin review/approval before transacting
      const isApprovedByDefault = publicRole !== 'investor';
      const trialDays = 15;
      const trialStarterCredits = 50;
      const trialEndsAt = new Date(Date.now() + trialDays * 86400000).toISOString();
      const referralCode = `RQ-${newUser.uid.slice(0, 6).toUpperCase()}`;

      // Check for referred_by parameter stored in URL / session
      const referredBy = safeStorage.getItem('rq_ref_code') || null;

      const initialProfile: UserProfile = {
        id: newUser.uid,
        email: newUser.email || email,
        role: publicRole,
        full_name: fullName,
        avatar_url: newUser.photoURL || null,
        bio: null,
        linkedin_url: null,
        onboarding_completed: false,
        is_approved: isApprovedByDefault,
        first_deal_fee_waived: false,
        subscription_status: 'trial',
        trial_ends_at: trialEndsAt,
        has_active_subscription: false,
        credit_balance: trialStarterCredits,
        referral_code: referralCode,
        referred_by: referredBy,
        created_at: new Date().toISOString(),
      };

      const userRef = doc(db, 'users', newUser.uid);
      await setDoc(userRef, initialProfile);

      // Record starter credits transaction for all new users
      try {
        const txRef = doc(db, 'credit_transactions', `tx_starter_${newUser.uid}`);
        await setDoc(txRef, {
          userId: newUser.uid,
          type: 'earn',
          source: 'trial_starter',
          amount: trialStarterCredits,
          balanceAfter: trialStarterCredits,
          timestamp: new Date().toISOString(),
          metadata: { note: '15-day free trial starter credits' }
        });
      } catch (txErr) {
        console.warn('[AuthContext] Could not record starter credits ledger:', txErr);
      }

      setProfile(initialProfile);
      return { error: null };
    } catch (err: any) {
      console.error('[AuthContext] signUp error:', err);
      return { error: err };
    }
  };

  // Sign in with Google OAuth (Strictly non-admin)
  const signInWithGoogle = async (preferredRole?: UserRole) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const userRef = doc(db, 'users', googleUser.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        const trialDays = 15;
        // Must match DEFAULT_GLOBAL_CONFIG.trial_starter_credits (50) — email signup path uses the same value.
        const trialStarterCredits = 50;
        const trialEndsAt = new Date(Date.now() + trialDays * 86400000).toISOString();
        const referralCode = `RQ-${googleUser.uid.slice(0, 6).toUpperCase()}`;
        const referredBy = safeStorage.getItem('rq_ref_code') || null;
        const targetRole = preferredRole || (safeStorage.getItem('rq_user_role') as UserRole) || 'founder';

        const initialProfile: UserProfile = {
          id: googleUser.uid,
          email: googleUser.email || '',
          role: targetRole,
          full_name: googleUser.displayName || 'User',
          avatar_url: googleUser.photoURL || null,
          bio: null,
          linkedin_url: null,
          onboarding_completed: false,
          is_approved: true,
          first_deal_fee_waived: false,
          subscription_status: 'trial',
          trial_ends_at: trialEndsAt,
          has_active_subscription: false,
          credit_balance: trialStarterCredits,
          referral_code: referralCode,
          referred_by: referredBy,
          created_at: new Date().toISOString(),
        };

        await setDoc(userRef, initialProfile);

        // Record starter credits transaction
        try {
          const txRef = doc(db, 'credit_transactions', `tx_starter_${googleUser.uid}`);
          await setDoc(txRef, {
            userId: googleUser.uid,
            type: 'earn',
            source: 'trial_starter',
            amount: trialStarterCredits,
            balanceAfter: trialStarterCredits,
            timestamp: new Date().toISOString(),
            metadata: { note: '15-day starter credits' }
          });
        } catch (txErr) {
          console.warn('[AuthContext] Could not record starter credits ledger:', txErr);
        }

        setProfile(initialProfile);
      }



      return { error: null };
    } catch (err: any) {
      console.error('[AuthContext] Google Sign In error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const getIdToken = useCallback(async (forceRefresh = false): Promise<string> => {
    if (auth.currentUser) return auth.currentUser.getIdToken(forceRefresh);
    if (user && typeof (user as any).getIdToken === 'function') {
      return (user as any).getIdToken(forceRefresh);
    }
    return '';
  }, [user]);

  const value = {
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile: async () => {
      if (user) await fetchProfile(user.uid);
    },
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
