import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'solid',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-builty-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    solid: 'bg-builty-blue text-white hover:bg-builty-blue-light hover:shadow-lg',
    outline: 'border-2 border-builty-blue text-builty-blue hover:bg-builty-blue hover:text-white',
    ghost: 'text-builty-gray hover:bg-builty-gray-lighter',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
