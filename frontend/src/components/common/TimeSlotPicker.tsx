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
      <label className="block text-sm font-normal text-text-50 mb-3">
        Выберите время <span className="text-red-500">*</span>
      </label>
      
      {/* Визуальная сетка слотов - чистый минималистичный дизайн */}
      <div className="grid grid-cols-4 gap-2.5 max-h-80 overflow-y-auto">
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
                px-4 py-3 text-sm font-medium rounded-md
                transition-all duration-200
                border
                ${
                  isSelected
                    ? 'bg-main-100 text-white border-main-100 shadow-sm'
                    : isDisabled
                    ? slot.isBusy
                      ? 'bg-white text-red-600 border-red-300 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-text-100 border-green-300 hover:border-green-400 hover:bg-green-50'
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
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
};

