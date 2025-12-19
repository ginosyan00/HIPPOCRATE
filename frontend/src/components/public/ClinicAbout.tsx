import React from 'react';
import { Card } from '../common/Card';
import { Clinic } from '../../types/api.types';

interface ClinicAboutProps {
  clinic: Clinic;
}

/**
 * ClinicAbout Component
 * Секция "О клинике" с описанием и графиком работы
 */
export const ClinicAbout: React.FC<ClinicAboutProps> = ({ clinic }) => {
  const workingHours = clinic.workingHours || {};

  const getDayName = (day: string): string => {
    const names: Record<string, string> = {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье',
    };
    return names[day] || day;
  };

  return (
    <section className="py-20 bg-gradient-to-b from-bg-white to-bg-primary/30 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-main-100/20 to-transparent"></div>
      
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* About Text */}
          <div className="animate-fade-in-left">
            <div className="inline-block mb-4">
              <span className="text-main-100 font-semibold text-sm uppercase tracking-wider">О нас</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-100 mb-8 leading-tight">
              О клинике
            </h2>
            {clinic.about ? (
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-text-50 leading-relaxed whitespace-pre-line">
                  {clinic.about}
                </p>
              </div>
            ) : (
              <p className="text-lg text-text-50 leading-relaxed">
                Мы предоставляем качественные стоматологические услуги с использованием современного оборудования и передовых технологий.
              </p>
            )}
          </div>

          {/* Working Hours */}
          <div className="animate-fade-in-right">
            <div className="inline-block mb-4">
              <span className="text-main-100 font-semibold text-sm uppercase tracking-wider">Расписание</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text-100 mb-8 leading-tight">
              График работы
            </h2>
            <Card padding="lg" className="bg-white/80 backdrop-blur-sm border border-stroke/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="space-y-4">
                {Object.entries(workingHours).length > 0 ? (
                  Object.entries(workingHours).map(([day, schedule]: [string, any]) => (
                    <div 
                      key={day} 
                      className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-main-10/30 transition-colors duration-200 border-b border-stroke/30 last:border-0"
                    >
                      <span className="text-text-50 font-semibold text-base">{getDayName(day)}:</span>
                      <span className="text-text-100 font-bold text-base">
                        {schedule.isOpen ? (
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            {schedule.open} - {schedule.close}
                          </span>
                        ) : (
                          <span className="text-text-10">Выходной</span>
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-text-50 text-center py-8">График работы не указан</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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
        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out;
        }
      `}</style>
    </section>
  );
};




