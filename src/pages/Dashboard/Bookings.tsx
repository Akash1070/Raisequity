import React, { useState, useEffect } from "react";
import { Loader2, Calendar, Clock, ExternalLink, AlertCircle } from "lucide-react";
import { useFounderProfile } from "../../hooks/useFounderProfile";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { CallBooking } from "../../types/founder";

type TabType = "all" | "pending" | "accepted" | "completed";

export default function Bookings() {
  const { founderProfile } = useFounderProfile();
  const [bookings, setBookings] = useState<CallBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!founderProfile?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const ref = collection(db, "call_bookings");
      const q = query(ref, where("founder_id", "==", founderProfile.id));
      const snap = await getDocs(q);

      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as CallBooking[];

      setBookings(items);
    } catch (e: any) {
      console.error("[Bookings] Error fetching bookings:", e);
      setError(e?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [founderProfile]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 text-green-600 border border-green-100";
      case "declined":
        return "bg-red-50 text-red-600 border border-red-100";
      case "completed":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      default:
        return "bg-orange-50 text-orange-600 border border-orange-100";
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not scheduled";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!founderProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-black">
            Call Bookings
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Track and join scheduled pitch meetings with target investors.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-bold flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-px">
        {(["all", "pending", "accepted", "completed"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings View */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-gray-300" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <Calendar size={32} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-black text-sm text-black">No bookings found</h3>
          <p className="text-gray-400 font-medium text-xs max-w-xs mx-auto mt-1 leading-normal">
            No scheduled meetings match this filter. Start booking calls in the Curated Investors tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${getStatusStyle(booking.status)}`}>
                    {booking.status}
                  </span>
                  {booking.payment_amount && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                      {booking.payment_amount} credits
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black text-black flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(booking.scheduled_at)}
                  </h4>
                  <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    {formatTime(booking.scheduled_at)}
                  </div>
                </div>

                {booking.message_from_founder && (
                  <p className="text-[11px] text-gray-500 italic bg-gray-50/50 p-3 rounded-xl border border-gray-50 leading-relaxed">
                    "{booking.message_from_founder}"
                  </p>
                )}
              </div>

              {/* Action Button */}
              {booking.status === "accepted" && booking.calendly_link && (
                <button
                  onClick={() => window.open(booking.calendly_link!, "_blank")}
                  className="w-full py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Join Meeting <ExternalLink size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
