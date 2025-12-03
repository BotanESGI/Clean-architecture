import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({ 
  variant = "primary", 
  children, 
  isLoading = false,
  className = "",
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    primary: "bg-primary text-background hover:bg-primary/90 shadow-glow",
    secondary: "bg-white/5 border border-white/10 hover:bg-white/10"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Chargement..." : children}
    </button>
  );
}

