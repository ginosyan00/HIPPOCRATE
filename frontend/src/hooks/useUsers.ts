import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { User, DoctorSchedule, UpdateDoctorScheduleRequest } from '../types/api.types';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';

/**
 * React Query Hooks для пользователей
 */

export function useUsers(params?: { role?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getAll(params),
    staleTime: 30000,
  });
}

export function useDoctors() {
  return useQuery({
    queryKey: ['users', 'doctors'],
    queryFn: () => userService.getDoctors(),
    staleTime: 60000, // 1 минута
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(state => state.user);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.update(id, data),
    onSuccess: (updatedUser) => {
      // Инвалидируем кэш списка пользователей
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Инвалидируем кэш списка врачей
      queryClient.invalidateQueries({ queryKey: ['users', 'doctors'] });
      
      // Инвалидируем кэш конкретного пользователя
      queryClient.invalidateQueries({ queryKey: ['users', updatedUser.id] });
      
      // Если обновлен врач, инвалидируем его профиль (чтобы врач видел изменения)
      if (updatedUser.role === 'DOCTOR') {
        queryClient.invalidateQueries({ queryKey: ['doctor', 'profile'] });
        queryClient.invalidateQueries({ queryKey: ['doctor', 'profile', updatedUser.id] });
      }

      // Если обновлен текущий пользователь, обновляем store
      if (currentUser && currentUser.id === updatedUser.id) {
        useAuthStore.setState({ user: updatedUser });
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

/**
 * Получить профиль текущего пользователя
 */
export function useMyProfile() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => userService.getMyProfile(),
    staleTime: 30000, // 30 секунд
  });
}

/**
 * Обновить профиль текущего пользователя
 */
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(state => state.user);

  return useMutation({
    mutationFn: (data: Partial<User>) => userService.updateMyProfile(data),
    onSuccess: (updatedUser) => {
      // Инвалидируем кэш профиля
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      
      // Обновляем store с новыми данными пользователя
      if (currentUser) {
        useAuthStore.setState({ user: updatedUser });
      }
    },
  });
}

/**
 * Изменить пароль текущего пользователя
 */
export function useUpdateMyPassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      userService.updateMyPassword(currentPassword, newPassword),
  });
}

/**
 * Удалить собственный аккаунт
 */
export function useDeleteMyAccount() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => userService.deleteMyAccount(),
    onSuccess: () => {
      // Очищаем весь кэш
      queryClient.clear();
      // Выходим из системы
      logout();
      // Мгновенный редирект на главную страницу
      window.location.href = '/';
    },
  });
}

/**
 * Получить расписание врача (для клиники)
 */
export function useDoctorSchedule(doctorId: string) {
  return useQuery({
    queryKey: ['users', doctorId, 'schedule'],
    queryFn: () => userService.getDoctorSchedule(doctorId),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

/**
 * Обновить расписание врача (для клиники)
 */
export function useUpdateDoctorSchedule(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedule: UpdateDoctorScheduleRequest['schedule']) => 
      userService.updateDoctorSchedule(doctorId, schedule),
    onSuccess: () => {
      // Инвалидируем кэш расписания для клиники
      queryClient.invalidateQueries({ queryKey: ['users', doctorId, 'schedule'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'schedule'] });
      
      // Инвалидируем кэш расписания для врача (чтобы врач видел изменения)
      queryClient.invalidateQueries({ queryKey: ['doctor', 'schedule', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'schedule'] });
      
      toast.success('Расписание врача успешно обновлено');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при обновлении расписания врача');
    },
  });
}


