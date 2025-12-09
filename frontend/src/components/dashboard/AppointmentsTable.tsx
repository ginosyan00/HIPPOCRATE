import React, { useState } from 'react';
import { Appointment } from '../../types/api.types';
import { Button } from '../common';
import { formatAppointmentDateTime } from '../../utils/dateFormat';
import { Pencil, Check, X } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';

// Import icons
import fileTextIcon from '../../assets/icons/file-text.svg';
import warningIcon from '../../assets/icons/warning.svg';
import phoneIcon from '../../assets/icons/phone.svg';
import mailIcon from '../../assets/icons/mail.svg';

interface AppointmentsTableProps {
  appointments: Appointment[];
  onStatusChange: (id: string, status: string) => void;
  onEditAmount?: (appointment: Appointment) => void;
  onUpdateAmount?: (appointmentId: string, amount: number) => Promise<void>;
  loadingAppointments: Record<string, string>;
  errorMessages: Record<string, string>;
}

/**
 * AppointmentsTable Component
 * Табличный формат отображения приёмов
 */
export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  onStatusChange,
  onEditAmount,
  onUpdateAmount,
  loadingAppointments,
  errorMessages,
}) => {
  // Состояние для редактирования суммы
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

  /**
   * Форматирует дату регистрации приёма
   * Использует ту же логику, что и в карточном представлении
   */
  const formatRegisteredAt = (appointment: Appointment): string | null => {
    if (!appointment.registeredAt && !appointment.createdAt) {
      return null;
    }

    // Сначала проверяем, есть ли исходная строка времени в notes
    let registeredAtOriginalStr = null;
    if (appointment.notes) {
      const match = appointment.notes.match(/REGISTERED_AT_ORIGINAL:\s*(.+)/);
      if (match) {
        registeredAtOriginalStr = match[1].trim();
      }
    }
    
    // Если есть исходная строка, используем её для отображения локального времени клиента
    if (registeredAtOriginalStr) {
      const match = registeredAtOriginalStr.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
      if (match) {
        const [datePart, timePart] = [match[1], match[2]];
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
      }
    }
    
    // Если исходной строки нет, используем стандартное форматирование
    const registeredAtStr = appointment.registeredAt || appointment.createdAt;
    if (!registeredAtStr) return null;
    
    const date = new Date(registeredAtStr);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 text-text-10 text-sm">
        Приёмы не найдены
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-bg-primary border-b border-stroke transition-colors duration-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
              Врач
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
              Пациент
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
              Дата и время
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
              Процедура
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
              Длительность
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
              Сумма
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="bg-bg-white divide-y divide-stroke">
          {appointments.map((appointment, index) => (
            <tr 
              key={appointment.id} 
              className="appointment-row hover:bg-bg-primary transition-all duration-500 ease-out will-change-opacity animate-fade-in"
              style={{ animationDelay: `${index * 0.02}s` }}
            >
              <td className="px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-text-100">{appointment.doctor?.name}</p>
                  {appointment.doctor?.specialization && (
                    <p className="text-xs text-text-10 mt-1">{appointment.doctor.specialization}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-text-100">{appointment.patient?.name}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    {appointment.patient?.phone && (
                      <p className="text-xs text-text-10 flex items-center gap-1">
                        <img src={phoneIcon} alt="Телефон" className="w-3 h-3" />
                        {appointment.patient.phone}
                      </p>
                    )}
                    {appointment.patient?.email && (
                      <p className="text-xs text-text-10 flex items-center gap-1">
                        <img src={mailIcon} alt="Email" className="w-3 h-3" />
                        {appointment.patient.email}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                <div>
                  <p className="text-text-100">{formatAppointmentDateTime(appointment.appointmentDate)}</p>
                  {(() => {
                    const registeredAtFormatted = formatRegisteredAt(appointment);
                    return registeredAtFormatted ? (
                      <p className="text-xs text-text-10 mt-1">
                        <span className="flex items-center gap-1">
                          <img src={fileTextIcon} alt="Зарегистрировано" className="w-3 h-3" />
                          Зарегистрировано: {registeredAtFormatted}
                        </span>
                      </p>
                    ) : null;
                  })()}
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                <p className="text-text-100">{appointment.reason || '—'}</p>
              </td>
              <td className="px-4 py-3 text-sm text-text-100">
                {appointment.duration} мин
              </td>
              <td className="px-4 py-3 text-sm">
                {editingAmountId === appointment.id ? (
                  <div className="flex flex-col gap-1">
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
                  <div className="flex items-center gap-2 group">
                    {appointment.amount ? (
                      <span className="font-semibold text-text-100">
                        {appointment.amount.toLocaleString('ru-RU')} ֏
                      </span>
                    ) : (
                      <span className="text-text-10">—</span>
                    )}
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
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex flex-col gap-2 min-w-[140px]">
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

                  {/* Inline Error Message */}
                  {errorMessages[appointment.id] && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-sm">
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <img src={warningIcon} alt="Предупреждение" className="w-4 h-4" />
                        {errorMessages[appointment.id]}
                      </p>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

