import React from 'react';
import { motion } from 'framer-motion';

interface KineticTextProps {
  children: string;
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
  delay?: number;
}

export function KineticText({
  children,
  className = "",
  highlightWords = [],
  highlightClassName = "text-[#0070F3]",
  delay = 0,
}: KineticTextProps) {
  const words = children.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 14,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const, // Bang-Motion anti-stutter fluid curve
      },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`inline-block ${className}`}
    >
      {words.map((word, i) => {
        const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
        const isHighlight = highlightWords.some(
          (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
        );

        return (
          <motion.span
            key={`${word}-${i}`}
            variants={wordVariants}
            className={`inline-block mr-[0.28em] last:mr-0 ${
              isHighlight ? highlightClassName : ""
            }`}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.span>
  );
}

export default KineticText;
