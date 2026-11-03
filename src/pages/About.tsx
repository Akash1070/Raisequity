import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="container mx-auto px-4 max-w-3xl py-12 flex-grow">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="mb-12">
          <span className="uppercase text-[11px] md:text-[12px] font-bold tracking-[1.08px] bg-[var(--color-clay-lemon)] text-black px-3 py-1 rounded-full mb-6 inline-block shadow-[inset_0_-1px_1px_rgba(0,0,0,0.2)]">
            Our Mission
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-[64px] font-bold tracking-[-1.5px] md:tracking-[-2.4px] text-black mb-6 leading-[1.05]">
            About Raisequity.
          </h1>
          <p className="text-[16px] md:text-[18px] text-[var(--color-clay-text-muted)] font-medium max-w-3xl leading-[1.6]">
            The curated deal flow intermediary bridging the Web2 &amp; Web3 funding gap.
          </p>
        </div>

        <div className="aspect-[21/9] glass-card bg-white rounded-[40px] p-2 overflow-hidden mb-12 relative group shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <img 
            src="https://picsum.photos/seed/web3-collaborate/1200/600" 
            alt="Startup Collaboration" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-[32px] group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        <div className="max-w-none space-y-6">
          <p className="text-[18px] text-black/80 leading-[1.6] font-medium">
            Early-stage founders — whether building in AI, SaaS, FinTech, or Web3 — struggle to identify and reach the right check-writers at the right stage. Cold outreach is noisy, warm introductions are heavily gated, and open platforms lead to unsolicited spam.
          </p>
          <p className="text-[18px] text-black/80 leading-[1.6] font-medium">
            On the investor side, discovering credible, high-conviction early-stage startups in one place — with verified traction and clear thesis alignment — is equally difficult.
          </p>

          <h2 className="text-[32px] font-bold text-black mt-12 mb-6 tracking-[-0.64px]">Our Mission</h2>
          <p className="text-[18px] text-black/80 leading-[1.6] font-medium">
            Raisequity acts as the trusted, curated middleman. We filter and qualify founders across Web2 and Web3 before presenting them to investors, protect both parties' contact information, and provide value-added services like perks, credits, and expert scouts to make the fundraising process smoother.
          </p>
        </div>

        <div className="mt-16 p-8 md:p-10 rounded-[40px] border border-[var(--color-clay-border)] bg-[var(--color-clay-slushie)] clay-shadow relative overflow-hidden transition-all hover:shadow-[-7px_7px_0_rgba(0,0,0,1)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-30 -z-10"></div>
          
          <h3 className="text-[32px] font-bold tracking-[-0.64px] mb-4 text-black leading-tight">Connect With Me</h3>
          <p className="text-[16px] leading-[1.5] text-black/80 font-medium mb-8 max-w-md">I'm Akash Kumar. Let's talk deal flow, startups, and fundraising across Web2 &amp; Web3.</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="https://www.linkedin.com/in/akashkumar107/" 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 rounded-full bg-white text-black text-[15px] font-bold transition-all flex items-center justify-center gap-2 border border-transparent hover:border-black hover:-rotate-3 hover:-translate-y-1 hover:shadow-[-5px_5px_0_rgb(10,102,194)]"
            >
              LinkedIn
            </a>
            <a 
              href="https://x.com/yourweb3guys" 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 rounded-full bg-white text-black text-[15px] font-bold transition-all flex items-center justify-center gap-2 border border-transparent hover:border-black hover:rotate-3 hover:-translate-y-1 hover:shadow-[5px_5px_0_black]"
            >
              X (Twitter)
            </a>
            <a 
              href="https://t.me/akash_kumar107" 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 rounded-full bg-white text-black text-[15px] font-bold transition-all flex items-center justify-center gap-2 border border-transparent hover:border-black hover:-rotate-3 hover:-translate-y-1 hover:shadow-[-5px_5px_0_rgb(34,158,217)]"
            >
              Telegram
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
