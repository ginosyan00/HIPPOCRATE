import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Button, Card, Spinner, Input } from '../../components/common';
import { PatientAppointmentsTable } from '../../components/dashboard/PatientAppointmentsTable';
import { AppointmentsMonthlyCalendar } from '../../components/dashboard/AppointmentsMonthlyCalendar';
import { AppointmentsWeeklyView } from '../../components/dashboard/AppointmentsWeeklyView';
import { BookNowModal } from '../../components/dashboard/BookNowModal';
import { AppointmentDetailModal } from '../../components/dashboard/AppointmentDetailModal';
import { usePatientAppointments } from '../../hooks/usePatientAppointments';
import { useUpdateAppointmentStatus } from '../../hooks/useAppointments';
import { Appointment } from '../../types/api.types';
import { Calendar, Clock, Filter, Search, CalendarPlus } from 'lucide-react';
import { format } from 'date-fns';

// Import icons
import calendarIcon from '../../assets/icons/calendar.svg';
import analyticsIcon from '../../assets/icons/analytics.svg';
import refreshIcon from '../../assets/icons/refresh.svg';

/**
 * PatientAppointmentsPage
 * Страница записей для пациента с табличным представлением и фильтрами
 */
export const PatientAppointmentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Фильтры из URL параметров
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
  const [dateFilter, setDateFilter] = useState<string>(searchParams.get('date') || '');
  const [timeFilter, setTimeFilter] = useState<string>(searchParams.get('time') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') || '');
  const [categoryInput, setCategoryInput] = useState<string>(searchParams.get('category') || '');

  // Модальное окно создания записи
  const [isBookNowModalOpen, setIsBookNowModalOpen] = useState(false);
  const [createModalDefaultDate, setCreateModalDefaultDate] = useState<string | undefined>(undefined);

  // Модальное окно с деталями записи
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDetailModalOpen, setIsAppointmentDetailModalOpen] = useState(false);

  // Вид отображения (list/monthly/weekly)
  const [viewType, setViewType] = useState<'list' | 'monthly' | 'weekly'>(() => {
    try {
      const saved = localStorage.getItem('patientAppointmentsViewType');
      if (saved && ['list', 'monthly', 'weekly'].includes(saved)) {
        return saved as 'list' | 'monthly' | 'weekly';
      }
    } catch (error) {
      console.error('Ошибка загрузки вида из localStorage:', error);
    }
    return 'list';
  });

  // Сохраняем выбранный вид в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem('patientAppointmentsViewType', viewType);
    } catch (error) {
      console.error('Ошибка сохранения вида в localStorage:', error);
    }
  }, [viewType]);

  // Функция для установки вида
  const handleViewTypeChange = (newViewType: 'list' | 'monthly' | 'weekly') => {
    setViewType(newViewType);
  };

  // Управление статусами
  const [loadingAppointments, setLoadingAppointments] = useState<Record<string, string>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  const isInitialMount = useRef(true);

  // Debounce для категории
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategoryFilter(categoryInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [categoryInput]);

  // Синхронизация фильтров с URL
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (dateFilter) params.set('date', dateFilter);
    if (timeFilter) params.set('time', timeFilter);
    if (categoryFilter) params.set('category', categoryFilter);

    setSearchParams(params, { replace: true });
  }, [statusFilter, dateFilter, timeFilter, categoryFilter, setSearchParams]);

  // Загружаем записи пациента
  const { data, isLoading, isFetching, error, refetch } = usePatientAppointments({
    status: statusFilter || undefined,
    limit: 100,
  });

  const updateStatusMutation = useUpdateAppointmentStatus();

  // Backend возвращает { appointments: [...], meta: {...} }, а не { data: [...] }
  const appointments = (data as any)?.appointments || [];

  // Фильтрация по дате, времени и категории на клиенте
  const filteredAppointments = React.useMemo(() => {
    let filtered = [...appointments];

    // Фильтр по дате
    if (dateFilter) {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        const filterDate = new Date(dateFilter);
        return (
          aptDate.getFullYear() === filterDate.getFullYear() &&
          aptDate.getMonth() === filterDate.getMonth() &&
          aptDate.getDate() === filterDate.getDate()
        );
      });
    }

    // Фильтр по времени
    if (timeFilter) {
      filtered = filtered.filter((apt) => {
        const aptTime = new Date(apt.appointmentDate);
        const [filterHour, filterMinute] = timeFilter.split(':').map(Number);
        return aptTime.getHours() === filterHour && aptTime.getMinutes() === filterMinute;
      });
    }

    // Фильтр по категории (reason)
    if (categoryFilter) {
      filtered = filtered.filter((apt) => {
        const reason = apt.reason?.toLowerCase() || '';
        return reason.includes(categoryFilter.toLowerCase());
      });
    }

    return filtered;
  }, [appointments, dateFilter, timeFilter, categoryFilter]);

  /**
   * Обработчик отмены записи
   */
  const handleCancel = async (id: string) => {
    setErrorMessages((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    setLoadingAppointments((prev) => ({ ...prev, [id]: 'cancelled' }));

    try {
      await updateStatusMutation.mutateAsync({
        id,
        status: 'cancelled',
        cancellationReason: 'Отменено пациентом',
      });

      setLoadingAppointments((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      // Обновляем данные
      refetch();
    } catch (err: any) {
      console.error('❌ [PATIENT APPOINTMENTS] Ошибка отмены записи:', err);
      const errorMessage = err.message || 'Ошибка отмены записи. Попробуйте позже.';
      setErrorMessages((prev) => ({ ...prev, [id]: errorMessage }));

      setLoadingAppointments((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  /**
   * Обработчик успешного создания записи
   */
  const handleAppointmentCreated = () => {
    refetch();
  };

  /**
   * Сброс фильтров
   */
  const handleResetFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setTimeFilter('');
    setCategoryFilter('');
    setCategoryInput('');
    setSearchParams({}, { replace: true });
  };

  if (error && !data) {
    return (
      <NewDashboardLayout>
        <Card className="bg-red-50 border-red-200 p-6">
          <p className="text-red-600 text-sm">Ошибка загрузки: {(error as any).message}</p>
        </Card>
      </NewDashboardLayout>
    );
  }

  return (
    <NewDashboardLayout>
      <div className="space-y-6">
        {/* Индикатор загрузки */}
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-main-100/10 overflow-hidden z-50">
            <div
              className="h-full bg-main-100/40 relative"
              style={{
                width: '25%',
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-50 mb-2">Мои записи</h1>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsBookNowModalOpen(true)}
            className="flex items-center gap-3 px-12 py-5 text-xl font-bold shadow-lg hover:shadow-xl transition-all min-w-[220px]"
          >
            <CalendarPlus className="w-7 h-7" />
            Записаться на прием
          </Button>
        </div>

        {/* Фильтры */}
        <Card padding="lg" className="border border-stroke shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-text-50" />
            <h2 className="text-lg font-semibold text-text-50">Фильтры</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-50 mb-2">Статус</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
              >
                <option value="">Все статусы</option>
                <option value="pending">Ожидает подтверждения</option>
                <option value="confirmed">Подтверждено</option>
                <option value="completed">Завершено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-50 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Дата
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-50 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Время
              </label>
              <input
                type="time"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-50 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Процедура / Причина
              </label>
              <Input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Поиск по процедуре..."
                className="w-full"
              />
            </div>
          </div>

          {(statusFilter || dateFilter || timeFilter || categoryFilter) && (
            <div className="mt-4 pt-4 border-t border-stroke">
              <Button variant="secondary" size="sm" onClick={handleResetFilters} className="flex items-center gap-2">
                <img src={refreshIcon} alt="Сбросить" className="w-4 h-4" />
                Сбросить фильтры
              </Button>
            </div>
          )}
        </Card>

        {/* Переключение видов и отображение записей */}
        {isLoading ? (
          <Card>
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          </Card>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-text-10">
              <div className="flex justify-center mb-3">
                <img src={calendarIcon} alt="Календарь" className="w-16 h-16 opacity-50" />
              </div>
              <p className="text-sm font-medium mb-2">Записей не найдено</p>
              <p className="text-xs mb-4">
                {statusFilter || dateFilter || timeFilter || categoryFilter
                  ? 'Попробуйте изменить фильтры или'
                  : ''}{' '}
                Запишитесь на прием, чтобы увидеть свои записи здесь
              </p>
              <Button 
                variant="primary" 
                onClick={() => setIsBookNowModalOpen(true)}
                className="flex items-center gap-3 px-12 py-5 text-xl font-bold shadow-lg hover:shadow-xl transition-all min-w-[220px]"
              >
                <CalendarPlus className="w-7 h-7" />
                Записаться на прием
              </Button>
            </div>
          </Card>
        ) : viewType === 'monthly' ? (
          <AppointmentsMonthlyCalendar
            appointments={filteredAppointments}
            onAppointmentClick={(appointment) => {
              // При клике на запись в календаре - открываем модальное окно с деталями
              setSelectedAppointment(appointment);
              setIsAppointmentDetailModalOpen(true);
            }}
            onDateClick={(date) => {
              // При клике на ячейку календаря - открываем модальное окно создания записи с предзаполненной датой
              const dateStr = format(date, 'yyyy-MM-dd');
              setCreateModalDefaultDate(dateStr);
              setIsBookNowModalOpen(true);
            }}
            onViewChange={handleViewTypeChange}
            currentView={viewType}
          />
        ) : viewType === 'weekly' ? (
          <AppointmentsWeeklyView
            appointments={filteredAppointments}
            onAppointmentClick={(appointment) => {
              // При клике на запись в недельном виде - открываем модальное окно с деталями
              setSelectedAppointment(appointment);
              setIsAppointmentDetailModalOpen(true);
            }}
            onTimeSlotClick={() => {
              // При клике на временной слот - открываем модальное окно создания записи
              setIsBookNowModalOpen(true);
            }}
            onViewChange={handleViewTypeChange}
            currentView={viewType}
          />
        ) : (
          // List view (table)
          <div className="space-y-4">
            {/* Переключение видов */}
            <Card padding="sm">
              <div className="flex items-center justify-center">
                <div className="flex border border-stroke rounded-sm overflow-hidden">
                  <button
                    onClick={() => handleViewTypeChange('list')}
                    className={`group px-5 py-2.5 text-base font-medium transition-smooth ${
                      viewType === 'list'
                        ? 'bg-main-100 text-white'
                        : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                    }`}
                    title="Таблица"
                  >
                    <span className="flex items-center gap-2">
                      <img 
                        src={analyticsIcon} 
                        alt="Таблица" 
                        className={`w-4 h-4 transition-smooth ${
                          viewType === 'list'
                            ? 'brightness-0 invert'
                            : 'group-hover:brightness-0 group-hover:invert'
                        }`} 
                      />
                      Таблица
                    </span>
                  </button>
                  <button
                    onClick={() => handleViewTypeChange('monthly')}
                    className={`group px-5 py-2.5 text-base font-medium transition-smooth ${
                      (viewType as 'list' | 'monthly' | 'weekly') === 'monthly'
                        ? 'bg-main-100 text-white'
                        : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                    }`}
                    title="Месячный календарь"
                  >
                    <span className="flex items-center gap-2">
                      <img 
                        src={calendarIcon} 
                        alt="Месяц" 
                        className={`w-4 h-4 transition-smooth ${
                          (viewType as 'list' | 'monthly' | 'weekly') === 'monthly'
                            ? 'brightness-0 invert'
                            : 'group-hover:brightness-0 group-hover:invert'
                        }`} 
                      />
                      Месяц
                    </span>
                  </button>
                  <button
                    onClick={() => handleViewTypeChange('weekly')}
                    className={`group px-5 py-2.5 text-base font-medium transition-smooth ${
                      (viewType as 'list' | 'monthly' | 'weekly') === 'weekly'
                        ? 'bg-main-100 text-white'
                        : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                    }`}
                    title="Недельный вид"
                  >
                    <span className="flex items-center gap-2">
                      <img 
                        src={calendarIcon} 
                        alt="Неделя" 
                        className={`w-4 h-4 transition-smooth ${
                          (viewType as 'list' | 'monthly' | 'weekly') === 'weekly'
                            ? 'brightness-0 invert'
                            : 'group-hover:brightness-0 group-hover:invert'
                        }`} 
                      />
                      Неделя
                    </span>
                  </button>
                </div>
              </div>
            </Card>
            <Card padding="md" className="border border-stroke shadow-md">
              <PatientAppointmentsTable
                appointments={filteredAppointments}
                onCancel={handleCancel}
                loadingAppointments={loadingAppointments}
                errorMessages={errorMessages}
              />
            </Card>
          </div>
        )}

        {/* Модальное окно создания записи */}
        <BookNowModal
          isOpen={isBookNowModalOpen}
          onClose={() => {
            setIsBookNowModalOpen(false);
            setCreateModalDefaultDate(undefined);
          }}
          onSuccess={handleAppointmentCreated}
          defaultDate={createModalDefaultDate}
        />

        {/* Модальное окно с деталями записи */}
        <AppointmentDetailModal
          isOpen={isAppointmentDetailModalOpen}
          onClose={() => {
            setIsAppointmentDetailModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
        />
      </div>
    </NewDashboardLayout>
  );
};

