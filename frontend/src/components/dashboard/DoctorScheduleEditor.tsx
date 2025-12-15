import React, { useState, useEffect, useMemo, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { DoctorSchedule } from '../../types/api.types';

interface DoctorScheduleEditorProps {
  schedule?: DoctorSchedule[];
  onUpdate: (schedule: Array<{
    dayOfWeek: number;
    startTime: string | null;
    endTime: string | null;
    isWorking: boolean;
  }>) => Promise<void>;
  isLoading?: boolean;
  hideSubmitButton?: boolean; // Скрыть кнопку "Сохранить расписание"
  hideCopyButton?: boolean; // Скрыть кнопку "Копировать"
}

export interface DoctorScheduleEditorRef {
  save: () => Promise<void>;
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
 * DoctorScheduleEditor Component
 * Компонент для редактирования расписания врача
 */
export const DoctorScheduleEditor = forwardRef<DoctorScheduleEditorRef, DoctorScheduleEditorProps>(({
  schedule = [],
  onUpdate,
  isLoading = false,
  hideSubmitButton = false,
  hideCopyButton = false,
}, ref) => {
  // Преобразуем массив расписания в объект для удобства работы (мемоизируем)
  const scheduleMap = useMemo(() => {
    return schedule.reduce((acc, item) => {
      acc[item.dayOfWeek] = item;
      return acc;
    }, {} as Record<number, DoctorSchedule>);
  }, [schedule]);

  // Функция для создания состояния из schedule
  const createStateFromSchedule = useMemo(() => {
    const state: Record<number, {
      dayOfWeek: number;
      startTime: string | null;
      endTime: string | null;
      isWorking: boolean;
    }> = {};

    DAYS.forEach(({ key }) => {
      const existing = scheduleMap[key];
      if (existing) {
        state[key] = {
          dayOfWeek: key,
          startTime: existing.isWorking ? existing.startTime : null,
          endTime: existing.isWorking ? existing.endTime : null,
          isWorking: existing.isWorking,
        };
      } else {
        // Дефолтные значения
        state[key] = {
          dayOfWeek: key,
          startTime: key === 0 || key === 6 ? null : '09:00', // Выходной для воскресенья и субботы
          endTime: key === 0 || key === 6 ? null : '18:00',
          isWorking: key !== 0 && key !== 6, // Работаем все дни кроме воскресенья
        };
      }
    });

    return state;
  }, [scheduleMap]);

  // Инициализируем состояние для всех дней недели
  const [scheduleState, setScheduleState] = useState<Record<number, {
    dayOfWeek: number;
    startTime: string | null;
    endTime: string | null;
    isWorking: boolean;
  }>>(createStateFromSchedule);

  // Используем useRef для отслеживания предыдущего schedule
  const prevScheduleRef = useRef<string>('');

  // Обновляем состояние при изменении пропсов (только если schedule действительно изменился)
  useEffect(() => {
    // Создаем строковое представление текущего schedule для сравнения
    const scheduleKey = JSON.stringify(schedule.map(s => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      isWorking: s.isWorking,
    })).sort((a, b) => a.dayOfWeek - b.dayOfWeek));

    // Обновляем только если schedule действительно изменился
    if (scheduleKey !== prevScheduleRef.current) {
      prevScheduleRef.current = scheduleKey;

      const newState: Record<number, {
        dayOfWeek: number;
        startTime: string | null;
        endTime: string | null;
        isWorking: boolean;
      }> = {};

      DAYS.forEach(({ key }) => {
        const existing = scheduleMap[key];
        if (existing) {
          newState[key] = {
            dayOfWeek: key,
            startTime: existing.isWorking ? existing.startTime : null,
            endTime: existing.isWorking ? existing.endTime : null,
            isWorking: existing.isWorking,
          };
        } else {
          newState[key] = {
            dayOfWeek: key,
            startTime: key === 0 || key === 6 ? null : '09:00',
            endTime: key === 0 || key === 6 ? null : '18:00',
            isWorking: key !== 0 && key !== 6,
          };
        }
      });

      setScheduleState(newState);
    }
  }, [schedule, scheduleMap]);

  const handleDayToggle = (dayOfWeek: number) => {
    setScheduleState(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        isWorking: !prev[dayOfWeek].isWorking,
        startTime: !prev[dayOfWeek].isWorking ? '09:00' : null,
        endTime: !prev[dayOfWeek].isWorking ? '18:00' : null,
      },
    }));
  };

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setScheduleState(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }));
  };

  const handleCopyDay = (sourceDay: number, targetDay: number) => {
    setScheduleState(prev => ({
      ...prev,
      [targetDay]: { ...prev[sourceDay], dayOfWeek: targetDay },
    }));
  };

  const handleApplyToAll = (dayOfWeek: number) => {
    const daySchedule = scheduleState[dayOfWeek];
    const newState: typeof scheduleState = {};

    DAYS.forEach(({ key }) => {
      newState[key] = {
        ...daySchedule,
        dayOfWeek: key,
      };
    });

    setScheduleState(newState);
  };

  const saveSchedule = useCallback(async () => {
    // Преобразуем объект обратно в массив
    const scheduleArray = Object.values(scheduleState).map(day => ({
      dayOfWeek: day.dayOfWeek,
      startTime: day.isWorking ? day.startTime : null,
      endTime: day.isWorking ? day.endTime : null,
      isWorking: day.isWorking,
    }));

    await onUpdate(scheduleArray);
  }, [scheduleState, onUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSchedule();
  };

  // Expose save function to parent via ref
  useImperativeHandle(ref, () => ({
    save: saveSchedule,
  }), [saveSchedule]);

  return (
    <Card title="Мое рабочее расписание" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {DAYS.map(({ key, label, short }) => {
            const daySchedule = scheduleState[key];
            return (
              <div
                key={key}
                className="flex items-center gap-4 p-4 border border-stroke rounded-sm bg-bg-white hover:border-main-100 transition-smooth"
              >
                {/* Checkbox для открыто/закрыто */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <input
                    type="checkbox"
                    id={`day-${key}`}
                    checked={daySchedule.isWorking}
                    onChange={() => handleDayToggle(key)}
                    className="w-4 h-4 text-main-100 border-stroke rounded focus:ring-main-100 focus:ring-2"
                  />
                  <label htmlFor={`day-${key}`} className="text-sm font-medium text-text-100 cursor-pointer">
                    {label}
                  </label>
                </div>

                {/* Время работы */}
                {daySchedule.isWorking ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={daySchedule.startTime || ''}
                      onChange={e => handleTimeChange(key, 'startTime', e.target.value)}
                      className="px-3 py-2 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 focus:outline-none focus:border-main-100 transition-smooth"
                      required
                    />
                    <span className="text-text-50">—</span>
                    <input
                      type="time"
                      value={daySchedule.endTime || ''}
                      onChange={e => handleTimeChange(key, 'endTime', e.target.value)}
                      className="px-3 py-2 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 focus:outline-none focus:border-main-100 transition-smooth"
                      required
                    />
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-text-10">Выходной</div>
                )}

                {/* Кнопки действий */}
                {daySchedule.isWorking && (
                  <div className="flex gap-2">
                    {!hideCopyButton && (
                      <button
                        type="button"
                        onClick={() => handleCopyDay(key, key === 1 ? 0 : 1)}
                        className="text-xs text-main-100 hover:text-main-100/80 transition-smooth"
                        title="Копировать на другой день"
                      >
                        Копировать
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleApplyToAll(key)}
                      className="text-xs text-main-100 hover:text-main-100/80 transition-smooth"
                      title="Применить ко всем дням"
                    >
                      Применить ко всем
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!hideSubmitButton && (
          <div className="flex justify-end pt-4 border-t border-stroke">
            <Button type="submit" variant="primary" size="md" isLoading={isLoading} disabled={isLoading}>
              Сохранить расписание
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
});

