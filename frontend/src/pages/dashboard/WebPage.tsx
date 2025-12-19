import React, { useRef } from 'react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { ProfileSection, ProfileSectionRef } from '../../components/dashboard/ProfileSection';
import { LogoUpload, LogoUploadRef } from '../../components/dashboard/LogoUpload';
import { HeroImageUpload, HeroImageUploadRef } from '../../components/dashboard/HeroImageUpload';
import { WorkingHoursEditor, WorkingHoursEditorRef } from '../../components/dashboard/WorkingHoursEditor';
import { CertificatesSection } from '../../components/dashboard/CertificatesSection';
import { TreatmentCategoriesSection } from '../../components/dashboard/TreatmentCategoriesSection';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useClinic, useUpdateClinic, useUploadLogo, useUploadHeroImage } from '../../hooks/useClinic';
import { WorkingHours } from '../../types/api.types';
import { toast } from 'react-hot-toast';

/**
 * Web Page
 * Страница управления веб-информацией клиники
 * Включает: логотип, профиль, график работы, сертификаты
 */
export const WebPage: React.FC = () => {
  const { data: clinic, isLoading: clinicLoading } = useClinic();
  const updateClinicMutation = useUpdateClinic();
  const uploadLogoMutation = useUploadLogo();
  const uploadHeroImageMutation = useUploadHeroImage();
  
  // Refs для доступа к методам компонентов
  const profileSectionRef = useRef<ProfileSectionRef>(null);
  const workingHoursEditorRef = useRef<WorkingHoursEditorRef>(null);
  const logoUploadRef = useRef<LogoUploadRef>(null);
  const heroImageUploadRef = useRef<HeroImageUploadRef>(null);

  const handleUpdateClinic = async (data: any) => {
    try {
      await updateClinicMutation.mutateAsync(data);
      toast.success('Профиль успешно обновлен');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении профиля');
      throw error;
    }
  };

  const handleUploadLogo = async (logo: string) => {
    // Цей метод більше не використовується для автоматичного збереження
    // Він залишений для сумісності, але фактичне збереження відбувається в handleSaveAll
  };

  const handleUploadHeroImage = async (heroImage: string) => {
    // Цей метод більше не використовується для автоматичного збереження
    // Він залишений для сумісності, але фактичне збереження відбувається в handleSaveAll
  };

  const handleUpdateWorkingHours = async (workingHours: WorkingHours) => {
    try {
      await updateClinicMutation.mutateAsync({ workingHours });
      toast.success('График работы успешно обновлен');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении графика работы');
      throw error;
    }
  };

  // Общий обработчик сохранения всех изменений
  const handleSaveAll = async () => {
    try {
      // Отримуємо поточні значення логотипу та hero image
      const logoValue = logoUploadRef.current?.getValue() ?? null;
      const heroImageValue = heroImageUploadRef.current?.getValue() ?? null;
      const currentLogo = clinic?.logo ?? null;
      const currentHeroImage = clinic?.heroImage ?? null;

      // Зберігаємо логотип, якщо він змінився
      if (logoValue !== currentLogo) {
        try {
          await uploadLogoMutation.mutateAsync(logoValue || '');
        } catch (err: any) {
          toast.error(err.message || 'Ошибка при сохранении логотипа');
          return;
        }
      }

      // Зберігаємо hero image, якщо воно змінилося
      if (heroImageValue !== currentHeroImage) {
        try {
          await uploadHeroImageMutation.mutateAsync(heroImageValue || '');
        } catch (err: any) {
          toast.error(err.message || 'Ошибка при сохранении главного изображения');
          return;
        }
      }

      // Сохраняем профиль и график работы последовательно
      const profileSuccess = await profileSectionRef.current?.submit();
      const scheduleSuccess = await workingHoursEditorRef.current?.submit();

      if (profileSuccess && scheduleSuccess) {
        toast.success('Все изменения успешно сохранены');
      } else if (!profileSuccess && !scheduleSuccess) {
        toast.error('Ошибка при сохранении изменений');
      } else if (!profileSuccess) {
        toast.error('Ошибка при сохранении профиля');
      } else {
        toast.error('Ошибка при сохранении графика работы');
      }
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при сохранении изменений');
    }
  };

  if (clinicLoading) {
    return (
      <NewDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main-100"></div>
        </div>
      </NewDashboardLayout>
    );
  }

  const handlePreview = () => {
    if (clinic?.slug) {
      // Открываем публичную страницу клиники в новой вкладке
      const previewUrl = `/clinic/${clinic.slug}`;
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Slug клиники не найден. Пожалуйста, сохраните данные клиники.');
    }
  };

  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        {/* Заголовок и кнопки действий */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-100">Веб-информация</h1>
            <p className="text-sm text-text-10 mt-1">Управление информацией о клинике для публичного сайта</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Кнопка Preview - большая и заметная в стиле дизайна сайта */}
            <button
              onClick={handlePreview}
              disabled={!clinic?.slug}
              className={`
                inline-flex items-center justify-center
                px-6 py-3 text-sm font-semibold
                rounded-sm transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-[#00a79d] focus:ring-offset-2
                min-w-[220px]
                ${!clinic?.slug 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-[#00a79d] text-white hover:bg-[#00867E] shadow-figma hover:shadow-figma-md active:bg-[#00645E] active:scale-[0.98]'
                }
              `}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Предварительный Просмотр
            </button>
            {/* Кнопка сохранения вверху страницы */}
            <button
              onClick={handleSaveAll}
              disabled={updateClinicMutation.isPending}
              className={`
                inline-flex items-center justify-center
                px-6 py-3 text-sm font-semibold
                rounded-sm transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-[#00a79d] focus:ring-offset-2
                min-w-[220px]
                ${updateClinicMutation.isPending
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-[#00a79d] text-white hover:bg-[#00867E] shadow-figma hover:shadow-figma-md active:bg-[#00645E] active:scale-[0.98]'
                }
              `}
            >
              {updateClinicMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Сохранение...
                </span>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Сохранить Изменения
                </>
              )}
            </button>
          </div>
        </div>

        {/* Логотип */}
        <Card title="Логотип клиники" padding="lg">
          <LogoUpload
            ref={logoUploadRef}
            currentLogo={clinic?.logo || null}
            onUpload={handleUploadLogo}
            isLoading={updateClinicMutation.isPending}
          />
        </Card>

        {/* Главное изображение */}
        <Card title="Главное изображение" padding="lg">
          <HeroImageUpload
            ref={heroImageUploadRef}
            currentHeroImage={clinic?.heroImage || null}
            onUpload={handleUploadHeroImage}
            isLoading={updateClinicMutation.isPending}
          />
        </Card>

        {/* Профиль */}
        <ProfileSection
          ref={profileSectionRef}
          clinic={clinic}
          onUpdate={handleUpdateClinic}
          isLoading={updateClinicMutation.isPending}
        />

        {/* График работы */}
        <WorkingHoursEditor
          ref={workingHoursEditorRef}
          workingHours={clinic?.workingHours}
          onUpdate={handleUpdateWorkingHours}
          isLoading={updateClinicMutation.isPending}
        />

        {/* Категории лечения */}
        <TreatmentCategoriesSection />

        {/* Сертификаты */}
        <CertificatesSection />
      </div>
    </NewDashboardLayout>
  );
};

