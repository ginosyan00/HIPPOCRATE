import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { treatmentCategoryService } from '../services/treatment-category.service';
import { TreatmentCategory, CreateTreatmentCategoryRequest, UpdateTreatmentCategoryRequest } from '../types/api.types';
import { toast } from 'react-hot-toast';

/**
 * React Query Hook для получения категорий лечения
 */
export function useTreatmentCategories() {
  return useQuery<TreatmentCategory[]>({
    queryKey: ['treatment-categories'],
    queryFn: () => treatmentCategoryService.getCategories(),
    staleTime: 300000, // 5 минут - категории не меняются часто
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * React Query Hook для получения категорий лечения конкретного врача
 * @param doctorId - ID врача (опционально, если не указан - запрос не выполняется)
 */
export function useDoctorTreatmentCategories(doctorId: string | null | undefined) {
  return useQuery<TreatmentCategory[]>({
    queryKey: ['doctor-treatment-categories', doctorId],
    queryFn: () => {
      if (!doctorId) {
        throw new Error('Doctor ID is required');
      }
      return treatmentCategoryService.getDoctorCategories(doctorId);
    },
    enabled: !!doctorId, // Запрос выполняется только если doctorId указан
    staleTime: 300000, // 5 минут - категории не меняются часто
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Hook для создания категории лечения
 */
export function useCreateTreatmentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTreatmentCategoryRequest) => 
      treatmentCategoryService.createCategory(data),
    onSuccess: () => {
      // Инвалидируем кеш категорий для обновления списка
      queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
    },
    onError: (error: any) => {
      console.error('❌ [TREATMENT CATEGORY] Ошибка создания категории:', error);
      toast.error(error.message || 'Ошибка при создании категории');
    },
  });
}

/**
 * Hook для обновления категории лечения
 */
export function useUpdateTreatmentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTreatmentCategoryRequest }) =>
      treatmentCategoryService.updateCategory(id, data),
    onSuccess: () => {
      // Инвалидируем кеш категорий для обновления списка
      queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
    },
    onError: (error: any) => {
      console.error('❌ [TREATMENT CATEGORY] Ошибка обновления категории:', error);
      toast.error(error.message || 'Ошибка при обновлении категории');
    },
  });
}

/**
 * Hook для удаления категории лечения
 */
export function useDeleteTreatmentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => treatmentCategoryService.deleteCategory(id),
    onSuccess: () => {
      // Инвалидируем кеш категорий для обновления списка
      queryClient.invalidateQueries({ queryKey: ['treatment-categories'] });
    },
    onError: (error: any) => {
      console.error('❌ [TREATMENT CATEGORY] Ошибка удаления категории:', error);
      toast.error(error.message || 'Ошибка при удалении категории');
    },
  });
}

/**
 * Hook для обновления категорий врача
 * @param doctorId - ID врача
 */
export function useUpdateDoctorCategories(doctorId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryIds: string[]) => {
      if (!doctorId) {
        throw new Error('Doctor ID is required');
      }
      return treatmentCategoryService.updateDoctorCategories(doctorId, categoryIds);
    },
    onSuccess: (_, categoryIds) => {
      // Инвалидируем кеш категорий врача для обновления списка
      queryClient.invalidateQueries({ queryKey: ['doctor-treatment-categories', doctorId] });
      console.log('✅ [DOCTOR CATEGORIES] Категории врача успешно обновлены:', categoryIds.length);
    },
    onError: (error: any) => {
      console.error('❌ [DOCTOR CATEGORIES] Ошибка обновления категорий врача:', error);
      toast.error(error.message || 'Ошибка при обновлении категорий');
    },
  });
}
