import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Lock, ShieldCheck, DollarSign, Calendar, ArrowLeft } from 'lucide-react';
import { getInvestorProfile } from '../../lib/investors';
import { InvestorProfile } from '../../types/investor';
import { useAuth } from '../../contexts/AuthContext';

export default function InvestorTeaser() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const uid = user?.uid || (user as any)?.id;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getInvestorProfile(id)
      .then((res) => {
        if (res.data) setProfile(res.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">Loading Investor Teaser...</div>;
  }

  if (!profile || profile.quiet_mode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center space-y-4 font-sans">
        <Lock size={48} className="text-gray-300" />
        <h2 className="text-2xl font-black text-black">Private or Unavailable Profile</h2>
        <p className="text-xs text-gray-500 font-medium max-w-xs">
          This investor profile is operating in Quiet Mode or does not exist in the public directory.
        </p>
        <Link to="/investors" className="px-6 py-3 bg-black text-white rounded-full text-xs font-black">
          Back to Investors
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 font-sans pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link to="/investors" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black">
          <ArrowLeft size={16} /> All Capital Partners
        </Link>

        {/* Public Teaser Header */}
        <div className="bg-white rounded-[36px] p-8 sm:p-12 border border-gray-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                {profile.investor_type?.replace('_', ' ') || 'Venture Capitalist'}
              </span>
              <h1 className="text-3xl font-extrabold text-black mt-3">{profile.full_name}</h1>
              <p className="text-sm font-bold text-gray-500">{profile.fund_name || 'Venture Partner'}</p>
            </div>
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 text-purple-600 font-black text-xl">
              {profile.full_name?.charAt(0) || 'V'}
            </div>
          </div>

          <p className="text-sm text-gray-700 font-medium leading-relaxed">
            {profile.bio || 'Active investor funding early-stage Web3, AI, and decentralized infrastructure.'}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs font-bold">
            <div>
              <span className="text-gray-400 uppercase text-[10px] block mb-1">Preferred Sectors</span>
              <span className="text-black">{(profile as any).preferred_sectors?.join(', ') || 'Web3, DeFi, AI'}</span>
            </div>
            <div>
              <span className="text-gray-400 uppercase text-[10px] block mb-1">Check Size Range</span>
              <span className="text-black">${((profile as any).min_check_size || 25000).toLocaleString()} – ${((profile as any).max_check_size || 250000).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Gated Detail */}
        <div className="bg-black text-white rounded-[36px] p-8 sm:p-12 border border-gray-800 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-400">
            <Lock size={16} /> Gated Investor Reach-Out
          </div>
          <h2 className="text-2xl font-extrabold">Connect with {profile.full_name}</h2>
          <p className="text-xs text-gray-300 font-medium leading-relaxed">
            Create a free founder account or sign in to request warm intros, share pitch decks, and book mentorship calls directly.
          </p>
          <div className="pt-2">
            {!uid ? (
              <Link to="/login?role=founder" className="px-7 py-3.5 bg-emerald-400 text-black rounded-full font-black text-xs hover:bg-white transition-all inline-block">
                Sign In to Connect
              </Link>
            ) : (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck size={16} /> Authenticated — Access full network in your dashboard.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
