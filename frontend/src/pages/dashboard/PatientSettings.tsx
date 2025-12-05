import React from 'react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { ProfilePictureUpload } from '../../components/patient/ProfilePictureUpload';
import { ProfileInfoSection } from '../../components/patient/ProfileInfoSection';
import { PasswordChangeSection } from '../../components/patient/PasswordChangeSection';
import { useMyProfile, useUpdateMyProfile, useUpdateMyPassword } from '../../hooks/useUsers';
import { toast } from 'react-hot-toast';
import { Spinner } from '../../components/common';

/**
 * PatientSettings Page
 * Страница настроек для пациента - управление личной информацией
 */
export const PatientSettingsPage: React.FC = () => {
  const { data: user, isLoading: isLoadingProfile } = useMyProfile();
  const updateProfileMutation = useUpdateMyProfile();
  const updatePasswordMutation = useUpdateMyPassword();

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      toast.success('Профиль успешно обновлен');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении профиля');
      throw error;
    }
  };

  const handleUpdateAvatar = async (avatar: string) => {
    try {
      await updateProfileMutation.mutateAsync({ avatar });
      toast.success('Фото профиля успешно обновлено');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении фото');
      throw error;
    }
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await updatePasswordMutation.mutateAsync({ currentPassword, newPassword });
      toast.success('Пароль успешно изменен');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при изменении пароля');
      throw error;
    }
  };

  if (isLoadingProfile) {
    return (
      <NewDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </NewDashboardLayout>
    );
  }

  if (!user) {
    return (
      <NewDashboardLayout>
        <div className="text-center py-12">
          <p className="text-text-10">Не удалось загрузить профиль</p>
        </div>
      </NewDashboardLayout>
    );
  }

  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-100">Настройки</h1>
          <p className="text-sm text-text-10 mt-1">
            Управление личной информацией, фото профиля и паролем
          </p>
        </div>

        {/* Фото профиля */}
        <ProfilePictureUpload
          currentAvatar={user.avatar}
          onUpload={handleUpdateAvatar}
          isLoading={updateProfileMutation.isPending}
        />

        {/* Личные данные */}
        <ProfileInfoSection
          user={user}
          onUpdate={handleUpdateProfile}
          isLoading={updateProfileMutation.isPending}
        />

        {/* Изменение пароля */}
        <PasswordChangeSection
          onUpdate={handleUpdatePassword}
          isLoading={updatePasswordMutation.isPending}
        />
      </div>
    </NewDashboardLayout>
  );
};

