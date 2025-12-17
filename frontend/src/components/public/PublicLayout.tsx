import React from 'react';
import { PublicHeader } from './PublicHeader';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * PublicLayout Component
 * Общий layout для всех публичных страниц
 * Включает единый header на всех страницах
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <PublicHeader />
      {children}
    </div>
  );
};





