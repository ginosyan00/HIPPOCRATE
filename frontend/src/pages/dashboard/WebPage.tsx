import React from 'react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { ProfileSection } from '../../components/dashboard/ProfileSection';
import { LogoUpload } from '../../components/dashboard/LogoUpload';
import { HeroImageUpload } from '../../components/dashboard/HeroImageUpload';
import { WorkingHoursEditor } from '../../components/dashboard/WorkingHoursEditor';
import { CertificatesSection } from '../../components/dashboard/CertificatesSection';
import { Card } from '../../components/common/Card';
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
        <div>
          <h1 className="text-2xl font-bold text-text-100">Веб-информация</h1>
          <p className="text-sm text-text-10 mt-1">Управление информацией о клинике для публичного сайта</p>
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
          clinic={clinic}
          onUpdate={handleUpdateClinic}
          isLoading={updateClinicMutation.isPending}
        />

        {/* График работы */}
        <WorkingHoursEditor
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

