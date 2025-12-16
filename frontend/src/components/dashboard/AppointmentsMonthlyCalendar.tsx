import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card } from '../common';
import { Appointment } from '../../types/api.types';
import { formatAppointmentDateTime } from '../../utils/dateFormat';
import { DayAppointmentsModal } from './DayAppointmentsModal';
import { useAuthStore } from '../../store/useAuthStore';

// Import icons
import analyticsIcon from '../../assets/icons/analytics.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import checkIcon from '../../assets/icons/check.svg';
import clockIcon from '../../assets/icons/clock.svg';
import xIcon from '../../assets/icons/x.svg';

interface AppointmentsMonthlyCalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onDateClick?: (date: Date) => void;
  onViewChange?: (viewType: 'list' | 'monthly' | 'weekly') => void;
  currentView?: 'list' | 'monthly' | 'weekly';
  className?: string;
}

/**
 * AppointmentsMonthlyCalendar Component
 * Месячный календарь с отображением приёмов (стиль Bitrix)
 * С навигацией по месяцам через стрелки и выбор месяца/года
 */
export const AppointmentsMonthlyCalendar: React.FC<AppointmentsMonthlyCalendarProps> = ({
  appointments,
  onAppointmentClick,
  onDateClick,
  onViewChange,
  currentView = 'monthly',
  className = '',
}) => {
  const user = useAuthStore(state => state.user);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  // Состояние для модального окна с приёмами дня
  const [selectedDayForModal, setSelectedDayForModal] = useState<Date | null>(null);

  // Группируем приёмы по датам для быстрого доступа
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach(appointment => {
      const dateKey = format(parseISO(appointment.appointmentDate.toString()), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });
    return grouped;
  }, [appointments]);

  // Генерируем массив дней месяца
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Понедельник
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Дни недели
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Навигация по месяцам
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Выбор месяца
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
    setShowMonthPicker(false);
  };

  // Выбор года
  const currentYear = currentMonth.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handleYearSelect = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setShowYearPicker(false);
  };

  // Получаем приёмы для конкретной даты
  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return appointmentsByDate[dateKey] || [];
  };

  // Открытие модального окна с приёмами дня
  const openDayModal = (date: Date) => {
    setSelectedDayForModal(date);
  };

  // Закрытие модального окна
  const closeDayModal = () => {
    setSelectedDayForModal(null);
  };

  // Получаем приёмы для выбранного дня в модальном окне
  const getModalAppointments = (): Appointment[] => {
    if (!selectedDayForModal) return [];
    return getAppointmentsForDate(selectedDayForModal);
  };

  // Получаем цвет статуса
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-main-100';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  // Получаем иконку статуса
  const getStatusIcon = (status: string): string => {
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

  // Получаем метку статуса
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'confirmed':
        return 'Подтвержден';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Calendar Header - Навигация как в Bitrix */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          {/* Левая часть - стрелки навигации */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-bg-primary rounded-sm transition-smooth text-text-50 hover:text-main-100"
              type="button"
              title="Предыдущий месяц"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-normal text-text-50 hover:text-main-100 hover:bg-bg-primary rounded-sm transition-smooth"
              type="button"
            >
              Сегодня
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-bg-primary rounded-sm transition-smooth text-text-50 hover:text-main-100"
              type="button"
              title="Следующий месяц"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Центральная часть - переключение видов */}
          {onViewChange && (
            <div className="flex items-center gap-2 border border-stroke rounded-sm overflow-hidden">
              <button
                onClick={() => onViewChange('list')}
                className={`px-5 py-2.5 text-base font-medium transition-smooth min-w-[120px] flex items-center justify-center ${
                  currentView === 'list'
                    ? 'bg-main-100 text-white'
                    : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                }`}
                title="Таблица"
              >
                <span className="flex items-center gap-2">
                  <img src={analyticsIcon} alt="Таблица" className="w-4 h-4" />
                  Таблица
                </span>
              </button>
              <button
                onClick={() => onViewChange('monthly')}
                className={`px-5 py-2.5 text-base font-medium transition-smooth min-w-[120px] flex items-center justify-center ${
                  currentView === 'monthly'
                    ? 'bg-main-100 text-white'
                    : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                }`}
                title="Месячный календарь"
              >
                <span className="flex items-center gap-2">
                  <img src={calendarIcon} alt="Месяц" className="w-4 h-4" />
                  Месяц
                </span>
              </button>
              <button
                onClick={() => onViewChange('weekly')}
                className={`px-5 py-2.5 text-base font-medium transition-smooth min-w-[120px] flex items-center justify-center ${
                  currentView === 'weekly'
                    ? 'bg-main-100 text-white'
                    : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                }`}
                title="Недельный вид"
              >
                <span className="flex items-center gap-2">
                  <img src={calendarIcon} alt="Неделя" className="w-4 h-4" />
                  Неделя
                </span>
              </button>
            </div>
          )}

          {/* Правая часть - выбор месяца и года */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => {
                setShowMonthPicker(!showMonthPicker);
                setShowYearPicker(false);
              }}
              className="px-4 py-2 text-base font-semibold text-text-100 hover:bg-bg-primary rounded-sm transition-smooth"
              type="button"
            >
              {format(currentMonth, 'MMMM yyyy', { locale: ru })}
            </button>

            {/* Month Picker Dropdown */}
            {showMonthPicker && (
              <div className="absolute top-full left-0 mt-1 bg-bg-white border border-stroke rounded-sm shadow-lg z-50 w-48">
                <div className="grid grid-cols-3 gap-1 p-2">
                  {months.map((month, index) => (
                    <button
                      key={index}
                      onClick={() => handleMonthSelect(index)}
                      className={`px-3 py-2 text-sm font-normal rounded-sm transition-smooth ${
                        currentMonth.getMonth() === index
                          ? 'bg-main-100 text-white'
                          : 'text-text-100 hover:bg-bg-primary'
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Year Picker Dropdown */}
            {showYearPicker && (
              <div className="absolute top-full right-0 mt-1 bg-bg-white border border-stroke rounded-sm shadow-lg z-50 w-32 max-h-64 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={`w-full px-3 py-2 text-sm font-normal rounded-sm transition-smooth ${
                        currentYear === year
                          ? 'bg-main-100 text-white'
                          : 'text-text-100 hover:bg-bg-primary'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowYearPicker(!showYearPicker);
                setShowMonthPicker(false);
              }}
              className="p-2 hover:bg-bg-primary rounded-sm transition-smooth text-text-50 hover:text-main-100"
              type="button"
              title="Выбрать год"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-stroke rounded-sm overflow-hidden bg-bg-white">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 bg-bg-primary border-b border-stroke">
            {weekDays.map(day => (
              <div
                key={day}
                className="p-2 text-center text-xs font-semibold text-text-50 border-r border-stroke last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const dayAppointments = getAppointmentsForDate(day);
              const appointmentCount = dayAppointments.length;

              return (
                <div
                  key={day.toISOString()}
                  onClick={(e) => {
                    // Если клик был на ячейку (не на приём или кнопку), открываем модальное окно создания приёма
                    const target = e.target as HTMLElement;
                    // Проверяем, был ли клик на кнопку или на приём
                    const clickedButton = target.closest('button');
                    const clickedAppointment = target.closest('[data-appointment-card]');
                    
                    // Если клик был на пустую область ячейки (не на кнопку и не на приём) и это текущий месяц
                    if (!clickedButton && !clickedAppointment && isCurrentMonth) {
                      onDateClick?.(day);
                    }
                  }}
                  className={`
                    min-h-[100px] border-r border-b border-stroke
                    ${!isCurrentMonth ? 'bg-bg-primary text-text-10' : 'bg-bg-white text-text-100'}
                    ${index % 7 === 6 ? 'border-r-0' : ''}
                    transition-smooth hover:bg-main-10/30 cursor-pointer
                  `}
                >
                  <div className="p-2">
                    {/* Date Number */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateClick?.(day);
                      }}
                      className={`
                        w-7 h-7 flex items-center justify-center rounded-sm text-sm font-normal
                        transition-smooth
                        ${
                          isToday
                            ? 'bg-main-100 text-white font-semibold'
                            : isCurrentMonth
                            ? 'text-text-100 hover:bg-main-10'
                            : 'text-text-10'
                        }
                      `}
                      type="button"
                    >
                      {format(day, 'd')}
                    </button>

                    {/* Appointments */}
                    {isCurrentMonth && appointmentCount > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {dayAppointments.slice(0, 3).map((appointment) => {
                          // Для PATIENT роли показываем "Я" или имя пользователя, для других ролей - имя пациента
                          const isPatientView = user?.role === 'PATIENT';
                          const patientName = isPatientView
                            ? (user?.name || 'Я')
                            : (appointment.patient?.name || 'Пациент');
                          const patientInitial = patientName.charAt(0).toUpperCase();
                          const appointmentTime = format(parseISO(appointment.appointmentDate.toString()), 'HH:mm');
                          
                          return (
                            <button
                              key={appointment.id}
                              data-appointment-card
                              onClick={(e) => {
                                e.stopPropagation();
                                onAppointmentClick?.(appointment);
                              }}
                              className={`
                                w-full text-left px-2 py-1.5 rounded-sm text-xs
                                ${getStatusColor(appointment.status)} text-white
                                hover:opacity-90 hover:shadow-md transition-all duration-200
                                border-l-4 border-white/30
                              `}
                              title={`${patientName} - ${formatAppointmentDateTime(appointment.appointmentDate)}`}
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
                            </button>
                          );
                        })}
                        {appointmentCount > 3 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDayModal(day);
                            }}
                            className="w-full text-xs text-text-50 px-2 py-1.5 bg-bg-primary hover:bg-main-10 rounded-sm text-center font-medium transition-smooth cursor-pointer"
                            type="button"
                          >
                            +{appointmentCount - 3} ещё
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
            <span className="text-text-50">Ожидает</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-main-100"></div>
            <span className="text-text-50">Подтвержден</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-500"></div>
            <span className="text-text-50">Завершен</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gray-400"></div>
            <span className="text-text-50">Отменен</span>
          </div>
        </div>
      </Card>

      {/* Модальное окно с приёмами дня */}
      <DayAppointmentsModal
        isOpen={selectedDayForModal !== null}
        onClose={closeDayModal}
        date={selectedDayForModal}
        appointments={getModalAppointments()}
        onAppointmentClick={onAppointmentClick}
      />
    </div>
  );
};

