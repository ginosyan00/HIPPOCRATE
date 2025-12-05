import api from './api';
import { ApiResponse, Notification, PaginatedResponse } from '../types/api.types';

/**
 * Notification Service
 * API calls для работы с уведомлениями
 */

export const notificationService = {
  /**
   * Получить все уведомления пациента или врача
   */
  async getAll(params?: {
    patientId?: string;
    userId?: string;
    isRead?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: Notification[]; meta: any }> {
    const { data } = await api.get<ApiResponse<{ notifications: Notification[]; meta: any }>>(
      '/notifications',
      { params }
    );
    return data.data;
  },

  /**
   * Получить количество непрочитанных уведомлений
   */
  async getUnreadCount(patientId?: string, userId?: string): Promise<number> {
    const params: any = {};
    if (patientId) params.patientId = patientId;
    if (userId) params.userId = userId;
    const { data } = await api.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count',
      { params }
    );
    return data.data.count;
  },

  /**
   * Получить уведомление по ID
   */
  async getById(id: string, patientId?: string, userId?: string): Promise<Notification> {
    const params: any = {};
    if (patientId) params.patientId = patientId;
    if (userId) params.userId = userId;
    const { data } = await api.get<ApiResponse<Notification>>(`/notifications/${id}`, { params });
    return data.data;
  },

  /**
   * Отметить уведомление как прочитанное
   */
  async markAsRead(id: string, patientId?: string, userId?: string): Promise<Notification> {
    const params: any = {};
    if (patientId) params.patientId = patientId;
    if (userId) params.userId = userId;
    const { data } = await api.patch<ApiResponse<Notification>>(
      `/notifications/${id}/read`,
      {},
      { params }
    );
    return data.data;
  },

  /**
   * Отметить все уведомления как прочитанные
   */
  async markAllAsRead(patientId?: string, userId?: string): Promise<{ count: number }> {
    const params: any = {};
    if (patientId) params.patientId = patientId;
    if (userId) params.userId = userId;
    const { data } = await api.patch<ApiResponse<{ count: number }>>(
      '/notifications/read-all',
      {},
      { params }
    );
    return data.data;
  },

  /**
   * Удалить уведомление
   */
  async delete(id: string, patientId?: string, userId?: string): Promise<void> {
    const params: any = {};
    if (patientId) params.patientId = patientId;
    if (userId) params.userId = userId;
    await api.delete(`/notifications/${id}`, { params });
  },
};

