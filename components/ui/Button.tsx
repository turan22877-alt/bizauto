
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bugatti-gradient text-white shadow-xl shadow-blue-900/40 hover:shadow-blue-600/40",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-900/40",
    ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] rounded-xl",
    md: "px-6 py-3.5 text-xs rounded-2xl",
    lg: "px-8 py-5 text-sm rounded-[1.5rem]"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
};

export default Button;
