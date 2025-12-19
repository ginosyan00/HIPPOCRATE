import React, { useState, useRef } from 'react';

// Import icons
import plusIcon from '../../assets/icons/plus.svg';
import infoIcon from '../../assets/icons/info.svg';
import { useNavigate } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Button, Input, Card, BackButton, Spinner } from '../../components/common';
import { userService } from '../../services/user.service';
import { clinicService } from '../../services/clinic.service';
import { DoctorScheduleEditor, DoctorScheduleEditorRef } from '../../components/dashboard/DoctorScheduleEditor';
import { useTreatmentCategories } from '../../hooks/useTreatmentCategories';

/**
 * AddDoctorPage
 * Отдельная страница для добавления врача в клинику
 * Доступ: только CLINIC (владелец клиники)
 */
export const AddDoctorPage: React.FC = () => {
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
  
  // Ref для редактора расписания
  const scheduleEditorRef = useRef<DoctorScheduleEditorRef>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔵 [ADD DOCTOR PAGE] Создание врача:', { name, email });

      // Получаем расписание из редактора
      let scheduleData: Array<{
        dayOfWeek: number;
        startTime: string | null;
        endTime: string | null;
        isWorking: boolean;
      }> = [];

      if (scheduleEditorRef.current) {
        scheduleData = scheduleEditorRef.current.getSchedule();
      }

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
        schedule: scheduleData.length > 0 ? scheduleData : undefined,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
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
            <span className="flex items-center gap-2">
              <img src={plusIcon} alt="Добавить" className="w-6 h-6" />
              Добавить врача
            </span>
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

            {/* Категории лечения */}
            <div>
              <h3 className="text-base font-semibold text-text-50 mb-4">
                Категории лечения
              </h3>
              <p className="text-sm text-text-10 mb-4">
                Выберите одну или несколько категорий лечения, которые предоставляет этот врач.
              </p>
              {categoriesLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="space-y-2 border border-stroke rounded-lg p-4 bg-bg-white">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors"
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
                          Длительность по умолчанию: {category.defaultDuration} мин
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <Card className="bg-yellow-50 border-yellow-200" padding="md">
                  <p className="text-yellow-800 text-sm">
                    Нет доступных категорий лечения. Добавьте категории в разделе{' '}
                    <strong>Clinic → Web → Категории лечения</strong>.
                  </p>
                </Card>
              )}
            </div>

            {/* График работы */}
            <div>
              <h3 className="text-base font-semibold text-text-50 mb-4">
                График работы
              </h3>
              <p className="text-sm text-text-10 mb-4">
                Настройте рабочий график врача. Вы можете настроить расписание для каждого дня недели.
              </p>
              <DoctorScheduleEditor
                ref={scheduleEditorRef}
                schedule={[]}
                onUpdate={async () => {
                  // Пустая функция, так как расписание будет сохранено при отправке формы
                }}
                isLoading={false}
                hideSubmitButton={true}
                title="График работы врача"
              />
            </div>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200" padding="md">
              <p className="text-blue-800 text-sm">
                <span className="flex items-center gap-2">
                  <img src={infoIcon} alt="Информация" className="w-4 h-4" />
                  <strong>Информация:</strong> Врач получит доступ к системе с указанными email и паролем.
                </span>
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

