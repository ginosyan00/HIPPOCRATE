import React from 'react';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';
import { useDoctors, useUpdateDoctorStatus } from '../../hooks/useUsers';
import { User, UserStatus } from '../../types/api.types';

/**
 * DoctorsStatusSection Component
 * Секция для управления статусами врачей клиники
 */
export const DoctorsStatusSection: React.FC = () => {
  const { data: doctors, isLoading } = useDoctors();
  const updateStatusMutation = useUpdateDoctorStatus();
  const [updatingDoctorId, setUpdatingDoctorId] = React.useState<string | null>(null);

  const handleStatusToggle = async (doctorId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUpdatingDoctorId(doctorId);
    try {
      await updateStatusMutation.mutateAsync({ 
        doctorId, 
        status: newStatus as 'ACTIVE' | 'SUSPENDED' 
      });
    } catch (error) {
      console.error('Ошибка при изменении статуса врача:', error);
    } finally {
      setUpdatingDoctorId(null);
    }
  };

  if (isLoading) {
    return (
      <Card title="Управление статусами врачей" padding="lg">
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <Card title="Управление статусами врачей" padding="lg">
        <div className="text-center py-8">
          <p className="text-sm text-text-10">В клинике пока нет врачей</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Управление статусами врачей" padding="lg">
      <div className="space-y-4">
        <p className="text-sm text-text-50 mb-4">
          Измените статус врача, чтобы управлять его доступностью для записи пациентов.
        </p>
        
        <div className="space-y-3">
          {doctors.map((doctor: User) => {
            const isActive = doctor.status === 'ACTIVE';
            const isUpdating = updatingDoctorId === doctor.id && updateStatusMutation.isPending;
            
            return (
              <div
                key={doctor.id}
                className="flex items-center justify-between p-4 border border-stroke rounded-lg bg-bg-white hover:bg-bg-primary transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-main-10 flex items-center justify-center flex-shrink-0">
                      {doctor.avatar ? (
                        <img
                          src={doctor.avatar}
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-main-100 font-medium text-sm">
                          {doctor.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-text-100 truncate">
                        {doctor.name}
                      </h3>
                      {doctor.specialization && (
                        <p className="text-sm text-text-50 truncate">
                          {doctor.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 ml-4">
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(doctor.id, doctor.status)}
                    disabled={isUpdating}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 select-none ${
                      isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md active:scale-95'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md active:scale-95'
                    } ${isUpdating ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:scale-105'}`}
                    title={isActive ? 'Кликните, чтобы сделать неактивным' : 'Кликните, чтобы сделать активным'}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {isUpdating ? (
                      <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span className="whitespace-nowrap">{isActive ? 'Активен' : 'Неактивен'}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-stroke">
          <div className="flex items-start gap-2 text-xs text-text-10">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Активен</span>
            </span>
            <span className="mx-2">—</span>
            <span>Врач доступен для записи пациентов</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-text-10 mt-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              <span>Неактивен</span>
            </span>
            <span className="mx-2">—</span>
            <span>Врач недоступен для записи (отпуск, болезнь и т.д.)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
