import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Card, Button, Input, Spinner } from '../../components/common';
import { PatientMetricsCards } from '../../components/dashboard/PatientMetricsCards';
import { PatientAnalyticsLineChart } from '../../components/dashboard/PatientAnalyticsLineChart';
import { PatientAnalyticsBarChart } from '../../components/dashboard/PatientAnalyticsBarChart';
import { PatientAnalyticsPieChart } from '../../components/dashboard/PatientAnalyticsPieChart';
import { PatientAnalyticsTable } from '../../components/dashboard/PatientAnalyticsTable';
import { usePatientAppointments } from '../../hooks/usePatientAppointments';
import { Appointment } from '../../types/api.types';
import { Calendar, Clock, Filter, Search, BarChart3, TrendingUp } from 'lucide-react';

/**
 * PatientAnalyticsPage
 * Страница аналитики для пациента с графиками, таблицей и фильтрами
 */
export const PatientAnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Фильтры из URL параметров
  const [dateFromFilter, setDateFromFilter] = useState<string>(
    searchParams.get('dateFrom') || ''
  );
  const [dateToFilter, setDateToFilter] = useState<string>(
    searchParams.get('dateTo') || ''
  );
  const [weekFilter, setWeekFilter] = useState<string>(searchParams.get('week') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') || '');
  const [categoryInput, setCategoryInput] = useState<string>(searchParams.get('category') || '');
  const [doctorFilter, setDoctorFilter] = useState<string>(searchParams.get('doctor') || '');

  // Тип графика
  const [chartType, setChartType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Debounce для категории
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategoryFilter(categoryInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [categoryInput]);

  // Синхронизация фильтров с URL
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (dateFromFilter) params.set('dateFrom', dateFromFilter);
    if (dateToFilter) params.set('dateTo', dateToFilter);
    if (weekFilter) params.set('week', weekFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    if (doctorFilter) params.set('doctor', doctorFilter);

    setSearchParams(params, { replace: true });
  }, [dateFromFilter, dateToFilter, weekFilter, categoryFilter, doctorFilter, setSearchParams]);

  // Загружаем записи пациента (больше данных для аналитики)
  const { data, isLoading, error } = usePatientAppointments({
    limit: 1000, // Загружаем больше данных для аналитики
  });

  const allAppointments = data?.appointments || [];

  // Фильтрация записей
  const filteredAppointments = useMemo(() => {
    let filtered = [...allAppointments];

    // Фильтр по дате от
    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= fromDate;
      });
    }

    // Фильтр по дате до
    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate <= toDate;
      });
    }

    // Фильтр по неделе
    if (weekFilter) {
      const weekDate = new Date(weekFilter);
      weekDate.setHours(0, 0, 0, 0);
      const day = weekDate.getDay();
      const diff = weekDate.getDate() - day + (day === 0 ? -6 : 1); // Понедельник
      const weekStart = new Date(weekDate);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= weekStart && aptDate <= weekEnd;
      });
    }

    // Фильтр по категории (reason)
    if (categoryFilter) {
      filtered = filtered.filter((apt) => {
        const reason = apt.reason?.toLowerCase() || '';
        return reason.includes(categoryFilter.toLowerCase());
      });
    }

    // Фильтр по врачу
    if (doctorFilter) {
      filtered = filtered.filter((apt) => {
        return apt.doctor?.id === doctorFilter || apt.doctor?.name?.toLowerCase().includes(doctorFilter.toLowerCase());
      });
    }

    return filtered;
  }, [allAppointments, dateFromFilter, dateToFilter, weekFilter, categoryFilter, doctorFilter]);

  // Получаем уникальных врачей для фильтра
  const uniqueDoctors = useMemo(() => {
    const doctorsMap = new Map<string, { id: string; name: string }>();
    allAppointments.forEach((apt) => {
      if (apt.doctor?.id && apt.doctor?.name) {
        if (!doctorsMap.has(apt.doctor.id)) {
          doctorsMap.set(apt.doctor.id, {
            id: apt.doctor.id,
            name: apt.doctor.name,
          });
        }
      }
    });
    return Array.from(doctorsMap.values());
  }, [allAppointments]);

  /**
   * Сброс фильтров
   */
  const handleResetFilters = () => {
    setDateFromFilter('');
    setDateToFilter('');
    setWeekFilter('');
    setCategoryFilter('');
    setCategoryInput('');
    setDoctorFilter('');
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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-50 mb-2">Аналитика</h1>
            <p className="text-text-10 text-sm">
              Общая аналитика и финансовые данные ваших записей
            </p>
          </div>
        </div>

        {/* Загрузка */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* Контент */}
        {!isLoading && (
          <>
            {/* Карточки метрик */}
            <PatientMetricsCards appointments={filteredAppointments} isLoading={isLoading} />

            {/* Фильтры */}
            <Card padding="lg" className="border border-stroke shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-text-50" />
                <h2 className="text-lg font-semibold text-text-50">Фильтры</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-50 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Дата от
                  </label>
                  <input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-50 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Дата до
                  </label>
                  <input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-50 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Неделя
                  </label>
                  <input
                    type="week"
                    value={weekFilter}
                    onChange={(e) => setWeekFilter(e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-text-50 mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Врач
                  </label>
                  <select
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
                  >
                    <option value="">Все врачи</option>
                    {uniqueDoctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-50 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Тип графика
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                    className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
                  >
                    <option value="daily">По дням</option>
                    <option value="weekly">По неделям</option>
                    <option value="monthly">По месяцам</option>
                  </select>
                </div>
              </div>

              {(dateFromFilter || dateToFilter || weekFilter || categoryFilter || doctorFilter) && (
                <div className="mt-4 pt-4 border-t border-stroke">
                  <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                    🔄 Сбросить фильтры
                  </Button>
                </div>
              )}
            </Card>

            {/* Графики */}
            {filteredAppointments.length > 0 ? (
              <div className="space-y-6">
                {/* Линейный график */}
                <PatientAnalyticsLineChart
                  appointments={filteredAppointments}
                  chartType={chartType}
                  isLoading={isLoading}
                />

                {/* Столбчатые графики */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PatientAnalyticsBarChart
                    appointments={filteredAppointments}
                    type="byDoctor"
                    isLoading={isLoading}
                  />
                  <PatientAnalyticsBarChart
                    appointments={filteredAppointments}
                    type="byCategory"
                    isLoading={isLoading}
                  />
                </div>

                {/* Круговая диаграмма */}
                <PatientAnalyticsPieChart
                  appointments={filteredAppointments}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <Card padding="lg">
                <div className="text-center py-12 text-text-10">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-text-10 opacity-50" />
                  <p className="text-sm font-medium mb-2">Нет данных для отображения</p>
                  <p className="text-xs">Попробуйте изменить фильтры или запишитесь на прием</p>
                </div>
              </Card>
            )}

            {/* Таблица */}
            {filteredAppointments.length > 0 && (
              <Card padding="md" className="border border-stroke shadow-md">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-text-50 mb-1">Детальная статистика</h2>
                  <p className="text-xs text-text-10">
                    Всего записей: <strong>{filteredAppointments.length}</strong>
                  </p>
                </div>
                <PatientAnalyticsTable appointments={filteredAppointments} />
              </Card>
            )}
          </>
        )}
      </div>
    </NewDashboardLayout>
  );
};


