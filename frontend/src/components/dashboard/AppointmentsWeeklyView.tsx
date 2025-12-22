import React, { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card } from '../common';
import { Appointment } from '../../types/api.types';
import { formatAppointmentTime, safeParseDate } from '../../utils/dateFormat';
import { useAuthStore } from '../../store/useAuthStore';
import { useTreatmentCategories } from '../../hooks/useTreatmentCategories';
import { getCategoryColor, getStatusColor } from '../../utils/appointmentColors';

// Import icons
import analyticsIcon from '../../assets/icons/analytics.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import doctorIcon from '../../assets/icons/doctor.svg';
import checkIcon from '../../assets/icons/check.svg';
import clockIcon from '../../assets/icons/clock.svg';
import xIcon from '../../assets/icons/x.svg';

interface AppointmentsWeeklyViewProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  onViewChange?: (viewType: 'list' | 'monthly' | 'weekly') => void;
  currentView?: 'list' | 'monthly' | 'weekly';
  className?: string;
}

/**
 * AppointmentsWeeklyView Component - Kanban Style
 * Недельный вид в стиле Kanban-доски
 * Показывает приёмы по дням недели в виде карточек
 */
export const AppointmentsWeeklyView: React.FC<AppointmentsWeeklyViewProps> = ({
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  onViewChange,
  currentView = 'weekly',
  className = '',
}) => {
  const user = useAuthStore(state => state.user);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Загружаем категории для получения цветов
  const { data: categories = [] } = useTreatmentCategories();

  // Генерируем дни недели
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Понедельник
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Группируем приёмы по дням недели
  const appointmentsByDay = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    
    appointments.forEach(appointment => {
      try {
        const appointmentDate = safeParseDate(appointment.appointmentDate);
        const dateKey = format(appointmentDate, 'yyyy-MM-dd');
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(appointment);
      } catch (error) {
        console.error('❌ [WEEKLY VIEW] Ошибка парсинга даты приёма:', error, appointment);
      }
    });
    
    // Сортируем приёмы по времени в каждом дне
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        try {
          const dateA = safeParseDate(a.appointmentDate);
          const dateB = safeParseDate(b.appointmentDate);
          return dateA.getTime() - dateB.getTime();
        } catch (error) {
          console.error('❌ [WEEKLY VIEW] Ошибка сортировки приёмов:', error);
          return 0;
        }
      });
    });
    
    return grouped;
  }, [appointments]);

  // Получаем приёмы для конкретного дня
  const getAppointmentsForDay = (day: Date): Appointment[] => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return appointmentsByDay[dateKey] || [];
  };

  // Навигация по неделям
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // Получаем цвет заголовка колонки для дня недели
  const getDayHeaderColor = (dayIndex: number, isToday: boolean): string => {
    // Все дни с цветом #00a79d
    return 'bg-[#00a79d] text-white';
  };

  // Получаем цвет статуса для бейджа
  const getStatusBadgeColor = (status: string): string => {
    // Все статусы с цветом #00a79d
    return 'bg-[#00a79d]/10 text-[#00a79d] border-[#00a79d]/20';
  };

  // Получаем иконку статуса
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return clockIcon;
      case 'confirmed':
        return checkIcon;
      case 'completed':
        return checkIcon;
      case 'cancelled':
        return xIcon;
      default:
        return clockIcon;
    }
  };

  // Получаем текст статуса
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'confirmed':
        return 'Подтверждено';
      case 'completed':
        return 'Завершено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Week Header - Навигация */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          {/* Левая часть - стрелки навигации */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-bg-primary rounded-sm transition-smooth text-text-50 hover:text-[#00a79d]"
              type="button"
              title="Предыдущая неделя"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-normal text-text-50 hover:text-[#00a79d] hover:bg-bg-primary rounded-sm transition-smooth"
              type="button"
            >
              Сегодня
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-bg-primary rounded-sm transition-smooth text-text-50 hover:text-[#00a79d]"
              type="button"
              title="Следующая неделя"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Центральная часть - переключение видов */}
          {onViewChange && (
            <div 
              className="flex items-center border border-stroke rounded-sm overflow-hidden"
              style={{
                height: '44px',
                width: '420px',
                position: 'relative',
                boxSizing: 'border-box',
                gap: '0'
              }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewChange('weekly');
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`group text-base font-medium transition-colors duration-150 flex-shrink-0 relative ${
                  currentView === 'weekly'
                    ? 'bg-[#00a79d] text-white'
                    : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                }`}
                style={{
                  width: '140px',
                  height: '44px',
                  padding: '0',
                  border: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1
                }}
                title="Недельный вид"
                type="button"
              >
                <span className="flex items-center gap-2" style={{ pointerEvents: 'none' }}>
                  <img 
                    src={calendarIcon} 
                    alt="Неделя" 
                    className={`w-4 h-4 flex-shrink-0 transition-smooth ${
                      currentView === 'weekly'
                        ? 'brightness-0 invert'
                        : 'group-hover:brightness-0 group-hover:invert'
                    }`} 
                    style={{ display: 'block' }}
                  />
                  <span style={{ whiteSpace: 'nowrap' }}>Неделя</span>
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewChange('monthly');
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`group text-base font-medium transition-colors duration-150 flex-shrink-0 relative ${
                  currentView === 'monthly'
                    ? 'bg-[#00a79d] text-white'
                    : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                }`}
                style={{
                  width: '140px',
                  height: '44px',
                  padding: '0',
                  border: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1
                }}
                title="Месячный календарь"
                type="button"
              >
                <span className="flex items-center gap-2" style={{ pointerEvents: 'none' }}>
                  <img 
                    src={calendarIcon} 
                    alt="Месяц" 
                    className={`w-4 h-4 flex-shrink-0 transition-smooth ${
                      currentView === 'monthly'
                        ? 'brightness-0 invert'
                        : 'group-hover:brightness-0 group-hover:invert'
                    }`} 
                    style={{ display: 'block' }}
                  />
                  <span style={{ whiteSpace: 'nowrap' }}>Месяц</span>
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewChange('list');
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`group text-base font-medium transition-colors duration-150 flex-shrink-0 relative ${
                  currentView === 'list'
                    ? 'bg-[#00a79d] text-white'
                    : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                }`}
                style={{
                  width: '140px',
                  height: '44px',
                  padding: '0',
                  border: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1
                }}
                title="Таблица"
                type="button"
              >
                <span className="flex items-center gap-2" style={{ pointerEvents: 'none' }}>
                  <img 
                    src={analyticsIcon} 
                    alt="Таблица" 
                    className={`w-4 h-4 flex-shrink-0 transition-smooth ${
                      currentView === 'list'
                        ? 'brightness-0 invert'
                        : 'group-hover:brightness-0 group-hover:invert'
                    }`} 
                    style={{ display: 'block' }}
                  />
                  <span style={{ whiteSpace: 'nowrap' }}>Таблица</span>
                </span>
              </button>
            </div>
          )}

          {/* Правая часть - период недели */}
          <div className="flex items-center">
            <h3 className="text-base font-semibold text-text-100">
              {format(weekStart, 'd MMM', { locale: ru })} - {format(weekEnd, 'd MMM yyyy', { locale: ru })}
            </h3>
          </div>
        </div>
      </Card>

      {/* Kanban Board - Колонки по дням недели */}
      <div className="w-full">
        <div className="flex gap-1.5 pb-4">
          {weekDays.map((day, dayIndex) => {
            const isToday = isSameDay(day, new Date());
            const dayAppointments = getAppointmentsForDay(day);
            const dayNameFull = format(day, 'EEEE', { locale: ru }); // Полное название дня
            const dayName = dayNameFull.charAt(0).toUpperCase() + dayNameFull.slice(1); // С заглавной буквы
            const dayDate = format(day, 'd MMM', { locale: ru }); // Дата
            const dayCount = dayAppointments.length;

            return (
              <div
                key={day.toISOString()}
                className={`flex-1 min-w-0 flex flex-col ${isToday ? 'ring-2 ring-[#00a79d] ring-offset-2' : ''}`}
              >
                {/* Заголовок колонки */}
                <div className={`${getDayHeaderColor(dayIndex, isToday)} p-2 rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold">{dayName}</div>
                      <div className="text-[10px] opacity-90 mt-0.5">{dayDate}</div>
                    </div>
                    <div className="text-xs font-bold">({dayCount})</div>
                  </div>
                </div>

                {/* Тело колонки с карточками */}
                <div className="bg-bg-primary border-x border-b border-stroke rounded-b-lg p-2 min-h-[500px] max-h-[700px] overflow-y-auto">
                  {dayAppointments.length === 0 ? (
                    <div className="text-center py-6 text-text-10 text-xs">
                      Нет приёмов
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {dayAppointments.map((appointment) => {
                        const appointmentDate = safeParseDate(appointment.appointmentDate);
                        const appointmentTime = formatAppointmentTime(appointmentDate);

                        // Получаем цвета для карточки
                        const categoryColor = getCategoryColor(appointment, categories);
                        const statusColorValue = getStatusColor(appointment.status);
                        
                        // Для PATIENT роли показываем "Я" или имя пользователя, для других ролей - имя пациента
                        const isPatientView = user?.role === 'PATIENT';
                        const patientName = isPatientView
                          ? (user?.name || 'Я')
                          : (appointment.patient?.name || 'Пациент');
                        const patientInitial = patientName.charAt(0).toUpperCase();
                        
                        return (
                          <div
                            key={appointment.id}
                            className="w-full text-left px-2 py-1.5 rounded-sm text-xs text-white hover:opacity-90 hover:shadow-md transition-all duration-200 cursor-pointer"
                            style={{
                              backgroundColor: categoryColor,
                              borderLeft: `4px solid ${statusColorValue}`,
                            }}
                            onClick={() => onAppointmentClick?.(appointment)}
                          >
                            <div className="flex items-center gap-2">
                              {/* Avatar Circle */}
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white border border-white/30">
                                {patientInitial}
                              </div>
                              {/* Name and Time */}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate text-white">
                                  {patientName}
                                </div>
                                <div className="text-[10px] text-white/80 font-medium mt-0.5">
                                  {appointmentTime}
                                </div>
                                {/* Статус */}
                                <div className="mt-1 flex items-center gap-1">
                                  <img src={getStatusIcon(appointment.status)} alt={getStatusLabel(appointment.status)} className="w-2.5 h-2.5 opacity-90" />
                                  <span className="text-[9px] text-white/90 font-medium">
                                    {getStatusLabel(appointment.status)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <Card padding="sm">
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#00a79d]"></div>
            <span className="text-text-50">Ожидает</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#00a79d]"></div>
            <span className="text-text-50">Подтвержден</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#00a79d]"></div>
            <span className="text-text-50">Завершен</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#00a79d]"></div>
            <span className="text-text-50">Отменен</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

