import React from 'react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { DoctorScheduleEditor } from '../../components/dashboard/DoctorScheduleEditor';
import { useDoctorSchedule, useUpdateDoctorSchedule } from '../../hooks/useDoctor';

// Import icons
import calendarIcon from '../../assets/icons/calendar.svg';

/**
 * DoctorGraphicsPage
 * Страница для управления расписанием врача
 * Врач может установить и обновить свой рабочий график
 */
export const DoctorGraphicsPage: React.FC = () => {
  // Загружаем расписание врача
  const { data: schedule, isLoading: isLoadingSchedule } = useDoctorSchedule();
  const updateScheduleMutation = useUpdateDoctorSchedule();

  const handleUpdateSchedule = async (scheduleData: Array<{
    dayOfWeek: number;
    startTime: string | null;
    endTime: string | null;
    isWorking: boolean;
  }>) => {
    await updateScheduleMutation.mutateAsync(scheduleData);
  };

  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-50 mb-2">
            <span className="flex items-center gap-2">
              Рабочее расписание
              <img src={calendarIcon} alt="Календарь" className="w-6 h-6" />
            </span>
          </h1>
          <p className="text-sm text-text-10">
            Установите свой еженедельный график работы. Пациенты смогут записаться только в указанное время.
          </p>
        </div>

        {/* Расписание врача */}
        <DoctorScheduleEditor
          schedule={schedule}
          onUpdate={handleUpdateSchedule}
          isLoading={updateScheduleMutation.isPending || isLoadingSchedule}
        />
      </div>
    </NewDashboardLayout>
  );
};

