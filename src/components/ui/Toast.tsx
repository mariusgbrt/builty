import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function Toast({ 
  isOpen, 
  onClose, 
  message, 
  type = 'info',
  duration = 3000 
}: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-900'
    },
    info: {
      icon: Info,
      bgColor: 'bg-builty-blue/5',
      borderColor: 'border-builty-blue/20',
      iconColor: 'text-builty-blue',
      textColor: 'text-builty-gray'
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`${bgColor} border-2 ${borderColor} rounded-2xl shadow-lg p-4 flex items-start gap-3 min-w-[320px] max-w-md animate-fade-in`}>
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="h-6 w-6" />
        </div>
        <p className={`flex-1 ${textColor} font-medium leading-relaxed`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-6 h-6 rounded-lg hover:bg-white/50 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
