import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getInvestorProfile, getInvestorPreferences } from '../lib/investors';
import type { InvestorProfile, InvestorPreferences } from '../types/investor';

export function useInvestorProfile() {
  const { user } = useAuth();
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [preferences, setPreferences] = useState<InvestorPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: profile } = await getInvestorProfile(user.id);
    setInvestorProfile(profile);

    if (profile) {
      const { data: prefs } = await getInvestorPreferences(profile.id);
      setPreferences(prefs);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { investorProfile, preferences, loading, refetch: fetchProfile };
}
