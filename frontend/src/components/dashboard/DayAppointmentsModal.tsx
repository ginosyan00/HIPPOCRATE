import React from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Modal, Card } from '../common';
import { Appointment } from '../../types/api.types';
import { formatAppointmentDateTime, formatAppointmentTime } from '../../utils/dateFormat';
import { useAuthStore } from '../../store/useAuthStore';

// Import icons
import doctorIcon from '../../assets/icons/doctor.svg';
import walletIcon from '../../assets/icons/wallet.svg';
import phoneIcon from '../../assets/icons/phone.svg';
import mailIcon from '../../assets/icons/mail.svg';

interface DayAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

/**
 * DayAppointmentsModal Component
 * Модальное окно для отображения всех приёмов выбранного дня
 */
export const DayAppointmentsModal: React.FC<DayAppointmentsModalProps> = ({
  isOpen,
  onClose,
  date,
  appointments,
  onAppointmentClick,
}) => {
  const user = useAuthStore(state => state.user);
  if (!date) return null;

  // Сортируем приёмы по времени
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = parseISO(a.appointmentDate.toString());
    const dateB = parseISO(b.appointmentDate.toString());
    return dateA.getTime() - dateB.getTime();
  });

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

  // Получаем цвет фона для карточки приёма
  const getAppointmentBgColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-main-100';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const formattedDate = format(date, 'd MMMM yyyy', { locale: ru });
  const dayName = format(date, 'EEEE', { locale: ru });
  const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${capitalizedDayName}, ${formattedDate}`}
      size="xl"
    >
      <div className="space-y-4">
        {sortedAppointments.length === 0 ? (
          <div className="text-center py-12 text-text-10">
            На этот день нет запланированных приёмов
          </div>
        ) : (
          <>
            <div className="text-sm text-text-50 mb-4">
              Всего приёмов: <span className="font-semibold text-text-100">{sortedAppointments.length}</span>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {sortedAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.appointmentDate.toString());
                const appointmentTime = formatAppointmentTime(appointmentDate);
                // Для PATIENT роли показываем "Я" или имя пользователя, для других ролей - имя пациента
                const isPatientView = user?.role === 'PATIENT';
                const patientName = isPatientView
                  ? (user?.name || 'Я')
                  : (appointment.patient?.name || 'Пациент');
                const patientInitial = patientName.charAt(0).toUpperCase();

                return (
                  <Card
                    key={appointment.id}
                    padding="md"
                    className="hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      onAppointmentClick?.(appointment);
                      onClose();
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Время и статус */}
                      <div className="flex-shrink-0">
                        <div className={`${getAppointmentBgColor(appointment.status)} text-white px-3 py-2 rounded-sm text-center min-w-[80px]`}>
                          <div className="text-sm font-semibold">{appointmentTime}</div>
                          {appointment.duration && (
                            <div className="text-xs opacity-90 mt-0.5">{appointment.duration} мин</div>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded-sm text-xs font-normal border ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                      </div>

                      {/* Информация о пациенте */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0 w-12 h-12 bg-main-10 rounded-sm flex items-center justify-center">
                            <span className="text-lg text-main-100 font-medium">
                              {patientInitial}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-text-100 mb-1">
                              {patientName}
                            </h4>
                            {appointment.patient?.phone && (
                              <p className="text-xs text-text-50 flex items-center gap-1">
                                <img src={phoneIcon} alt="Телефон" className="w-3 h-3" />
                                {appointment.patient.phone}
                              </p>
                            )}
                            {appointment.patient?.email && (
                              <p className="text-xs text-text-50 flex items-center gap-1">
                                <img src={mailIcon} alt="Email" className="w-3 h-3" />
                                {appointment.patient.email}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Информация о враче */}
                        {appointment.doctor?.name && (
                          <div className="mb-3 text-sm">
                            <span className="text-text-10 flex items-center gap-1">
                              <img src={doctorIcon} alt="Врач" className="w-3 h-3" />
                              Врач: 
                            </span>
                            <span className="text-text-100 font-medium">{appointment.doctor.name}</span>
                            {appointment.doctor.specialization && (
                              <span className="text-text-50 ml-1">({appointment.doctor.specialization})</span>
                            )}
                          </div>
                        )}

                        {/* Причина визита */}
                        {appointment.reason && (
                          <div className="mb-3 text-sm">
                            <span className="text-text-10">Причина визита: </span>
                            <span className="text-text-100">{appointment.reason}</span>
                          </div>
                        )}

                        {/* Заметки */}
                        {appointment.notes && (
                          <div className="text-sm">
                            <span className="text-text-10">Заметки: </span>
                            <span className="text-text-50">{appointment.notes}</span>
                          </div>
                        )}

                        {/* Сумма */}
                        {appointment.amount && (
                          <div className="mt-3 pt-3 border-t border-stroke text-sm">
                            <span className="text-text-10 flex items-center gap-1">
                              <img src={walletIcon} alt="Сумма" className="w-3 h-3" />
                              Сумма: 
                            </span>
                            <span className="text-text-100 font-semibold">
                              {appointment.amount.toLocaleString('ru-RU')} ֏
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

