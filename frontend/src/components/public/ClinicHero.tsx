import React from 'react';
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
  return (
    <section className="relative bg-gradient-to-br from-main-10/30 via-bg-white via-50% to-main-10/20 py-20 md:py-28 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-main-100/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-main-100/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Logo and Clinic Name */}
          <div className="flex-shrink-0 text-center lg:text-left animate-fade-in-up">
            {clinic.logo ? (
              <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-main-100/20 rounded-2xl blur-xl"></div>
                  <img
                    src={clinic.logo}
                    alt={`${clinic.name} логотип`}
                    className="relative w-36 h-36 md:w-44 md:h-44 object-contain mx-auto lg:mx-0 rounded-2xl shadow-2xl ring-4 ring-white/50"
                  />
                </div>
              </div>
            ) : (
              <div className="w-36 h-36 md:w-44 md:h-44 bg-gradient-to-br from-main-100 to-main-100/80 rounded-2xl mx-auto lg:mx-0 mb-8 flex items-center justify-center shadow-2xl ring-4 ring-white/50 transform hover:scale-105 transition-transform duration-300">
                <svg className="w-20 h-20 md:w-24 md:h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-text-100 mb-6 leading-tight bg-gradient-to-r from-text-100 to-text-50 bg-clip-text text-transparent">
              {clinic.name}
            </h1>
            <p className="text-xl md:text-2xl text-text-50 mb-8 max-w-2xl leading-relaxed font-light">
              Профессиональная стоматологическая клиника
            </p>
            <Button
              onClick={onBookAppointment}
              className="bg-gradient-to-r from-main-100 to-main-100/90 text-white hover:from-main-100/90 hover:to-main-100 px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-main-100/30 hover:scale-105 transition-all duration-300 rounded-xl"
              size="lg"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Записаться на приём
              </span>
            </Button>
          </div>

          {/* Hero Image */}
          {clinic.heroImage && (
            <div className="flex-1 w-full lg:w-auto animate-fade-in-right">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>
                <img
                  src={clinic.heroImage}
                  alt={clinic.name}
                  className="w-full h-[450px] md:h-[550px] lg:h-[650px] object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-main-100/10 to-transparent z-10"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out 0.2s both;
        }
      `}</style>
    </section>
  );
};

