import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border-2 border-gray-100 ${hover ? 'hover:border-builty-blue/30 hover:shadow-lg transition-all duration-200' : 'shadow-sm'} ${className}`}>
      {children}
    </div>
  );
}
