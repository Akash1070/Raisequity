import React, { useEffect, useState } from "react";
import { Users, Gift, CheckCircle2, Clock, Activity, Search, ArrowUpRight } from "lucide-react";
import { getAllReferrals } from "../../lib/referrals";
import { ReferralRecord } from "../../types";

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllReferrals();
        setReferrals(data);
      } catch (err) {
        console.error("Error fetching referrals:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = referrals.filter((ref) => {
    const matchesSearch =
      !search ||
      ref.inviteeEmail.toLowerCase().includes(search.toLowerCase()) ||
      ref.referrerName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || ref.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvited = referrals.length;
  const verifiedCount = referrals.filter(r => r.status === "verified" || r.status === "rewarded").length;
  const rewardedCount = referrals.filter(r => r.status === "rewarded").length;
  const totalCreditsAwarded = rewardedCount * 30;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Activity size={32} className="animate-spin text-black" />
        <p className="text-xs font-mono font-bold text-gray-400">Loading referral analytics ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] font-black text-black tracking-tight font-heading flex items-center gap-3">
          <Users className="w-8 h-8 text-black" /> Referral Analytics & Verified Rewards
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Tracking viral growth and 30-credit rewards for verified investor introductions
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-black uppercase text-gray-400">Total Referrals</span>
          <div className="text-2xl font-black text-black">{totalInvited}</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-black uppercase text-amber-600">Verified Introductions</span>
          <div className="text-2xl font-black text-amber-600">{verifiedCount}</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-black uppercase text-emerald-600">Rewarded Referrals</span>
          <div className="text-2xl font-black text-emerald-600">{rewardedCount}</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-black uppercase text-blue-600">Credits Awarded</span>
          <div className="text-2xl font-black text-blue-600">+{totalCreditsAwarded}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by referrer name or invitee email..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-black placeholder:text-gray-400 focus:ring-2 focus:ring-black outline-none shadow-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs font-black uppercase font-mono text-black outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="joined">Joined (Pending Verification)</option>
          <option value="verified">Verified</option>
          <option value="rewarded">Rewarded (+30 Credits)</option>
        </select>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Invitee</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Referrer</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((ref) => (
                <tr key={ref.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-extrabold text-black">{ref.inviteeEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black font-mono px-2.5 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-200 uppercase">
                      {ref.inviteeRole}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-black">{ref.referrerName || "Founder"}</div>
                    <div className="text-[10px] text-gray-400 font-mono">UID: {ref.referrerUid.slice(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-black font-mono px-2.5 py-1 rounded-full border inline-flex items-center gap-1 uppercase ${
                        ref.status === "rewarded"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : ref.status === "verified"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {ref.status === "rewarded" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {ref.status === "rewarded" ? "REWARDED (+30 CREDITS)" : ref.status === "verified" ? "VERIFIED" : "JOINED (UNVERIFIED)"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm font-medium">No referral records match query</div>
        )}
      </div>
    </div>
  );
}
