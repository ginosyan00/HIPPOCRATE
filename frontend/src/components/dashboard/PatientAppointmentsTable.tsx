import React, { useMemo, useState } from 'react';
import { Appointment } from '../../types/api.types';
import { Button, Spinner } from '../common';
import { formatAppointmentDateTime } from '../../utils/dateFormat';
import { Calendar, User, Building2, FileText, MoreVertical, XCircle } from 'lucide-react';
import { AppointmentDetailModal } from './AppointmentDetailModal';

// Import icons
import clockIcon from '../../assets/icons/clock.svg';
import checkIcon from '../../assets/icons/check.svg';
import xIcon from '../../assets/icons/x.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import mapPinIcon from '../../assets/icons/map-pin.svg';

interface PatientAppointmentsTableProps {
  appointments: Appointment[];
  onCancel?: (id: string) => void;
  loadingAppointments?: Record<string, string>;
  errorMessages?: Record<string, string>;
}

type SortField = 'date' | 'category' | 'doctor' | 'clinic';
type SortDirection = 'asc' | 'desc';

/**
 * PatientAppointmentsTable Component
 * Табличное представление записей пациента
 */
export const PatientAppointmentsTable: React.FC<PatientAppointmentsTableProps> = ({
  appointments,
  onCancel,
  loadingAppointments = {},
  errorMessages = {},
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
      target.closest('a')
    ) {
      return;
    }

    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
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
        case 'clinic':
          aValue = a.clinic?.name || '';
          bValue = b.clinic?.name || '';
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

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 text-text-10">
        <div className="flex justify-center mb-3">
          <img src={calendarIcon} alt="Календарь" className="w-16 h-16 opacity-50" />
        </div>
        <p className="text-sm font-medium">Записей не найдено</p>
        <p className="text-xs mt-1">Запишитесь на прием, чтобы увидеть свои записи здесь</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-bg-primary border-b-2 border-stroke">
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
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50">Статус</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50">
              <div className="flex items-center gap-2">
                <MoreVertical className="w-5 h-5" />
                Действия
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedAppointments.map((appointment) => (
            <tr
              key={appointment.id}
              className="border-b border-stroke hover:bg-bg-secondary transition-colors cursor-pointer"
              onClick={(e) => handleRowClick(appointment, e)}
            >
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-text-50">
                  {formatAppointmentDateTime(appointment.appointmentDate, { dateFormat: 'short' })}
                </div>
              </td>
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
              <td className="px-4 py-3">
                <div className="text-sm text-text-50">
                  {appointment.reason || (
                    <span className="text-text-10 italic">Не указана</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                {(() => {
                  const badge = getStatusBadge(appointment.status);
                  return (
                    <span className={`px-3 py-1 border rounded-full text-xs font-medium flex items-center gap-1 ${badge.style}`}>
                      <img src={badge.icon} alt={badge.label} className="w-3 h-3" />
                      {badge.label}
                    </span>
                  );
                })()}
              </td>
              <td 
                className="px-4 py-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  {appointment.status !== 'cancelled' &&
                    appointment.status !== 'completed' &&
                    onCancel && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onCancel(appointment.id)}
                        isLoading={loadingAppointments[appointment.id] === 'cancelled'}
                        disabled={!!loadingAppointments[appointment.id]}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Отменить
                      </Button>
                    )}
                  {errorMessages[appointment.id] && (
                    <div className="text-xs text-red-600 mt-1">{errorMessages[appointment.id]}</div>
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

