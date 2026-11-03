import React from 'react';
import logoImg from '../../assets/logo.png';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "w-8 h-8", size }: LogoProps) {
  return (
    <img 
      src={logoImg || "/logo.png?v=brand_r_v1"} 
      alt="Raisequity Logo" 
      className={`object-contain rounded-lg shrink-0 ${className}`} 
      style={size ? { width: size, height: size } : undefined}
      loading="eager"
    />
  );
}

export default Logo;
