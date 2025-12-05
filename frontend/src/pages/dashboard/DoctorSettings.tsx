import React from 'react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { DoctorProfileSection } from '../../components/dashboard/DoctorProfileSection';
import { useDoctorProfile, useUpdateDoctorProfile, useUploadDoctorAvatar } from '../../hooks/useDoctor';

/**
 * DoctorSettings Page
 * Страница настроек врача (профиль, фото)
 */
export const DoctorSettings: React.FC = () => {
  const { data: doctor, isLoading: doctorLoading } = useDoctorProfile();
  const updateProfileMutation = useUpdateDoctorProfile();
  const uploadAvatarMutation = useUploadDoctorAvatar();

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      // toast уже показывается в useUpdateDoctorProfile
    } catch (error: any) {
      // toast уже показывается в useUpdateDoctorProfile
      throw error;
    }
  };

  const handleAvatarUpload = async (avatar: string) => {
    try {
      await uploadAvatarMutation.mutateAsync(avatar);
      // toast уже показывается в useUploadDoctorAvatar
    } catch (error: any) {
      // toast уже показывается в useUploadDoctorAvatar
      throw error;
    }
  };

  if (doctorLoading) {
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
          <h1 className="text-2xl font-bold text-text-100">Настройки</h1>
          <p className="text-sm text-text-10 mt-1">Управление профилем и настройками</p>
        </div>

        {/* Профиль врача */}
        <DoctorProfileSection
          doctor={doctor}
          onUpdate={handleUpdateProfile}
          onAvatarUpload={handleAvatarUpload}
          isLoading={updateProfileMutation.isPending}
          isAvatarLoading={uploadAvatarMutation.isPending}
        />
      </div>
    </NewDashboardLayout>
  );
};

