import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Button, Input, Card, BackButton } from '../../components/common';
import { userService } from '../../services/user.service';
import { clinicService } from '../../services/clinic.service';

/**
 * AddDoctorPage
 * Отдельная страница для добавления врача в клинику
 * Доступ: только CLINIC (владелец клиники)
 */
export const AddDoctorPage: React.FC = () => {
  const navigate = useNavigate();
  
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

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔵 [ADD DOCTOR PAGE] Создание врача:', { name, email });

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
      });

      console.log('✅ [ADD DOCTOR PAGE] Врач успешно создан:', createdDoctor.id);

      // Получаем slug клиники для редиректа
      const clinic = await clinicService.getClinic();
      const clinicSlug = clinic.slug;

      // Редирект на публичную страницу врача (landing)
      navigate(`/clinic/${clinicSlug}/doctor/${createdDoctor.id}`);
    } catch (err: any) {
      console.error('🔴 [ADD DOCTOR PAGE] Ошибка:', err.message);
      setError(err.message || 'Ошибка при создании врача');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/doctors');
  };

  return (
    <NewDashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton fallback="/dashboard/doctors" />
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-100 mb-2">
            ➕ Добавить врача
          </h1>
          <p className="text-text-10 text-sm">
            Заполните форму для добавления нового врача в клинику
          </p>
        </div>

        {/* Form */}
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Основная информация */}
            <div>
              <h3 className="text-base font-semibold text-text-50 mb-4">
                Основная информация
              </h3>
              <div className="space-y-4">
                <Input
                  label="ФИО *"
                  placeholder="Арам Григорян"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Дата рождения"
                    type="date"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-text-50 mb-2">
                      Пол
                    </label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value as any)}
                      className="w-full px-4 py-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-main-100 text-sm bg-bg-white"
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
              <h3 className="text-base font-semibold text-text-50 mb-4">
                Профессиональная информация
              </h3>
              <div className="space-y-4">
                <Input
                  label="Специализация *"
                  placeholder="Стоматолог-терапевт"
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200" padding="md">
              <p className="text-blue-800 text-sm">
                <strong>ℹ️ Информация:</strong> Врач получит доступ к системе с указанными email и паролем.
                Рекомендуется сообщить врачу эти данные отдельно.
              </p>
            </Card>

            {/* Error */}
            {error && (
              <Card className="bg-red-50 border-red-200" padding="md">
                <p className="text-red-600 text-sm">{error}</p>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-stroke">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={isLoading} 
                className="flex-1"
              >
                Добавить врача
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </NewDashboardLayout>
  );
};

