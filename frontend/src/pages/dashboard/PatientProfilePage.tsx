import React from 'react';
import { useParams } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Card, BackButton, Spinner } from '../../components/common';
import { Patient, Appointment, AppointmentStatus } from '../../types/api.types';
import { formatAppointmentDateTime } from '../../utils/dateFormat';
import { usePatient } from '../../hooks/usePatients';

/**
 * PatientProfilePage
 * Отдельная страница с полной информацией о пациенте и всей его истории визитов
 */
export const PatientProfilePage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();

  const { data: patient, isLoading, error } = usePatient(patientId || '');

  const getStatusBadge = (status: AppointmentStatus) => {
    const styles = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-main-10 text-main-100 border-main-100/20',
      completed: 'bg-secondary-10 text-secondary-100 border-secondary-100/20',
      cancelled: 'bg-bg-primary text-text-10 border-stroke',
    };
    const labels = {
      pending: 'Ожидает',
      confirmed: 'Подтвержден',
      completed: 'Завершен',
      cancelled: 'Отменен',
    };
    return (
      <span className={`px-2 py-1 border rounded-sm text-xs font-normal ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '-';
    return `${amount.toLocaleString('ru-RU')} ֏`;
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <BackButton fallback="/dashboard/patients" showText />
          <div>
            <h1 className="text-2xl font-semibold text-text-100">Профиль пациента</h1>
            <p className="text-text-10 text-sm mt-1">Полная информация о пациенте и история визитов</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card padding="lg">
            <div className="text-center py-12 text-text-10 text-sm">
              Ошибка загрузки данных пациента
            </div>
          </Card>
        )}

        {/* Patient Data */}
        {patient && (
          <div className="space-y-6">
            {/* Информация о пациенте */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-text-100 mb-6">Личная информация</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-text-10 mb-2">ФИО</p>
                  <p className="text-base text-text-100 font-medium">{patient.name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-10 mb-2">Телефон</p>
                  <p className="text-base text-text-100">{patient.phone}</p>
                </div>
                {patient.email && (
                  <div>
                    <p className="text-xs text-text-10 mb-2">Email</p>
                    <p className="text-base text-text-100">{patient.email}</p>
                  </div>
                )}
                {patient.dateOfBirth && (
                  <div>
                    <p className="text-xs text-text-10 mb-2">Дата рождения</p>
                    <p className="text-base text-text-100">{formatDate(patient.dateOfBirth)}</p>
                  </div>
                )}
                {patient.gender && (
                  <div>
                    <p className="text-xs text-text-10 mb-2">Пол</p>
                    <p className="text-base text-text-100">
                      {patient.gender === 'male' ? 'Мужской' : patient.gender === 'female' ? 'Женский' : 'Другой'}
                    </p>
                  </div>
                )}
                {patient.notes && (
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-xs text-text-10 mb-2">Заметки</p>
                    <p className="text-base text-text-100 whitespace-pre-wrap">{patient.notes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* История визитов */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-text-100 mb-6">
                История визитов ({patient.appointments?.length || 0})
              </h3>

              {!patient.appointments || patient.appointments.length === 0 ? (
                <div className="text-center py-12 text-text-10 text-sm border border-stroke rounded-lg">
                  Нет записей о визитах
                </div>
              ) : (
                <div className="space-y-4">
                  {(patient.appointments as Appointment[]).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-bg-primary border border-stroke rounded-lg p-5 hover:border-main-100/30 transition-smooth"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-base font-medium text-text-100">
                              {formatAppointmentDateTime(appointment.appointmentDate)}
                            </h4>
                            {getStatusBadge(appointment.status)}
                          </div>
                          {appointment.doctor && (
                            <p className="text-sm text-text-50 mb-2">
                              <span className="font-medium">Врач:</span> {appointment.doctor.name}
                              {appointment.doctor.specialization && ` (${appointment.doctor.specialization})`}
                            </p>
                          )}
                          {appointment.reason && (
                            <p className="text-sm text-text-50">
                              <span className="font-medium">Причина:</span> {appointment.reason}
                            </p>
                          )}
                        </div>
                        {appointment.amount && (
                          <div className="text-right ml-4">
                            <p className="text-xs text-text-10 mb-1">Сумма</p>
                            <p className="text-lg font-semibold text-text-100">{formatAmount(appointment.amount)}</p>
                          </div>
                        )}
                      </div>
                      {appointment.notes && (
                        <div className="mt-4 pt-4 border-t border-stroke">
                          <p className="text-xs text-text-10 mb-2 font-medium">Заметки врача:</p>
                          <p className="text-sm text-text-50 whitespace-pre-wrap">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </NewDashboardLayout>
  );
};

