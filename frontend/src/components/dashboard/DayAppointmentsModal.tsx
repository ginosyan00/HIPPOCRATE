import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Modal, Card } from '../common';
import { Appointment } from '../../types/api.types';
import { formatAppointmentDateTime, formatAppointmentTime, safeParseDate } from '../../utils/dateFormat';
import { useAuthStore } from '../../store/useAuthStore';
import { useTreatmentCategories } from '../../hooks/useTreatmentCategories';
import { getCategoryColor, getStatusColor } from '../../utils/appointmentColors';

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
  // Загружаем категории для получения цветов
  const { data: categories = [] } = useTreatmentCategories();
  
  if (!date) return null;

  // Сортируем приёмы по времени
  const sortedAppointments = [...appointments].sort((a, b) => {
    try {
      const dateA = safeParseDate(a.appointmentDate);
      const dateB = safeParseDate(b.appointmentDate);
      return dateA.getTime() - dateB.getTime();
    } catch (error) {
      console.error('❌ [DAY MODAL] Ошибка сортировки приёмов:', error);
      return 0;
    }
  });

  // Получаем классы цвета статуса для бейджа (для обратной совместимости)
  const getStatusColorClass = (status: string): string => {
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
                const appointmentDate = safeParseDate(appointment.appointmentDate);
                const appointmentTime = formatAppointmentTime(appointmentDate);
                // Для PATIENT роли показываем "Я" или имя пользователя, для других ролей - имя пациента
                const isPatientView = user?.role === 'PATIENT';
                const patientName = isPatientView
                  ? (user?.name || 'Я')
                  : (appointment.patient?.name || 'Пациент');
                const patientInitial = patientName.charAt(0).toUpperCase();

                // Получаем цвета для карточки
                const categoryColor = getCategoryColor(appointment, categories);
                const statusColorValue = getStatusColor(appointment.status);
                
                return (
                  <Card
                    key={appointment.id}
                    padding="md"
                    className="hover:shadow-md transition-all duration-200 cursor-pointer relative"
                    style={{
                      backgroundColor: categoryColor,
                      borderLeft: `4px solid ${statusColorValue}`,
                    }}
                    onClick={() => {
                      onAppointmentClick?.(appointment);
                      onClose();
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Время и статус */}
                      <div className="flex-shrink-0">
                        <div className="text-white px-3 py-2 rounded-sm text-center min-w-[80px] bg-black/20">
                          <div className="text-sm font-semibold">{appointmentTime}</div>
                          {appointment.duration && (
                            <div className="text-xs opacity-90 mt-0.5">{appointment.duration} мин</div>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded-sm text-xs font-normal border ${getStatusColorClass(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                      </div>

                      {/* Информация о пациенте */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          {/* Avatar */}
                          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-sm flex items-center justify-center">
                            <span className="text-lg text-white font-medium">
                              {patientInitial}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-white mb-1">
                              {patientName}
                            </h4>
                            {appointment.patient?.phone && (
                              <p className="text-xs text-white/90 flex items-center gap-1">
                                <img src={phoneIcon} alt="Телефон" className="w-3 h-3 brightness-0 invert" />
                                {appointment.patient.phone}
                              </p>
                            )}
                            {appointment.patient?.email && (
                              <p className="text-xs text-white/90 flex items-center gap-1">
                                <img src={mailIcon} alt="Email" className="w-3 h-3 brightness-0 invert" />
                                {appointment.patient.email}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Информация о враче */}
                        {appointment.doctor?.name && (
                          <div className="mb-3 text-sm">
                            <span className="text-white/80 flex items-center gap-1">
                              <img src={doctorIcon} alt="Врач" className="w-3 h-3 brightness-0 invert" />
                              Врач: 
                            </span>
                            <span className="text-white font-medium">{appointment.doctor.name}</span>
                            {appointment.doctor.specialization && (
                              <span className="text-white/80 ml-1">({appointment.doctor.specialization})</span>
                            )}
                          </div>
                        )}

                        {/* Причина визита */}
                        {appointment.reason && (
                          <div className="mb-3 text-sm">
                            <span className="text-white/80">Причина визита: </span>
                            <span className="text-white">{appointment.reason}</span>
                          </div>
                        )}

                        {/* Заметки */}
                        {appointment.notes && (
                          <div className="text-sm">
                            <span className="text-white/80">Заметки: </span>
                            <span className="text-white/90">{appointment.notes}</span>
                          </div>
                        )}

                        {/* Сумма */}
                        {appointment.amount && (
                          <div className="mt-3 pt-3 border-t border-white/20 text-sm">
                            <span className="text-white/80 flex items-center gap-1">
                              <img src={walletIcon} alt="Сумма" className="w-3 h-3 brightness-0 invert" />
                              Сумма: 
                            </span>
                            <span className="text-white font-semibold">
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

