import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-builty-gray-lighter text-builty-gray border border-gray-200',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-orange-50 text-orange-700 border border-orange-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-builty-blue border border-builty-blue/20',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
