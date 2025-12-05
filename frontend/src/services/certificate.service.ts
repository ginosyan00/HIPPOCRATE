import api from './api';
import { ApiResponse, Certificate } from '../types/api.types';

/**
 * Certificate Service
 * API calls для работы с сертификатами клиники
 */

export const certificateService = {
  /**
   * Получить все сертификаты клиники
   */
  async getCertificates(): Promise<Certificate[]> {
    const { data } = await api.get<ApiResponse<Certificate[]>>('/certificates');
    return data.data;
  },

  /**
   * Получить сертификат по ID
   */
  async getCertificate(id: string): Promise<Certificate> {
    const { data } = await api.get<ApiResponse<Certificate>>(`/certificates/${id}`);
    return data.data;
  },

  /**
   * Создать новый сертификат
   */
  async createCertificate(certificateData: Omit<Certificate, 'id' | 'clinicId' | 'createdAt' | 'updatedAt' | 'isVerified'>): Promise<Certificate> {
    const { data } = await api.post<ApiResponse<Certificate>>('/certificates', certificateData);
    return data.data;
  },

  /**
   * Обновить сертификат
   */
  async updateCertificate(id: string, certificateData: Partial<Omit<Certificate, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>>): Promise<Certificate> {
    const { data } = await api.put<ApiResponse<Certificate>>(`/certificates/${id}`, certificateData);
    return data.data;
  },

  /**
   * Удалить сертификат
   */
  async deleteCertificate(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.delete<ApiResponse<{ success: boolean; message: string }>>(`/certificates/${id}`);
    return data.data;
  },
};

