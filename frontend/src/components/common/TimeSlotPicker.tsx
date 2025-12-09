import React from 'react';

interface TimeSlot {
  time: string;
  isBusy: boolean;
  isPast: boolean;
}

interface TimeSlotPickerProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  busySlots?: Array<{ start: string; end: string; appointmentId: string }>;
  appointmentDuration?: number; // Длительность приёма в минутах
  selectedDate?: Date | string | null; // Дата для проверки прошлых слотов
  className?: string;
  timeSlots?: string[]; // Кастомные временные слоты (если не указаны, генерируются автоматически)
  startHour?: number; // Начальный час (по умолчанию 8)
  endHour?: number; // Конечный час (по умолчанию 20)
  slotInterval?: number; // Интервал между слотами в минутах (по умолчанию 30)
}

/**
 * TimeSlotPicker Component
 * Визуальный выбор времени с цветовой индикацией доступных и занятых слотов
 * - Зеленый: доступные слоты
 * - Красный: занятые слоты
 * - Серый: прошедшие слоты
 */
export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedTime,
  onTimeSelect,
  busySlots = [],
  appointmentDuration = 30,
  selectedDate,
  className = '',
  timeSlots,
  startHour = 8,
  endHour = 20,
  slotInterval = 30,
}) => {
  // Генерируем временные слоты, если не переданы
  const generateTimeSlots = (): string[] => {
    if (timeSlots) return timeSlots;
    
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();

  // Проверяем, занят ли временной слот
  const isTimeSlotBusy = (time: string): boolean => {
    if (!selectedDate || busySlots.length === 0) return false;

    let dateStr: string;
    if (selectedDate instanceof Date) {
      dateStr = selectedDate.toISOString().split('T')[0];
    } else if (typeof selectedDate === 'string') {
      dateStr = selectedDate.split('T')[0];
    } else {
      return false;
    }

    const slotDateTime = new Date(`${dateStr}T${time}:00`);
    const slotEndTime = new Date(slotDateTime.getTime() + appointmentDuration * 60000);

    return busySlots.some(busySlot => {
      const busyStart = new Date(busySlot.start);
      const busyEnd = new Date(busySlot.end);

      // Проверяем пересечение интервалов
      return slotDateTime < busyEnd && slotEndTime > busyStart;
    });
  };

  // Проверяем, является ли слот прошедшим
  const isTimeSlotPast = (time: string): boolean => {
    if (!selectedDate) return false;

    let dateStr: string;
    if (selectedDate instanceof Date) {
      dateStr = selectedDate.toISOString().split('T')[0];
    } else if (typeof selectedDate === 'string') {
      dateStr = selectedDate.split('T')[0];
    } else {
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    if (dateStr !== today) return false;

    const slotDateTime = new Date(`${dateStr}T${time}:00`);
    return slotDateTime <= new Date();
  };

  // Подготовка данных для каждого слота
  const slots: TimeSlot[] = allTimeSlots.map(time => ({
    time,
    isBusy: isTimeSlotBusy(time),
    isPast: isTimeSlotPast(time),
  }));

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.isBusy && !slot.isPast) {
      onTimeSelect(slot.time);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-normal text-text-10 mb-2">
        Выберите время <span className="text-red-500">*</span>
      </label>
      
      {/* Визуальная сетка слотов */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-3 border border-stroke rounded-lg bg-bg-white">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isDisabled = slot.isBusy || slot.isPast;

          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => handleSlotClick(slot)}
              disabled={isDisabled}
              className={`
                px-3 py-2.5 text-sm font-medium rounded-lg
                transition-all duration-200
                border-2
                ${
                  isSelected
                    ? 'bg-main-100 text-white border-main-100 shadow-lg scale-105'
                    : isDisabled
                    ? slot.isBusy
                      ? 'bg-red-50 text-red-600 border-red-200 cursor-not-allowed opacity-75'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 hover:shadow-md hover:scale-105'
                }
                focus:outline-none focus:ring-2 focus:ring-main-100 focus:ring-offset-1
              `}
              title={
                isSelected
                  ? 'Выбранное время'
                  : slot.isBusy
                  ? 'Это время занято'
                  : slot.isPast
                  ? 'Это время в прошлом'
                  : 'Доступно для записи'
              }
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold">{slot.time}</span>
                {slot.isBusy && (
                  <span className="text-xs">🚫</span>
                )}
                {!slot.isBusy && !slot.isPast && (
                  <span className="text-xs">✓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Легенда */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-10 pt-2 border-t border-stroke">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-200"></div>
          <span>Доступно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-50 border-2 border-red-200"></div>
          <span>Занято</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-200"></div>
          <span>Прошедшее</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-main-100 border-2 border-main-100"></div>
          <span>Выбрано</span>
        </div>
      </div>

      {/* Информация о занятых слотах */}
      {busySlots.length > 0 && (
        <p className="text-xs text-text-10 mt-1">
          Занятые слоты отмечены красным цветом и недоступны для выбора
        </p>
      )}
    </div>
  );
};

