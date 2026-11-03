import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 cursor-pointer select-none border ${
        isDark
          ? 'bg-[#171717] hover:bg-[#262626] text-white border-[#333333] shadow-sm'
          : 'bg-white hover:bg-[#FAFAFA] text-[#171717] border-slate-200 shadow-sm'
      } ${className}`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun size={15} className="text-amber-400 transition-transform rotate-0" />
        ) : (
          <Moon size={15} className="text-slate-700 transition-transform rotate-0" />
        )}
      </div>
      {showLabel && (
        <span className="text-[11px] uppercase tracking-wider font-semibold">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;

