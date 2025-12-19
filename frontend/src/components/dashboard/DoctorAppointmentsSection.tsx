import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Spinner, Input } from '../common';
import { AppointmentsListView } from './AppointmentsListView';
import { AppointmentsMonthlyCalendar } from './AppointmentsMonthlyCalendar';
import { AppointmentsWeeklyView } from './AppointmentsWeeklyView';
import { CreateAppointmentModal } from './CreateAppointmentModal';
import { CompleteAppointmentModal } from './CompleteAppointmentModal';
import { CancelAppointmentModal } from './CancelAppointmentModal';
import { EditAmountModal } from './EditAmountModal';
import { useAppointments, useUpdateAppointmentStatus, useUpdateAppointment } from '../../hooks/useAppointments';
import { useAuthStore } from '../../store/useAuthStore';
import { Appointment } from '../../types/api.types';
import { format } from 'date-fns';
import { Filter, Calendar, Clock, Search, CalendarPlus } from 'lucide-react';

// Import icons
import refreshIcon from '../../assets/icons/refresh.svg';
import analyticsIcon from '../../assets/icons/analytics.svg';
import calendarIcon from '../../assets/icons/calendar.svg';

/**
 * DoctorAppointmentsSection Component
 * Секция приёмов для страницы врача
 * Показывает все приёмы текущего врача с фильтрами и возможностью управления
 */
interface DoctorAppointmentsSectionProps {
  onCreateAppointmentClick?: () => void;
  onCreateAppointmentWithDate?: (date: string) => void;
}

export const DoctorAppointmentsSection: React.FC<DoctorAppointmentsSectionProps> = ({
  onCreateAppointmentClick,
  onCreateAppointmentWithDate,
}) => {
  const user = useAuthStore(state => state.user);
  const doctorId = user?.id;

  // Фильтры
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('');
  const [weekFilter, setWeekFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [categoryInput, setCategoryInput] = useState<string>(''); // Для debounce

  // Вид отображения (list/monthly/weekly) - как в клинике
  const [viewType, setViewType] = useState<'list' | 'monthly' | 'weekly'>(() => {
    try {
      const saved = localStorage.getItem('doctorAppointmentsViewType');
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
      const saved = localStorage.getItem('doctorAppointmentsViewMode');
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
      localStorage.setItem('doctorAppointmentsViewType', viewType);
    } catch (error) {
      console.error('Ошибка сохранения вида в localStorage:', error);
    }
  }, [viewType]);

  useEffect(() => {
    try {
      localStorage.setItem('doctorAppointmentsViewMode', viewMode);
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

  // Модальные окна
  // Если обработчики переданы извне, используем их, иначе используем внутреннее состояние
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDefaultDate, setCreateModalDefaultDate] = useState<string | undefined>(undefined);
  const isUsingExternalModal = !!onCreateAppointmentClick;
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedAppointmentForComplete, setSelectedAppointmentForComplete] = useState<Appointment | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState<Appointment | null>(null);
  const [isEditAmountModalOpen, setIsEditAmountModalOpen] = useState(false);
  const [selectedAppointmentForEdit, setSelectedAppointmentForEdit] = useState<Appointment | null>(null);

  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const [loadingAppointments, setLoadingAppointments] = useState<Record<string, string>>({});

  // Debounce для поля категории
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategoryFilter(categoryInput);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [categoryInput]);

  // Загружаем приёмы с фильтром по текущему врачу
  const { data, isLoading, isFetching, error } = useAppointments({
    doctorId: doctorId, // Автоматически фильтруем по текущему врачу
    status: statusFilter && statusFilter.trim() !== '' ? statusFilter : undefined,
    date: dateFilter || undefined,
    time: timeFilter || undefined,
    week: weekFilter || undefined,
    category: categoryFilter || undefined,
  });

  const updateStatusMutation = useUpdateAppointmentStatus();
  const updateAppointmentMutation = useUpdateAppointment();

  const appointments = data?.appointments || [];

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

  /**
   * Обработчик изменения статуса приёма
   */
  const handleStatusChange = async (id: string, newStatus: string) => {
    if (newStatus === 'completed') {
      const appointment = appointments.find(a => a.id === id);
      if (appointment) {
        setSelectedAppointmentForComplete(appointment);
        setIsCompleteModalOpen(true);
      }
      return;
    }

    if (newStatus === 'cancelled') {
      const appointment = appointments.find(a => a.id === id);
      if (appointment) {
        setSelectedAppointmentForCancel(appointment);
        setIsCancelModalOpen(true);
      }
      return;
    }

    setErrorMessages(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });

    setLoadingAppointments(prev => ({ ...prev, [id]: newStatus }));

    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      setLoadingAppointments(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err: any) {
      console.error('❌ [DOCTOR APPOINTMENTS] Ошибка изменения статуса:', err);
      const errorMessage = err.message || 'Ошибка изменения статуса. Попробуйте позже.';
      setErrorMessages(prev => ({ ...prev, [id]: errorMessage }));
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
      console.error('❌ [DOCTOR APPOINTMENTS] Ошибка завершения приёма:', err);
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
      console.error('❌ [DOCTOR APPOINTMENTS] Ошибка отмены приёма:', err);
      throw err;
    }
  };

  /**
   * Сброс фильтров
   */
  const handleResetFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setTimeFilter('');
    setWeekFilter('');
    setCategoryFilter('');
    setCategoryInput('');
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
      console.error('❌ [DOCTOR APPOINTMENTS] Ошибка обновления суммы:', err);
      throw err;
    }
  };


  if (error && !data) {
    return (
      <Card className="bg-red-50 border-red-200">
        <p className="text-red-600 text-sm">Ошибка загрузки: {(error as any).message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <Card padding="lg" className="border border-stroke shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-text-50" />
          <h2 className="text-lg font-semibold text-text-50">Фильтры</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

        {(statusFilter || dateFilter || timeFilter || weekFilter || categoryFilter) && (
          <div className="mt-4 pt-4 border-t border-stroke">
            <Button variant="secondary" size="sm" onClick={handleResetFilters} className="flex items-center gap-2">
              <img src={refreshIcon} alt="Сбросить" className="w-4 h-4" />
              Сбросить фильтры
            </Button>
          </div>
        )}
      </Card>

      {/* Appointments Display - разные виды как в клинике */}
      {isLoading && !data ? (
        <Card>
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : viewType === 'monthly' ? (
        <AppointmentsMonthlyCalendar
          appointments={appointments}
          onAppointmentClick={(appointment) => {
            // При клике на приём в календаре - открываем модальное окно или выполняем действие
            if (appointment.status === 'pending') {
              handleStatusChange(appointment.id, 'confirmed');
            } else if (appointment.status === 'confirmed' || appointment.status === 'completed') {
              // Для confirmed и completed - открываем модальное окно завершения/изменения
              handleStatusChange(appointment.id, 'completed');
            }
          }}
          onDateClick={(date) => {
            // При клике на ячейку календаря - открываем модальное окно создания приёма с предзаполненной датой
            const dateStr = format(date, 'yyyy-MM-dd');
            if (onCreateAppointmentWithDate) {
              onCreateAppointmentWithDate(dateStr);
            } else {
              setCreateModalDefaultDate(dateStr);
              setIsCreateModalOpen(true);
            }
          }}
          onViewChange={handleViewTypeChange}
          currentView={viewType}
        />
      ) : viewType === 'weekly' ? (
        <AppointmentsWeeklyView
          appointments={appointments}
          onAppointmentClick={(appointment) => {
            // При клике на приём в недельном виде
            if (appointment.status === 'pending') {
              handleStatusChange(appointment.id, 'confirmed');
            } else if (appointment.status === 'confirmed' || appointment.status === 'completed') {
              // Для confirmed и completed - открываем модальное окно завершения/изменения
              handleStatusChange(appointment.id, 'completed');
            }
          }}
          onTimeSlotClick={() => {
            // При клике на временной слот - открываем модальное окно создания приёма
            if (onCreateAppointmentClick) {
              onCreateAppointmentClick();
            } else {
              setIsCreateModalOpen(true);
            }
          }}
          onViewChange={handleViewTypeChange}
          currentView={viewType}
        />
      ) : (
        // List view (table или cards) - с переключением видов
        <div className="space-y-4">
          {/* Переключение видов для list вида (Неделя, Месяц, Таблица) - фиксированный порядок */}
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
          <AppointmentsListView
            appointments={displayedAppointments}
            viewMode={viewMode}
            onStatusChange={handleStatusChange}
            onEditAmount={handleEditAmount}
            onUpdateAmount={handleUpdateAmount}
            loadingAppointments={loadingAppointments}
            errorMessages={errorMessages}
            isFetching={isFetching}
            isTransitioning={isTransitioning}
            userRole="DOCTOR"
          />
        </div>
      )}

      {/* Модальное окно создания приёма - только если не используется внешний обработчик */}
      {!isUsingExternalModal && (
        <CreateAppointmentModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateModalDefaultDate(undefined);
          }}
          onSuccess={() => {
            // Обновление произойдет автоматически через React Query
            console.log('✅ [DOCTOR APPOINTMENTS] Приём успешно создан');
            setCreateModalDefaultDate(undefined);
          }}
          defaultDoctorId={doctorId} // Автоматически выбираем текущего врача
          defaultDate={createModalDefaultDate}
        />
      )}

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
    </div>
  );
};

