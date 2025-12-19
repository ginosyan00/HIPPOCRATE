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
