import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Input, Button } from '../common';
import { User } from '../../types/api.types';

interface ProfileInfoSectionProps {
  user: User;
  onUpdate: (data: Partial<User>) => Promise<void>;
  isLoading?: boolean;
}

/**
 * ProfileInfoSection Component
 * Секция для редактирования личных данных пациента
 */
export const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({
  user,
  onUpdate,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split('T')[0]
      : '',
    gender: user.gender || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Проверяем, были ли изменения
    const hasChanges =
      formData.name !== (user.name || '') ||
      formData.email !== (user.email || '') ||
      formData.phone !== (user.phone || '') ||
      formData.dateOfBirth !==
        (user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split('T')[0]
          : '') ||
      formData.gender !== (user.gender || '');

    setIsDirty(hasChanges);
  }, [formData, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибки
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Некорректный формат телефона';
    }

    if (formData.dateOfBirth) {
      const date = new Date(formData.dateOfBirth);
      if (date > new Date()) {
        newErrors.dateOfBirth = 'Дата рождения не может быть в будущем';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onUpdate({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        gender: formData.gender || null,
      });
    } catch (err: any) {
      setErrors({ email: err.message || 'Ошибка при обновлении профиля' });
    }
  };

  return (
    <Card title="Личные данные" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Имя и фамилия"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="Введите ваше имя"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          placeholder="example@email.com"
        />

        <Input
          label="Телефон"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="+374 XX XXX XXX"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Дата рождения"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            error={errors.dateOfBirth}
            max={new Date().toISOString().split('T')[0]}
          />

          <div>
            <label className="block text-sm font-medium text-text-100 mb-2">
              Пол
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-main-100 focus:border-transparent bg-bg-white text-text-100"
            >
              <option value="">Не указано</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="other">Другое</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-stroke">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isLoading || !isDirty}
          >
            Сохранить изменения
          </Button>
        </div>
      </form>
    </Card>
  );
};

