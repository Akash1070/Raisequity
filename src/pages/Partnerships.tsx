import { motion } from "framer-motion";
import { Building2, Landmark, Rocket, ShieldCheck } from "lucide-react";

export default function Partnerships() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-[1240px]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
        <h1 className="text-5xl md:text-[80px] font-black italic tracking-tighter mb-4">Partnerships.</h1>
        <p className="text-gray-400 font-bold uppercase tracking-[4px] text-xs">Strategic Alliances for the Web3 Era</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { name: "Alliance DAO", type: "Accelerator", icon: <Rocket /> },
          { name: "Ethereum Foundation", type: "Grants", icon: <Landmark /> },
          { name: "Pantera Capital", type: "Ventures", icon: <Building2 /> },
          { name: "ImmuneFi", type: "Security", icon: <ShieldCheck /> }
        ].map((p, i) => (
          <div key={i} className="bg-white rounded-[40px] p-10 border border-gray-100 hover:border-black transition-all shadow-xl shadow-gray-200/20 text-center group">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl mx-auto mb-6 flex items-center justify-center text-gray-400 group-hover:text-black transition-colors">
              {p.icon}
            </div>
            <h3 className="font-black italic text-xl uppercase tracking-tighter">{p.name}</h3>
            <p className="text-xs font-black text-gray-400 mt-2 uppercase tracking-widest">{p.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
