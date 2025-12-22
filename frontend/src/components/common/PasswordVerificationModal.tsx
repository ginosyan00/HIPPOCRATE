import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { authService } from '../../services/auth.service';

interface PasswordVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * PasswordVerificationModal Component
 * Модальное окно для проверки пароля при доступе к защищенным разделам
 */
export const PasswordVerificationModal: React.FC<PasswordVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.verifyPassword(password);
      // Сохраняем подтверждение в sessionStorage
      sessionStorage.setItem('analytics_password_verified', 'true');
      setPassword('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('🔴 [PASSWORD VERIFICATION] Ошибка проверки пароля:', err);
      setError(err.response?.data?.message || err.message || 'Неверный пароль');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Подтверждение доступа"
      size="md"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            size="md"
          >
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!password || isLoading}
            size="md"
          >
            Подтвердить
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-text-50">
            Для доступа к разделу Analytics требуется подтверждение пароля.
            Пожалуйста, введите ваш пароль для продолжения.
          </p>
        </div>

        <Input
          label="Пароль"
          type="password"
          placeholder="Введите ваш пароль"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          error={error}
          required
          autoFocus
          autoComplete="current-password"
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
};

