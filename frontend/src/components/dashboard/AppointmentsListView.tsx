import React, { useState } from 'react';
import { Card, Button } from '../common';
import { AppointmentsTable } from './AppointmentsTable';
import { Appointment } from '../../types/api.types';
import { formatAppointmentDateTime } from '../../utils/dateFormat';
import { Pencil, Check, X } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { DeleteAppointmentsConfirmModal } from './DeleteAppointmentsConfirmModal';
import { toast } from 'react-hot-toast';
import { useTreatmentCategories } from '../../hooks/useTreatmentCategories';
import { getCategoryColor, getStatusColor } from '../../utils/appointmentColors';

// Import icons for card view
import doctorIcon from '../../assets/icons/doctor.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import walletIcon from '../../assets/icons/wallet.svg';
import phoneIcon from '../../assets/icons/phone.svg';
import warningIcon from '../../assets/icons/warning.svg';

interface AppointmentsListViewProps {
  appointments: Appointment[];
  viewMode: 'table' | 'cards';
  onStatusChange: (id: string, status: string) => void;
  onEditAmount?: (appointment: Appointment) => void;
  onUpdateAmount?: (appointmentId: string, amount: number) => Promise<void>;
  onDeleteSelected?: (ids: string[]) => Promise<void>;
  loadingAppointments: Record<string, string>;
  errorMessages: Record<string, string>;
  isFetching?: boolean;
  isTransitioning?: boolean;
  userRole?: 'DOCTOR' | 'CLINIC' | 'ADMIN'; // Роль пользователя для определения колонок
}

/**
 * AppointmentsListView Component
 * Обертка для отображения приёмов в виде таблицы или карточек
 */
export const AppointmentsListView: React.FC<AppointmentsListViewProps> = ({
  appointments,
  viewMode,
  onStatusChange,
  onEditAmount,
  onUpdateAmount,
  onDeleteSelected,
  loadingAppointments,
  errorMessages,
  isFetching = false,
  isTransitioning = false,
  userRole,
}) => {
  // Состояние для редактирования суммы в карточках
  const [editingAmountId, setEditingAmountId] = useState<string | null>(null);
  const [editingAmountValue, setEditingAmountValue] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  
  // Состояние для управления открытым dropdown
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Состояние для выбранных приёмов
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Состояние для модального окна с деталями приёма
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Загружаем категории для получения цветов
  const { data: categories = [] } = useTreatmentCategories();

  /**
   * Открывает модальное окно с деталями приёма
   */
  const handleCardClick = (appointment: Appointment, e: React.MouseEvent) => {
    // Предотвращаем открытие модального окна при клике на интерактивные элементы
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('[role="button"]') ||
      target.closest('.status-dropdown') ||
      target.closest('a')
    ) {
      return;
    }

    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  /**
   * Начинает редактирование суммы
   */
  const handleStartEditAmount = (appointment: Appointment) => {
    setEditingAmountId(appointment.id);
    setEditingAmountValue(appointment.amount ? String(appointment.amount) : '');
    setAmountError('');
  };

  /**
   * Отменяет редактирование суммы
   */
  const handleCancelEditAmount = () => {
    setEditingAmountId(null);
    setEditingAmountValue('');
    setAmountError('');
  };

  /**
   * Сохраняет новую сумму
   */
  const handleSaveAmount = async (appointmentId: string) => {
    setAmountError('');
    
    // Валидация суммы
    const amountNum = parseFloat(editingAmountValue.replace(/\s/g, '').replace(',', '.'));
    if (isNaN(amountNum) || amountNum < 0) {
      setAmountError('Введите корректную сумму (положительное число)');
      return;
    }

    if (onUpdateAmount) {
      try {
        await onUpdateAmount(appointmentId, amountNum);
        setEditingAmountId(null);
        setEditingAmountValue('');
        setAmountError('');
      } catch (err: any) {
        setAmountError(err.message || 'Ошибка при обновлении суммы');
      }
    } else if (onEditAmount) {
      // Fallback к модальному окну, если onUpdateAmount не предоставлен
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        onEditAmount(appointment);
      }
    }
  };

  /**
   * Обработка изменения значения суммы
   */
  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только цифры, точку, запятую и пробелы
    if (value === '' || /^[\d\s.,]+$/.test(value)) {
      setEditingAmountValue(value);
      setAmountError('');
    }
  };

  /**
   * Обработка нажатия Enter для сохранения
   */
  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, appointmentId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveAmount(appointmentId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditAmount();
    }
  };

  /**
   * Обработка выбора/снятия выбора приёма
   */
  const handleToggleSelect = (appointmentId: string) => {
    setSelectedAppointments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appointmentId)) {
        newSet.delete(appointmentId);
      } else {
        newSet.add(appointmentId);
      }
      return newSet;
    });
  };

  /**
   * Обработка выбора всех приёмов
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAppointments(new Set(appointments.map(a => a.id)));
    } else {
      setSelectedAppointments(new Set());
    }
  };

  /**
   * Открывает модальное окно подтверждения удаления
   */
  const handleDeleteClick = () => {
    if (selectedAppointments.size === 0 || !onDeleteSelected) return;
    setIsDeleteModalOpen(true);
  };

  /**
   * Обработка удаления выбранных приёмов после подтверждения
   */
  const handleDeleteConfirmed = async () => {
    if (selectedAppointments.size === 0 || !onDeleteSelected) return;

    const selectedIds = Array.from(selectedAppointments);
    const count = selectedIds.length;

    setIsDeleting(true);
    try {
      await onDeleteSelected(selectedIds);
      setSelectedAppointments(new Set());
      setIsDeleteModalOpen(false);
      toast.success(`Успешно удалено ${count} ${count === 1 ? 'приём' : count < 5 ? 'приёма' : 'приёмов'}`);
      console.log(`✅ [APPOINTMENTS] Успешно удалено ${count} приёмов`);
    } catch (err: any) {
      console.error('❌ [APPOINTMENTS] Ошибка при массовом удалении:', err);
      toast.error(err.message || 'Ошибка при удалении приёмов. Попробуйте позже.');
      // Модальное окно не закрываем при ошибке, чтобы пользователь мог попробовать снова
    } finally {
      setIsDeleting(false);
    }
  };

  if (appointments.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-text-10 text-sm">
          Приёмы не найдены
        </div>
      </Card>
    );
  }

  if (viewMode === 'table') {
    const selectedCount = selectedAppointments.size;
    const isAllSelected = appointments.length > 0 && selectedAppointments.size === appointments.length;
    const isIndeterminate = selectedCount > 0 && selectedCount < appointments.length;
    
    // Удаление доступно для ADMIN и CLINIC
    const canDelete = userRole === 'ADMIN' || userRole === 'CLINIC';

    return (
      <div className={`space-y-4 transition-opacity duration-500 ease-out will-change-opacity ${isFetching ? 'opacity-95' : 'opacity-100'}`}>
        {/* Панель выбора - показываем только для ADMIN */}
        {canDelete && selectedCount > 0 && (
          <Card padding="sm" className="bg-bg-primary">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-50">
                Выбрано {selectedCount} {selectedCount === 1 ? 'приём' : selectedCount < 5 ? 'приёма' : 'приёмов'}
              </span>
              <Button
                onClick={handleDeleteClick}
                disabled={isDeleting || !onDeleteSelected}
                variant="secondary"
                size="sm"
                className="bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Удалить выбранные
              </Button>
            </div>
          </Card>
        )}

        <Card padding="md" className={isTransitioning ? 'opacity-0 transition-opacity duration-300 ease-out' : 'opacity-100 transition-opacity duration-500 ease-out'}>
          <AppointmentsTable
            appointments={appointments}
            onStatusChange={onStatusChange}
            onEditAmount={onEditAmount}
            onUpdateAmount={onUpdateAmount}
            loadingAppointments={loadingAppointments}
            errorMessages={errorMessages}
            selectedAppointments={canDelete ? selectedAppointments : new Set()}
            onToggleSelect={canDelete ? handleToggleSelect : undefined}
            onSelectAll={canDelete ? handleSelectAll : undefined}
            isAllSelected={canDelete ? isAllSelected : false}
            isIndeterminate={canDelete ? isIndeterminate : false}
            userRole={userRole}
          />
        </Card>

        {/* Модальное окно подтверждения удаления */}
        {canDelete && (
          <DeleteAppointmentsConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            count={selectedCount}
            appointments={appointments.filter(appointment => selectedAppointments.has(appointment.id))}
            onConfirm={handleDeleteConfirmed}
            isLoading={isDeleting}
          />
        )}
      </div>
    );
  }

  // Cards view
  return (
    <div className={`space-y-4 transition-opacity duration-500 ease-out will-change-opacity ${isFetching ? 'opacity-95' : 'opacity-100'}`}>
      <div className={isTransitioning ? 'opacity-0 transition-opacity duration-300 ease-out' : 'opacity-100 transition-opacity duration-500 ease-out'}>
        {appointments.map((appointment, index) => {
          // Получаем цвета для карточки
          const categoryColor = getCategoryColor(appointment, categories);
          const statusColorValue = getStatusColor(appointment.status);
          
          return (
          <Card 
            key={appointment.id} 
            padding="md"
            className="appointment-card transition-all duration-500 ease-out will-change-opacity animate-fade-in cursor-pointer hover:shadow-md relative"
            style={{ 
              animationDelay: `${index * 0.02}s`,
              backgroundColor: categoryColor,
              borderLeft: `4px solid ${statusColorValue}`,
            }}
            onClick={(e) => handleCardClick(appointment, e)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Patient Info Header */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-12 h-12 bg-white/20 rounded-sm flex items-center justify-center flex-shrink-0">
                    <span className="text-base text-white font-medium">
                      {appointment.patient?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">
                      {appointment.patient?.name}
                    </h3>
                    {appointment.patient?.phone && (
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <p className="text-xs text-white/90 flex items-center gap-1">
                          <img src={phoneIcon} alt="Телефон" className="w-3 h-3 brightness-0 invert" />
                          {appointment.patient.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor and Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white/10 p-3 rounded-sm">
                    <p className="font-normal text-white/80 mb-2 flex items-center gap-1">
                      <img src={doctorIcon} alt="Врач" className="w-3 h-3 brightness-0 invert" />
                      Врач:
                    </p>
                    <p className="font-semibold text-white text-sm">{appointment.doctor?.name}</p>
                    {appointment.doctor?.specialization && (
                      <p className="text-white/80 mt-1">{appointment.doctor.specialization}</p>
                    )}
                  </div>
                  <div className="bg-white/10 p-3 rounded-sm">
                    <p className="font-normal text-white/80 mb-2 flex items-center gap-1">
                      <img src={calendarIcon} alt="Дата" className="w-3 h-3 brightness-0 invert" />
                      Дата и время приёма:
                    </p>
                    <p className="font-semibold text-white text-sm">
                      {formatAppointmentDateTime(appointment.appointmentDate, { dateFormat: 'long' })}
                    </p>
                    <div className="text-white/80 mt-1">
                      <span className="flex items-center gap-1">
                        <img src={walletIcon} alt="Сумма" className="w-3 h-3 brightness-0 invert" />
                        Сумма:{' '}
                      </span>
                      {editingAmountId === appointment.id ? (
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingAmountValue}
                              onChange={handleAmountInputChange}
                              onKeyDown={(e) => handleAmountKeyDown(e, appointment.id)}
                              className="w-24 px-2 py-1 text-sm border border-stroke rounded focus:outline-none focus:ring-2 focus:ring-main-100 focus:border-main-100"
                              autoFocus
                              disabled={loadingAppointments[appointment.id] === 'updating'}
                            />
                            <span className="text-text-10 text-xs">֏</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSaveAmount(appointment.id)}
                                disabled={loadingAppointments[appointment.id] === 'updating'}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                title="Сохранить"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEditAmount}
                                disabled={loadingAppointments[appointment.id] === 'updating'}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="Отменить"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {amountError && (
                            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                              {amountError}
                            </div>
                          )}
                        </div>
                        ) : (
                        <span className="font-semibold text-white group inline-flex items-center gap-1">
                          {appointment.amount ? (
                            <>
                              {appointment.amount.toLocaleString('ru-RU')} ֏
                              {appointment.status === 'completed' && (onUpdateAmount || onEditAmount) && (
                                <button
                                  onClick={() => handleStartEditAmount(appointment)}
                                  disabled={!!loadingAppointments[appointment.id]}
                                  className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded transition-all"
                                  title={appointment.amount ? 'Изменить сумму' : 'Добавить сумму'}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              —
                              {appointment.status === 'completed' && (onUpdateAmount || onEditAmount) && (
                                <button
                                  onClick={() => handleStartEditAmount(appointment)}
                                  disabled={!!loadingAppointments[appointment.id]}
                                  className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded transition-all"
                                  title="Добавить сумму"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {appointment.reason && (
                  <div className="text-xs">
                    <p className="font-normal text-white/80 mb-1">Причина визита:</p>
                    <p className="text-white">{appointment.reason}</p>
                  </div>
                )}

                {appointment.notes && (
                  <div className="text-xs">
                    <p className="font-normal text-white/80 mb-1">Заметки:</p>
                    <p className="text-white/90">{appointment.notes}</p>
                  </div>
                )}

                {/* Inline Error Message */}
                {errorMessages[appointment.id] && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-sm">
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <img src={warningIcon} alt="Предупреждение" className="w-4 h-4" />
                      {errorMessages[appointment.id]}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div 
                className="flex flex-col gap-2 ml-4 min-w-[140px]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Dropdown для выбора статуса */}
                <StatusDropdown
                  currentStatus={appointment.status}
                  onStatusChange={(status) => {
                    onStatusChange(appointment.id, status);
                    setOpenDropdownId(null); // Закрываем dropdown после выбора
                  }}
                  isLoading={!!loadingAppointments[appointment.id]}
                  disabled={!!loadingAppointments[appointment.id]}
                  isOpen={openDropdownId === appointment.id}
                  onToggle={(isOpen) => {
                    if (isOpen) {
                      setOpenDropdownId(appointment.id); // Открываем только этот dropdown
                    } else {
                      setOpenDropdownId(null); // Закрываем все
                    }
                  }}
                  dropdownId={appointment.id}
                />
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      {/* Модальное окно с деталями приёма */}
      {selectedAppointment && (
        <AppointmentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
        />
      )}
    </div>
  );
};

