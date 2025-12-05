import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Modal Component - Figma Design
 * Модальное окно с минималистичным дизайном
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-text-100 bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={`relative bg-bg-white border border-stroke rounded-lg ${sizeStyles[size]} w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-xl`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-stroke">
              <h3 className="text-lg font-medium text-text-50">{title}</h3>
              <button
                onClick={onClose}
                className="text-text-10 hover:text-text-100 transition-smooth"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-5 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-5 py-4 bg-bg-primary border-t border-stroke flex justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


