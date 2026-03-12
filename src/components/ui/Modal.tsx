import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-builty-gray/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className={`relative bg-white rounded-3xl shadow-2xl border-2 border-gray-100 ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto animate-scale-in`}>
          <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
            <h2 className="text-2xl font-extrabold text-builty-gray">{title}</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-100 text-builty-gray-light hover:text-red-600 transition-all duration-200 flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-8 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
