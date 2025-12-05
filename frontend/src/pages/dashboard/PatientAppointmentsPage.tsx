import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Button, Card, Spinner, Input } from '../../components/common';
import { PatientAppointmentsTable } from '../../components/dashboard/PatientAppointmentsTable';
import { BookNowModal } from '../../components/dashboard/BookNowModal';
import { usePatientAppointments } from '../../hooks/usePatientAppointments';
import { useUpdateAppointmentStatus } from '../../hooks/useAppointments';
import { Appointment } from '../../types/api.types';
import { Calendar, Clock, Filter, Search } from 'lucide-react';

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

  const appointments = data?.appointments || [];

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

  // Статистика
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
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
            <p className="text-text-10 text-sm">
              Всего записей: <strong>{filteredAppointments.length}</strong> из {stats.total}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsBookNowModalOpen(true)}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            📅 Записаться на прием
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card padding="md" className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-center">
              <p className="text-xs text-blue-700 mb-1 font-medium">Всего</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </Card>
          <Card padding="md" className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="text-center">
              <p className="text-xs text-yellow-700 mb-1 font-medium">Ожидают</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </Card>
          <Card padding="md" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-center">
              <p className="text-xs text-green-700 mb-1 font-medium">Подтверждено</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
          </Card>
          <Card padding="md" className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-center">
              <p className="text-xs text-purple-700 mb-1 font-medium">Завершено</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
            </div>
          </Card>
          <Card padding="md" className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-700 mb-1 font-medium">Отменено</p>
              <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
            </div>
          </Card>
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
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                🔄 Сбросить фильтры
              </Button>
            </div>
          )}
        </Card>

        {/* Таблица записей */}
        {isLoading ? (
          <Card>
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          </Card>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-text-10">
              <div className="text-5xl mb-3">📅</div>
              <p className="text-sm font-medium mb-2">Записей не найдено</p>
              <p className="text-xs mb-4">
                {statusFilter || dateFilter || timeFilter || categoryFilter
                  ? 'Попробуйте изменить фильтры или'
                  : ''}{' '}
                Запишитесь на прием, чтобы увидеть свои записи здесь
              </p>
              <Button variant="primary" onClick={() => setIsBookNowModalOpen(true)}>
                📅 Записаться на прием
              </Button>
            </div>
          </Card>
        ) : (
          <Card padding="md" className="border border-stroke shadow-md">
            <PatientAppointmentsTable
              appointments={filteredAppointments}
              onCancel={handleCancel}
              loadingAppointments={loadingAppointments}
              errorMessages={errorMessages}
            />
          </Card>
        )}

        {/* Модальное окно создания записи */}
        <BookNowModal
          isOpen={isBookNowModalOpen}
          onClose={() => setIsBookNowModalOpen(false)}
          onSuccess={handleAppointmentCreated}
        />
      </div>
    </NewDashboardLayout>
  );
};

