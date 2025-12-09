import React, { useMemo, useState } from 'react';
import { Appointment } from '../../types/api.types';
import { formatAppointmentDate, formatAppointmentTime } from '../../utils/dateFormat';
import { Calendar, Clock, User, Building2, FileText, DollarSign } from 'lucide-react';

// Import icons
import clockIcon from '../../assets/icons/clock.svg';
import checkIcon from '../../assets/icons/check.svg';
import xIcon from '../../assets/icons/x.svg';
import analyticsIcon from '../../assets/icons/analytics.svg';
import mapPinIcon from '../../assets/icons/map-pin.svg';

interface PatientAnalyticsTableProps {
  appointments: Appointment[];
}

type SortField = 'date' | 'amount' | 'category' | 'doctor' | 'clinic' | 'status';
type SortDirection = 'asc' | 'desc';

/**
 * PatientAnalyticsTable Component
 * Таблица детальной статистики для пациента
 */
export const PatientAnalyticsTable: React.FC<PatientAnalyticsTableProps> = ({ appointments }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'AMD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
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
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
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
      setSortDirection('desc');
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
    const label = labels[status as keyof typeof labels];
    const icon = icons[status as keyof typeof icons];
    return (
      <span
        className={`px-3 py-1 border rounded-full text-xs font-medium flex items-center gap-1 ${styles[status as keyof typeof styles]}`}
      >
        <img src={icon} alt={label} className="w-3 h-3" />
        {label}
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
        <div className="flex justify-center mb-3">
          <img src={analyticsIcon} alt="Аналитика" className="w-16 h-16 opacity-50" />
        </div>
        <p className="text-sm font-medium">Нет данных для отображения</p>
        <p className="text-xs mt-1">Запишитесь на прием, чтобы увидеть статистику здесь</p>
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
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Время
                <SortIcon field="date" />
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
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
              onClick={() => handleSort('status')}
            >
              Статус
              <SortIcon field="status" />
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-text-50 cursor-pointer hover:bg-bg-secondary transition-colors"
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Сумма
                <SortIcon field="amount" />
              </div>
            </th>
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
                  <div className="text-xs text-text-10 flex items-center gap-1">
                    <img src={mapPinIcon} alt="Местоположение" className="w-3 h-3" />
                    {appointment.clinic.city}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-text-50">
                  {appointment.reason || <span className="text-text-10 italic">Не указана</span>}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusBadge(appointment.status).style}`}>
                  <img src={getStatusBadge(appointment.status).icon} alt={getStatusBadge(appointment.status).label} className="w-3 h-3" />
                  {getStatusBadge(appointment.status).label}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-text-50">
                  {appointment.status === 'completed' ? (
                    <span className="text-green-600">{formatCurrency(appointment.amount)}</span>
                  ) : (
                    <span className="text-text-10">-</span>
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


