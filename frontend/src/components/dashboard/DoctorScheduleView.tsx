import React, { useMemo } from 'react';
import { Card } from '../common/Card';
import { DoctorSchedule } from '../../types/api.types';
import clockIcon from '../../assets/icons/clock.svg';

interface DoctorScheduleViewProps {
  schedule?: DoctorSchedule[];
  isLoading?: boolean;
  doctorName?: string;
}

const DAYS = [
  { key: 0, label: 'Воскресенье', short: 'Вс' },
  { key: 1, label: 'Понедельник', short: 'Пн' },
  { key: 2, label: 'Вторник', short: 'Вт' },
  { key: 3, label: 'Среда', short: 'Ср' },
  { key: 4, label: 'Четверг', short: 'Чт' },
  { key: 5, label: 'Пятница', short: 'Пт' },
  { key: 6, label: 'Суббота', short: 'Сб' },
] as const;

/**
 * DoctorScheduleView Component
 * Компонент для отображения расписания врача (только просмотр)
 */
export const DoctorScheduleView: React.FC<DoctorScheduleViewProps> = ({
  schedule = [],
  isLoading = false,
  doctorName,
}) => {
  // Преобразуем массив расписания в объект для удобства работы
  const scheduleMap = useMemo(() => {
    return schedule.reduce((acc, item) => {
      acc[item.dayOfWeek] = item;
      return acc;
    }, {} as Record<number, DoctorSchedule>);
  }, [schedule]);

  // Проверяем, есть ли расписание
  const hasSchedule = schedule.length > 0 && schedule.some(s => s.isWorking);

  return (
    <Card 
      title={doctorName ? `Расписание врача: ${doctorName}` : 'Рабочее расписание'} 
      padding="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-text-10 text-sm">Загрузка расписания...</div>
        </div>
      ) : !hasSchedule ? (
        <div className="text-center py-8">
          <div className="text-text-10 text-sm mb-2">
            Расписание не установлено
          </div>
          <div className="text-text-10 text-xs">
            Врач еще не настроил свое рабочее расписание
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {DAYS.map(({ key, label, short }) => {
            const daySchedule = scheduleMap[key];
            const isWorking = daySchedule?.isWorking ?? false;
            const startTime = daySchedule?.startTime || null;
            const endTime = daySchedule?.endTime || null;

            return (
              <div
                key={key}
                className={`flex items-center gap-4 p-4 border rounded-sm transition-smooth ${
                  isWorking
                    ? 'border-stroke bg-bg-white hover:border-main-100'
                    : 'border-stroke/50 bg-bg-primary/30'
                }`}
              >
                {/* День недели */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <div className={`w-2 h-2 rounded-full ${isWorking ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <label className="text-sm font-medium text-text-100 cursor-default">
                    {label}
                  </label>
                </div>

                {/* Время работы */}
                {isWorking ? (
                  <div className="flex items-center gap-2 flex-1">
                    <img src={clockIcon} alt="Clock" className="w-4 h-4 text-text-50" />
                    <span className="text-sm text-text-100 font-medium">
                      {startTime || '09:00'} — {endTime || '18:00'}
                    </span>
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-text-10 italic">Выходной</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

