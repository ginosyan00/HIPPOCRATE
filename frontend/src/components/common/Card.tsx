import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * Card Component - Figma Design
 * Белые карточки с тонкими границами и закругленными углами
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title, 
  footer,
  padding = 'md',
  onClick,
  style
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  };

  return (
    <div 
      className={`bg-bg-white border border-stroke rounded-lg overflow-hidden ${className}`}
      onClick={onClick}
      style={style}
    >
      {title && (
        <div className="px-5 py-4 border-b border-stroke">
          <h3 className="text-lg font-medium text-text-50">{title}</h3>
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
      {footer && (
        <div className="px-5 py-4 bg-bg-primary border-t border-stroke">
          {footer}
        </div>
      )}
    </div>
  );
};


