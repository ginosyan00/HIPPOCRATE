import api from './api';
import {
  ApiResponse,
  TreatmentCategory,
  CreateTreatmentCategoryRequest,
  UpdateTreatmentCategoryRequest,
  UpdateDoctorCategoriesRequest,
} from '../types/api.types';

/**
 * Treatment Category Service
 * API calls для работы с категориями лечения клиники
 */
export const treatmentCategoryService = {
  /**
   * Получить все категории лечения клиники
   */
  async getCategories(): Promise<TreatmentCategory[]> {
    const { data } = await api.get<ApiResponse<TreatmentCategory[]>>(
      '/clinic/treatment-categories'
    );
    return data.data;
  },

  /**
   * Получить категорию по ID
   */
  async getCategory(id: string): Promise<TreatmentCategory> {
    const { data } = await api.get<ApiResponse<TreatmentCategory>>(
      `/clinic/treatment-categories/${id}`
    );
    return data.data;
  },

  /**
   * Создать новую категорию лечения
   */
  async createCategory(
    categoryData: CreateTreatmentCategoryRequest
  ): Promise<TreatmentCategory> {
    const { data } = await api.post<ApiResponse<TreatmentCategory>>(
      '/clinic/treatment-categories',
      categoryData
    );
    return data.data;
  },

  /**
   * Обновить категорию лечения
   */
  async updateCategory(
    id: string,
    categoryData: UpdateTreatmentCategoryRequest
  ): Promise<TreatmentCategory> {
    const { data } = await api.put<ApiResponse<TreatmentCategory>>(
      `/clinic/treatment-categories/${id}`,
      categoryData
    );
    return data.data;
  },

  /**
   * Удалить категорию лечения
   */
  async deleteCategory(id: string): Promise<{ message: string }> {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(
      `/clinic/treatment-categories/${id}`
    );
    return data.data;
  },

  /**
   * Получить категории врача
   */
  async getDoctorCategories(doctorId: string): Promise<TreatmentCategory[]> {
    const { data } = await api.get<ApiResponse<TreatmentCategory[]>>(
      `/users/${doctorId}/treatment-categories`
    );
    return data.data;
  },

  /**
   * Обновить категории врача
   */
  async updateDoctorCategories(
    doctorId: string,
    categoryIds: string[]
  ): Promise<{ message: string }> {
    const { data } = await api.put<ApiResponse<{ message: string }>>(
      `/users/${doctorId}/treatment-categories`,
      { categoryIds }
    );
    return data.data;
  },
};
