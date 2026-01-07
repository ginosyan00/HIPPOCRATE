import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { authService } from '../../services/auth.service';

interface AnalyticsPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * AnalyticsPasswordModal Component
 * Модальное окно для ввода Analytics пароля с цифровой клавиатурой
 * Пароль должен состоять только из цифр
 */
export const AnalyticsPasswordModal: React.FC<AnalyticsPasswordModalProps> = ({
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
      console.error('🔴 [ANALYTICS PASSWORD] Ошибка проверки пароля:', err);
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

  const handleNumberClick = (num: string) => {
    if (password.length < 20) {
      // Максимум 20 цифр
      setPassword(prev => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPassword(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPassword('');
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Подтверждение доступа к Analytics"
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
            disabled={!password || isLoading || password.length < 4}
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
            Для доступа к разделу Analytics требуется ввести Analytics пароль.
            Пароль должен состоять только из цифр.
          </p>
        </div>

        {/* Поле для отображения пароля */}
        <div className="mb-4">
          <label className="block text-sm font-normal text-text-10 mb-2">
            Analytics пароль
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={password}
              onChange={(e) => {
                // Разрешаем только цифры
                const value = e.target.value.replace(/\D/g, '').slice(0, 20);
                setPassword(value);
                setError('');
              }}
              placeholder="Введите пароль"
              className="block w-full px-4 py-3 border border-stroke rounded-lg bg-bg-white text-2xl font-mono text-center focus:outline-none focus:ring-2 focus:ring-main-100 focus:border-transparent"
              autoFocus
            />
          </div>
          <p className="text-xs text-text-10 mt-2 text-center">
            {password.length > 0 ? `${password.length} цифр` : 'Минимум 4 цифры'}
          </p>
        </div>

        {/* Цифровая клавиатура */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumberClick(num.toString())}
              disabled={isLoading}
              className="aspect-square bg-bg-primary hover:bg-bg-primary/80 border border-stroke rounded-lg text-2xl font-semibold text-text-100 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {num}
            </button>
          ))}
          {/* Пустая кнопка для выравнивания */}
          <div></div>
          <button
            type="button"
            onClick={() => handleNumberClick('0')}
            disabled={isLoading}
            className="aspect-square bg-bg-primary hover:bg-bg-primary/80 border border-stroke rounded-lg text-2xl font-semibold text-text-100 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            disabled={isLoading || password.length === 0}
            className="aspect-square bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg flex items-center justify-center transition-smooth disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
              />
            </svg>
          </button>
        </div>

        {/* Кнопка очистки */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || password.length === 0}
            className="text-sm text-text-50 hover:text-text-100 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Очистить
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
};






