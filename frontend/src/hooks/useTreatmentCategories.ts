import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treatmentCategoryService } from '../services/treatment-category.service';
import {
  TreatmentCategory,
  CreateTreatmentCategoryRequest,
  UpdateTreatmentCategoryRequest,
} from '../types/api.types';

/**
 * React Query Hooks для категорий лечения
 */

/**
 * Получить все категории лечения клиники
 */
export function useTreatmentCategories() {
  return useQuery({
    queryKey: ['treatment-categories'],
    queryFn: () => treatmentCategoryService.getCategories(),
    staleTime: 60000, // 1 минута
  });
}

/**
 * Получить категории врача
 */
export function useDoctorCategories(doctorId: string) {
  return useQuery({
    queryKey: ['doctor-categories', doctorId],
    queryFn: () => treatmentCategoryService.getDoctorCategories(doctorId),
    enabled: !!doctorId,
    staleTime: 60000, // 1 минута
  });
}

/**
 * Создать категорию лечения
 */
export function useCreateTreatmentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTreatmentCategoryRequest) =>
      treatmentCategoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
    },
  });
}

/**
 * Обновить категорию лечения
 */
export function useUpdateTreatmentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTreatmentCategoryRequest;
    }) => treatmentCategoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-categories'] });
    },
  });
}

/**
 * Удалить категорию лечения
 */
export function useDeleteTreatmentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => treatmentCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-categories'] });
    },
  });
}

/**
 * Обновить категории врача
 */
export function useUpdateDoctorCategories(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryIds: string[]) =>
      treatmentCategoryService.updateDoctorCategories(doctorId, categoryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-categories', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}
