import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Button, Input, PasswordVerificationModal } from '../../components/common';
import { MetricsCards } from '../../components/dashboard/MetricsCards';
import { AnalyticsLineChart } from '../../components/dashboard/AnalyticsLineChart';
import { AnalyticsBarChart } from '../../components/dashboard/AnalyticsBarChart';
import { AnalyticsPieChart } from '../../components/dashboard/AnalyticsPieChart';
import { AnalyticsTable } from '../../components/dashboard/AnalyticsTable';
import {
  useAnalyticsSummary,
  useAnalyticsChart,
  useAnalyticsTable,
} from '../../hooks/useAnalytics';
import { useDoctors } from '../../hooks/useUsers';
import { AnalyticsFilters } from '../../services/analytics.service';
import { format, startOfWeek } from 'date-fns';

/**
 * Analytics Page
 * Страница аналитики клиники с графиками, таблицей и фильтрами
 * Требует подтверждения пароля для доступа
 */
export const AnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const passwordCheckDone = useRef(false);

  // Проверка подтверждения пароля при монтировании и очистка при размонтировании
  useEffect(() => {
    // Защита от повторного выполнения
    if (passwordCheckDone.current) return;
    passwordCheckDone.current = true;

    const isPasswordVerified = sessionStorage.getItem('analytics_password_verified') === 'true';
    
    if (!isPasswordVerified) {
      // Пароль не подтвержден, показываем модальное окно
      setIsPasswordModalOpen(true);
    }

    // Cleanup: при размонтировании компонента (выходе со страницы) очищаем подтверждение пароля
    // Это гарантирует, что при каждом следующем входе потребуется новый пароль
    return () => {
      console.log('🔴 [ANALYTICS PAGE] Выход со страницы Analytics, очищаем подтверждение пароля');
      sessionStorage.removeItem('analytics_password_verified');
      passwordCheckDone.current = false; // Сбрасываем флаг при размонтировании
    };
  }, []);

  // Обработчик успешной проверки пароля
  const handlePasswordVerified = () => {
    // Пароль подтвержден, закрываем модальное окно
    setIsPasswordModalOpen(false);
  };

  // Обработчик закрытия модального окна без подтверждения
  const handlePasswordModalClose = () => {
    // Если пароль не подтвержден, перенаправляем на dashboard
    const isPasswordVerified = sessionStorage.getItem('analytics_password_verified') === 'true';
    if (!isPasswordVerified) {
      navigate('/dashboard');
    } else {
      setIsPasswordModalOpen(false);
    }
  };

  // Инициализация фильтров из URL параметров
  const [doctorId, setDoctorId] = useState<string>(searchParams.get('doctorId') || '');
  const [dateFrom, setDateFrom] = useState<string>(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState<string>(searchParams.get('dateTo') || '');
  const [week, setWeek] = useState<string>(searchParams.get('week') || '');
  const [category, setCategory] = useState<string>(searchParams.get('category') || '');
  const [categoryInput, setCategoryInput] = useState<string>(searchParams.get('category') || '');

  // Тип графика
  const [chartType, setChartType] = useState<'daily' | 'weekly' | 'monthly' | 'byDoctor' | 'byCategory' | 'byStatus'>(
    (searchParams.get('chartType') as any) || 'monthly'
  );

  // Пагинация таблицы
  const [tablePage, setTablePage] = useState<number>(parseInt(searchParams.get('tablePage') || '1'));
  const [tableSortBy, setTableSortBy] = useState<string>(searchParams.get('tableSortBy') || 'appointmentDate');
  const [tableSortOrder, setTableSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('tableSortOrder') as 'asc' | 'desc') || 'desc'
  );

  const isInitialMount = useRef(true);

  // Загрузка врачей
  const { data: doctorsData } = useDoctors();
  const doctors = doctorsData || [];

  // Построение фильтров для API
  const filters: AnalyticsFilters = React.useMemo(() => {
    const f: AnalyticsFilters = {};
    if (doctorId) f.doctorId = doctorId;
    if (dateFrom) f.dateFrom = dateFrom;
    if (dateTo) f.dateTo = dateTo;
    if (week) f.week = week;
    if (category) f.category = category;
    return f;
  }, [doctorId, dateFrom, dateTo, week, category]);

  // Загрузка данных
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(filters);
  const { data: chartData, isLoading: chartLoading } = useAnalyticsChart(chartType, filters);
  const { data: statusChartData, isLoading: statusChartLoading } = useAnalyticsChart('byStatus', filters);
  const { data: tableData, isLoading: tableLoading } = useAnalyticsTable({
    ...filters,
    page: tablePage,
    limit: 20,
    sortBy: tableSortBy,
    sortOrder: tableSortOrder,
  });

  // Debounce для категории
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategory(categoryInput);
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
    if (doctorId) params.set('doctorId', doctorId);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (week) params.set('week', week);
    if (category) params.set('category', category);
    if (chartType) params.set('chartType', chartType);
    if (tablePage > 1) params.set('tablePage', tablePage.toString());
    if (tableSortBy !== 'appointmentDate') params.set('tableSortBy', tableSortBy);
    if (tableSortOrder !== 'desc') params.set('tableSortOrder', tableSortOrder);

    setSearchParams(params, { replace: true });
  }, [doctorId, dateFrom, dateTo, week, category, chartType, tablePage, tableSortBy, tableSortOrder, setSearchParams]);

  // Обработчики фильтров
  const handleResetFilters = () => {
    setDoctorId('');
    setDateFrom('');
    setDateTo('');
    setWeek('');
    setCategory('');
    setCategoryInput('');
    setTablePage(1);
    setTableSortBy('appointmentDate');
    setTableSortOrder('desc');
  };

  const handleWeekSelect = (selectedWeek: string) => {
    if (selectedWeek === '') {
      setWeek('');
      setDateFrom('');
      setDateTo('');
      return;
    }

    if (selectedWeek === 'current') {
      const today = new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      setWeek(format(weekStart, 'yyyy-MM-dd'));
      setDateFrom('');
      setDateTo('');
    } else {
      setWeek(selectedWeek);
      setDateFrom('');
      setDateTo('');
    }
  };

  const getChartTitle = () => {
    const titles = {
      daily: 'График по дням (последние 30 дней)',
      weekly: 'График по неделям (последние 12 недель)',
      monthly: 'График по месяцам (последние 12 месяцев)',
      byDoctor: 'Распределение по врачам',
      byCategory: 'Распределение по категориям',
      byStatus: 'Распределение по статусам',
    };
    return titles[chartType];
  };

  // Если пароль не подтвержден, показываем только модальное окно вместо контента
  const isPasswordVerified = sessionStorage.getItem('analytics_password_verified') === 'true';
  
  if (!isPasswordVerified) {
    return (
      <>
        <NewDashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
          </div>
        </NewDashboardLayout>
        <PasswordVerificationModal
          isOpen={isPasswordModalOpen}
          onClose={handlePasswordModalClose}
          onSuccess={handlePasswordVerified}
        />
      </>
    );
  }

  return (
    <>
      <NewDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-100">Аналитика</h1>
            <p className="text-sm text-text-10 mt-1">Общая статистика и аналитика клиники</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-bg-white border border-stroke rounded-lg p-5">
          <h3 className="text-lg font-medium text-text-50 mb-4">Фильтры</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Врач */}
            <div>
              <label className="block text-sm font-normal text-text-10 mb-2">Врач</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full px-4 py-2 border border-stroke rounded-lg bg-bg-white text-text-100 text-sm focus:outline-none focus:border-main-100"
              >
                <option value="">Все врачи</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} {doctor.specialization ? `(${doctor.specialization})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Дата от */}
            <div>
              <label className="block text-sm font-normal text-text-10 mb-2">Дата от</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setWeek(''); // Очищаем неделю при выборе даты
                }}
                className="w-full"
              />
            </div>

            {/* Дата до */}
            <div>
              <label className="block text-sm font-normal text-text-10 mb-2">Дата до</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setWeek(''); // Очищаем неделю при выборе даты
                }}
                className="w-full"
              />
            </div>

            {/* Неделя */}
            <div>
              <label className="block text-sm font-normal text-text-10 mb-2">Неделя</label>
              <select
                value={week}
                onChange={(e) => handleWeekSelect(e.target.value)}
                className="w-full px-4 py-2 border border-stroke rounded-lg bg-bg-white text-text-100 text-sm focus:outline-none focus:border-main-100"
              >
                <option value="">Выберите неделю</option>
                <option value="current">Текущая неделя</option>
                {/* Можно добавить больше недель при необходимости */}
              </select>
            </div>

            {/* Категория */}
            <div>
              <label className="block text-sm font-normal text-text-10 mb-2">Категория</label>
              <Input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Введите категорию..."
                className="w-full"
              />
            </div>

            {/* Тип графика */}
            <div>
              <label className="block text-sm font-normal text-text-10 mb-2">Тип графика</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="w-full px-4 py-2 border border-stroke rounded-lg bg-bg-white text-text-100 text-sm focus:outline-none focus:border-main-100"
              >
                <option value="daily">По дням</option>
                <option value="weekly">По неделям</option>
                <option value="monthly">По месяцам</option>
                <option value="byDoctor">По врачам</option>
                <option value="byCategory">По категориям</option>
                <option value="byStatus">По статусам</option>
              </select>
            </div>
          </div>
          {(doctorId || dateFrom || dateTo || week || category) && (
            <div className="mt-4 pt-4 border-t border-stroke flex justify-end">
              <Button onClick={handleResetFilters} variant="secondary" size="sm">
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Сбросить фильтры
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Metrics Cards */}
        <MetricsCards summary={summary} isLoading={summaryLoading} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Основной график */}
          {chartType === 'byStatus' ? (
            <AnalyticsPieChart
              data={chartData}
              title={getChartTitle()}
              isLoading={chartLoading}
            />
          ) : chartType === 'byDoctor' || chartType === 'byCategory' ? (
            <AnalyticsBarChart
              data={chartData}
              title={getChartTitle()}
              isLoading={chartLoading}
            />
          ) : (
            <AnalyticsLineChart
              data={chartData}
              title={getChartTitle()}
              isLoading={chartLoading}
            />
          )}

          {/* Дополнительная статистика - Pie Chart по статусам */}
          {chartType !== 'byStatus' && (
            <div>
              <AnalyticsPieChart
                data={statusChartData}
                title="Распределение по статусам"
                isLoading={statusChartLoading}
              />
            </div>
          )}
        </div>

        {/* Table */}
        <AnalyticsTable
          data={tableData?.appointments}
          meta={tableData?.meta}
          isLoading={tableLoading}
          onPageChange={(page) => setTablePage(page)}
          onSort={(sortBy, sortOrder) => {
            setTableSortBy(sortBy);
            setTableSortOrder(sortOrder);
            setTablePage(1);
          }}
        />
      </div>
    </NewDashboardLayout>
    <PasswordVerificationModal
      isOpen={isPasswordModalOpen}
      onClose={handlePasswordModalClose}
      onSuccess={handlePasswordVerified}
    />
    </>
  );
};

