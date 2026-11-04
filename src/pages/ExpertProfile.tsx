import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Linkedin, 
  Twitter, 
  Globe, 
  Star, 
  Clock, 
  Calendar,
  MessageSquare,
  ArrowLeft,
  ChevronRight
} from "lucide-react";

import { EXPERTS } from "../data/experts";
import { usePageMeta } from "../hooks/usePageMeta";

export default function ExpertProfile() {
  const { id } = useParams();
  const expert = EXPERTS.find(e => e.id === id) || EXPERTS[0];

  usePageMeta({
    title: `${expert.name} - Raisequity Experts`,
    description: expert.aboutMe.slice(0, 155),
    canonicalPath: `/expert/${id || ''}`,
  });

  return (
    <div className="bg-[#F8FAFB] min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-[1240px]">
        {/* Back Link */}
        <Link to="/founders" className="inline-flex items-center gap-2 text-gray-400 hover:text-black font-bold text-sm mb-12 transition-colors">
          <ArrowLeft size={16} /> Back to Experts
        </Link>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* Main Content */}
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="w-[300px] h-[400px] shrink-0 rounded-[40px] overflow-hidden shadow-2xl">
                <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                      <h1 className="text-4xl font-black italic tracking-tighter uppercase">{expert.name}</h1>
                      <div className="text-blue-500 bg-blue-50 p-1 rounded-full">
                         <ShieldCheck size={20} fill="currentColor" className="text-white" />
                      </div>
                   </div>
                   <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px] leading-relaxed max-w-sm">
                      {expert.title}
                   </p>
                </div>
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight leading-tight">
                  I'm energetic, slightly unfiltered, and truly passionate about <span className="bg-[var(--color-clay-slushie)] px-2 py-0.5 rounded-lg">brand-building</span>.
                </h2>
                
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                      <Star size={16} className="text-yellow-400" fill="currentColor" />
                      <span className="font-black italic text-sm">{expert.rating}</span>
                      <span className="text-gray-300 text-xs font-bold uppercase tracking-widest ml-1">{expert.reviews} reviews</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Grid Stats/Info */}
            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl shadow-gray-200/20">
                  <h3 className="text-[12px] font-black uppercase tracking-[3px] text-gray-400 mb-8 flex items-center gap-2">
                     <Clock size={16} /> What I bring
                  </h3>
                  <ul className="space-y-4">
                     {expert.bringing.map((item, i) => (
                       <li key={i} className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-gray-200 mt-2 shrink-0" />
                          <p className="font-bold text-gray-600 leading-relaxed text-[15px]">{item}</p>
                       </li>
                     ))}
                  </ul>
               </div>

               <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl shadow-gray-200/20">
                  <h3 className="text-[12px] font-black uppercase tracking-[3px] text-gray-400 mb-8 flex items-center gap-2">
                     <MessageSquare size={16} /> You'll get advice on
                  </h3>
                  <ul className="space-y-4">
                     {expert.adviceOn.map((item, i) => (
                       <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 size={18} className="text-green-500" />
                          <p className="font-black italic text-gray-700 uppercase tracking-tighter">{item}</p>
                       </li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl shadow-gray-200/20">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[12px] font-black uppercase tracking-[3px] text-gray-400 flex items-center gap-2">
                    <Linkedin size={16} /> About me
                  </h3>
                  <div className="flex gap-4">
                     <Linkedin className="text-gray-300 hover:text-black cursor-pointer transition-colors" size={20} />
                     <Twitter className="text-gray-300 hover:text-black cursor-pointer transition-colors" size={20} />
                  </div>
               </div>
               <div className="prose max-w-none">
                  <p className="text-gray-500 font-medium leading-relaxed whitespace-pre-wrap">
                    {expert.aboutMe}
                  </p>
                  <button className="text-blue-600 font-black text-xs uppercase tracking-widest mt-6">See More</button>
               </div>
            </div>

            {/* Testimonials */}
            <div>
               <div className="flex items-center justify-between mb-8 px-2">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Real feedback from real sessions</h3>
                  <button className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">All reviews &rarr;</button>
               </div>
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[var(--color-clay-matcha)]/10 rounded-[30px] p-8 space-y-6">
                     <p className="font-bold text-gray-700 leading-relaxed italic">"Becca is 5-star + She is an expert, friendly, supportive, and fun to speak with. I left the meeting with a page of actionable ideas! Thank you!"</p>
                     <div className="flex items-center gap-3 border-t border-black/5 pt-6">
                        <div className="w-10 h-10 bg-black rounded-full text-white flex items-center justify-center font-black">A</div>
                        <div>
                           <div className="text-sm font-black italic">Adam Christie</div>
                           <div className="flex items-center gap-1 mt-0.5">
                              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="currentColor" className="text-black" />)}
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="bg-white rounded-[30px] p-8 space-y-6 border border-gray-100 shadow-sm">
                     <p className="font-bold text-gray-700 leading-relaxed italic">"I recently had a fantastic 15-minute video call with Becca, and I couldn't be more pleased with the experience. She discussed my personal brand and helped me refine my headlines..."</p>
                     <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-full text-orange-600 flex items-center justify-center font-black">K</div>
                        <div>
                           <div className="text-sm font-black italic">Karina M.</div>
                           <div className="flex items-center gap-1 mt-0.5">
                              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="currentColor" className="text-black" />)}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-[120px] h-fit">
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-8">
               <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-[20px] overflow-hidden">
                    <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center justify-center gap-2">
                       Connect with {expert.name.split(' ')[0]} <ShieldCheck size={18} fill="currentColor" className="text-blue-500" />
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{expert.title.split('|')[0]}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-black italic">
                    <Star size={14} fill="currentColor" className="text-yellow-400" /> 5.0 <span className="text-gray-300 font-bold uppercase tracking-widest text-[10px] ml-1">12 reviews</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">How deep do you want to go?</div>
                  <div className="grid grid-cols-3 gap-2">
                     <button className="bg-blue-50 text-blue-600 rounded-xl p-3 text-center group border border-blue-100 hover:bg-blue-100 transition-all">
                        <div className="font-black text-[12px] italic uppercase tracking-tighter mb-0.5">Quick</div>
                        <div className="text-[10px] font-bold opacity-60">15 min</div>
                     </button>
                     <button className="bg-gray-50 text-gray-400 border border-gray-100 rounded-xl p-3 text-center hover:bg-gray-100 transition-all">
                        <div className="font-black text-[12px] italic uppercase tracking-tighter mb-0.5">Full</div>
                        <div className="text-[10px] font-bold opacity-60">30 min</div>
                     </button>
                     <button className="bg-gray-50 text-gray-400 border border-gray-100 rounded-xl p-3 text-center hover:bg-gray-100 transition-all">
                        <div className="font-black text-[12px] italic uppercase tracking-tighter mb-0.5">Deep Dive</div>
                        <div className="text-[10px] font-bold opacity-60">45 min</div>
                     </button>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Next availability</div>
                     <button className="text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline">View other availability &rarr;</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     <div className="p-3 bg-blue-50 rounded-xl text-center border-2 border-blue-200">
                        <div className="text-[12px] font-black italic">Thu, May 7th</div>
                        <div className="text-[11px] font-bold text-blue-400 uppercase">9:00 AM</div>
                     </div>
                     <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100 opacity-50">
                        <div className="text-[12px] font-black italic">Thu, May 7th</div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase">10:00 AM</div>
                     </div>
                  </div>
               </div>

               <button className="w-full bg-black text-white py-5 rounded-[24px] font-black flex items-center justify-center gap-2 hover:shadow-2xl transition-all h-[80px] text-lg active:scale-95">
                  Book for ${expert.price}
               </button>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mt-4 italic">Full 1 hr • May 7th 9:00 AM</p>
            </div>

            <div className="bg-gray-900 rounded-[40px] p-10 text-white space-y-6">
               <h3 className="text-xl font-black italic uppercase tracking-tighter">Become an expert.</h3>
               <p className="text-gray-400 font-medium leading-relaxed">Share your wisdom with the next generation of Web3 founders.</p>
               <button className="w-full bg-white text-black py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Apply to Expert Lab</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CheckCircle2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
