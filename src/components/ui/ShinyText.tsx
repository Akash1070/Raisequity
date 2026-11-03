import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = "",
}: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900 bg-[length:250%_100%] ${
        !disabled ? "animate-shimmer-text" : ""
      } ${className}`}
      style={{
        animationDuration: animationDuration,
      }}
    >
      {text}
    </span>
  );
}

