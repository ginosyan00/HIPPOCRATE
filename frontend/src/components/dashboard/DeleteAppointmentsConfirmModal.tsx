import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common';
import { Appointment } from '../../types/api.types';
import { formatAppointmentDateTime } from '../../utils/dateFormat';

// Import icons
import warningIcon from '../../assets/icons/warning.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import doctorIcon from '../../assets/icons/doctor.svg';
import phoneIcon from '../../assets/icons/phone.svg';

interface DeleteAppointmentsConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  appointments: Appointment[];
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

/**
 * DeleteAppointmentsConfirmModal Component
 * Модальное окно для подтверждения удаления выбранных приёмов
 */
export const DeleteAppointmentsConfirmModal: React.FC<DeleteAppointmentsConfirmModalProps> = ({
  isOpen,
  onClose,
  count,
  appointments,
  onConfirm,
  isLoading = false,
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Ошибка обрабатывается в родительском компоненте
      // Модальное окно не закрываем при ошибке
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Подтверждение удаления"
      size="lg"
      footer={
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Удалить
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Предупреждение */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <img 
              src={warningIcon} 
              alt="Предупреждение" 
              className="w-5 h-5 flex-shrink-0 mt-0.5" 
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 mb-2">
                Вы уверены, что хотите удалить {count} {count === 1 ? 'приём' : count < 5 ? 'приёма' : 'приёмов'}?
              </p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Это действие нельзя отменить</li>
                <li>Все данные о выбранных приёмах будут безвозвратно удалены</li>
                <li>Пациенты будут уведомлены об отмене приёмов</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Информация */}
        <div className="bg-bg-primary p-3 rounded-lg border border-stroke">
          <p className="text-sm text-text-50">
            Будет удалено: <span className="font-semibold text-text-100">{count}</span> {count === 1 ? 'приём' : count < 5 ? 'приёма' : 'приёмов'}
          </p>
        </div>

        {/* Список выбранных приёмов */}
        {appointments.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-text-50 mb-3">Выбранные приёмы:</p>
            <div className="max-h-64 overflow-y-auto space-y-2 border border-stroke rounded-lg p-2">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-bg-white border border-stroke rounded-sm p-3 hover:bg-bg-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Пациент */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-main-10 rounded-sm flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-main-100">
                            {appointment.patient?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-text-100 truncate">
                          {appointment.patient?.name || 'Не указан'}
                        </p>
                      </div>

                      {/* Дата и время */}
                      <div className="flex items-center gap-1.5 text-xs text-text-50 mb-1">
                        <img src={calendarIcon} alt="Дата" className="w-3 h-3 flex-shrink-0" />
                        <span>
                          {formatAppointmentDateTime(appointment.appointmentDate, { dateFormat: 'long' })}
                        </span>
                      </div>

                      {/* Врач */}
                      {appointment.doctor && (
                        <div className="flex items-center gap-1.5 text-xs text-text-50">
                          <img src={doctorIcon} alt="Врач" className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {appointment.doctor.name}
                            {appointment.doctor.specialization && ` (${appointment.doctor.specialization})`}
                          </span>
                        </div>
                      )}

                      {/* Телефон пациента */}
                      {appointment.patient?.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-text-10 mt-1">
                          <img src={phoneIcon} alt="Телефон" className="w-3 h-3 flex-shrink-0" />
                          <span>{appointment.patient.phone}</span>
                        </div>
                      )}

                      {/* Причина визита */}
                      {appointment.reason && (
                        <p className="text-xs text-text-50 mt-1 truncate" title={appointment.reason}>
                          {appointment.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};





