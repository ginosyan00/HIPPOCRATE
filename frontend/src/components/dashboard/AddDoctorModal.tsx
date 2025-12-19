import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Input, Card, Spinner } from '../common';
import { userService } from '../../services/user.service';
import { clinicService } from '../../services/clinic.service';
import { useTreatmentCategories } from '../../hooks/useTreatmentCategories';

// Import icons
import plusIcon from '../../assets/icons/plus.svg';
import infoIcon from '../../assets/icons/info.svg';

/**
 * AddDoctorModal Component
 * Модальное окно для добавления врача в клинику
 * Доступ: только DOCTOR (владелец клиники)
 */

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback после успешного создания
}

export const AddDoctorModal: React.FC<AddDoctorModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useTreatmentCategories();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔵 [ADD DOCTOR MODAL] Создание врача:', { name, email });

      const createdDoctor = await userService.createDoctor({
        name,
        email,
        password,
        specialization,
        licenseNumber,
        experience: parseInt(experience),
        phone: phone || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      });

      console.log('✅ [ADD DOCTOR MODAL] Врач успешно создан:', createdDoctor.id);

      // Получаем slug клиники для редиректа
      const clinic = await clinicService.getClinic();
      const clinicSlug = clinic.slug;

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setSpecialization('');
      setLicenseNumber('');
      setExperience('');
      setPhone('');
      setDateOfBirth('');
      setGender('male');
      setSelectedCategoryIds([]);

      // Notify parent
      onSuccess();
      onClose();

      // Редирект на публичную страницу врача (landing)
      navigate(`/clinic/${clinicSlug}/doctor/${createdDoctor.id}`);
    } catch (err: any) {
      console.error('🔴 [ADD DOCTOR MODAL] Ошибка:', err.message);
      setError(err.message || 'Ошибка при создании врача');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Добавить врача">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Основная информация */}
        <div>
          <h3 className="text-sm font-semibold text-text-50 mb-3">Основная информация</h3>
          <div className="space-y-3">
            <Input
              label="ФИО *"
              placeholder="Арам Григорян"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Email *"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <Input
                label="Телефон"
                placeholder="+374 98 123456"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <Input
              label="Пароль *"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              helperText="Минимум 8 символов, 1 заглавная, 1 цифра"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Дата рождения"
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-text-50 mb-2">Пол</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full px-4 py-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-main-100 text-sm"
                >
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                  <option value="other">Другое</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Профессиональная информация */}
        <div>
          <h3 className="text-sm font-semibold text-text-50 mb-3">Профессиональная информация</h3>
          <div className="space-y-3">
            <Input
              label="Специализация *"
              placeholder="Стоматолог-терапевт"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Номер лицензии *"
                placeholder="MD-123456"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                required
              />

              <Input
                label="Опыт работы (лет) *"
                type="number"
                placeholder="5"
                value={experience}
                onChange={e => setExperience(e.target.value)}
                required
                min="0"
                max="70"
              />
            </div>
          </div>
        </div>

        {/* Категории лечения */}
        <div>
          <h3 className="text-sm font-semibold text-text-50 mb-3">Категории лечения</h3>
          {categoriesLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="space-y-2 border border-stroke rounded-lg p-4 bg-bg-white">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategoryIds([...selectedCategoryIds, category.id]);
                      } else {
                        setSelectedCategoryIds(
                          selectedCategoryIds.filter((id) => id !== category.id)
                        );
                      }
                    }}
                    className="mt-1 w-4 h-4 text-main-100 border-stroke rounded focus:ring-main-100"
                  />
                  <div className="flex-1">
                    <div className="text-text-100 font-medium text-sm">{category.name}</div>
                    {category.description && (
                      <div className="text-text-10 text-xs mt-1">{category.description}</div>
                    )}
                    <div className="text-text-50 text-xs mt-1">
                      Длительность: {category.defaultDuration} мин
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="border border-stroke rounded-lg p-4 bg-yellow-50">
              <p className="text-yellow-800 text-sm">
                Нет доступных категорий лечения. Добавьте категории в разделе{' '}
                <strong>Clinic → Web → Категории лечения</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200" padding="sm">
          <p className="text-blue-800 text-xs">
            <span className="flex items-center gap-2">
              <img src={infoIcon} alt="Информация" className="w-4 h-4" />
              <strong>Информация:</strong> Врач получит доступ к системе с указанными email и паролем.
            </span>
            Рекомендуется сообщить врачу эти данные отдельно.
          </p>
        </Card>

        {/* Error */}
        {error && (
          <Card className="bg-red-50 border-red-200" padding="sm">
            <p className="text-red-600 text-xs">{error}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
            Добавить врача
          </Button>
        </div>
      </form>
    </Modal>
  );
};


