import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle, CheckCircle, HelpCircle } from "lucide-react";
import { WarmIntroRequest } from "../../types/founder";
import { db } from "../../lib/firebase";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";

interface WarmIntroCardProps {
  request: WarmIntroRequest;
  onStatusChange?: () => void;
  onChatClick?: (introducingFounderId: string) => void;
}

export default function WarmIntroCard({ request, onStatusChange, onChatClick }: WarmIntroCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const investor = request.investor_contact;
  const introducingFounder = request.introducing_founder;

  // Format time since creation
  const getRelativeTime = (dateStr: string) => {
    const created = new Date(dateStr).getTime();
    const diffMs = Date.now() - created;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "warm_intro_requests", request.id);
      await updateDoc(docRef, { status: "accepted" });

      // Also send a notification to the introducing founder
      if (introducingFounder?.user_id) {
        const notifRef = collection(db, "notifications");
        await addDoc(notifRef, {
          user_id: introducingFounder.user_id,
          type: "intro_approved",
          title: "Introduction Accepted! 🤝",
          body: `The founder accepted your introduction to ${investor?.investor_name || "investor"}. Check your email to connect.`,
          link: "/dashboard/feed",
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      if (onStatusChange) onStatusChange();
    } catch (err) {
      console.error("Error accepting intro:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper hints for "What you should do"
  const getHintText = (status: string) => {
    switch (status) {
      case "pending":
        return "Wait for the introducing founder to review and approve your intro request.";
      case "approved":
        return "The introduction is approved! Wait for the introducing founder to send the email connect.";
      case "intro_sent":
        return "Introduction has been sent! Click 'Accept Intro' to confirm you want to proceed and receive details.";
      case "accepted":
        return "You accepted the intro. Check your email for the group thread or chat with the connector.";
      case "declined":
        return "This request was declined. No credits were deducted.";
      default:
        return "Check status updates or message the connector.";
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-orange-50 text-orange-600 border border-orange-100",
    approved: "bg-purple-50 text-purple-600 border border-purple-100",
    intro_sent: "bg-blue-50 text-blue-600 border border-blue-100 animate-pulse",
    accepted: "bg-green-50 text-green-600 border border-green-100",
    declined: "bg-red-50 text-red-600 border border-red-100"
  };

  const investorInit = investor?.investor_name?.charAt(0) || "I";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Investor Avatar Placeholder */}
          <div className="w-10 h-10 rounded-xl bg-[var(--color-clay-ube)]/10 flex items-center justify-center text-[var(--color-clay-ube-dark)] font-bold text-sm shrink-0">
            {investorInit}
          </div>
          <div>
            <h4 className="text-[14px] font-black text-black leading-tight">
              Intro to {investor?.investor_name || "Investor"}
            </h4>
            <p className="text-[11px] text-gray-400 font-medium">
              Introduced by{" "}
              <span className="font-bold text-gray-600">
                {introducingFounder?.full_name || "Matched Founder"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${statusColors[request.status || ""] || "bg-gray-100"}`}>
            {(request.status || "pending").replace("_", " ")}
          </span>
          <span className="text-[9px] font-bold text-gray-300">
            {getRelativeTime(request.created_at)}
          </span>
        </div>
      </div>

      {/* Connected Info Line */}
      <div className="text-[11px] font-medium text-gray-500 bg-gray-50 px-3 py-2 rounded-xl flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
        Connected via {introducingFounder?.full_name || "Founder"} • {investor?.fund_name || "Private Fund"}
      </div>

      {/* Accordion / Expandable Offer Details */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-black cursor-pointer transition-colors"
        >
          {expanded ? (
            <>
              Hide details <ChevronUp size={12} />
            </>
          ) : (
            <>
              View offer details <ChevronDown size={12} />
            </>
          )}
        </button>

        {expanded && (
          <div className="mt-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100 text-xs space-y-2">
            <div>
              <span className="font-bold text-gray-400">Sectors:</span>{" "}
              <span className="text-gray-700 font-medium">
                {investor?.sectors_invested_in?.join(", ") || "All Tech"}
              </span>
            </div>
            <div>
              <span className="font-bold text-gray-400">Check Size:</span>{" "}
              <span className="text-gray-700 font-medium">
                ${investor?.check_size_min?.toLocaleString()} - ${investor?.check_size_max?.toLocaleString()}
              </span>
            </div>
            {request.blurb_sent && (
              <div>
                <span className="font-bold text-gray-400">Blurb Sent:</span>
                <p className="text-gray-600 mt-1 italic leading-relaxed">
                  "{request.blurb_sent}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-50">
        <div className="flex items-start gap-1.5">
          <HelpCircle size={14} className="text-gray-300 mt-0.5 shrink-0" />
          <p className="text-[10px] text-gray-400 font-medium italic leading-tight">
            {getHintText(request.status)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {onChatClick && introducingFounder && (
            <button
              onClick={() => onChatClick(introducingFounder.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 hover:border-black text-[11px] font-bold text-gray-500 hover:text-black cursor-pointer transition-all"
            >
              <MessageCircle size={13} />
              Chat
            </button>
          )}

          {request.status === "intro_sent" && (
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-clay-matcha)] hover:bg-[var(--color-clay-matcha-dark)] text-white rounded-xl text-[11px] font-black uppercase tracking-wider cursor-pointer shadow-sm disabled:opacity-50 transition-all"
            >
              <CheckCircle size={13} />
              {loading ? "Accepting..." : "Accept Intro"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
