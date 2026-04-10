import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-orange-600 hover:bg-orange-700 text-white shadow-sm",
    secondary: "bg-white hover:bg-stone-50 text-stone-700 border border-stone-200",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    ghost: "bg-transparent hover:bg-stone-100 text-stone-500 hover:text-stone-700"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-6 py-3 text-sm rounded-lg"
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