import React, { useState } from 'react';
import { Card, Button } from '../common';
import { AppointmentsTable } from './AppointmentsTable';
import { Appointment } from '../../types/api.types';
import { formatAppointmentDateTime } from '../../utils/dateFormat';
import { Pencil, Check, X } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';

interface AppointmentsListViewProps {
  appointments: Appointment[];
  viewMode: 'table' | 'cards';
  onStatusChange: (id: string, status: string) => void;
  onEditAmount?: (appointment: Appointment) => void;
  onUpdateAmount?: (appointmentId: string, amount: number) => Promise<void>;
  loadingAppointments: Record<string, string>;
  errorMessages: Record<string, string>;
  isFetching?: boolean;
  isTransitioning?: boolean;
}

/**
 * AppointmentsListView Component
 * Обертка для отображения приёмов в виде таблицы или карточек
 */
export const AppointmentsListView: React.FC<AppointmentsListViewProps> = ({
  appointments,
  viewMode,
  onStatusChange,
  onEditAmount,
  onUpdateAmount,
  loadingAppointments,
  errorMessages,
  isFetching = false,
  isTransitioning = false,
}) => {
  // Состояние для редактирования суммы в карточках
  const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
  const [editingAmountValue, setEditingAmountValue] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  
  // Состояние для управления открытым dropdown
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  /**
   * Начинает редактирование суммы
   */
  const handleStartEditAmount = (appointment: Appointment) => {
    setEditingAmountId(appointment.id);
    setEditingAmountValue(appointment.amount ? String(appointment.amount) : '');
    setAmountError('');
  };

  /**
   * Отменяет редактирование суммы
   */
  const handleCancelEditAmount = () => {
    setEditingAmountId(null);
    setEditingAmountValue('');
    setAmountError('');
  };

  /**
   * Сохраняет новую сумму
   */
  const handleSaveAmount = async (appointmentId: string) => {
    setAmountError('');
    
    // Валидация суммы
    const amountNum = parseFloat(editingAmountValue.replace(/\s/g, '').replace(',', '.'));
    if (isNaN(amountNum) || amountNum < 0) {
      setAmountError('Введите корректную сумму (положительное число)');
      return;
    }

    if (onUpdateAmount) {
      try {
        await onUpdateAmount(appointmentId, amountNum);
        setEditingAmountId(null);
        setEditingAmountValue('');
        setAmountError('');
      } catch (err: any) {
        setAmountError(err.message || 'Ошибка при обновлении суммы');
      }
    } else if (onEditAmount) {
      // Fallback к модальному окну, если onUpdateAmount не предоставлен
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        onEditAmount(appointment);
      }
    }
  };

  /**
   * Обработка изменения значения суммы
   */
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только цифры, точку, запятую и пробелы
    if (value === '' || /^[\d\s.,]+$/.test(value)) {
      setEditingAmountValue(value);
      setAmountError('');
    }
  };

  /**
   * Обработка нажатия Enter для сохранения
   */
  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, appointmentId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveAmount(appointmentId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditAmount();
    }
  };

  if (appointments.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-text-10 text-sm">
          Приёмы не найдены
        </div>
      </Card>
    );
  }

  if (viewMode === 'table') {
    return (
      <Card padding="md" className={`transition-opacity duration-500 ease-out will-change-opacity ${isFetching ? 'opacity-95' : 'opacity-100'}`}>
        <div className={isTransitioning ? 'opacity-0 transition-opacity duration-300 ease-out' : 'opacity-100 transition-opacity duration-500 ease-out'}>
          <AppointmentsTable
            appointments={appointments}
            onStatusChange={onStatusChange}
            onEditAmount={onEditAmount}
            onUpdateAmount={onUpdateAmount}
            loadingAppointments={loadingAppointments}
            errorMessages={errorMessages}
          />
        </div>
      </Card>
    );
  }

  // Cards view
  return (
    <div className={`space-y-4 transition-opacity duration-500 ease-out will-change-opacity ${isFetching ? 'opacity-95' : 'opacity-100'}`}>
      <div className={isTransitioning ? 'opacity-0 transition-opacity duration-300 ease-out' : 'opacity-100 transition-opacity duration-500 ease-out'}>
        {appointments.map((appointment, index) => (
          <Card 
            key={appointment.id} 
            padding="md"
            className="appointment-card transition-all duration-500 ease-out will-change-opacity animate-fade-in"
            style={{ animationDelay: `${index * 0.02}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Patient Info Header */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-12 h-12 bg-main-10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <span className="text-base text-main-100 font-medium">
                      {appointment.patient?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-text-100 truncate">
                      {appointment.patient?.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {appointment.patient?.email && (
                        <p className="text-xs text-text-10">📧 {appointment.patient.email}</p>
                      )}
                      {appointment.patient?.phone && (
                        <p className="text-xs text-text-10">📱 {appointment.patient.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Doctor and Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-bg-primary p-3 rounded-sm">
                    <p className="font-normal text-text-10 mb-2">👨‍⚕️ Врач:</p>
                    <p className="font-semibold text-text-50 text-sm">{appointment.doctor?.name}</p>
                    {appointment.doctor?.specialization && (
                      <p className="text-text-10 mt-1">{appointment.doctor.specialization}</p>
                    )}
                  </div>
                  <div className="bg-bg-primary p-3 rounded-sm">
                    <p className="font-normal text-text-10 mb-2">📅 Дата и время приёма:</p>
                    <p className="font-semibold text-text-50 text-sm">
                      {formatAppointmentDateTime(appointment.appointmentDate, { dateFormat: 'long' })}
                    </p>
                    {(appointment.registeredAt || appointment.createdAt) && (
                      <p className="text-text-10 mt-1 text-xs">
                        📝 Зарегистрировано: {(() => {
                          let registeredAtOriginalStr = null;
                          if (appointment.notes) {
                            const match = appointment.notes.match(/REGISTERED_AT_ORIGINAL:\s*(.+)/);
                            if (match) {
                              registeredAtOriginalStr = match[1].trim();
                            }
                          }
                          
                          if (registeredAtOriginalStr) {
                            const match = registeredAtOriginalStr.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
                            if (match) {
                              const [datePart, timePart] = [match[1], match[2]];
                              const [year, month, day] = datePart.split('-');
                              const [hours, minutes] = timePart.split(':');
                              return `${day}.${month}.${year} ${hours}:${minutes}`;
                            }
                          }
                          
                          const registeredAtStr = appointment.registeredAt || appointment.createdAt;
                          if (!registeredAtStr) return '';
                          
                          const date = new Date(registeredAtStr);
                          return date.toLocaleString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                        })()}
                      </p>
                    )}
                    <p className="text-text-10 mt-1">⏱️ Длительность: {appointment.duration} мин</p>
                    <div className="text-text-10 mt-1">
                      💰 Сумма:{' '}
                      {editingAmountId === appointment.id ? (
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingAmountValue}
                              onChange={handleAmountInputChange}
                              onKeyDown={(e) => handleAmountKeyDown(e, appointment.id)}
                              className="w-24 px-2 py-1 text-sm border border-stroke rounded focus:outline-none focus:ring-2 focus:ring-main-100 focus:border-main-100"
                              autoFocus
                              disabled={loadingAppointments[appointment.id] === 'updating'}
                            />
                            <span className="text-text-10 text-xs">֏</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSaveAmount(appointment.id)}
                                disabled={loadingAppointments[appointment.id] === 'updating'}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                title="Сохранить"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEditAmount}
                                disabled={loadingAppointments[appointment.id] === 'updating'}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="Отменить"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {amountError && (
                            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                              {amountError}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="font-semibold text-text-100 group inline-flex items-center gap-1">
                          {appointment.amount ? (
                            <>
                              {appointment.amount.toLocaleString('ru-RU')} ֏
                              {appointment.status === 'completed' && (onUpdateAmount || onEditAmount) && (
                                <button
                                  onClick={() => handleStartEditAmount(appointment)}
                                  disabled={!!loadingAppointments[appointment.id]}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-text-10 hover:text-main-100 hover:bg-main-10 rounded transition-all"
                                  title={appointment.amount ? 'Изменить сумму' : 'Добавить сумму'}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              —
                              {appointment.status === 'completed' && (onUpdateAmount || onEditAmount) && (
                                <button
                                  onClick={() => handleStartEditAmount(appointment)}
                                  disabled={!!loadingAppointments[appointment.id]}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-text-10 hover:text-main-100 hover:bg-main-10 rounded transition-all"
                                  title="Добавить сумму"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {appointment.reason && (
                  <div className="text-xs">
                    <p className="font-normal text-text-10 mb-1">Причина визита:</p>
                    <p className="text-text-50">{appointment.reason}</p>
                  </div>
                )}

                {appointment.notes && (
                  <div className="text-xs">
                    <p className="font-normal text-text-10 mb-1">Заметки:</p>
                    <p className="text-text-50">{appointment.notes}</p>
                  </div>
                )}

                {/* Inline Error Message */}
                {errorMessages[appointment.id] && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-sm">
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <span>⚠️</span>
                      {errorMessages[appointment.id]}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 ml-4 min-w-[140px]">
                {/* Dropdown для выбора статуса */}
                <StatusDropdown
                  currentStatus={appointment.status}
                  onStatusChange={(status) => {
                    onStatusChange(appointment.id, status);
                    setOpenDropdownId(null); // Закрываем dropdown после выбора
                  }}
                  isLoading={!!loadingAppointments[appointment.id]}
                  disabled={!!loadingAppointments[appointment.id]}
                  isOpen={openDropdownId === appointment.id}
                  onToggle={(isOpen) => {
                    if (isOpen) {
                      setOpenDropdownId(appointment.id); // Открываем только этот dropdown
                    } else {
                      setOpenDropdownId(null); // Закрываем все
                    }
                  }}
                  dropdownId={appointment.id}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

