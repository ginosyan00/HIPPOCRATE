import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { WorkingHours, DaySchedule } from '../../types/api.types';

interface WorkingHoursEditorProps {
  workingHours?: WorkingHours;
  onUpdate: (workingHours: WorkingHours) => Promise<void>;
  isLoading?: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Понедельник' },
  { key: 'tuesday', label: 'Вторник' },
  { key: 'wednesday', label: 'Среда' },
  { key: 'thursday', label: 'Четверг' },
  { key: 'friday', label: 'Пятница' },
  { key: 'saturday', label: 'Суббота' },
  { key: 'sunday', label: 'Воскресенье' },
] as const;

/**
 * WorkingHoursEditor Component
 * Компонент для редактирования графика работы клиники
 */
export const WorkingHoursEditor: React.FC<WorkingHoursEditorProps> = ({
  workingHours,
  onUpdate,
  isLoading = false,
}) => {
  const [schedule, setSchedule] = useState<WorkingHours>(() => {
    if (workingHours) {
      return workingHours;
    }
    // Дефолтные значения
    return {
      monday: { isOpen: true, open: '09:00', close: '18:00' },
      tuesday: { isOpen: true, open: '09:00', close: '18:00' },
      wednesday: { isOpen: true, open: '09:00', close: '18:00' },
      thursday: { isOpen: true, open: '09:00', close: '18:00' },
      friday: { isOpen: true, open: '09:00', close: '18:00' },
      saturday: { isOpen: true, open: '10:00', close: '14:00' },
      sunday: { isOpen: false, open: null, close: null },
    };
  });

  useEffect(() => {
    if (workingHours) {
      setSchedule(workingHours);
    }
  }, [workingHours]);

  const handleDayToggle = (day: keyof WorkingHours) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
        open: !prev[day].isOpen ? '09:00' : null,
        close: !prev[day].isOpen ? '18:00' : null,
      },
    }));
  };

  const handleTimeChange = (day: keyof WorkingHours, field: 'open' | 'close', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleCopyDay = (sourceDay: keyof WorkingHours, targetDay: keyof WorkingHours) => {
    setSchedule(prev => ({
      ...prev,
      [targetDay]: { ...prev[sourceDay] },
    }));
  };

  const handleApplyToAll = (day: keyof WorkingHours) => {
    const daySchedule = schedule[day];
    const newSchedule: WorkingHours = { ...schedule };
    
    (Object.keys(newSchedule) as Array<keyof WorkingHours>).forEach(key => {
      newSchedule[key] = { ...daySchedule };
    });
    
    setSchedule(newSchedule);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(schedule);
  };

  return (
    <Card title="График работы" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {DAYS.map(({ key, label }) => {
            const daySchedule = schedule[key];
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
                    checked={daySchedule.isOpen}
                    onChange={() => handleDayToggle(key)}
                    className="w-4 h-4 text-main-100 border-stroke rounded focus:ring-main-100 focus:ring-2"
                  />
                  <label htmlFor={`day-${key}`} className="text-sm font-medium text-text-100 cursor-pointer">
                    {label}
                  </label>
                </div>

                {/* Время работы */}
                {daySchedule.isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={daySchedule.open || ''}
                      onChange={e => handleTimeChange(key, 'open', e.target.value)}
                      className="px-3 py-2 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 focus:outline-none focus:border-main-100 transition-smooth"
                      required
                    />
                    <span className="text-text-50">—</span>
                    <input
                      type="time"
                      value={daySchedule.close || ''}
                      onChange={e => handleTimeChange(key, 'close', e.target.value)}
                      className="px-3 py-2 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 focus:outline-none focus:border-main-100 transition-smooth"
                      required
                    />
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-text-10">Выходной</div>
                )}

                {/* Кнопки действий */}
                {daySchedule.isOpen && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyDay(key, key === 'monday' ? 'tuesday' : 'monday')}
                      className="text-xs text-main-100 hover:text-main-100/80 transition-smooth"
                      title="Копировать на другой день"
                    >
                      Копировать
                    </button>
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

        <div className="flex justify-end pt-4 border-t border-stroke">
          <Button type="submit" variant="primary" size="md" isLoading={isLoading} disabled={isLoading}>
            Сохранить график
          </Button>
        </div>
      </form>
    </Card>
  );
};

