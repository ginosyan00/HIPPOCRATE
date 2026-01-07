import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { User } from '../../types/api.types';
import { useUpdateDoctorStatus } from '../../hooks/useUsers';
import { toast } from 'react-hot-toast';

interface DoctorStatusQuickToggleProps {
  doctor: User;
  size?: 'sm' | 'md';
  variant?: 'button' | 'badge';
}

/**
 * DoctorStatusQuickToggle Component
 * Компактный компонент для быстрого переключения статуса врача из списка
 * Используется в таблице и карточках врачей
 */
export const DoctorStatusQuickToggle: React.FC<DoctorStatusQuickToggleProps> = ({
  doctor,
  size = 'sm',
  variant = 'button',
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'ACTIVE' | 'SUSPENDED' | null>(null);
  const updateStatusMutation = useUpdateDoctorStatus();

  // Проверяем что это врач
  if (!doctor) {
    return <span className="text-xs text-text-10">-</span>;
  }

  // Если не врач, все равно показываем статус (может быть другая роль)
  const currentStatus = doctor.status || 'ACTIVE';
  const isActive = currentStatus === 'ACTIVE';
  
  // Если не врач, показываем только статус без возможности изменения
  if (doctor.role !== 'DOCTOR') {
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${
          isActive
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}
      >
        {isActive ? '✓ Активен' : '✗ Неактивен'}
      </span>
    );
  }

  const handleToggleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем клик на строку/карточку
    const newStatus = isActive ? 'SUSPENDED' : 'ACTIVE';
    setPendingStatus(newStatus);
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingStatus || isChanging) return;

    try {
      setIsChanging(true);
      setIsConfirmModalOpen(false);
      
      // Клиника меняет статус врача
      await updateStatusMutation.mutateAsync({
        doctorId: doctor.id,
        status: pendingStatus,
      });
    } catch (error: any) {
      console.error('🔴 [DOCTOR STATUS QUICK TOGGLE] Ошибка при изменении статуса:', error);
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

  // Если вариант badge - показываем только статус с возможностью клика
  if (variant === 'badge') {
    return (
      <div className="inline-block">
        <button
          type="button"
          onClick={handleToggleStatusClick}
          className={`inline-flex items-center justify-center px-2 py-1 rounded-sm text-xs font-medium transition-smooth hover:opacity-80 cursor-pointer ${
            isActive
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
          }`}
          title={isActive ? 'Нажмите, чтобы перевести в статус "Неактивен"' : 'Нажмите, чтобы активировать'}
          disabled={isChanging || updateStatusMutation.isPending}
          style={{ minWidth: '90px', minHeight: '24px' }}
        >
          {isActive ? '✓ Активен' : '✗ Неактивен'}
        </button>

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
                        Вы уверены, что хотите перевести врача "{doctor.name}" в статус "Неактивен" (отпуск)?
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                        <li>Все временные слоты будут заблокированы для бронирования</li>
                        <li>Пациенты не смогут записаться на приём к этому врачу</li>
                        <li>Врач сможет снова активировать себя в любое время</li>
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
                        Вы уверены, что хотите активировать врача "{doctor.name}"?
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
                  ? 'Перевести в статус "Неактивен"'
                  : 'Активировать врача'
                }
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Если вариант button - показываем кнопку
  return (
    <div className="inline-block">
      <Button
        type="button"
        variant={isActive ? 'danger' : 'primary'}
        size={size}
        onClick={handleToggleStatusClick}
        isLoading={isChanging || updateStatusMutation.isPending}
        disabled={isChanging || updateStatusMutation.isPending}
      >
        {isActive ? 'Деактивировать' : 'Активировать'}
      </Button>

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
                      Вы уверены, что хотите перевести врача "{doctor.name}" в статус "Неактивен" (отпуск)?
                    </p>
                    <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                      <li>Все временные слоты будут заблокированы для бронирования</li>
                      <li>Пациенты не смогут записаться на приём к этому врачу</li>
                      <li>Врач сможет снова активировать себя в любое время</li>
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
                      Вы уверены, что хотите активировать врача "{doctor.name}"?
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
                ? 'Перевести в статус "Неактивен"'
                : 'Активировать врача'
              }
            </Button>
          </div>
          </div>
        </Modal>
    </div>
  );
};











