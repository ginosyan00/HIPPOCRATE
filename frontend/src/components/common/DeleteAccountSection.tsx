import React, { useState } from 'react';
import { Card } from './Card';
import { Button, Modal } from './';
import { toast } from 'react-hot-toast';

interface DeleteAccountSectionProps {
  onDelete: () => Promise<void>;
  isLoading?: boolean;
  userRole?: 'PATIENT' | 'DOCTOR' | 'PARTNER' | 'ADMIN';
}

/**
 * DeleteAccountSection Component
 * Секция для удаления собственного аккаунта
 */
export const DeleteAccountSection: React.FC<DeleteAccountSectionProps> = ({
  onDelete,
  isLoading = false,
  userRole = 'PATIENT',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'УДАЛИТЬ') {
      toast.error('Пожалуйста, введите "УДАЛИТЬ" для подтверждения');
      return;
    }

    try {
      await onDelete();
      toast.success('Аккаунт успешно удален');
      setIsModalOpen(false);
      // Редирект произойдет автоматически через logout в useDeleteMyAccount
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении аккаунта');
    }
  };

  const getRoleText = () => {
    switch (userRole) {
      case 'DOCTOR':
        return 'врача';
      case 'PARTNER':
        return 'партнера';
      case 'ADMIN':
        return 'администратора';
      default:
        return 'пациента';
    }
  };

  return (
    <>
      <Card title="Удаление аккаунта" padding="lg">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">⚠️ Внимание!</h4>
            <p className="text-sm text-red-700 mb-2">
              Удаление аккаунта — это необратимое действие. После удаления вы больше не сможете войти в систему.
            </p>
            <p className="text-sm text-red-700">
              <strong>Важно:</strong> Ваши данные (записи на приём) останутся в клинике и будут доступны администратору.
              Удаляется только ваш аккаунт для входа в систему.
            </p>
          </div>

          <div className="pt-4 border-t border-stroke">
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading}
            >
              Удалить аккаунт
            </Button>
          </div>
        </div>
      </Card>

      {/* Модальное окно подтверждения */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setConfirmText('');
        }}
        title="Подтверждение удаления аккаунта"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium mb-2">
              Вы уверены, что хотите удалить свой аккаунт {getRoleText()}?
            </p>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Вы больше не сможете войти в систему</li>
              <li>Ваши записи на приём останутся в клинике</li>
              <li>Это действие нельзя отменить</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-100 mb-2">
              Для подтверждения введите <strong className="text-red-600">УДАЛИТЬ</strong>:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="УДАЛИТЬ"
              className="w-full px-4 py-2 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-main-100 focus:border-transparent"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-stroke">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                setIsModalOpen(false);
                setConfirmText('');
              }}
              className="flex-1"
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={handleDelete}
              isLoading={isLoading}
              disabled={isLoading || confirmText !== 'УДАЛИТЬ'}
              className="flex-1"
            >
              Удалить аккаунт
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

