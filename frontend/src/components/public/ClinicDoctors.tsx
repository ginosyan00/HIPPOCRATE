import React from 'react';
import { Card, Button, Spinner } from '../common';
import { User } from '../../types/api.types';
import doctorIcon from '../../assets/icons/doctor.svg';

interface ClinicDoctorsProps {
  doctors: User[];
  isLoading: boolean;
  onBookAppointment: (doctorId: string) => void;
}

/**
 * ClinicDoctors Component
 * Секция с врачами клиники
 */
export const ClinicDoctors: React.FC<ClinicDoctorsProps> = ({ doctors, isLoading, onBookAppointment }) => {
  if (isLoading) {
    return (
      <section className="py-16 bg-bg-primary">
        <div className="container mx-auto px-8">
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <section className="py-16 bg-bg-primary">
        <div className="container mx-auto px-8">
          <h2 className="text-3xl font-semibold text-text-100 mb-8">Наши врачи</h2>
          <Card>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-main-10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <img src={doctorIcon} alt="Doctor" className="w-8 h-8" />
              </div>
              <p className="text-text-50 text-lg">Список врачей пока пуст</p>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-bg-primary/30 via-bg-primary to-bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-main-100/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-main-100/3 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-main-100 font-semibold text-sm uppercase tracking-wider">Команда</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-100 mb-4 leading-tight">
            Наши врачи
          </h2>
          <p className="text-lg text-text-50 max-w-2xl mx-auto">
            Выберите врача и запишитесь на приём
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor, index) => (
            <Card 
              key={doctor.id} 
              padding="lg" 
              className="bg-white/90 backdrop-blur-sm border border-stroke/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-center space-y-5">
                {/* Avatar */}
                <div className="relative mx-auto w-28 h-28">
                  <div className="absolute inset-0 bg-gradient-to-br from-main-100 to-main-100/60 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-28 h-28 rounded-full overflow-hidden mx-auto border-4 border-white shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    {doctor.avatar ? (
                      <img 
                        src={doctor.avatar} 
                        alt={doctor.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-main-100 to-main-100/80 flex items-center justify-center">
                        <img src={doctorIcon} alt="Doctor" className="w-14 h-14 opacity-90" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-text-100 group-hover:text-main-100 transition-colors">
                    {doctor.name}
                  </h3>
                  {doctor.specialization && (
                    <p className="text-main-100 font-semibold text-base mb-3">{doctor.specialization}</p>
                  )}
                  {doctor.experience && (
                    <div className="flex items-center justify-center gap-2 text-sm text-text-50">
                      <svg className="w-4 h-4 text-main-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Опыт работы: {doctor.experience} {doctor.experience === 1 ? 'год' : doctor.experience < 5 ? 'года' : 'лет'}
                    </div>
                  )}
                  {doctor.licenseNumber && (
                    <p className="text-xs text-text-10 mt-2">Лицензия: {doctor.licenseNumber}</p>
                  )}
                </div>

                {/* Book Button */}
                <Button
                  onClick={() => onBookAppointment(doctor.id)}
                  className="w-full bg-gradient-to-r from-main-100 to-main-100/90 text-white hover:from-main-100/90 hover:to-main-100 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl"
                  size="md"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Записаться
                  </span>
                </Button>
              </div>
            </Card>
          ))}
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
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
      `}</style>
    </section>
  );
};











