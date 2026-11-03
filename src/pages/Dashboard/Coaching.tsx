import { motion } from "framer-motion";
import { Star, Calendar, ArrowUpRight, RefreshCw, Users } from "lucide-react";
import { useExperts } from "../../hooks/useExperts";

export default function Coaching() {
  const { experts, loading, error, refetch } = useExperts();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500 font-bold">Failed to load experts</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-xl font-bold text-sm">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-black">Coaching</h1>
          <p className="text-gray-500 font-medium">Book private sessions with institutional experts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex animate-pulse">
              <div className="w-64 bg-gray-100 shrink-0" style={{ minHeight: 280 }} />
              <div className="flex-1 p-8 space-y-4">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            </div>
          ))
        ) : experts.length === 0 ? (
          <div className="col-span-2 bg-white rounded-[40px] border-2 border-dashed border-gray-100 p-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center">
              <Users size={32} className="text-gray-300" />
            </div>
            <h3 className="font-black text-[18px] text-black">No experts yet</h3>
            <p className="text-gray-500 font-medium text-sm max-w-xs">
              Expert profiles will appear here once they are added by the platform admin.
            </p>
          </div>
        ) : (
          experts.map((expert: any) => (
            <motion.div
              key={expert.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-64 bg-gray-50 p-8 flex flex-col items-center">
                <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white shadow-xl mb-6">
                  <img
                    src={expert.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.id}`}
                    alt={expert.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-[18px] font-black text-black leading-tight">{expert.title}</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase mt-1">{expert.company}</p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-black text-black">5.0</span>
                  <span className="text-[11px] text-gray-400 font-bold">(New)</span>
                </div>
              </div>

              <div className="flex-1 p-8 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-6">
                  {expert.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 rounded-full text-[11px] font-bold text-gray-500 border border-gray-100">{tag}</span>
                  ))}
                </div>
                <h4 className="text-[13px] font-black uppercase text-gray-300 tracking-widest mb-3">About</h4>
                <p className="text-[14px] text-gray-600 leading-relaxed font-medium mb-8">
                  {expert.bio || "Experienced expert available for 1:1 sessions."}
                </p>
                <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-300 block mb-1">Session Starts At</span>
                    <span className="text-[20px] font-black text-black">
                      {expert.rate_per_hour ? `$${expert.rate_per_hour}` : "Free"}
                    </span>
                  </div>
                  {expert.calendly_url ? (
                    <a href={expert.calendly_url} target="_blank" rel="noreferrer"
                      className="bg-black text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-[var(--color-clay-ube)] transition-all">
                      Book Call <Calendar size={18} />
                    </a>
                  ) : (
                    <button className="bg-black text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-[var(--color-clay-ube)] transition-all">
                      Book Call <Calendar size={18} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="bg-gradient-to-br from-black to-gray-800 rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-[var(--color-clay-ube)] blur-[120px] opacity-20"></div>
        <div className="relative z-10 max-w-xl">
          <span className="bg-[var(--color-clay-ube)] text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Pro Accelerator</span>
          <h2 className="text-[32px] font-black leading-none mb-6">Become a fundraising <br /><span className="text-[var(--color-clay-ube)] font-black text-[36px]">powerhouse.</span></h2>
          <p className="text-[16px] text-white/60 font-medium leading-relaxed mb-10">
            Unlock the 1:1 expert coaching plan. Includes 4 strategy sessions per month, full deck reconstruction, and direct introduction paths to Tier 1 VC firms.
          </p>
          <button className="bg-white text-black px-10 py-4 rounded-2xl font-black flex items-center gap-2 hover:shadow-2xl transition-all">
            Unlock Advisor Plan <ArrowUpRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
