import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Button, Card, Spinner, Input } from '../../components/common';
import { AppointmentsListView } from '../../components/dashboard/AppointmentsListView';
import { AppointmentsMonthlyCalendar } from '../../components/dashboard/AppointmentsMonthlyCalendar';
import { AppointmentsWeeklyView } from '../../components/dashboard/AppointmentsWeeklyView';
import { CreateAppointmentModal } from '../../components/dashboard/CreateAppointmentModal';
import { CompleteAppointmentModal } from '../../components/dashboard/CompleteAppointmentModal';
import { CancelAppointmentModal } from '../../components/dashboard/CancelAppointmentModal';
import { EditAmountModal } from '../../components/dashboard/EditAmountModal';
import { AppointmentDetailModal } from '../../components/dashboard/AppointmentDetailModal';
import { useAppointments, useUpdateAppointmentStatus, useUpdateAppointment } from '../../hooks/useAppointments';
import { appointmentService } from '../../services/appointment.service';
import { userService } from '../../services/user.service';
import { useAuthStore } from '../../store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { User, Appointment } from '../../types/api.types';
import { format } from 'date-fns';
import { Filter, Calendar, Clock, Search, User as UserIcon } from 'lucide-react';

// Import icons
import analyticsIcon from '../../assets/icons/analytics.svg';
import plusIcon from '../../assets/icons/plus.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import refreshIcon from '../../assets/icons/refresh.svg';

/**
 * Appointments Page - Figma Design
 * Управление приёмами в новом стиле
 * Улучшенная версия с фильтрами, статистикой и детальной информацией
 * Фильтры сохраняются в URL параметрах для сохранения состояния при обновлении страницы
 */
export const AppointmentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore(state => state.user);
  const isDoctor = user?.role === 'DOCTOR';
  
  // Инициализация фильтров из URL параметров
  // Для врачей фильтр по врачу устанавливается автоматически и не может быть изменен
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
  const [dateFilter, setDateFilter] = useState<string>(searchParams.get('date') || '');
  const [doctorFilter, setDoctorFilter] = useState<string>(searchParams.get('doctor') || '');
  const [timeFilter, setTimeFilter] = useState<string>(searchParams.get('time') || '');
  const [weekFilter, setWeekFilter] = useState<string>(searchParams.get('week') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') || '');
  const [categoryInput, setCategoryInput] = useState<string>(searchParams.get('category') || ''); // Для debounce
  
  // Вид отображения (list/monthly/weekly) - только для CLINIC
  const isClinic = user?.role === 'CLINIC' || user?.role === 'ADMIN';
  
  // Загружаем сохраненный вид из localStorage при инициализации
  const [viewType, setViewType] = useState<'list' | 'monthly' | 'weekly'>(() => {
    try {
      const saved = localStorage.getItem('appointmentsViewType');
      if (saved && ['list', 'monthly', 'weekly'].includes(saved)) {
        return saved as 'list' | 'monthly' | 'weekly';
      }
    } catch (error) {
      console.error('Ошибка загрузки вида из localStorage:', error);
    }
    return 'list';
  });
  
  // Для list вида - переключение между table и cards
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    try {
      const saved = localStorage.getItem('appointmentsViewMode');
      if (saved && ['table', 'cards'].includes(saved)) {
        return saved as 'table' | 'cards';
      }
    } catch (error) {
      console.error('Ошибка загрузки режима из localStorage:', error);
    }
    return 'table';
  });
  
  // Сохраняем выбранный вид в localStorage при изменении
  useEffect(() => {
    try {
      if (isClinic) {
        localStorage.setItem('appointmentsViewType', viewType);
      }
    } catch (error) {
      console.error('Ошибка сохранения вида в localStorage:', error);
    }
  }, [viewType, isClinic]);
  
  useEffect(() => {
    try {
      localStorage.setItem('appointmentsViewMode', viewMode);
    } catch (error) {
      console.error('Ошибка сохранения режима в localStorage:', error);
    }
  }, [viewMode]);
  
  // Функция для установки вида с автоматическим сохранением
  const handleViewTypeChange = (newViewType: 'list' | 'monthly' | 'weekly') => {
    setViewType(newViewType);
    if (newViewType === 'list') {
      // При переключении на список, сохраняем режим таблицы
      setViewMode('table');
    }
  };
  
  // Модальное окно создания приёма
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDefaultDate, setCreateModalDefaultDate] = useState<string | undefined>(undefined);
  
  // Модальное окно завершения приёма
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedAppointmentForComplete, setSelectedAppointmentForComplete] = useState<Appointment | null>(null);
  
  // Модальное окно отмены приёма
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState<Appointment | null>(null);
  
  // Модальное окно редактирования суммы
  const [isEditAmountModalOpen, setIsEditAmountModalOpen] = useState(false);
  const [selectedAppointmentForEdit, setSelectedAppointmentForEdit] = useState<Appointment | null>(null);
  
  // Модальное окно детальной информации о записи
  const [isAppointmentDetailModalOpen, setIsAppointmentDetailModalOpen] = useState(false);
  const [selectedAppointmentForDetail, setSelectedAppointmentForDetail] = useState<Appointment | null>(null);
  
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const [loadingAppointments, setLoadingAppointments] = useState<Record<string, string>>({});
  
  // Флаг для отслеживания первой инициализации
  const isInitialMount = useRef(true);

  // Загрузка списка врачей для фильтра
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setIsDoctorsLoading(true);
        const doctorsList = await userService.getDoctors();
        setDoctors(doctorsList);
      } catch (err) {
        console.error('Ошибка загрузки врачей:', err);
      } finally {
        setIsDoctorsLoading(false);
      }
    };
    loadDoctors();
  }, []);

  // Debounce для поля категории - обновляем фильтр только после 500ms паузы в вводе
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategoryFilter(categoryInput);
    }, 500); // 500ms задержка

    return () => {
      clearTimeout(timer);
    };
  }, [categoryInput]);

  // Синхронизация фильтров с URL параметрами
  // Обновляем URL только когда фильтры изменяются пользователем (не при первой загрузке)
  useEffect(() => {
    // Пропускаем обновление URL при первой загрузке (фильтры уже инициализированы из URL)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (dateFilter) params.set('date', dateFilter);
    if (doctorFilter) params.set('doctor', doctorFilter);
    if (timeFilter) params.set('time', timeFilter);
    if (weekFilter) params.set('week', weekFilter);
    if (categoryFilter) params.set('category', categoryFilter);
    
    // Обновляем URL без перезагрузки страницы
    setSearchParams(params, { replace: true });
  }, [statusFilter, dateFilter, doctorFilter, timeFilter, weekFilter, categoryFilter, setSearchParams]);

  // По умолчанию исключаем завершенные приёмы (completed) из раздела Appointments
  // Они должны отображаться только в разделе Patients
  // Но если выбран фильтр "Все статусы" (пустая строка), показываем все приёмы
  // Для врачей автоматически устанавливаем doctorId = user.id (врачи видят только свои назначения)
  const { data, isLoading, isFetching, error } = useAppointments({
    status: statusFilter && statusFilter.trim() !== '' ? statusFilter : undefined,
    date: dateFilter || undefined,
    doctorId: isDoctor ? user?.id : (doctorFilter || undefined), // Для врачей автоматически фильтруем по их ID
    time: timeFilter || undefined,
    week: weekFilter || undefined,
    category: categoryFilter || undefined,
  });
  const queryClient = useQueryClient();
  const updateStatusMutation = useUpdateAppointmentStatus();
  const updateAppointmentMutation = useUpdateAppointment();

  // Фильтруем завершенные приёмы, если статус не выбран явно
  // Это гарантирует, что завершенные приёмы не отображаются в разделе Appointments
  // НО: если выбран фильтр "Все статусы" (statusFilter === ''), показываем все приёмы
  const filteredAppointments = React.useMemo(() => {
    // API возвращает { appointments: Appointment[], meta: {...} }
    const appointments = (data as any)?.appointments || [];
    if (!appointments || appointments.length === 0) return [];
    
    // Если статус выбран явно (не пустая строка), используем данные как есть
    // API уже отфильтровал по статусу
    if (statusFilter && statusFilter.trim() !== '') {
      return appointments;
    }
    
    // Если выбран "Все статусы" (пустая строка) или статус не установлен
    // Показываем все приёмы без фильтрации
    // Это позволяет видеть все приёмы, включая завершенные и отмененные
    return appointments;
  }, [data, statusFilter]);

  /**
   * Обработчик изменения статуса приёма
   * @param id - ID приёма
   * @param newStatus - Новый статус (confirmed, cancelled, completed)
   */
  const handleStatusChange = async (id: string, newStatus: string) => {
    // Если статус - completed, открываем модальное окно для ввода суммы
    if (newStatus === 'completed') {
      const appointment = appointments.find((a: Appointment) => a.id === id);
      if (appointment) {
        setSelectedAppointmentForComplete(appointment);
        setIsCompleteModalOpen(true);
      }
      return;
    }

    // Если статус - cancelled, открываем модальное окно для ввода причины отмены
    if (newStatus === 'cancelled') {
      const appointment = appointments.find((a: Appointment) => a.id === id);
      if (appointment) {
        setSelectedAppointmentForCancel(appointment);
        setIsCancelModalOpen(true);
      }
      return;
    }

    // Для других статусов - обычное изменение
    // Очищаем предыдущую ошибку для этого приёма
    setErrorMessages(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    // Устанавливаем состояние загрузки
    setLoadingAppointments(prev => ({ ...prev, [id]: newStatus }));

    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      // Успешно - очищаем состояние загрузки
      setLoadingAppointments(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err: any) {
      console.error('❌ [APPOINTMENTS] Ошибка изменения статуса:', err);
      
      // Сохраняем сообщение об ошибке для отображения inline
      const errorMessage = err.message || 'Ошибка изменения статуса. Попробуйте позже.';
      setErrorMessages(prev => ({ ...prev, [id]: errorMessage }));
      
      // Очищаем состояние загрузки
      setLoadingAppointments(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  /**
   * Обработчик завершения приёма с суммой
   */
  const handleComplete = async (appointmentId: string, amount: number) => {
    setLoadingAppointments(prev => ({ ...prev, [appointmentId]: 'completed' }));
    try {
      await updateStatusMutation.mutateAsync({ id: appointmentId, status: 'completed', amount });
      setIsCompleteModalOpen(false);
      setSelectedAppointmentForComplete(null);
      setLoadingAppointments(prev => {
        const updated = { ...prev };
        delete updated[appointmentId];
        return updated;
      });
    } catch (err: any) {
      console.error('❌ [APPOINTMENTS] Ошибка завершения приёма:', err);
      throw err;
    }
  };

  /**
   * Обработчик отмены приёма с причиной
   */
  const handleCancel = async (cancellationReason: string, suggestedNewDate?: string) => {
    if (!selectedAppointmentForCancel) return;
    
    const appointmentId = selectedAppointmentForCancel.id;
    setLoadingAppointments(prev => ({ ...prev, [appointmentId]: 'cancelled' }));
    
    try {
      await updateStatusMutation.mutateAsync({ 
        id: appointmentId, 
        status: 'cancelled',
        cancellationReason,
        suggestedNewDate
      });
      setIsCancelModalOpen(false);
      setSelectedAppointmentForCancel(null);
      setLoadingAppointments(prev => {
        const updated = { ...prev };
        delete updated[appointmentId];
        return updated;
      });
    } catch (err: any) {
      console.error('❌ [APPOINTMENTS] Ошибка отмены приёма:', err);
      
      // Формируем понятное сообщение об ошибке
      let errorMessage = 'Ошибка при отмене приёма. Попробуйте позже.';
      
      if (err.details && Array.isArray(err.details)) {
        // Если есть детали валидации, показываем первое сообщение
        const firstError = err.details[0];
        errorMessage = firstError.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Очищаем состояние загрузки
      setLoadingAppointments(prev => {
        const updated = { ...prev };
        delete updated[appointmentId];
        return updated;
      });
      
      // Пробрасываем ошибку с понятным сообщением
      const errorWithMessage = new Error(errorMessage);
      (errorWithMessage as any).details = err.details;
      throw errorWithMessage;
    }
  };

  /**
   * Обработчик редактирования суммы
   */
  const handleEditAmount = (appointment: Appointment) => {
    setSelectedAppointmentForEdit(appointment);
    setIsEditAmountModalOpen(true);
  };

  /**
   * Обработчик сохранения новой суммы
   */
  const handleUpdateAmount = async (appointmentId: string, amount: number) => {
    setLoadingAppointments(prev => ({ ...prev, [appointmentId]: 'updating' }));
    try {
      await updateAppointmentMutation.mutateAsync({ id: appointmentId, data: { amount } });
      setIsEditAmountModalOpen(false);
      setSelectedAppointmentForEdit(null);
      setLoadingAppointments(prev => {
        const updated = { ...prev };
        delete updated[appointmentId];
        return updated;
      });
    } catch (err: any) {
      console.error('❌ [APPOINTMENTS] Ошибка обновления суммы:', err);
      throw err;
    }
  };

  /**
   * Обработчик удаления выбранных приёмов
   * @param ids - Массив ID приёмов для удаления
   */
  const handleDeleteSelected = async (ids: string[]): Promise<void> => {
    if (!ids || ids.length === 0) return;

    // Проверяем, что пользователь имеет права ADMIN или CLINIC
    if (user?.role !== 'ADMIN' && user?.role !== 'CLINIC') {
      console.error('❌ [APPOINTMENTS] Попытка удаления без прав ADMIN или CLINIC');
      throw new Error('У вас нет прав на удаление приёмов. Эта функция доступна только для администраторов и клиник.');
    }

    console.log(`🗑️ [APPOINTMENTS] Начало удаления ${ids.length} приёмов`);

    // Удаляем все приёмы параллельно
    // Используем Promise.allSettled, чтобы попытаться удалить все, даже если некоторые не удались
    const results = await Promise.allSettled(
      ids.map((id) => 
        appointmentService.delete(id).catch(err => {
          // Сохраняем ID приёма в ошибке для последующего отображения
          const errorWithId = new Error(err?.message || 'Неизвестная ошибка');
          (errorWithId as any).appointmentId = id;
          throw errorWithId;
        })
      )
    );

    // Проверяем результаты
    const failed = results.filter(result => result.status === 'rejected');
    const succeeded = results.filter(result => result.status === 'fulfilled');

    // Инвалидируем кеш один раз после всех удалений (независимо от результата)
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });

    if (failed.length > 0) {
      const errorMessages = failed
        .map((result) => {
          if (result.status === 'rejected') {
            const appointmentId = (result.reason as any)?.appointmentId || 'неизвестный';
            return `Приём ${appointmentId}: ${result.reason?.message || 'Неизвестная ошибка'}`;
          }
          return null;
        })
        .filter(Boolean);

      console.error(`❌ [APPOINTMENTS] Ошибки при удалении:`, errorMessages);
      
      // Если удалось удалить хотя бы один, показываем частичный успех
      if (succeeded.length > 0) {
        throw new Error(
          `Удалено ${succeeded.length} из ${ids.length} приёмов. Ошибки: ${errorMessages.join('; ')}`
        );
      } else {
        // Если ничего не удалось удалить
        throw new Error(
          `Не удалось удалить приёмы. Ошибки: ${errorMessages.join('; ')}`
        );
      }
    }

    console.log(`✅ [APPOINTMENTS] Успешно удалено ${succeeded.length} приёмов`);
  };

  // Показываем ошибку только если это первая загрузка и есть ошибка
  if (error && !data) {
    return (
      <NewDashboardLayout>
        <div>
          <Card className="bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">Ошибка загрузки: {(error as any).message}</p>
          </Card>
        </div>
      </NewDashboardLayout>
    );
  }

  // Используем отфильтрованные приёмы (исключаем completed по умолчанию)
  const appointments = filteredAppointments;
  
  // Показываем спиннер только при первой загрузке (когда нет данных)
  const isInitialLoading = isLoading && !data;
  
  // Отслеживаем изменения для плавного исчезновения/появления
  const [displayedAppointments, setDisplayedAppointments] = useState(appointments);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevAppointmentIdsRef = useRef<string[]>(appointments.map((a: Appointment) => a.id));
  
  // Плавное обновление данных при изменении
  useEffect(() => {
    const currentIds = appointments.map((a: Appointment) => a.id);
    const prevIds = prevAppointmentIdsRef.current;
    
    // Проверяем, изменился ли состав данных
    const idsChanged = JSON.stringify([...currentIds].sort()) !== JSON.stringify([...prevIds].sort());
    
    if (idsChanged && prevIds.length > 0) {
      // Если состав изменился и были предыдущие данные, делаем плавный переход
      setIsTransitioning(true);
      
      // Небольшая задержка для fade-out эффекта
      const transitionTimer = setTimeout(() => {
        setDisplayedAppointments(appointments);
        prevAppointmentIdsRef.current = currentIds;
        
        // Небольшая задержка перед fade-in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 250); // Время для fade-out
      
      return () => clearTimeout(transitionTimer);
    } else {
      // Если данные не изменились или это первая загрузка, просто обновляем
      setDisplayedAppointments(appointments);
      prevAppointmentIdsRef.current = currentIds;
      setIsTransitioning(false);
    }
  }, [appointments]);

  return (
    <NewDashboardLayout>
      <div className="space-y-6 relative">
        {/* Сверхтонкий индикатор загрузки вверху страницы (почти незаметный) */}
        {isFetching && !isInitialLoading && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-main-100/10 overflow-hidden z-50">
            <div 
              className="h-full bg-main-100/40 relative"
              style={{ 
                width: '25%',
                animation: 'shimmer 2s ease-in-out infinite'
              }} 
            />
          </div>
        )}
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-100">Приёмы</h1>
            <p className="text-text-10 text-sm mt-1">
              {statusFilter 
                ? `Всего: ${(data as any)?.meta?.total || 0} назначений`
                : `Активных: ${appointments.length} из ${(data as any)?.meta?.total || 0} назначений`
              }
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {/* Для врачей - переключение table/cards */}
            {!isClinic && (
            <div className="flex border border-stroke rounded-sm overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-normal transition-smooth ${
                  viewMode === 'table'
                    ? 'bg-main-100 text-white'
                    : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                }`}
              >
                📊 Таблица
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 text-sm font-normal transition-smooth ${
                  viewMode === 'cards'
                    ? 'bg-main-100 text-white'
                    : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                }`}
              >
                Карточки
              </button>
            </div>
            )}
          </div>
        </div>

      {/* Фильтры */}
      <Card padding="lg" className="border border-stroke shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-text-50" />
          <h2 className="text-lg font-semibold text-text-50">Фильтры</h2>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isDoctor ? 'lg:grid-cols-5' : 'lg:grid-cols-6'} gap-4`}>
          {/* Фильтр "Врач" скрыт для врачей, так как они видят только свои назначения */}
          {!isDoctor && (
            <div>
              <label className="block text-sm font-medium text-text-50 mb-2 flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Врач
              </label>
              <select
                value={doctorFilter}
                onChange={e => setDoctorFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
                disabled={isDoctorsLoading}
              >
                <option value="">Все врачи</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} {doctor.specialization ? `(${doctor.specialization})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-50 mb-2">Статус</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
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
              onChange={e => {
                setDateFilter(e.target.value);
                // Очищаем фильтр по неделе при выборе даты
                if (e.target.value) setWeekFilter('');
              }}
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
              onChange={e => setTimeFilter(e.target.value)}
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
              onChange={e => {
                setWeekFilter(e.target.value);
                // Очищаем фильтр по дате при выборе недели
                if (e.target.value) setDateFilter('');
              }}
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

        {(!isDoctor && doctorFilter || statusFilter || dateFilter || timeFilter || weekFilter || categoryFilter) && (
          <div className="mt-4 pt-4 border-t border-stroke">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!isDoctor) setDoctorFilter('');
                setStatusFilter('');
                setDateFilter('');
                setTimeFilter('');
                setWeekFilter('');
                setCategoryFilter('');
                setCategoryInput('');
                // Очищаем URL параметры
                setSearchParams({}, { replace: true });
              }}
            >
              <span className="flex items-center gap-2">
                <img src={refreshIcon} alt="Сбросить" className="w-4 h-4" />
                Сбросить фильтры
              </span>
            </Button>
          </div>
        )}
      </Card>

      {/* Appointments Display - разные виды для CLINIC */}
      {isInitialLoading ? (
        <Card>
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : appointments.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-text-10 text-sm">
            Приёмы не найдены
          </div>
        </Card>
      ) : isClinic && viewType === 'monthly' ? (
        <AppointmentsMonthlyCalendar
          appointments={appointments}
          onAppointmentClick={(appointment) => {
            // При клике на приём в календаре - открываем модальное окно с детальной информацией
            setSelectedAppointmentForDetail(appointment);
            setIsAppointmentDetailModalOpen(true);
          }}
          onDateClick={(date) => {
            // При клике на ячейку календаря - открываем модальное окно создания приёма с предзаполненной датой
            const dateStr = format(date, 'yyyy-MM-dd');
            setCreateModalDefaultDate(dateStr);
            setIsCreateModalOpen(true);
          }}
          onViewChange={handleViewTypeChange}
          currentView={viewType}
        />
      ) : isClinic && viewType === 'weekly' ? (
        <AppointmentsWeeklyView
          appointments={appointments}
          onAppointmentClick={(appointment) => {
            // При клике на приём в недельном виде - открываем модальное окно с детальной информацией
            setSelectedAppointmentForDetail(appointment);
            setIsAppointmentDetailModalOpen(true);
          }}
          onTimeSlotClick={() => {
            // При клике на временной слот - открываем модальное окно создания приёма
            setIsCreateModalOpen(true);
          }}
          onViewChange={handleViewTypeChange}
          currentView={viewType}
        />
      ) : (
        // List view (table или cards) - для всех ролей
        <div className="space-y-4">
          {/* Переключение видов для CLINIC в списке - фиксированный порядок: Неделя, Месяц, Таблица */}
          {isClinic && (
            <Card padding="sm">
              <div className="flex items-center justify-center">
                <div 
                  className="flex border border-stroke rounded-sm overflow-hidden"
                  style={{
                    height: '44px',
                    width: '420px',
                    position: 'relative',
                    boxSizing: 'border-box',
                    gap: '0'
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleViewTypeChange('weekly');
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={`group text-base font-medium transition-colors duration-150 flex-shrink-0 relative ${
                      viewType === 'weekly'
                        ? 'bg-main-100 text-white'
                        : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                    }`}
                    style={{
                      width: '140px',
                      height: '44px',
                      padding: '0',
                      border: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1
                    }}
                    title="Недельный вид"
                    type="button"
                  >
                    <span className="flex items-center gap-2" style={{ pointerEvents: 'none' }}>
                      <img 
                        src={calendarIcon} 
                        alt="Неделя" 
                        className={`w-4 h-4 flex-shrink-0 transition-smooth ${
                          viewType === 'weekly'
                            ? 'brightness-0 invert'
                            : 'group-hover:brightness-0 group-hover:invert'
                        }`} 
                        style={{ display: 'block' }}
                      />
                      <span style={{ whiteSpace: 'nowrap' }}>Неделя</span>
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleViewTypeChange('monthly');
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={`group text-base font-medium transition-colors duration-150 flex-shrink-0 relative ${
                      viewType === 'monthly'
                        ? 'bg-main-100 text-white'
                        : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                    }`}
                    style={{
                      width: '140px',
                      height: '44px',
                      padding: '0',
                      border: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1
                    }}
                    title="Месячный календарь"
                    type="button"
                  >
                    <span className="flex items-center gap-2" style={{ pointerEvents: 'none' }}>
                      <img 
                        src={calendarIcon} 
                        alt="Месяц" 
                        className={`w-4 h-4 flex-shrink-0 transition-smooth ${
                          viewType === 'monthly'
                            ? 'brightness-0 invert'
                            : 'group-hover:brightness-0 group-hover:invert'
                        }`} 
                        style={{ display: 'block' }}
                      />
                      <span style={{ whiteSpace: 'nowrap' }}>Месяц</span>
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleViewTypeChange('list');
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={`group text-base font-medium transition-colors duration-150 flex-shrink-0 relative ${
                      viewType === 'list'
                        ? 'bg-main-100 text-white'
                        : 'bg-bg-white text-text-50 hover:bg-bg-primary'
                    }`}
                    style={{
                      width: '140px',
                      height: '44px',
                      padding: '0',
                      border: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1
                    }}
                    title="Таблица"
                    type="button"
                  >
                    <span className="flex items-center gap-2" style={{ pointerEvents: 'none' }}>
                      <img 
                        src={analyticsIcon} 
                        alt="Таблица" 
                        className={`w-4 h-4 flex-shrink-0 transition-smooth ${
                          viewType === 'list'
                            ? 'brightness-0 invert'
                            : 'group-hover:brightness-0 group-hover:invert'
                        }`} 
                        style={{ display: 'block' }}
                      />
                      <span style={{ whiteSpace: 'nowrap' }}>Таблица</span>
                    </span>
                  </button>
                </div>
              </div>
            </Card>
          )}
          <AppointmentsListView
            appointments={displayedAppointments}
            viewMode={viewMode}
            onStatusChange={handleStatusChange}
            onEditAmount={handleEditAmount}
            onUpdateAmount={handleUpdateAmount}
            onDeleteSelected={(user?.role === 'ADMIN' || user?.role === 'CLINIC') ? handleDeleteSelected : undefined}
            loadingAppointments={loadingAppointments}
            errorMessages={errorMessages}
            isFetching={isFetching}
            isTransitioning={isTransitioning}
            userRole={user?.role as 'DOCTOR' | 'CLINIC' | 'ADMIN'}
          />
        </div>
      )}

      {/* Модальное окно создания приёма */}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateModalDefaultDate(undefined);
        }}
        onSuccess={() => {
          // Обновление произойдет автоматически через React Query
          console.log('✅ [APPOINTMENTS] Приём успешно создан');
          setCreateModalDefaultDate(undefined);
        }}
        defaultDate={createModalDefaultDate}
      />

      {/* Модальное окно завершения приёма */}
      <CompleteAppointmentModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedAppointmentForComplete(null);
        }}
        appointment={selectedAppointmentForComplete}
        onComplete={handleComplete}
        isLoading={selectedAppointmentForComplete ? loadingAppointments[selectedAppointmentForComplete.id] === 'completed' : false}
      />

      {/* Модальное окно отмены приёма */}
      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedAppointmentForCancel(null);
        }}
        appointment={selectedAppointmentForCancel}
        onConfirm={handleCancel}
        isLoading={selectedAppointmentForCancel ? loadingAppointments[selectedAppointmentForCancel.id] === 'cancelled' : false}
      />

      {/* Модальное окно редактирования суммы */}
      <EditAmountModal
        isOpen={isEditAmountModalOpen}
        onClose={() => {
          setIsEditAmountModalOpen(false);
          setSelectedAppointmentForEdit(null);
        }}
        appointment={selectedAppointmentForEdit}
        onUpdate={handleUpdateAmount}
        isLoading={selectedAppointmentForEdit ? loadingAppointments[selectedAppointmentForEdit.id] === 'updating' : false}
      />

      {/* Модальное окно детальной информации о записи */}
      <AppointmentDetailModal
        isOpen={isAppointmentDetailModalOpen}
        onClose={() => {
          setIsAppointmentDetailModalOpen(false);
          setSelectedAppointmentForDetail(null);
        }}
        appointment={selectedAppointmentForDetail}
      />
      </div>
    </NewDashboardLayout>
  );
};

