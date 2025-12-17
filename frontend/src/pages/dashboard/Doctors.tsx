import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Button, Input, Card, Spinner, BackButton } from '../../components/common';
import { useDoctors, useDoctorSchedule, useUser, useUpdateUser, useUpdateDoctorSchedule } from '../../hooks/useUsers';
import { useAuthStore } from '../../store/useAuthStore';
import { useClinic } from '../../hooks/useClinic';
import { User } from '../../types/api.types';
import { DoctorScheduleEditor, DoctorScheduleEditorRef } from '../../components/dashboard/DoctorScheduleEditor';
import { DoctorProfileSection, DoctorProfileSectionRef } from '../../components/dashboard/DoctorProfileSection';
import { toast } from 'react-hot-toast';

// Import icons
import searchIcon from '../../assets/icons/search.svg';
import doctorIcon from '../../assets/icons/doctor.svg';
import analyticsIcon from '../../assets/icons/analytics.svg';
import plusIcon from '../../assets/icons/plus.svg';
import phoneIcon from '../../assets/icons/phone.svg';
import mailIcon from '../../assets/icons/mail.svg';
import fileTextIcon from '../../assets/icons/file-text.svg';
import briefcaseIcon from '../../assets/icons/briefcase.svg';
import userIcon from '../../assets/icons/user.svg';

/**
 * Doctors Page
 * Страница для отображения всех врачей клиники с полной информацией
 */
export const DoctorsPage: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Refs для компонентов
  const profileSectionRef = useRef<DoctorProfileSectionRef>(null);
  const scheduleEditorRef = useRef<DoctorScheduleEditorRef>(null);

  // Загружаем врачей и клинику
  const { data: doctorsData, isLoading } = useDoctors();
  const { data: clinic } = useClinic();
  const doctors = doctorsData || [];

  // Загружаем данные выбранного врача
  const { data: selectedDoctorData, isLoading: isLoadingDoctor } = useUser(
    selectedDoctor?.id || ''
  );
  
  // Загружаем расписание выбранного врача
  const { data: doctorSchedule, isLoading: isLoadingSchedule } = useDoctorSchedule(
    selectedDoctor?.id || ''
  );

  // Мутации для обновления
  const updateUserMutation = useUpdateUser();
  const updateScheduleMutation = useUpdateDoctorSchedule(selectedDoctor?.id || '');

  // Проверка: только CLINIC может добавлять врачей
  const canAddDoctors = user?.role === 'CLINIC';

  // Сброс выбранного врача при навигации на /dashboard/doctors через сайдбар
  useEffect(() => {
    // Проверяем, есть ли в location.state флаг для сброса выбора
    const resetSelection = (location.state as any)?.resetSelection;
    if (resetSelection) {
      console.log('🔄 [DOCTORS PAGE] Сброс выбранного врача через сайдбар');
      setSelectedDoctor(null);
      // Очищаем state после использования, чтобы избежать повторных сбросов
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Обработчик клика на врача - показываем настройки и расписание
  const handleDoctorClick = (doctor: User) => {
    setSelectedDoctor(doctor);
  };

  // Обработчик закрытия
  const handleCloseSchedule = () => {
    setSelectedDoctor(null);
  };

  // Обработчик обновления профиля врача
  const handleUpdateProfile = async (data: Partial<User>) => {
    if (!selectedDoctor) return;
    
    try {
      await updateUserMutation.mutateAsync({
        id: selectedDoctor.id,
        data,
      });
      toast.success('Профиль врача успешно обновлен');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении профиля');
      throw error;
    }
  };

  // Обработчик обновления аватара
  const handleAvatarUpload = async (avatar: string) => {
    if (!selectedDoctor) return;
    
    try {
      await updateUserMutation.mutateAsync({
        id: selectedDoctor.id,
        data: { avatar },
      });
      toast.success('Фото врача успешно обновлено');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении фото');
      throw error;
    }
  };

  // Обработчик обновления расписания
  const handleUpdateSchedule = async (scheduleData: Array<{
    dayOfWeek: number;
    startTime: string | null;
    endTime: string | null;
    isWorking: boolean;
  }>) => {
    if (!selectedDoctor) return;
    
    try {
      await updateScheduleMutation.mutateAsync(scheduleData);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении расписания');
      throw error;
    }
  };

  // Обработчик сохранения всех изменений
  const handleSaveAll = async () => {
    if (!selectedDoctor) return;

    setIsSaving(true);
    try {
      // Сохраняем профиль
      const profileSaved = await profileSectionRef.current?.save();
      
      if (profileSaved === false) {
        // Валидация не прошла, не сохраняем расписание
        setIsSaving(false);
        return;
      }
      
      // Сохраняем расписание
      await scheduleEditorRef.current?.save();

      toast.success('Все изменения успешно сохранены');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при сохранении изменений');
    } finally {
      setIsSaving(false);
    }
  };

  // Фильтрация врачей
  const filteredDoctors = useMemo(() => {
    let filtered = [...doctors];

    // Поиск по имени, телефону, email, специальности
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        doctor =>
          doctor.name.toLowerCase().includes(searchLower) ||
          doctor.phone?.toLowerCase().includes(searchLower) ||
          doctor.email.toLowerCase().includes(searchLower) ||
          doctor.specialization?.toLowerCase().includes(searchLower) ||
          doctor.licenseNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по специальности
    if (specializationFilter) {
      filtered = filtered.filter(
        doctor => doctor.specialization === specializationFilter
      );
    }

    // Фильтр по статусу
    if (statusFilter) {
      filtered = filtered.filter(doctor => doctor.status === statusFilter);
    }

    return filtered;
  }, [doctors, search, specializationFilter, statusFilter]);

  // Уникальные специальности для фильтра
  const specializations = useMemo(() => {
    const specs = doctors
      .map(d => d.specialization)
      .filter((spec): spec is string => !!spec);
    return Array.from(new Set(specs)).sort();
  }, [doctors]);


  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-50 text-green-700 border-green-200',
      PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
      REJECTED: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    const labels = {
      ACTIVE: 'Активен',
      PENDING: 'Ожидает',
      SUSPENDED: 'Приостановлен',
      REJECTED: 'Отклонен',
    };
    return (
      <span
        className={`px-2 py-1 border rounded-sm text-xs font-normal ${
          styles[status as keyof typeof styles] || styles.ACTIVE
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  // Если выбран врач, показываем его настройки и расписание
  if (selectedDoctor) {
    const doctor = selectedDoctorData || selectedDoctor;
    const isLoadingDoctorData = isLoadingDoctor || isLoadingSchedule;

    return (
      <NewDashboardLayout>
        <div className="space-y-6">
          {/* Header с кнопкой назад */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleCloseSchedule}
              className="inline-flex items-center gap-2 text-sm font-normal text-text-50 hover:text-main-100 transition-smooth focus:outline-none"
              aria-label="Вернуться к списку"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Назад</span>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-text-100">
                Настройки врача
              </h1>
              <p className="text-text-10 text-sm mt-1">
                {doctor.name} • {doctor.specialization || 'Специализация не указана'}
              </p>
            </div>
          </div>

          {/* Loading */}
          {isLoadingDoctorData && (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {/* Профиль врача */}
          {!isLoadingDoctorData && (
            <>
              <DoctorProfileSection
                ref={profileSectionRef}
                doctor={doctor}
                onUpdate={handleUpdateProfile}
                onAvatarUpload={handleAvatarUpload}
                isLoading={updateUserMutation.isPending}
                isAvatarLoading={updateUserMutation.isPending}
                isEditingSelf={false}
                hideSubmitButton={true}
              />

              {/* Расписание врача с возможностью редактирования */}
              <DoctorScheduleEditor
                ref={scheduleEditorRef}
                schedule={doctorSchedule}
                onUpdate={handleUpdateSchedule}
                isLoading={updateScheduleMutation.isPending || isLoadingSchedule}
                hideSubmitButton={true}
              />

              {/* Общая кнопка сохранения */}
              <div className="flex justify-end pt-4 border-t border-stroke">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveAll}
                  isLoading={isSaving || updateUserMutation.isPending || updateScheduleMutation.isPending}
                  disabled={isSaving || updateUserMutation.isPending || updateScheduleMutation.isPending}
                >
                  Сохранить все изменения
                </Button>
              </div>
            </>
          )}
        </div>
      </NewDashboardLayout>
    );
  }

  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-100">Врачи</h1>
            <p className="text-text-10 text-sm mt-1">
              Всего врачей: {filteredDoctors.length} из {doctors.length}
            </p>
          </div>
          <div className="flex gap-3">
            {/* Переключение вида */}
            <div className="flex border border-stroke rounded-sm overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-normal transition-smooth ${
                  viewMode === 'table'
                    ? 'bg-main-100 text-white'
                    : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                }`}
              >
                <span className="flex items-center gap-2">
                  <img src={analyticsIcon} alt="Таблица" className="w-4 h-4" />
                  Таблица
                </span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 text-sm font-normal transition-smooth ${
                  viewMode === 'cards'
                    ? 'bg-main-100 text-white'
                    : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                }`}
              >
                <span className="flex items-center gap-2">
                  <img src={userIcon} alt="Карточки" className="w-4 h-4" />
                  Карточки
                </span>
              </button>
            </div>
            {canAddDoctors && (
              <Button onClick={() => navigate('/dashboard/doctors/add')} variant="primary">
                <span className="flex items-center gap-2">
                  <img src={plusIcon} alt="Добавить" className="w-4 h-4" />
                  Добавить врача
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card padding="md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Поиск по имени, телефону, email, специальности..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<img src={searchIcon} alt="Search" className="w-4 h-4" />}
            />
            <select
              value={specializationFilter}
              onChange={e => setSpecializationFilter(e.target.value)}
              className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-smooth"
            >
              <option value="">Все специальности</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-smooth"
            >
              <option value="">Все статусы</option>
              <option value="ACTIVE">Активен</option>
              <option value="PENDING">Ожидает</option>
              <option value="SUSPENDED">Приостановлен</option>
              <option value="REJECTED">Отклонен</option>
            </select>
          </div>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && !isLoading && (
          <>
            {filteredDoctors.length === 0 ? (
              <Card>
                <div className="text-center py-12 text-text-10 text-sm">
                  {search || specializationFilter || statusFilter
                    ? 'Врачи не найдены'
                    : 'Нет врачей. Добавьте первого врача!'}
                </div>
              </Card>
            ) : (
              <Card padding="none" className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-bg-primary border-b border-stroke">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
                        Врач
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
                        Телефон
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
                        Специальность
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-50 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-bg-white divide-y divide-stroke">
                    {filteredDoctors.map(doctor => (
                      <tr
                        key={doctor.id}
                        className="hover:bg-bg-primary transition-smooth cursor-pointer"
                        onClick={() => handleDoctorClick(doctor)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-stroke bg-main-10 flex items-center justify-center flex-shrink-0">
                              {doctor.avatar ? (
                                <img
                                  src={doctor.avatar}
                                  alt={doctor.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src={doctorIcon}
                                  alt="Doctor"
                                  className="w-5 h-5"
                                />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-text-100">
                                {doctor.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-text-50">
                            {doctor.phone || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-text-50 truncate max-w-xs">
                            {doctor.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-text-100 font-medium">
                            {doctor.specialization || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(doctor.status)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDoctorClick(doctor);
                            }}
                          >
                            Настройки
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </>
        )}

        {/* Cards View */}
        {viewMode === 'cards' && !isLoading && (
          <>
            {filteredDoctors.length === 0 ? (
              <Card>
                <div className="text-center py-12 text-text-10 text-sm">
                  {search || specializationFilter || statusFilter
                    ? 'Врачи не найдены'
                    : 'Нет врачей. Добавьте первого врача!'}
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.map(doctor => (
                  <Card
                    key={doctor.id}
                    padding="md"
                    className="cursor-pointer hover:border-main-100/30 transition-smooth"
                    onClick={() => handleDoctorClick(doctor)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-stroke bg-main-10 flex items-center justify-center flex-shrink-0">
                          {doctor.avatar ? (
                            <img
                              src={doctor.avatar}
                              alt={doctor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={doctorIcon}
                              alt="Doctor"
                              className="w-7 h-7"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-text-100 truncate">
                            {doctor.name}
                          </h3>
                          <p className="text-xs text-main-100 font-medium truncate">
                            {doctor.specialization || 'Специализация не указана'}
                          </p>
                          <div className="mt-2">{getStatusBadge(doctor.status)}</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        {doctor.phone && (
                          <div className="flex items-center gap-2">
                            <img src={phoneIcon} alt="Телефон" className="w-4 h-4" />
                            <span className="text-text-50">{doctor.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <img src={mailIcon} alt="Email" className="w-4 h-4" />
                          <span className="text-text-50 truncate">
                            {doctor.email}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stroke">
                        <Button
                          size="sm"
                          variant="primary"
                          className="w-full"
                          onClick={e => {
                            e.stopPropagation();
                            handleDoctorClick(doctor);
                          }}
                        >
                          Настройки
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </NewDashboardLayout>
  );
};

