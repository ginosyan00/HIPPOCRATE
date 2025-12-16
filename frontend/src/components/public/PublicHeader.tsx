import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common';
import { PublicBookNowModal } from './PublicBookNowModal';
import hippocratesLogo from '../../assets/icons/hippocrates-logo.png';
import calendarIcon from '../../assets/icons/calendar.svg';

/**
 * PublicHeader Component
 * Единый header для всех публичных страниц
 * Включает логотип, кнопки навигации и модальное окно записи
 */
export const PublicHeader: React.FC = () => {
  const [isBookNowModalOpen, setIsBookNowModalOpen] = useState(false);

  return (
    <>
      <header className="bg-bg-white/80 backdrop-blur-md border-b border-stroke sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-8 py-5 flex justify-between items-center">
          <Link to="/" className="flex items-center group transition-all duration-300 hover:opacity-90">
            <div className="relative">
              <img 
                src={hippocratesLogo} 
                alt="Logo" 
                className="w-40 h-22 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg object-contain" 
              />
            </div>
          </Link>
          
          <div className="flex gap-2 md:gap-3 items-center">
            <Button 
              onClick={() => setIsBookNowModalOpen(true)}
              size="md"
              className="text-xs md:text-sm font-medium bg-main-100 text-white hover:bg-main-200 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap min-w-[140px] md:min-w-[160px] px-4 md:px-5 py-2 md:py-2.5"
            >
              <img src={calendarIcon} alt="Calendar" className="w-4 h-4 mr-1 md:mr-2 inline" />
              <span className="hidden sm:inline">Записаться сейчас</span>
              <span className="sm:hidden">Записаться</span>
            </Button>
            <Link to="/clinics" className="hidden md:block">
              <Button 
                variant="secondary" 
                size="md"
                className="text-xs md:text-sm font-normal min-w-[140px] md:min-w-[160px] px-4 md:px-5 py-2 md:py-2.5"
              >
                Каталог клиник
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                size="md"
                className="text-xs md:text-sm font-normal hover:text-white whitespace-nowrap min-w-[140px] md:min-w-[160px] px-4 md:px-5 py-2 md:py-2.5"
                style={{ 
                  backgroundColor: '#E6F7F6', 
                  color: '#00a79d'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00a79d';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#E6F7F6';
                  e.currentTarget.style.color = '#00a79d';
                }}
              >
                <span className="hidden sm:inline">Вход для клиник</span>
                <span className="sm:hidden">Вход</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <PublicBookNowModal
        isOpen={isBookNowModalOpen}
        onClose={() => setIsBookNowModalOpen(false)}
        onSuccess={() => {
          setIsBookNowModalOpen(false);
        }}
      />
    </>
  );
};




