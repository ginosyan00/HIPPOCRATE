import React from 'react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { DoctorAppointmentsSection } from '../../components/dashboard/DoctorAppointmentsSection';

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
  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-100">Мои приёмы</h1>
          <p className="text-text-10 text-sm mt-1">
            Управление всеми вашими приёмами - просмотр, создание и изменение статусов
          </p>
        </div>

        {/* Appointments Section with all functionality */}
        <DoctorAppointmentsSection />
      </div>
    </NewDashboardLayout>
  );
};

