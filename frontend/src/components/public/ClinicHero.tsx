import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Clinic } from '../../types/api.types';

interface ClinicHeroProps {
  clinic: Clinic;
  onBookAppointment: () => void;
}

/**
 * ClinicHero Component
 * Hero секция с логотипом, названием клиники и главным изображением
 */
export const ClinicHero: React.FC<ClinicHeroProps> = ({ clinic, onBookAppointment }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Сбрасываем состояние загрузки при смене изображения
  useEffect(() => {
    setIsImageLoaded(false);
    if (clinic.heroImage) {
      // Небольшая задержка для плавного запуска анимации
      const timer = setTimeout(() => {
        const img = new Image();
        img.src = clinic.heroImage!;
        img.onload = () => setIsImageLoaded(true);
        img.onerror = () => setIsImageLoaded(true); // Показываем даже при ошибке
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [clinic.heroImage]);

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {/* Background Image */}
      {clinic.heroImage ? (
        <div className="absolute inset-0 overflow-hidden">
          {/* Loading shimmer effect */}
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-slow z-10"></div>
          )}
          <div className={`absolute inset-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isImageLoaded 
              ? 'opacity-100 blur-0' 
              : 'opacity-0 blur-md'
          }`}>
            <img
              src={clinic.heroImage}
              alt={clinic.name}
              className={`w-[120%] h-[120%] object-cover absolute top-1/2 left-1/2 transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isImageLoaded 
                  ? 'animate-ken-burns' 
                  : 'scale-[0.9] -translate-x-1/2 -translate-y-1/2'
              }`}
              onLoad={() => {
                // Небольшая задержка для более плавного эффекта
                setTimeout(() => setIsImageLoaded(true), 150);
              }}
            />
          </div>
          {/* Dark Overlay for better text readability */}
          <div className={`absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 transition-opacity duration-[1000ms] ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}></div>
          {/* Additional gradient overlay for depth */}
          <div className={`absolute inset-0 bg-gradient-to-br from-main-100/20 via-transparent to-main-100/10 transition-opacity duration-[1000ms] ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-main-100 via-main-100/80 to-main-100/60">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}

      {/* Logo - Top Left Corner */}
      <div className="absolute top-8 left-8 z-20 animate-fade-in-up">
        {clinic.logo ? (
          <div className="transform hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-lg"></div>
              <img
                src={clinic.logo}
                alt={`${clinic.name} логотип`}
                className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain rounded-xl shadow-xl ring-2 ring-white/40 backdrop-blur-sm"
              />
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-xl ring-2 ring-white/40 transform hover:scale-105 transition-transform duration-300">
            <svg className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        <div className="container mx-auto text-center animate-fade-in-up">
          {/* Clinic Name */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl">
            {clinic.name}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-lg">
            Профессиональная стоматологическая клиника
          </p>

          {/* CTA Button */}
          <Button
            onClick={onBookAppointment}
            className="bg-white text-main-100 hover:bg-white/90 px-10 py-4 md:px-12 md:py-5 text-lg md:text-xl font-bold shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all duration-300 rounded-xl backdrop-blur-sm"
            size="lg"
          >
            <span className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Записаться на приём
            </span>
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        @keyframes shimmer-slow {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }
        .animate-shimmer-slow {
          animation: shimmer-slow 3s infinite;
        }
        @keyframes ken-burns {
          0% {
            transform: translate(-50%, -50%) scale(1) translate(-4%, -3%);
          }
          25% {
            transform: translate(-50%, -50%) scale(1.08) translate(3%, -2%);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.12) translate(2%, 3%);
          }
          75% {
            transform: translate(-50%, -50%) scale(1.06) translate(-3%, 2%);
          }
          100% {
            transform: translate(-50%, -50%) scale(1.1) translate(-2%, -3%);
          }
        }
        .animate-ken-burns {
          animation: ken-burns 25s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
    </section>
  );
};












