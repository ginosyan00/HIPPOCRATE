import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificateService } from '../services/certificate.service';
import { Certificate } from '../types/api.types';
import { toast } from 'react-hot-toast';

/**
 * React Query hooks для работы с сертификатами
 */

/**
 * Получить все сертификаты клиники
 */
export function useCertificates() {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateService.getCertificates(),
  });
}

/**
 * Получить сертификат по ID
 */
export function useCertificate(id: string) {
  return useQuery({
    queryKey: ['certificates', id],
    queryFn: () => certificateService.getCertificate(id),
    enabled: !!id,
  });
}

/**
 * Создать новый сертификат
 */
export function useCreateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (certificateData: Omit<Certificate, 'id' | 'clinicId' | 'createdAt' | 'updatedAt' | 'isVerified'>) =>
      certificateService.createCertificate(certificateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Сертификат успешно добавлен');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при добавлении сертификата');
    },
  });
}

/**
 * Обновить сертификат
 */
export function useUpdateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Certificate, 'id' | 'clinicId' | 'createdAt' | 'updatedAt'>> }) =>
      certificateService.updateCertificate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['certificates', variables.id] });
      toast.success('Сертификат успешно обновлен');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при обновлении сертификата');
    },
  });
}

/**
 * Удалить сертификат
 */
export function useDeleteCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => certificateService.deleteCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Сертификат успешно удален');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при удалении сертификата');
    },
  });
}

