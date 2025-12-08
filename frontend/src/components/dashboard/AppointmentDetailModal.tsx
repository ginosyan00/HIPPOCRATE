import React from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Modal, Card } from '../common';
import { Appointment } from '../../types/api.types';
import { formatAppointmentDateTime, formatAppointmentTime } from '../../utils/dateFormat';
import { useAuthStore } from '../../store/useAuthStore';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

/**
 * AppointmentDetailModal Component
 * Модальное окно с детальной информацией о записи
 */
export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const user = useAuthStore(state => state.user);

  if (!appointment) return null;

  const appointmentDate = parseISO(appointment.appointmentDate.toString());
  const formattedDate = format(appointmentDate, 'd MMMM yyyy', { locale: ru });
  const formattedTime = formatAppointmentTime(appointmentDate);
  const dayName = format(appointmentDate, 'EEEE', { locale: ru });
  const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  // Для PATIENT роли показываем "Я" или имя пользователя, для других ролей - имя пациента
  const isPatientView = user?.role === 'PATIENT';
  const patientName = isPatientView
    ? (user?.name || 'Я')
    : (appointment.patient?.name || 'Пациент');
  const patientInitial = patientName.charAt(0).toUpperCase();

  // Получаем цвет статуса
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'confirmed':
        return 'bg-main-10 text-main-100 border-main-100/20';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  // Получаем текст статуса
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'confirmed':
        return 'Подтвержден';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  // Форматирование суммы
  const formatAmount = (amount?: number) => {
    if (!amount) return '-';
    return `${amount.toLocaleString('ru-RU')} ֏`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Запись на приём`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Дата и время */}
        <Card padding="md" className="bg-main-10/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-10 mb-1">Дата и время</p>
              <p className="text-lg font-semibold text-text-100">
                {capitalizedDayName}, {formattedDate}
              </p>
              <p className="text-sm text-text-50 mt-1">{formattedTime}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-10 mb-1">Статус</p>
              <span className={`inline-block px-3 py-1.5 rounded-sm text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>
          </div>
          {appointment.duration && (
            <div className="mt-3 pt-3 border-t border-stroke">
              <p className="text-xs text-text-10">Длительность</p>
              <p className="text-sm font-medium text-text-100">{appointment.duration} минут</p>
            </div>
          )}
        </Card>

        {/* Информация о пациенте */}
        <Card padding="md">
          <h4 className="text-sm font-semibold text-text-100 mb-3">Информация о пациенте</h4>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-main-10 rounded-sm flex items-center justify-center">
              <span className="text-2xl text-main-100 font-medium">
                {patientInitial}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-text-100 mb-2">{patientName}</p>
              {appointment.patient?.phone && (
                <div className="mb-2">
                  <p className="text-xs text-text-10 mb-1">Телефон</p>
                  <p className="text-sm text-text-100">📱 {appointment.patient.phone}</p>
                </div>
              )}
              {appointment.patient?.email && (
                <div>
                  <p className="text-xs text-text-10 mb-1">Email</p>
                  <p className="text-sm text-text-100">📧 {appointment.patient.email}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Информация о враче */}
        {appointment.doctor?.name && (
          <Card padding="md">
            <h4 className="text-sm font-semibold text-text-100 mb-3">Информация о враче</h4>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-bg-primary rounded-sm flex items-center justify-center">
                <span className="text-lg text-text-50">👨‍⚕️</span>
              </div>
              <div>
                <p className="text-base font-semibold text-text-100">{appointment.doctor.name}</p>
                {appointment.doctor.specialization && (
                  <p className="text-sm text-text-50 mt-1">{appointment.doctor.specialization}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Причина визита */}
        {appointment.reason && (
          <Card padding="md">
            <h4 className="text-sm font-semibold text-text-100 mb-2">Причина визита</h4>
            <p className="text-sm text-text-50">{appointment.reason}</p>
          </Card>
        )}

        {/* Заметки */}
        {appointment.notes && (
          <Card padding="md">
            <h4 className="text-sm font-semibold text-text-100 mb-2">Заметки</h4>
            <p className="text-sm text-text-50 whitespace-pre-wrap">{appointment.notes}</p>
          </Card>
        )}

        {/* Сумма */}
        {appointment.amount && (
          <Card padding="md" className="bg-secondary-10/30">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text-100">Сумма оплаты</h4>
              <p className="text-lg font-bold text-secondary-100">
                {formatAmount(appointment.amount)}
              </p>
            </div>
          </Card>
        )}

        {/* Информация об отмене */}
        {appointment.status === 'cancelled' && appointment.cancellationReason && (
          <Card padding="md" className="bg-gray-50 border-gray-200">
            <h4 className="text-sm font-semibold text-text-100 mb-2">Причина отмены</h4>
            <p className="text-sm text-text-50">{appointment.cancellationReason}</p>
            {appointment.suggestedNewDate && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-text-10 mb-1">Предложенное новое время</p>
                <p className="text-sm text-text-100">
                  {format(parseISO(appointment.suggestedNewDate.toString()), 'd MMMM yyyy, HH:mm', { locale: ru })}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Дополнительная информация */}
        <Card padding="md" className="bg-bg-primary">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-text-10 mb-1">Дата создания</p>
              <p className="text-text-100">
                {format(parseISO(appointment.createdAt.toString()), 'd MMM yyyy, HH:mm', { locale: ru })}
              </p>
            </div>
            <div>
              <p className="text-text-10 mb-1">Последнее обновление</p>
              <p className="text-text-100">
                {format(parseISO(appointment.updatedAt.toString()), 'd MMM yyyy, HH:mm', { locale: ru })}
              </p>
            </div>
            {appointment.registeredAt && (
              <div className="col-span-2">
                <p className="text-text-10 mb-1">Время регистрации на сайте</p>
                <p className="text-text-100">
                  {format(parseISO(appointment.registeredAt.toString()), 'd MMM yyyy, HH:mm', { locale: ru })}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Modal>
  );
};

