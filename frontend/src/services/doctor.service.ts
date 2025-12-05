import api from './api';
import { ApiResponse, User } from '../types/api.types';

/**
 * Doctor Service
 * API calls для работы с данными врача (врач обновляет свои данные)
 */
export const doctorService = {
  /**
   * Получить профиль текущего врача
   */
  async getMyProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/doctor/me');
    return data.data;
  },

  /**
   * Обновить профиль текущего врача
   */
  async updateMyProfile(profile: Partial<User>): Promise<User> {
    const { data } = await api.put<ApiResponse<User>>('/doctor/me', profile);
    return data.data;
  },

  /**
   * Загрузить аватар врача
   */
  async uploadAvatar(avatar: string): Promise<User> {
    const { data } = await api.put<ApiResponse<User>>('/doctor/me', { avatar });
    return data.data;
  },
};

