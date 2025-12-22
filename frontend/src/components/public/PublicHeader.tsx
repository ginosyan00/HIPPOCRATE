import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../common';
import { PublicBookNowModal } from './PublicBookNowModal';
import { HippocratesClockCompact } from './HippocratesClockCompact';
import hippocratesLogo from '../../assets/icons/hippocrates-logo.png';
import calendarIcon from '../../assets/icons/calendar.svg';
import userIcon from '../../assets/icons/user.svg';

/**
 * PublicHeader Component
 * Единый header для всех публичных страниц
 * Включает логотип, навигацию, иконку входа и кнопку записи
 */
export const PublicHeader: React.FC = () => {
  const [isBookNowModalOpen, setIsBookNowModalOpen] = useState(false);
  const location = useLocation();

  // Определяем активную страницу для подсветки навигации
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="bg-bg-white/80 backdrop-blur-md border-b border-stroke sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex justify-between items-center">
            {/* Логотип слева */}
            <Link to="/" className="flex items-center group transition-all duration-300 hover:opacity-90 flex-shrink-0">
              <div className="relative">
                <img 
                  src={hippocratesLogo} 
                  alt="Hippocrates Logo" 
                  className="w-32 sm:w-36 lg:w-40 h-auto transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg object-contain" 
                />
              </div>
            </Link>
            
            {/* Навигация в центре */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 mx-4 lg:mx-8">
              <Link 
                to="/"
                className={`px-4 lg:px-6 py-2 rounded-sm text-sm lg:text-base font-medium transition-all duration-300 ${
                  isActive('/') 
                    ? 'text-main-100 bg-main-10' 
                    : 'text-text-100 hover:text-main-100 hover:bg-bg-primary'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/clinics"
                className={`px-4 lg:px-6 py-2 rounded-sm text-sm lg:text-base font-medium transition-all duration-300 ${
                  isActive('/clinics') 
                    ? 'text-main-100 bg-main-10' 
                    : 'text-text-100 hover:text-main-100 hover:bg-bg-primary'
                }`}
              >
                Клиника
              </Link>
            </nav>

            {/* Правая часть: часы, иконка входа и кнопка Book */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Компактные часы */}
              <div className="hidden md:block">
                <HippocratesClockCompact />
              </div>

              {/* Иконка Login/Register с текстом */}
              <Link 
                to="/login"
                className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-sm bg-bg-primary hover:bg-main-10 text-text-100 hover:text-main-100 transition-all duration-300 border border-stroke hover:border-main-100 group"
                title="Вход / Регистрация"
              >
                <img 
                  src={userIcon} 
                  alt="User" 
                  className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:scale-110 flex-shrink-0" 
                />
                <span className="hidden sm:inline text-sm lg:text-base font-medium whitespace-nowrap">
                  Логин / Регистрация
                </span>
              </Link>

              {/* Крупная кнопка Book */}
              <Button 
                onClick={() => setIsBookNowModalOpen(true)}
                size="lg"
                className="bg-main-100 text-white hover:bg-main-200 font-semibold text-sm lg:text-base px-5 lg:px-8 py-2.5 lg:py-3 rounded-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 whitespace-nowrap min-w-[120px] lg:min-w-[160px]"
              >
                <img 
                  src={calendarIcon} 
                  alt="Calendar" 
                  className="w-5 h-5 lg:w-6 lg:h-6" 
                />
                <span>Book</span>
              </Button>
            </div>
          </div>

          {/* Мобильная навигация */}
          <nav className="md:hidden flex items-center justify-center gap-2 mt-3 pt-3 border-t border-stroke">
            <Link 
              to="/"
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all duration-300 ${
                isActive('/') 
                  ? 'text-main-100 bg-main-10' 
                  : 'text-text-100 hover:text-main-100 hover:bg-bg-primary'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/clinics"
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-all duration-300 ${
                isActive('/clinics') 
                  ? 'text-main-100 bg-main-10' 
                  : 'text-text-100 hover:text-main-100 hover:bg-bg-primary'
              }`}
            >
              Клиника
            </Link>
          </nav>
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













