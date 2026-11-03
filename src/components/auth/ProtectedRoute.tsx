import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { Loader2, ShieldAlert } from 'lucide-react';
import { safeStorage } from '../../lib/storage';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

// Role-to-Dashboard route mapping
export const ROLE_DASHBOARDS: Record<string, string> = {
  founder: '/dashboard/feed',
  investor: '/investor-dashboard/deals',
  service_provider: '/agency-dashboard/rfps',
  agency: '/agency-dashboard/rfps',
  scout_admin: '/admin',
  scout: '/dashboard/feed',
  admin: '/admin',
};

// Role-to-Onboarding route mapping
export const ROLE_ONBOARDING: Record<string, string> = {
  founder: '/onboarding',
  investor: '/investor-onboarding',
  service_provider: '/agency-onboarding',
  agency: '/agency-onboarding',
  scout_admin: '/admin',
  scout: '/onboarding',
  admin: '/admin',
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, role, loading } = useAuth();
  const location = useLocation();

  // Loading spinner while auth state resolves
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0F12] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-sm font-medium text-gray-400">Verifying access & permissions...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated → redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const userRole = profile?.role || role || 'founder';
  const isUserAdmin = (adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()) || userRole === 'admin' || userRole === 'scout_admin';
  const effectiveRole = isUserAdmin ? 'admin' : userRole;

  // Role restriction check
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    const defaultTarget = ROLE_DASHBOARDS[effectiveRole] || '/dashboard/feed';
    return <Navigate to={defaultTarget} replace />;
  }

  // Onboarding completion check (skip for admin)
  const currentUid = profile?.id || user?.uid || (user as any)?.id;
  const isLocallyCompleted = currentUid ? Boolean(safeStorage.getItem(`rq_onboarding_completed_${currentUid}`)) : false;
  const onboardingCompleted = (profile?.onboarding_completed ?? false) || isLocallyCompleted;

  if ((effectiveRole as string) !== 'scout_admin' && effectiveRole !== 'admin') {
    if (!onboardingCompleted && !location.pathname.includes('onboarding')) {
      const onboardingTarget = ROLE_ONBOARDING[effectiveRole] || '/onboarding';
      return <Navigate to={onboardingTarget} replace />;
    }
    if (onboardingCompleted && location.pathname.includes('onboarding')) {
      const dashboardTarget = ROLE_DASHBOARDS[effectiveRole] || '/dashboard/feed';
      return <Navigate to={dashboardTarget} replace />;
    }
  }

  // Consolidated Paywall Gate (Founders & Service Providers)
  // Access requires either active subscription OR valid active trial (trial_ends_at in future)
  if (!isUserAdmin && (effectiveRole === 'founder' || effectiveRole === 'service_provider')) {
    const userCreationTime = user?.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now();
    const daysSinceCreation = (Date.now() - userCreationTime) / (1000 * 60 * 60 * 24);
    const isNewUserTrial = daysSinceCreation <= 15;

    const hasSubscription = Boolean(profile?.has_active_subscription);
    const isTrialActive = Boolean(
      (profile?.trial_ends_at && new Date() < new Date(profile.trial_ends_at)) ||
      isNewUserTrial ||
      !profile // Grace period if profile loading
    );
    const isPaywallAllowed = hasSubscription || isTrialActive;

    const isCheckoutPath = location.pathname.includes('/checkout') || location.pathname.includes('/settings');

    if (!isPaywallAllowed && !isCheckoutPath && onboardingCompleted) {
      return (
        <div className="min-h-screen bg-[#0D0F12] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#161920] border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-400 font-black text-xl">
              ⌛
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Free Trial Expired</h2>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                Your 15-day free trial has concluded. Subscribe to Raisequity for <strong>$20/month</strong> to unlock full dashboard access, founder warm intros, and dealflow.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left text-xs space-y-2 text-gray-300">
              <div className="flex items-center justify-between font-bold">
                <span>Account Email:</span>
                <span className="text-white">{profile?.email || user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span>Trial Status:</span>
                <span className="text-red-400 font-bold uppercase">Expired</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => window.location.href = '/checkout'}
                className="w-full bg-[var(--color-clay-matcha)] hover:bg-[var(--color-clay-matcha-dark)] text-white font-black py-4 rounded-xl shadow-lg transition-all text-sm cursor-pointer"
              >
                View Subscription Breakdown & Reactivate ($20/mo)
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
