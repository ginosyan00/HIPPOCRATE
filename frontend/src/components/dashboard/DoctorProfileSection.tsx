import React, { useState, useEffect } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { AvatarUpload } from './AvatarUpload';
import { User } from '../../types/api.types';

interface DoctorProfileSectionProps {
  doctor: User | undefined;
  onUpdate: (data: Partial<User>) => Promise<void>;
  onAvatarUpload?: (avatar: string) => Promise<void>;
  isLoading?: boolean;
  isAvatarLoading?: boolean;
  isEditingSelf?: boolean; // Флаг: врач редактирует себя или клиника редактирует врача
}

/**
 * DoctorProfileSection Component
 * Секция для редактирования профиля врача
 */
export const DoctorProfileSection: React.FC<DoctorProfileSectionProps> = ({ 
  doctor, 
  onUpdate,
  onAvatarUpload,
  isLoading = false,
  isAvatarLoading = false,
  isEditingSelf = true, // По умолчанию врач редактирует себя
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    dateOfBirth: '',
    gender: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(doctor?.avatar || null);

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        licenseNumber: doctor.licenseNumber || '',
        experience: doctor.experience?.toString() || '',
        dateOfBirth: doctor.dateOfBirth 
          ? new Date(doctor.dateOfBirth).toISOString().split('T')[0]
          : '',
        gender: doctor.gender || '',
      });
      setAvatarPreview(doctor.avatar || null);
    }
  }, [doctor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (formData.experience && (isNaN(Number(formData.experience)) || Number(formData.experience) < 0 || Number(formData.experience) > 70)) {
      newErrors.experience = 'Опыт должен быть числом от 0 до 70';
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
      const updateData: Partial<User> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        specialization: formData.specialization || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        experience: formData.experience ? Number(formData.experience) : undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: formData.gender || undefined,
      };

      // Проверяем, изменился ли avatar (включая удаление)
      // Сравниваем текущее значение avatarPreview с оригинальным avatar доктора
      const originalAvatar = doctor?.avatar || null;
      const avatarChanged = avatarPreview !== originalAvatar;

      // Если avatar изменился, добавляем его в updateData
      if (avatarChanged) {
        // Если avatar был удален (null или пустая строка), устанавливаем пустую строку
        // Иначе устанавливаем новое значение
        updateData.avatar = avatarPreview !== null && avatarPreview !== undefined ? avatarPreview : '';
      }

      // Удаляем undefined поля
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof User] === undefined) {
          delete updateData[key as keyof User];
        }
      });

      // Если avatar изменился (включая удаление), сначала сохраняем его через отдельный обработчик
      if (avatarChanged && onAvatarUpload) {
        try {
          // Передаем пустую строку если avatar удален, иначе preview
          await onAvatarUpload(avatarPreview || '');
        } catch (avatarErr) {
          console.error('Ошибка при загрузке/удалении аватара:', avatarErr);
          throw avatarErr;
        }
      }
      
      // Затем обновляем остальные данные
      await onUpdate(updateData);
    } catch (err: any) {
      // Ошибки обрабатываются в родительском компоненте
      console.error('Ошибка обновления профиля:', err);
    }
  };

  // Определяем заголовок карточки в зависимости от контекста
  const cardTitle = isEditingSelf ? 'Мой профиль' : `Профиль врача: ${doctor?.name || ''}`;

  return (
    <Card title={cardTitle} padding="lg">
      {/* Avatar Upload Section */}
      {onAvatarUpload && (
        <div className="mb-6 pb-6 border-b border-stroke">
          <h3 className="text-sm font-medium text-text-50 mb-4">Фото профиля</h3>
          <AvatarUpload
            currentAvatar={avatarPreview !== undefined ? avatarPreview : doctor?.avatar}
            onUpload={(avatar) => {
              // Обновляем preview (null для удаления, строка для нового изображения)
              // Сохранение произойдет при нажатии "Сохранить изменения"
              setAvatarPreview(avatar || null);
            }}
            isLoading={isAvatarLoading}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Имя"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
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

          <Input
            label="Специализация"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            error={errors.specialization}
            placeholder="Например: Стоматолог-терапевт"
          />

          <Input
            label="Номер лицензии"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            error={errors.licenseNumber}
            placeholder="Номер лицензии"
          />

          <Input
            label="Опыт работы (лет)"
            name="experience"
            type="number"
            value={formData.experience}
            onChange={handleChange}
            error={errors.experience}
            placeholder="0"
            min={0}
            max={70}
          />

          <Input
            label="Дата рождения"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            error={errors.dateOfBirth}
          />

          <div>
            <label className="block text-sm font-normal text-text-10 mb-2">
              Пол
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm font-normal focus:outline-none focus:border-main-100 transition-smooth"
            >
              <option value="">Не указано</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="other">Другое</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-stroke">
          <Button type="submit" variant="primary" size="md" isLoading={isLoading} disabled={isLoading}>
            Сохранить изменения
          </Button>
        </div>
      </form>
    </Card>
  );
};

