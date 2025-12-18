import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Card, Button, Spinner } from '../../components/common';
import { PatientAppointmentsStats } from '../../components/dashboard/PatientAppointmentsStats';
import { PatientMiniChart } from '../../components/dashboard/PatientMiniChart';
import { DailyTipCard } from '../../components/public/DailyTipCard';
import { useAuthStore } from '../../store/useAuthStore';
import { usePatientAppointments } from '../../hooks/usePatientAppointments';
import { useUnreadNotificationsCount, useMarkAllNotificationsAsRead } from '../../hooks/useNotifications';
import { formatAppointmentDate, formatAppointmentTime } from '../../utils/dateFormat';

// Import icons
import userIcon from '../../assets/icons/user.svg';
import notificationIcon from '../../assets/icons/notification.svg';
import plusIcon from '../../assets/icons/plus.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import doctorIcon from '../../assets/icons/doctor.svg';
import mapPinIcon from '../../assets/icons/map-pin.svg';
import checkIcon from '../../assets/icons/check.svg';
import clockIcon from '../../assets/icons/clock.svg';
import hospitalIcon from '../../assets/icons/hospital.svg';
import pharmacyIcon from '../../assets/icons/pharmacy.svg';
import messageIcon from '../../assets/icons/message.svg';
import phoneIcon from '../../assets/icons/phone.svg';

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const { data: appointmentsData, isLoading: isLoadingAppointments } = usePatientAppointments({
    limit: 100, // Больше данных для графиков и статистики
  });

  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  // Backend возвращает { appointments: [...], meta: {...} }, а не { data: [...] }
  const appointments = (appointmentsData as any)?.appointments || [];

  // Debug: Проверяем appointments и amount
  React.useEffect(() => {
    console.log('🔵 [PatientDashboard] All appointments:', appointments);
    console.log('🔵 [PatientDashboard] Completed appointments:', appointments.filter((apt: any) => apt.status === 'completed'));
    console.log('🔵 [PatientDashboard] Appointments with amount:', appointments.filter((apt: any) => apt.amount && apt.amount > 0));
    console.log('🔵 [PatientDashboard] Completed with amount:', appointments.filter((apt: any) => apt.status === 'completed' && apt.amount && apt.amount > 0));
  }, [appointments]);

  // Разделяем appointments на предстоящие и завершенные
  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (apt: any) => new Date(apt.appointmentDate) >= now && apt.status !== 'cancelled'
  );

  // Форматирование даты и времени - используем утилиту для правильного форматирования
  // Это исправляет проблемы с часовыми поясами при отображении времени приема
  const formatDate = (dateString: string) => {
    return formatAppointmentDate(dateString, 'short');
  };

  const formatTime = (dateString: string) => {
    return formatAppointmentTime(dateString, 'short');
  };


  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <Card padding="lg" className="bg-main-10 border-main-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-text-50 mb-2">
                Здравствуйте, {user?.name}!
              </h1>
              <p className="text-sm text-text-10">
                Рады видеть вас снова. У вас <strong className="text-main-100">{upcomingAppointments.length}</strong> предстоящих {upcomingAppointments.length === 1 ? 'запись' : 'записей'}.
              </p>
              {upcomingAppointments.length > 0 && (
                <p className="text-xs text-text-10 mt-2">
                  Ближайшая запись: {formatDate(upcomingAppointments[0]?.appointmentDate)} в {formatTime(upcomingAppointments[0]?.appointmentDate)}
                </p>
              )}
            </div>
            <div className="hidden md:block">
              {user?.avatar ? (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-stroke">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-stroke bg-main-10 flex items-center justify-center">
                  {user?.name?.charAt(0) ? (
                    <span className="text-3xl md:text-4xl text-main-100 font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                  ) : (
                    <img src={userIcon} alt="User" className="w-10 h-10 md:w-12 md:h-12" />
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Совет дня */}
        <DailyTipCard />

        {/* Расширенная статистика */}
        <PatientAppointmentsStats
          appointments={appointments}
          isLoading={isLoadingAppointments}
        />

        {/* Мини-графики */}
        {appointments.length > 0 && (
          <PatientMiniChart 
            appointments={appointments} 
            isLoading={isLoadingAppointments}
          />
        )}

        {/* Уведомления карточка */}
        {unreadCount > 0 && (
          <Card padding="lg" className="border-stroke">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-main-10 rounded-lg flex items-center justify-center">
                  <img src={notificationIcon} alt="Уведомления" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-50">
                    {unreadCount} {unreadCount === 1 ? 'новое уведомление' : unreadCount < 5 ? 'новых уведомления' : 'новых уведомлений'}
                  </h3>
                  <p className="text-sm text-text-10">У вас есть непрочитанные уведомления</p>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => markAllAsReadMutation.mutate({})}
                isLoading={markAllAsReadMutation.isPending}
              >
                Прочитать все
              </Button>
            </div>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 space-y-6">
            <Card padding="lg" className="border-stroke">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-text-50 mb-1">Предстоящие записи</h2>
                  <p className="text-xs text-text-10">Ваши ближайшие приемы</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/patient/clinics')} className="flex items-center gap-2">
                  <img src={plusIcon} alt="Добавить" className="w-4 h-4" />
                  Записаться
                </Button>
              </div>

              {isLoadingAppointments ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-text-10">
                  <div className="flex justify-center mb-2">
                    <img src={calendarIcon} alt="Календарь" className="w-12 h-12 opacity-50" />
                  </div>
                  <p className="text-sm mb-4">Нет предстоящих записей</p>
                  <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/patient/clinics')}>
                    Записаться на прием
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment: any) => (
                    <Card
                      key={appointment.id}
                        className="border-stroke hover:border-main-100 transition-all"
                        padding="md"
                      >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-main-10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <img src={doctorIcon} alt="Врач" className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-text-50 text-base mb-1">
                              {appointment.doctor?.name || 'Врач'}
                            </h3>
                            <p className="text-xs font-medium text-main-100 mb-1">
                              {appointment.doctor?.specialization || 'Специализация не указана'}
                            </p>
                            <p className="text-xs text-text-10 flex items-center gap-1">
                              <img src={mapPinIcon} alt="Местоположение" className="w-3 h-3" />
                              {appointment.clinic?.name || 'Клиника'}
                            </p>
                            {appointment.reason && (
                              <p className="text-xs text-text-10 mt-1 line-clamp-1">
                                <span className="font-medium">Причина:</span> {appointment.reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="bg-main-10 px-3 py-2 rounded-lg mb-2">
                            <p className="text-sm font-bold text-main-100">
                              {formatDate(appointment.appointmentDate)}
                            </p>
                            <p className="text-xs font-medium text-main-100">{formatTime(appointment.appointmentDate)}</p>
                          </div>
                          <span
                            className={`inline-block px-3 py-1 text-xs font-medium rounded ${
                              appointment.status === 'confirmed'
                                ? 'bg-main-10 text-main-100'
                                : appointment.status === 'pending'
                                ? 'bg-main-10 text-text-50'
                                : 'bg-bg-primary text-text-10'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              {appointment.status === 'confirmed' && <img src={checkIcon} alt="Подтверждено" className="w-3 h-3" />}
                              {appointment.status === 'pending' && <img src={clockIcon} alt="Ожидает" className="w-3 h-3" />}
                              {appointment.status === 'confirmed'
                                ? 'Подтверждено'
                                : appointment.status === 'pending'
                                ? 'Ожидает'
                                : appointment.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>

          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card padding="lg" className="border-stroke">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-text-50 mb-1">Быстрые действия</h2>
                <p className="text-xs text-text-10">Часто используемые функции</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard/patient/clinics')}
                  className="w-full p-4 border border-stroke rounded-lg hover:border-main-100 hover:bg-main-10 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-main-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img src={hospitalIcon} alt="Клиника" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-text-50 text-sm mb-1">Выбрать клинику</h3>
                      <p className="text-xs text-text-10">Просмотреть все доступные клиники</p>
                    </div>
                  </div>
                </button>

                <button
                  className="w-full p-4 border border-stroke rounded-lg hover:border-main-100 hover:bg-main-10 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-main-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img src={pharmacyIcon} alt="Рецепты" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-text-50 text-sm mb-1">Рецепты</h3>
                      <p className="text-xs text-text-10">Активные назначения</p>
                    </div>
                  </div>
                </button>

                <button
                  className="w-full p-4 border border-stroke rounded-lg hover:border-main-100 hover:bg-main-10 transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-main-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <img src={messageIcon} alt="Консультация" className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-text-50 text-sm mb-1">Консультация</h3>
                      <p className="text-xs text-text-10">Задать вопрос</p>
                    </div>
                  </div>
                </button>
              </div>
            </Card>

            {/* Contact Support */}
            <Card className="bg-main-10 border-main-100" padding="lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-main-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <img src={phoneIcon} alt="Телефон" className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-text-50 text-base mb-2">Нужна помощь?</h3>
                <p className="text-xs text-text-10 mb-4">
                  Свяжитесь с нами в любое время
                </p>
                <Button variant="primary" size="sm" className="w-full">
                  Позвонить
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </NewDashboardLayout>
  );
};
