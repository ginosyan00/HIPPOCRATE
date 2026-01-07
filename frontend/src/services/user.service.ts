import api from './api';
import { ApiResponse, User, PaginatedResponse, DoctorSchedule, UpdateDoctorScheduleRequest } from '../types/api.types';

/**
 * User Service
 * API calls для работы с пользователями/сотрудниками
 */

export const userService = {
  /**
   * Получить всех пользователей
   */
  async getAll(params?: { role?: string; page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    const { data } = await api.get<ApiResponse<PaginatedResponse<User>>>('/users', {
      params,
    });
    return data.data;
  },

  /**
   * Получить только врачей
   * @param onlyActive - Если true, возвращает только активных врачей (status: 'ACTIVE')
   *                     По умолчанию false - возвращает всех врачей для управления
   */
  async getDoctors(onlyActive: boolean = false): Promise<User[]> {
    const { data } = await api.get<ApiResponse<User[]>>('/users/doctors', {
      params: { onlyActive },
    });
    return data.data;
  },

  /**
   * Получить пользователя по ID
   */
  async getById(id: string): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  },

  /**
   * Создать пользователя
   */
  async create(user: {
    name: string;
    email: string;
    password: string;
    role: string;
    specialization?: string;
    phone?: string;
  }): Promise<User> {
    const { data } = await api.post<ApiResponse<User>>('/users', user);
    return data.data;
  },

  /**
   * Обновить пользователя
   */
  async update(id: string, user: Partial<User>): Promise<User> {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, user);
    return data.data;
  },

  /**
   * Удалить пользователя
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  /**
   * Получить всех пользователей со статусом PENDING (только для ADMIN)
   */
  async getPendingUsers(): Promise<User[]> {
    console.log('🔵 [USER SERVICE] Запрос pending пользователей');
    const { data } = await api.get<ApiResponse<User[]>>('/users/pending');
    console.log('✅ [USER SERVICE] Получено pending:', data.data.length);
    return data.data;
  },

  /**
   * Одобрить пользователя (PENDING -> ACTIVE) (только для ADMIN)
   */
  async approveUser(id: string): Promise<User> {
    console.log('🔵 [USER SERVICE] Одобрение пользователя:', id);
    const { data } = await api.post<ApiResponse<User>>(`/users/${id}/approve`);
    console.log('✅ [USER SERVICE] Пользователь одобрен');
    return data.data;
  },

  /**
   * Отклонить пользователя (PENDING -> REJECTED) (только для ADMIN)
   */
  async rejectUser(id: string, reason?: string): Promise<User> {
    console.log('🔵 [USER SERVICE] Отклонение пользователя:', id);
    const { data } = await api.post<ApiResponse<User>>(`/users/${id}/reject`, { reason });
    console.log('✅ [USER SERVICE] Пользователь отклонен');
    return data.data;
  },

  /**
   * Создать врача в клинике (только для DOCTOR - владелец клиники)
   */
  async createDoctor(doctor: {
    name: string;
    email: string;
    password: string;
    specialization: string;
    licenseNumber: string;
    experience: number;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    schedule?: Array<{
      dayOfWeek: number;
      startTime: string | null;
      endTime: string | null;
      isWorking: boolean;
    }>;
    categoryIds?: string[];
  }): Promise<User> {
    console.log('🔵 [USER SERVICE] Создание врача для клиники');
    const { data } = await api.post<ApiResponse<User>>('/users/doctors', doctor);
    console.log('✅ [USER SERVICE] Врач успешно создан:', data.data.id);
    return data.data;
  },

  /**
   * Получить профиль текущего пользователя
   */
  async getMyProfile(): Promise<User> {
    console.log('🔵 [USER SERVICE] Получение профиля текущего пользователя');
    const { data } = await api.get<ApiResponse<User>>('/users/me');
    console.log('✅ [USER SERVICE] Профиль получен:', data.data.id);
    return data.data;
  },

  /**
   * Обновить профиль текущего пользователя
   */
  async updateMyProfile(profile: Partial<User>): Promise<User> {
    console.log('🔵 [USER SERVICE] Обновление профиля текущего пользователя');
    const { data } = await api.put<ApiResponse<User>>('/users/me', profile);
    console.log('✅ [USER SERVICE] Профиль обновлен:', data.data.id);
    return data.data;
  },

  /**
   * Изменить пароль текущего пользователя
   */
  async updateMyPassword(currentPassword: string, newPassword: string): Promise<void> {
    console.log('🔵 [USER SERVICE] Изменение пароля текущего пользователя');
    await api.put<ApiResponse<{ message: string }>>('/users/me/password', {
      currentPassword,
      newPassword,
    });
    console.log('✅ [USER SERVICE] Пароль изменен');
  },

  /**
   * Удалить собственный аккаунт
   * Примечание: Данные (appointments) остаются в клинике, удаляется только аккаунт
   */
  async deleteMyAccount(): Promise<void> {
    console.log('🔵 [USER SERVICE] Удаление собственного аккаунта');
    await api.delete<ApiResponse<{ message: string }>>('/users/me');
    console.log('✅ [USER SERVICE] Аккаунт удален');
  },

  /**
   * Получить расписание врача (для клиники)
   */
  async getDoctorSchedule(doctorId: string): Promise<DoctorSchedule[]> {
    console.log('🔵 [USER SERVICE] Получение расписания врача:', doctorId);
    const { data } = await api.get<ApiResponse<DoctorSchedule[]>>(`/users/${doctorId}/schedule`);
    console.log('✅ [USER SERVICE] Расписание врача получено');
    return data.data;
  },

  /**
   * Обновить расписание врача (для клиники)
   */
  async updateDoctorSchedule(doctorId: string, schedule: UpdateDoctorScheduleRequest['schedule']): Promise<DoctorSchedule[]> {
    console.log('🔵 [USER SERVICE] Обновление расписания врача:', doctorId);
    const { data } = await api.put<ApiResponse<DoctorSchedule[]>>(`/users/${doctorId}/schedule`, { schedule });
    console.log('✅ [USER SERVICE] Расписание врача обновлено');
    return data.data;
  },
};


