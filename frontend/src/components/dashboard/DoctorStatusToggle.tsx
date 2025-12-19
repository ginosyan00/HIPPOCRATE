import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { User } from '../../types/api.types';
import { useUpdateDoctorStatus } from '../../hooks/useUsers';
import { useUpdateDoctorProfile } from '../../hooks/useDoctor';
import { toast } from 'react-hot-toast';

interface DoctorStatusToggleProps {
  doctor: User;
  isEditingSelf?: boolean; // Если true - врач редактирует себя (может менять статус)
}

/**
 * DoctorStatusToggle Component
 * Компонент для переключения статуса врача (Активен/Неактивен)
 * Доступен для клиники при редактировании врача и для врача в своих настройках
 */
export const DoctorStatusToggle: React.FC<DoctorStatusToggleProps> = ({
  doctor,
  isEditingSelf = false,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'ACTIVE' | 'SUSPENDED' | null>(null);
  const updateStatusMutation = useUpdateDoctorStatus(); // Для клиники
  const updateDoctorProfileMutation = useUpdateDoctorProfile(); // Для врача

  // Только для врачей
  if (doctor.role !== 'DOCTOR') {
    return null;
  }

  const currentStatus = doctor.status || 'ACTIVE';
  const isActive = currentStatus === 'ACTIVE';
  const isSuspended = currentStatus === 'SUSPENDED';

  const handleToggleStatusClick = () => {
    const newStatus = isActive ? 'SUSPENDED' : 'ACTIVE';
    setPendingStatus(newStatus);
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingStatus || isChanging) return;

    try {
      setIsChanging(true);
      setIsConfirmModalOpen(false);
      
      if (isEditingSelf) {
        // Врач меняет свой статус через updateMyProfile
        await updateDoctorProfileMutation.mutateAsync({
          status: pendingStatus,
        });
      } else {
        // Клиника меняет статус врача
        await updateStatusMutation.mutateAsync({
          doctorId: doctor.id,
          status: pendingStatus,
        });
      }
    } catch (error: any) {
      console.error('🔴 [DOCTOR STATUS TOGGLE] Ошибка при изменении статуса:', error);
      toast.error(error.message || 'Ошибка при изменении статуса врача');
    } finally {
      setIsChanging(false);
      setPendingStatus(null);
    }
  };

  const handleCancel = () => {
    setIsConfirmModalOpen(false);
    setPendingStatus(null);
  };

  return (
    <Card title="Статус врача" padding="lg">
      <div className="space-y-4">
        {/* Текущий статус */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-50 mb-1">Текущий статус</p>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {isActive ? '✓ Активен' : '✗ Неактивен'}
              </span>
            </div>
          </div>
        </div>

        {/* Описание */}
        <div className="text-sm text-text-10 space-y-2">
          {isActive ? (
            <p>
              Врач активен. Пациенты могут записываться на приём к этому врачу.
            </p>
          ) : (
            <div className="space-y-1">
              <p className="font-medium text-text-50">
                Врач неактивен (отпуск/недоступен).
              </p>
              <p>
                Все временные слоты заблокированы. Пациенты не смогут записаться на приём к этому врачу.
              </p>
            </div>
          )}
        </div>

        {/* Кнопка переключения */}
        <div className="pt-2 border-t border-stroke">
          <Button
            type="button"
            variant={isActive ? 'danger' : 'primary'}
            size="md"
            onClick={handleToggleStatusClick}
            isLoading={isChanging || (isEditingSelf ? updateDoctorProfileMutation.isPending : updateStatusMutation.isPending)}
            disabled={isChanging || (isEditingSelf ? updateDoctorProfileMutation.isPending : updateStatusMutation.isPending)}
          >
            {isActive 
              ? (isEditingSelf ? 'Перевести себя в статус "Неактивен" (отпуск)' : 'Перевести в статус "Неактивен"')
              : (isEditingSelf ? 'Активировать себя' : 'Активировать врача')
            }
          </Button>
        </div>
      </div>

      {/* Модальное окно подтверждения */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleCancel}
        title={pendingStatus === 'SUSPENDED' ? 'Подтверждение изменения статуса' : 'Активировать врача'}
        size="md"
      >
        <div className="space-y-4">
          {pendingStatus === 'SUSPENDED' ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-2">
                      {isEditingSelf 
                        ? 'Вы уверены, что хотите перевести себя в статус "Неактивен" (отпуск)?'
                        : `Вы уверены, что хотите перевести врача "${doctor.name}" в статус "Неактивен" (отпуск)?`
                      }
                    </p>
                    <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                      <li>Все временные слоты будут заблокированы для бронирования</li>
                      <li>Пациенты не смогут записаться на приём к этому врачу</li>
                      <li>Вы сможете снова активировать себя в любое время</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800 mb-2">
                      {isEditingSelf 
                        ? 'Вы уверены, что хотите активировать себя?'
                        : `Вы уверены, что хотите активировать врача "${doctor.name}"?`
                      }
                    </p>
                    <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                      <li>Временные слоты станут доступны для бронирования</li>
                      <li>Пациенты смогут записаться на приём к этому врачу</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Кнопки действий */}
          <div className="flex justify-end gap-3 pt-4 border-t border-stroke">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCancel}
              disabled={isChanging}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant={pendingStatus === 'SUSPENDED' ? 'danger' : 'primary'}
              size="md"
              onClick={handleConfirm}
              isLoading={isChanging}
              disabled={isChanging}
            >
              {pendingStatus === 'SUSPENDED' 
                ? (isEditingSelf ? 'Перевести в отпуск' : 'Перевести в статус "Неактивен"')
                : (isEditingSelf ? 'Активировать себя' : 'Активировать врача')
              }
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};




