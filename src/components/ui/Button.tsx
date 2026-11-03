import React from "react";
import { cn } from "../../lib/utils";

export const buttonVariants = ({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
} = {}) => {
  const baseClass =
    "inline-flex items-center justify-center rounded-full font-bold transition-all focus-visible:outline-none focus-[rgb(20,110,245)_solid_2px] disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary:
      "bg-black text-white hover:bg-[var(--color-clay-slushie)] hover:text-black border border-black hover:-rotate-2 hover:-translate-y-1 hover:shadow-[-7px_7px_0_rgba(0,0,0,1)]",
    secondary:
      "bg-[var(--color-clay-lemon)] text-black border border-[var(--color-clay-border)] clay-shadow hover:bg-[var(--color-clay-matcha)] hover:-rotate-2 hover:-translate-y-1 hover:shadow-[-7px_7px_0_rgba(0,0,0,1)]",
    outline:
      "border border-[var(--color-clay-border)] bg-transparent hover:bg-[var(--color-clay-pomegranate)] hover:text-white hover:border-[var(--color-clay-pomegranate)] text-black hover:-rotate-2 hover:-translate-y-1 hover:shadow-[-7px_7px_0_rgba(0,0,0,1)]",
    ghost: "hover:bg-[var(--color-clay-bg)] text-[var(--color-clay-text-muted)] hover:text-black",
  };

  const sizes = {
    sm: "h-9 px-4 text-[13px]",
    md: "h-11 px-6 py-2 text-[15px]",
    lg: "h-14 px-8 text-[16px]",
  };

  return cn(baseClass, variants[variant], sizes[size], className);
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
