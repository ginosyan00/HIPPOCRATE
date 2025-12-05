import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Button Component - Figma Design
 * Flat-дизайн кнопок из медицинского дашборда
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'font-normal rounded-sm transition-smooth focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';

  const variantStyles = {
    primary: 'bg-main-10 text-main-100 hover:bg-main-100 hover:text-white',
    secondary: 'bg-bg-white border border-stroke text-text-100 hover:bg-bg-primary',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    success: 'bg-secondary-10 text-secondary-100 hover:bg-secondary-100 hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};


