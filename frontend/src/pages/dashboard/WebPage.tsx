import React, { useRef } from 'react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { ProfileSection, ProfileSectionRef } from '../../components/dashboard/ProfileSection';
import { LogoUpload } from '../../components/dashboard/LogoUpload';
import { HeroImageUpload } from '../../components/dashboard/HeroImageUpload';
import { WorkingHoursEditor, WorkingHoursEditorRef } from '../../components/dashboard/WorkingHoursEditor';
import { CertificatesSection } from '../../components/dashboard/CertificatesSection';
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
    try {
      await uploadLogoMutation.mutateAsync(logo);
      toast.success('Логотип успешно загружен');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при загрузке логотипа');
      throw error;
    }
  };

  const handleUploadHeroImage = async (heroImage: string) => {
    try {
      await uploadHeroImageMutation.mutateAsync(heroImage);
      toast.success('Главное изображение успешно загружено');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при загрузке главного изображения');
      throw error;
    }
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

  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-100">Веб-информация</h1>
            <p className="text-sm text-text-10 mt-1">Управление информацией о клинике для публичного сайта</p>
          </div>
          {/* Кнопка сохранения вверху страницы */}
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveAll}
            isLoading={updateClinicMutation.isPending}
            disabled={updateClinicMutation.isPending}
          >
            Сохранить изменения
          </Button>
        </div>

        {/* Логотип */}
        <Card title="Логотип клиники" padding="lg">
          <LogoUpload
            currentLogo={clinic?.logo || null}
            onUpload={handleUploadLogo}
            isLoading={uploadLogoMutation.isPending}
          />
        </Card>

        {/* Главное изображение */}
        <Card title="Главное изображение" padding="lg">
          <HeroImageUpload
            currentHeroImage={clinic?.heroImage || null}
            onUpload={handleUploadHeroImage}
            isLoading={uploadHeroImageMutation.isPending}
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

        {/* Сертификаты */}
        <CertificatesSection />
      </div>
    </NewDashboardLayout>
  );
};

