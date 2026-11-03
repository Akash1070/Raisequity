import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowLeft, Star, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ServiceTeaser() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const uid = user?.uid || (user as any)?.id;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 font-sans pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link to="/service-providers" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black">
          <ArrowLeft size={16} /> All Service Partners
        </Link>

        {/* Public Teaser Header */}
        <div className="bg-white rounded-[36px] p-8 sm:p-12 border border-gray-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
                Verified Service Partner
              </span>
              <h1 className="text-3xl font-extrabold text-black mt-3">{id?.replace('-', ' ') || 'Partner Agency'}</h1>
              <p className="text-sm font-bold text-gray-500">Smart Contract Auditing & Legal Tokenomics</p>
            </div>
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 text-amber-600 font-black text-xl">
              <Briefcase size={28} />
            </div>
          </div>

          <p className="text-sm text-gray-700 font-medium leading-relaxed">
            Specialized Web3 service provider delivering token design, audit reports, and go-to-market acceleration for top platform founders.
          </p>
        </div>

        {/* Gated Detail */}
        <div className="bg-black text-white rounded-[36px] p-8 sm:p-12 border border-gray-800 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-400">
            <Lock size={16} /> Restricted Service Partner Reach-Out
          </div>
          <h2 className="text-2xl font-extrabold">Request Proposal & Direct Quote</h2>
          <p className="text-xs text-gray-300 font-medium leading-relaxed">
            Sign in or register to view full client reviews, portfolio case studies, and send a direct quote request with escrow protection.
          </p>
          <div className="pt-2">
            {!uid ? (
              <Link to="/login" className="px-7 py-3.5 bg-amber-400 text-black rounded-full font-black text-xs hover:bg-white transition-all inline-block">
                Sign In to Request Quote
              </Link>
            ) : (
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <ShieldCheck size={16} /> Authenticated — Request proposals inside your dashboard.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
