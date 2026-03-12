import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantColors = {
    danger: {
      icon: 'bg-red-100',
      iconColor: 'text-red-600',
      border: 'border-red-200'
    },
    warning: {
      icon: 'bg-orange-100',
      iconColor: 'text-orange-600',
      border: 'border-orange-200'
    },
    info: {
      icon: 'bg-builty-blue/10',
      iconColor: 'text-builty-blue',
      border: 'border-builty-blue/20'
    }
  };

  const colors = variantColors[variant];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-builty-gray/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-gray-100 max-w-md w-full animate-scale-in">
          {/* Header */}
          <div className={`border-b-2 ${colors.border} px-6 py-5 flex items-start justify-between`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
                <AlertTriangle className={`h-6 w-6 ${colors.iconColor}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-builty-gray">{title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-builty-gray-light hover:text-builty-gray transition-all duration-200 flex items-center justify-center ml-4"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 bg-gray-50 rounded-b-3xl flex items-center justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              size="md"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              variant={variant === 'info' ? 'primary' : 'danger'}
              size="md"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
