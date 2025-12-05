import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

/**
 * Input Component - Figma Design
 * Поле ввода в стиле медицинского дашборда
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  ...props
}) => {
  const inputStyles = error
    ? 'border-red-500 focus:border-red-500'
    : 'border-stroke focus:border-main-100';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-normal text-text-10 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-10">
            {icon}
          </div>
        )}
        <input
          className={`
            block w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            border rounded-sm 
            bg-bg-white
            text-sm font-normal
            placeholder-text-10
            focus:outline-none 
            transition-smooth
            disabled:bg-bg-primary disabled:cursor-not-allowed
            ${inputStyles}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-xs text-text-10">{helperText}</p>}
    </div>
  );
};


