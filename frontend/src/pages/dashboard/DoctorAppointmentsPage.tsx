import React, { useState } from 'react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { DoctorAppointmentsSection } from '../../components/dashboard/DoctorAppointmentsSection';
import { Button } from '../../components/common';
import { CreateAppointmentModal } from '../../components/dashboard/CreateAppointmentModal';
import { useAuthStore } from '../../store/useAuthStore';
import { CalendarPlus } from 'lucide-react';

/**
 * DoctorAppointmentsPage
 * Отдельная страница приёмов для врачей
 * Показывает все приёмы текущего врача с полным функционалом управления:
 * - Просмотр всех приёмов (только для текущего врача)
 * - Фильтрация по статусу, дате, времени, неделе, категории
 * - Статистика по статусам
 * - Создание новых приёмов
 * - Управление статусами (подтверждение, завершение, отмена)
 * - Редактирование суммы для завершенных приёмов
 * - Табличный и карточный вид отображения
 */
export const DoctorAppointmentsPage: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const doctorId = user?.id;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDefaultDate, setCreateModalDefaultDate] = useState<string | undefined>(undefined);

  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-100">Мои приёмы</h1>
            <p className="text-text-10 text-sm mt-1">
              Управление всеми вашими приёмами - просмотр, создание и изменение статусов
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button 
              variant="primary" 
              onClick={() => setIsCreateModalOpen(true)} 
              className="flex items-center gap-3 px-12 py-5 text-xl font-bold shadow-lg hover:shadow-xl transition-all min-w-[220px]"
            >
              <CalendarPlus className="w-7 h-7" />
              Создать приём
            </Button>
          </div>
        </div>

        {/* Appointments Section with all functionality */}
        <DoctorAppointmentsSection 
          onCreateAppointmentClick={() => setIsCreateModalOpen(true)}
          onCreateAppointmentWithDate={(date: string) => {
            setCreateModalDefaultDate(date);
            setIsCreateModalOpen(true);
          }}
        />

        {/* Модальное окно создания приёма */}
        <CreateAppointmentModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateModalDefaultDate(undefined);
          }}
          onSuccess={() => {
            console.log('✅ [DOCTOR APPOINTMENTS] Приём успешно создан');
            setCreateModalDefaultDate(undefined);
          }}
          defaultDoctorId={doctorId}
          defaultDate={createModalDefaultDate}
        />
      </div>
    </NewDashboardLayout>
  );
};

