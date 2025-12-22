import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface AnalyticsPasswordSectionProps {
  onUpdate: (password: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * AnalyticsPasswordSection Component
 * Секция для установки/обновления Analytics пароля (только цифры)
 */
export const AnalyticsPasswordSection: React.FC<AnalyticsPasswordSectionProps> = ({
  onUpdate,
  isLoading = false,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    // Проверка на только цифры
    if (password && !/^\d+$/.test(password)) {
      newErrors.password = 'Пароль должен состоять только из цифр';
    }

    // Проверка минимальной длины
    if (password && password.length < 4) {
      newErrors.password = 'Пароль должен содержать минимум 4 цифры';
    }

    // Проверка максимальной длины
    if (password && password.length > 20) {
      newErrors.password = 'Пароль должен содержать максимум 20 цифр';
    }

    // Проверка совпадения паролей
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!validate()) {
      return;
    }

    if (!password) {
      setErrors({ password: 'Введите пароль' });
      return;
    }

    try {
      await onUpdate(password);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setErrors({ password: err.message || 'Ошибка при установке пароля' });
    }
  };

  const handlePasswordChange = (value: string) => {
    // Разрешаем только цифры
    const numericValue = value.replace(/\D/g, '').slice(0, 20);
    setPassword(numericValue);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    // Разрешаем только цифры
    const numericValue = value.replace(/\D/g, '').slice(0, 20);
    setConfirmPassword(numericValue);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  return (
    <Card title="Analytics пароль" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-4">
          <p className="text-sm text-text-50">
            Установите специальный пароль для доступа к разделу Analytics.
            Пароль должен состоять только из цифр (минимум 4, максимум 20).
          </p>
        </div>

        <div>
          <label className="block text-sm font-normal text-text-10 mb-2">
            Analytics пароль <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Введите пароль (только цифры)"
            className={`block w-full px-4 py-2.5 border rounded-sm bg-bg-white text-sm font-mono focus:outline-none transition-smooth ${
              errors.password
                ? 'border-red-500 focus:border-red-500'
                : 'border-stroke focus:border-main-100'
            }`}
          />
          {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
          {!errors.password && password && (
            <p className="mt-1.5 text-xs text-text-10">{password.length} цифр</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-normal text-text-10 mb-2">
            Подтвердите пароль <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            placeholder="Повторите пароль"
            className={`block w-full px-4 py-2.5 border rounded-sm bg-bg-white text-sm font-mono focus:outline-none transition-smooth ${
              errors.confirmPassword
                ? 'border-red-500 focus:border-red-500'
                : 'border-stroke focus:border-main-100'
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {success && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200">
            Analytics пароль успешно установлен!
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-stroke">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={!password || !confirmPassword}
          >
            Установить пароль
          </Button>
        </div>
      </form>
    </Card>
  );
};

