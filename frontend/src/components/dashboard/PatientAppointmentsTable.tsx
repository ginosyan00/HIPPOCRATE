import React, { useMemo, useState } from 'react';
import { Appointment } from '../../types/api.types';
import { Button, Spinner } from '../common';
import { formatAppointmentDate, formatAppointmentTime } from '../../utils/dateFormat';
import { Calendar, Clock, User, Building2, FileText, XCircle } from 'lucide-react';

interface PatientAppointmentsTableProps {
  appointments: Appointment[];
  onCancel?: (id: string) => void;
  loadingAppointments?: Record<string, string>;
  errorMessages?: Record<string, string>;
}

type SortField = 'date' | 'time' | 'category' | 'doctor' | 'clinic';
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
        case 'time':
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
      pending: '⏳ Ожидает',
      confirmed: '✅ Подтверждено',
      completed: '✅ Завершено',
      cancelled: '❌ Отменено',
    };
    return (
      <span
        className={`px-3 py-1 border rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
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
        <div className="text-4xl mb-3">📅</div>
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
                <Calendar className="w-4 h-4" />
                Дата
                <SortIcon field="date" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
              onClick={() => handleSort('time')}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Время
                <SortIcon field="time" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
              onClick={() => handleSort('doctor')}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Врач
                <SortIcon field="doctor" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
              onClick={() => handleSort('clinic')}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Клиника
                <SortIcon field="clinic" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Процедура / Причина
                <SortIcon field="category" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50">Статус</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-50">Действия</th>
          </tr>
        </thead>
        <tbody>
          {sortedAppointments.map((appointment) => (
            <tr
              key={appointment.id}
              className="border-b border-stroke hover:bg-bg-secondary transition-colors"
            >
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-text-50">
                  {formatAppointmentDate(appointment.appointmentDate, 'short')}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-text-50">
                  {formatAppointmentTime(appointment.appointmentDate)}
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
                  <div className="text-xs text-text-10">📍 {appointment.clinic.city}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-text-50">
                  {appointment.reason || (
                    <span className="text-text-10 italic">Не указана</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">{getStatusBadge(appointment.status)}</td>
              <td className="px-4 py-3">
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
    </div>
  );
};

