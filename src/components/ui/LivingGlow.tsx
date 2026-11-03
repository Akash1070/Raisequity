import React from 'react';
import { motion } from 'framer-motion';

interface LivingGlowProps {
  className?: string;
  color?: string;
}

export function LivingGlow({
  className = "",
  color = "#0070F3",
}: LivingGlowProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}>
      {/* Primary breathing core glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.28, 0.15],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-[100%] blur-[120px] mix-blend-screen"
        style={{
          background: `radial-gradient(circle, ${color} 0%, rgba(0,112,243,0.05) 60%, transparent 80%)`,
        }}
      />

      {/* Secondary horizon ambient diffusion */}
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.08, 0.18, 0.08],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[10%] right-[10%] w-[500px] h-[350px] rounded-full blur-[140px] mix-blend-screen"
        style={{
          background: `radial-gradient(circle, #7928CA 0%, rgba(121,40,202,0.05) 50%, transparent 80%)`,
        }}
      />
    </div>
  );
}

export default LivingGlow;

