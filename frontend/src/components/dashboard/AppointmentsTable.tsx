import React, { useState, useMemo } from 'react';
import { Appointment } from '../../types/api.types';
import { Button } from '../common';
import { formatAppointmentDateTime } from '../../utils/dateFormat';
import { Calendar, User, Building2, FileText, Wallet, MoreVertical, Pencil, Check, X } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { AppointmentDetailModal } from './AppointmentDetailModal';

// Import icons
import warningIcon from '../../assets/icons/warning.svg';
import phoneIcon from '../../assets/icons/phone.svg';
import clockIcon from '../../assets/icons/clock.svg';
import checkIcon from '../../assets/icons/check.svg';
import xIcon from '../../assets/icons/x.svg';
import mapPinIcon from '../../assets/icons/map-pin.svg';

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
  userRole?: 'DOCTOR' | 'CLINIC' | 'ADMIN'; // Роль пользователя для определения колонок
}

type SortField = 'date' | 'doctor' | 'patient' | 'clinic' | 'category' | 'status' | 'amount';
type SortDirection = 'asc' | 'desc';

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
  userRole,
}) => {
  // Состояние для сортировки
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  // Сортировка записей
  const sortedAppointments = useMemo(() => {
    if (!appointments.length) return [];

    const sorted = [...appointments].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.appointmentDate).getTime();
          bValue = new Date(b.appointmentDate).getTime();
          break;
        case 'category':
          aValue = a.reason || '';
          bValue = b.reason || '';
          break;
        case 'doctor':
          aValue = a.doctor?.name || '';
          bValue = b.doctor?.name || '';
          break;
        case 'patient':
          aValue = a.patient?.name || '';
          bValue = b.patient?.name || '';
          break;
        case 'clinic':
          aValue = a.clinic?.name || '';
          bValue = b.clinic?.name || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [appointments, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    const labels = {
      pending: 'Ожидает',
      confirmed: 'Подтверждено',
      completed: 'Завершено',
      cancelled: 'Отменено',
    };
    const icons = {
      pending: clockIcon,
      confirmed: checkIcon,
      completed: checkIcon,
      cancelled: xIcon,
    };
    const label = labels[status as keyof typeof labels] || status;
    const icon = icons[status as keyof typeof icons] || clockIcon;
    const style = styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200';
    
    return { label, icon, style };
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  // Определяем, какие колонки показывать в зависимости от роли
  const isDoctor = userRole === 'DOCTOR';
  const isClinic = userRole === 'CLINIC' || userRole === 'ADMIN';



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
          <tr className="bg-bg-primary border-b-2 border-stroke">
            {onToggleSelect && onSelectAll && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 w-12">
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
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Дата и время
                <SortIcon field="date" />
              </div>
            </th>
            {isClinic && (
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
                onClick={() => handleSort('doctor')}
              >
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Врач
                  <SortIcon field="doctor" />
                </div>
              </th>
            )}
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
              onClick={() => handleSort('patient')}
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Пациент
                <SortIcon field="patient" />
              </div>
            </th>
            {isClinic && (
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
                onClick={() => handleSort('clinic')}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Клиника
                  <SortIcon field="clinic" />
                </div>
              </th>
            )}
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Процедура / Причина
                <SortIcon field="category" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Сумма
                <SortIcon field="amount" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50">
              <div className="flex items-center gap-2">
                <MoreVertical className="w-5 h-5" />
                Действия
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedAppointments.map((appointment, index) => (
            <tr 
              key={appointment.id}
              className="border-b border-stroke hover:bg-bg-secondary transition-colors cursor-pointer"
              onClick={(e) => handleRowClick(appointment, e)}
            >
              {onToggleSelect && (
                <td 
                  className="px-4 py-3"
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
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-text-50">
                  {formatAppointmentDateTime(appointment.appointmentDate, { dateFormat: 'short' })}
                </div>
              </td>
              {isClinic && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-main-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-main-100">
                        {appointment.doctor?.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-50">
                        {appointment.doctor?.name || 'Не указан'}
                      </div>
                      {appointment.doctor?.specialization && (
                        <div className="text-xs text-text-10">{appointment.doctor.specialization}</div>
                      )}
                    </div>
                  </div>
                </td>
              )}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-main-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-main-100">
                      {appointment.patient?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-50">
                      {appointment.patient?.name || 'Не указан'}
                    </div>
                    {appointment.patient?.phone && (
                      <div className="text-xs text-text-10 flex items-center gap-1">
                        <img src={phoneIcon} alt="Телефон" className="w-3 h-3" />
                        {appointment.patient.phone}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              {isClinic && (
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-text-50">
                    {appointment.clinic?.name || 'Не указана'}
                  </div>
                  {appointment.clinic?.city && (
                    <div className="text-xs text-text-10 flex items-center gap-1">
                      <img src={mapPinIcon} alt="Местоположение" className="w-3 h-3" />
                      {appointment.clinic.city}
                    </div>
                  )}
                </td>
              )}
              <td className="px-4 py-3">
                <div className="text-sm text-text-50">
                  {appointment.reason || (
                    <span className="text-text-10 italic">Не указана</span>
                  )}
                </div>
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
                        className="p-1 text-text-10 hover:text-main-100 hover:bg-main-10 rounded transition-all"
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

