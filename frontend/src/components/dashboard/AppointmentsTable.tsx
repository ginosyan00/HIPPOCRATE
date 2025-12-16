import React, { useState } from 'react';
import { Appointment } from '../../types/api.types';
import { Button } from '../common';
import { formatAppointmentDateTime } from '../../utils/dateFormat';
import { Pencil, Check, X } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { AppointmentDetailModal } from './AppointmentDetailModal';

// Import icons
import warningIcon from '../../assets/icons/warning.svg';
import phoneIcon from '../../assets/icons/phone.svg';

interface AppointmentsTableProps {
  appointments: Appointment[];
  onStatusChange: (id: string, status: string) => void;
  onEditAmount?: (appointment: Appointment) => void;
  onUpdateAmount?: (appointmentId: string, amount: number) => Promise<void>;
  loadingAppointments: Record<string, string>;
  errorMessages: Record<string, string>;
  selectedAppointments?: Set<string>;
  onToggleSelect?: (appointmentId: string) => void;
  onSelectAll?: (checked: boolean) => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
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
  selectedAppointments = new Set(),
  onToggleSelect,
  onSelectAll,
  isAllSelected = false,
  isIndeterminate = false,
}) => {
  // Состояние для редактирования суммы
  const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
  const [editingAmountValue, setEditingAmountValue] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  
  // Состояние для управления открытым dropdown
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Состояние для модального окна с деталями приёма
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  /**
   * Открывает модальное окно с деталями приёма
   */
  const handleRowClick = (appointment: Appointment, e: React.MouseEvent) => {
    // Предотвращаем открытие модального окна при клике на интерактивные элементы
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('[role="button"]') ||
      target.closest('.status-dropdown') ||
      target.closest('a')
    ) {
      return;
    }

    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

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
            {onToggleSelect && onSelectAll && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-main-100 border-stroke rounded focus:ring-main-100 focus:ring-2 cursor-pointer"
                />
              </th>
            )}
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
              className="appointment-row hover:bg-bg-primary transition-all duration-500 ease-out will-change-opacity animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 0.02}s` }}
              onClick={(e) => handleRowClick(appointment, e)}
            >
                  {onToggleSelect && (
                    <td 
                      className="px-4 py-3 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAppointments.has(appointment.id)}
                        onChange={() => onToggleSelect(appointment.id)}
                        disabled={!!loadingAppointments[appointment.id]}
                        className="w-4 h-4 text-main-100 border-stroke rounded focus:ring-main-100 focus:ring-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                  )}
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
                      {appointment.patient?.phone && (
                        <div className="flex flex-col gap-1 mt-1">
                          <p className="text-xs text-text-10 flex items-center gap-1">
                            <img src={phoneIcon} alt="Телефон" className="w-3 h-3" />
                            {appointment.patient.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <p className="text-text-100">{formatAppointmentDateTime(appointment.appointmentDate)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <p className="text-text-100">{appointment.reason || '—'}</p>
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
              <td 
                className="px-4 py-3 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
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

      {/* Модальное окно с деталями приёма */}
      {selectedAppointment && (
        <AppointmentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
};

