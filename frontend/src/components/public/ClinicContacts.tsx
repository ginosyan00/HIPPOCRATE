import React from 'react';
import { Card } from '../common/Card';
import { Clinic } from '../../types/api.types';

interface ClinicContactsProps {
  clinic: Clinic;
}

/**
 * ClinicContacts Component
 * Секция с контактной информацией клиники
 */
export const ClinicContacts: React.FC<ClinicContactsProps> = ({ clinic }) => {
  return (
    <section className="py-20 bg-gradient-to-b from-bg-white to-main-10/10 relative overflow-hidden">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-main-100/30 to-transparent"></div>
      
      <div className="container mx-auto px-8">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-main-100 font-semibold text-sm uppercase tracking-wider">Связь</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-100 mb-4 leading-tight">
            Контакты
          </h2>
          <p className="text-lg text-text-50 max-w-2xl mx-auto">
            Свяжитесь с нами удобным для вас способом
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Address */}
          <Card 
            padding="lg" 
            className="bg-white/90 backdrop-blur-sm border border-stroke/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-main-100/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-main-100 to-main-100/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-100 mb-3 group-hover:text-main-100 transition-colors">Адрес</h3>
                <p className="text-text-50 font-medium text-base">{clinic.city}</p>
                {clinic.address && (
                  <p className="text-text-50 mt-2 text-base">{clinic.address}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Phone */}
          <Card 
            padding="lg" 
            className="bg-white/90 backdrop-blur-sm border border-stroke/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-main-100/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-main-100 to-main-100/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-100 mb-3 group-hover:text-main-100 transition-colors">Телефон</h3>
                <a 
                  href={`tel:${clinic.phone}`}
                  className="text-main-100 hover:text-main-100/80 font-bold text-lg transition-colors inline-block transform hover:scale-105"
                >
                  {clinic.phone}
                </a>
              </div>
            </div>
          </Card>

          {/* Email */}
          <Card 
            padding="lg" 
            className="bg-white/90 backdrop-blur-sm border border-stroke/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-main-100/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-main-100 to-main-100/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-100 mb-3 group-hover:text-main-100 transition-colors">Email</h3>
                <a 
                  href={`mailto:${clinic.email}`}
                  className="text-main-100 hover:text-main-100/80 font-bold text-base transition-colors break-all inline-block transform hover:scale-105"
                >
                  {clinic.email}
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};











