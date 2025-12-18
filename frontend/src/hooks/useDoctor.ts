import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../services/doctor.service';
import { useAuthStore } from '../store/useAuthStore';
import { User, DoctorSchedule, UpdateDoctorScheduleRequest } from '../types/api.types';
import { toast } from 'react-hot-toast';

/**
 * React Query hooks для работы с данными врача
 */

/**
 * Получить профиль текущего врача
 */
export function useDoctorProfile() {
  const user = useAuthStore(state => state.user);

  return useQuery({
    queryKey: ['doctor', 'profile', user?.id],
    queryFn: () => doctorService.getMyProfile(),
    enabled: !!user && user.role === 'DOCTOR',
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

/**
 * Обновить профиль текущего врача
 */
export function useUpdateDoctorProfile() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  return useMutation({
    mutationFn: (profile: Partial<User>) => doctorService.updateMyProfile(profile),
    onSuccess: (updatedDoctor) => {
      // Инвалидируем кэш профиля врача
      queryClient.invalidateQueries({ queryKey: ['doctor', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'profile', updatedDoctor.id] });
      
      // Инвалидируем кэш списка врачей (чтобы клиника видела обновления)
      queryClient.invalidateQueries({ queryKey: ['users', 'doctors'] });
      
      // Инвалидируем кэш конкретного пользователя (если клиника просматривает его профиль)
      queryClient.invalidateQueries({ queryKey: ['users', updatedDoctor.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Обновляем данные пользователя в store (важно для сохранения сессии при изменении статуса)
      useAuthStore.setState({ user: updatedDoctor });
      useAuthStore.getState().updateUser(updatedDoctor);
      
      toast.success('Профиль успешно обновлен');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при обновлении профиля');
    },
  });
}

/**
 * Загрузить аватар врача
 */
export function useUploadDoctorAvatar() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  return useMutation({
    mutationFn: (avatar: string) => doctorService.uploadAvatar(avatar),
    onSuccess: (updatedDoctor) => {
      // Инвалидируем кэш профиля врача
      queryClient.invalidateQueries({ queryKey: ['doctor', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'profile', updatedDoctor.id] });
      
      // Инвалидируем кэш списка врачей (чтобы клиника видела обновления)
      queryClient.invalidateQueries({ queryKey: ['users', 'doctors'] });
      
      // Инвалидируем кэш конкретного пользователя
      queryClient.invalidateQueries({ queryKey: ['users', updatedDoctor.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Обновляем данные пользователя в store
      useAuthStore.setState({ user: updatedDoctor });
      
      toast.success('Фото успешно загружено');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при загрузке фото');
    },
  });
}

/**
 * Получить расписание текущего врача
 */
export function useDoctorSchedule() {
  const user = useAuthStore(state => state.user);

  return useQuery({
    queryKey: ['doctor', 'schedule', user?.id],
    queryFn: () => doctorService.getSchedule(),
    enabled: !!user && user.role === 'DOCTOR',
    staleTime: 30 * 1000, // 30 секунд - для быстрой синхронизации
    refetchOnWindowFocus: true, // Обновляем при фокусе окна
    refetchOnMount: true, // Обновляем при монтировании
  });
}

/**
 * Обновить расписание текущего врача
 */
export function useUpdateDoctorSchedule() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  return useMutation({
    mutationFn: (schedule: UpdateDoctorScheduleRequest['schedule']) => 
      doctorService.updateSchedule(schedule),
    onSuccess: () => {
      if (!user?.id) return;

      console.log('🔄 [USE DOCTOR] Инвалидация кэша после обновления расписания врачом:', user.id);

      // Инвалидируем кэш расписания врача (все варианты ключей)
      queryClient.invalidateQueries({ queryKey: ['doctor', 'schedule', user.id] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'schedule'] });
      
      // Инвалидируем кэш расписания для клиники (чтобы клиника видела изменения)
      queryClient.invalidateQueries({ queryKey: ['users', user.id, 'schedule'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'schedule'] });
      
      // Инвалидируем кэш списка врачей (чтобы клиника видела изменения в списке)
      queryClient.invalidateQueries({ queryKey: ['users', 'doctors'] });
      
      // Инвалидируем кэш конкретного пользователя (если клиника просматривает его профиль)
      queryClient.invalidateQueries({ queryKey: ['users', user.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast.success('Расписание успешно обновлено');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при обновлении расписания');
    },
  });
}

