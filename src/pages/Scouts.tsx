import { motion } from "framer-motion";
import { UserCheck, ShieldCheck, MapPin } from "lucide-react";

export default function Scouts() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-[1240px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
        <h1 className="text-5xl md:text-[80px] font-black italic tracking-tighter mb-4">Scouts.</h1>
        <p className="text-gray-400 font-bold uppercase tracking-[4px] text-xs">Community-driven Deal Verification</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-[40px] p-10 border border-gray-100 hover:border-black transition-all group">
             <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden group-hover:scale-105 transition-all">
                   <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Scout" />
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                   <ShieldCheck size={20} />
                </div>
             </div>
             <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1">Scout #{1024 + i}</h3>
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">
                <MapPin size={12} /> Global • L1 Specialist
             </div>
             <div className="space-y-3">
                <div className="h-2 bg-gray-50 rounded-full w-full" />
                <div className="h-2 bg-gray-50 rounded-full w-[80%]" />
             </div>
             <button className="mt-10 w-full py-4 border-2 border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-black transition-all">Connect with Scout</button>
          </div>
        ))}
      </div>
    </div>
  );
}
