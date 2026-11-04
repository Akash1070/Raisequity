import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  ArrowLeft, 
  Star,
  Users,
  TrendingUp,
  Brain,
  MessageCircle,
  MoreHorizontal
} from "lucide-react";

import { EXPERT_CATEGORIES } from "../data/experts";
import { usePageMeta } from "../hooks/usePageMeta";

export default function ExpertCategory() {
  const { categoryId } = useParams();
  const category = EXPERT_CATEGORIES[categoryId as keyof typeof EXPERT_CATEGORIES] || EXPERT_CATEGORIES["marketing-gtm"];

  usePageMeta({
    title: `${category.title} Experts - Raisequity`,
    description: category.tagline,
    canonicalPath: `/experts/category/${categoryId || ''}`,
  });

  return (
    <div className="bg-[#F8FAFB] min-h-screen pb-32">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-20 text-center max-w-[1240px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-8">
           <div className="w-16 h-16 bg-[var(--color-clay-slushie)] rounded-full flex items-center justify-center">
              <TrendingUp size={30} className="text-black/40" />
           </div>
           <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">{category.title}</h1>
              <p className="text-2xl md:text-4xl font-medium tracking-tight text-gray-700 max-w-4xl">
                 {category.tagline}
              </p>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">
                 {category.description}
              </p>
           </div>
           
           <div className="flex -space-x-4">
              {category.topExperts.map((expert, i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-sm">
                   <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
                </div>
              ))}
           </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 max-w-[1240px]">
         {/* Filter Bar */}
         <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-gray-100 font-bold text-xs uppercase tracking-widest shadow-sm hover:border-black transition-all">
               <Star size={14} className="text-gray-300" /> Only top advisors
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-gray-100 font-bold text-xs uppercase tracking-widest shadow-sm hover:border-black transition-all">
               <Users size={14} className="text-gray-300" /> New experts
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-gray-100 font-bold text-xs uppercase tracking-widest shadow-sm hover:border-black transition-all">
               <TrendingUp size={14} className="text-gray-300" /> Availability
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-gray-100 font-bold text-xs uppercase tracking-widest shadow-sm hover:border-black transition-all">
               <Users size={14} className="text-gray-300" /> Budget
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-gray-100 font-bold text-xs uppercase tracking-widest shadow-sm hover:border-black transition-all">
               <Brain size={14} className="text-gray-300" /> Community rating
            </button>
         </div>

         {/* Section Header */}
         <div className="bg-white rounded-[60px] p-12 md:p-20 mb-20 border border-gray-100 text-center space-y-12 shadow-xl shadow-gray-200/20">
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">Founders building products are guided by these Top Experts.</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
               {category.topExperts.map((expert, i) => (
                 <div key={i} className="flex flex-col items-center gap-4 group">
                    <div className="relative">
                       <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                          <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
                       </div>
                       <div className="absolute -top-2 -right-2 bg-green-500 p-1.5 rounded-full border-4 border-white">
                          <ShieldCheck size={14} className="text-white" fill="currentColor" />
                       </div>
                    </div>
                    <div className="text-center">
                       <h4 className="text-sm font-black italic uppercase tracking-tighter">{expert.name}</h4>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Marketing Expert</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Expert Listing Grid */}
         <div className="space-y-12">
            <div className="flex items-center justify-between px-4">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter">Meet experts who can help you with {category.title}.</h3>
               <p className="text-gray-400 font-medium text-sm">Find and connect with the right experts, ready to help you move forward.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {/* Becca Card */}
               <Link to={`/expert/becca-chambers`} className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/20 group hover:border-black transition-all">
                  <div className="aspect-[4/5] relative overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                        <ShieldCheck size={20} className="text-blue-500" fill="currentColor" />
                     </div>
                  </div>
                  <div className="p-8">
                     <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1">Becca Chambers</h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Personal Brand Expert | VC CMO</p>
                     <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                           <MessageCircle size={14} className="text-gray-300" /> Sessions from $110
                        </div>
                        <div className="flex items-center gap-1">
                           <Star size={14} fill="currentColor" className="text-yellow-400" /> 5.0
                        </div>
                     </div>
                  </div>
               </Link>

               {/* More Mock Cards */}
               {[
                 { name: "Trace Cohen", title: "Investor | NYC Venture", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" },
                 { name: "Olivia O'Sullivan", title: "Partner | Forum VC", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400" },
                 { name: "David Yii", title: "GP | Quidance Capital", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400" },
                 { name: "Tracey Cohen", title: "Growth | NYC", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
                 { name: "Karim B.", title: "Founder | Pinea VC", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" },
                 { name: "Olivia Sullivan", title: "CMO | Forum", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" },
                 { name: "Suzy Engwall", title: "HealthTech Expert", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" }
               ].map((e, i) => (
                 <div key={i} className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/20 group hover:border-black transition-all cursor-pointer">
                    <div className="aspect-[4/5] relative overflow-hidden">
                       <img src={e.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-8">
                       <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1">{e.name}</h3>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">{e.title}</p>
                       <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                          <div className="flex items-center gap-1.5">
                             <MessageCircle size={14} className="text-gray-300" /> Sessions from $90+
                          </div>
                          <div className="flex items-center gap-1">
                             <Star size={14} fill="currentColor" className="text-yellow-400" /> 5.0
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
               
               {/* CTA Card */}
               <div className="bg-black text-white rounded-[40px] p-10 flex flex-col justify-center gap-6 group hover:translate-y-[-8px] transition-all">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">Can't find what you're looking for?</h3>
                  <p className="text-gray-400 font-medium">Tell us your challenge and we'll match you with the right expert.</p>
                  <button className="bg-white text-black py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Request Match</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
