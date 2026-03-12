import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-bold text-builty-gray mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-builty-blue focus:border-builty-blue outline-none transition-all duration-200 font-medium bg-white ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
