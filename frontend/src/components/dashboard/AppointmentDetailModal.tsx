import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Modal, Card, Button, Input, Spinner } from '../common';
import { Appointment, User } from '../../types/api.types';
import { formatAppointmentDateTime, formatAppointmentTime } from '../../utils/dateFormat';
import { useAuthStore } from '../../store/useAuthStore';
import { useUpdateAppointment, useUpdateAppointmentStatus } from '../../hooks/useAppointments';
import { useUpdatePatient } from '../../hooks/usePatients';
import { useDoctors } from '../../hooks/useUsers';
import { userService } from '../../services/user.service';
import { STATUS_COLORS, getStatusColor } from '../../utils/appointmentColors';

// Import icons
import doctorIcon from '../../assets/icons/doctor.svg';
import phoneIcon from '../../assets/icons/phone.svg';
import mailIcon from '../../assets/icons/mail.svg';
import { Calendar, Clock, User as UserIcon, DollarSign, FileText } from 'lucide-react';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

/**
 * AppointmentDetailModal Component
 * Модальное окно с редактируемой информацией о записи
 * Открывается сразу в режиме редактирования при клике на карточку
 */
export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const user = useAuthStore(state => state.user);
  const updateAppointmentMutation = useUpdateAppointment();
  const updateAppointmentStatusMutation = useUpdateAppointmentStatus();
  const updatePatientMutation = useUpdatePatient();
  const { data: doctors = [], isLoading: isLoadingDoctors } = useDoctors();

  // Проверяем, может ли пользователь редактировать (только CLINIC, ADMIN и DOCTOR)
  const canEdit = user?.role === 'CLINIC' || user?.role === 'ADMIN' || user?.role === 'DOCTOR';
  
  // Для завершенных записей можно редактировать только сумму
  // Для отмененных записей редактирование запрещено
  const isCompleted = appointment?.status === 'completed';
  const isCancelled = appointment?.status === 'cancelled';
  const canEditAppointment = !isCancelled;

  // Состояние формы для записи
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [doctorId, setDoctorId] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<string>('pending');

  // Состояние формы для пациента
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  // Состояние загрузки и ошибок
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doctorsList, setDoctorsList] = useState<User[]>([]);
  
  // Состояние для кастомного dropdown статуса
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Инициализация формы при открытии модального окна
  useEffect(() => {
    if (appointment && isOpen) {
      const appointmentDateObj = parseISO(appointment.appointmentDate.toString());
      const dateStr = format(appointmentDateObj, 'yyyy-MM-dd');
      const timeStr = format(appointmentDateObj, 'HH:mm');

      setAppointmentDate(dateStr);
      setAppointmentTime(timeStr);
      setDuration(String(appointment.duration || 30));
      setDoctorId(appointment.doctorId || '');
      setReason(appointment.reason || '');
      setNotes(appointment.notes || '');
      setAmount(appointment.amount ? String(appointment.amount) : '');
      setStatus(appointment.status);

      // Данные пациента
      setPatientName(appointment.patient?.name || '');
      setPatientPhone(appointment.patient?.phone || '');
      setPatientEmail(appointment.patient?.email || '');
      setErrors({});
    }
  }, [appointment, isOpen]);

  // Загрузка списка врачей
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctorsList = await userService.getDoctors();
        setDoctorsList(doctorsList);
      } catch (err) {
        console.error('Ошибка загрузки врачей:', err);
      }
    };
    if (isOpen) {
      loadDoctors();
    }
  }, [isOpen]);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusDropdownOpen]);

  if (!appointment) return null;

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Для завершенных записей валидируем только сумму
    if (isCompleted) {
      if (amount && (isNaN(parseFloat(amount)) || parseFloat(amount) < 0)) {
        newErrors.amount = 'Сумма должна быть положительным числом';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // Для отмененных записей редактирование запрещено
    if (isCancelled) {
      newErrors.submit = 'Отмененные записи нельзя редактировать';
      setErrors(newErrors);
      return false;
    }

    // Валидация данных пациента
    if (!patientName.trim()) {
      newErrors.patientName = 'Имя пациента обязательно';
    }
    if (!patientPhone.trim()) {
      newErrors.patientPhone = 'Телефон пациента обязателен';
    } else if (!/^\+?[\d\s()-]+$/.test(patientPhone)) {
      newErrors.patientPhone = 'Неверный формат телефона';
    }
    if (patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
      newErrors.patientEmail = 'Неверный формат email';
    }

    // Валидация данных записи
    if (!appointmentDate) {
      newErrors.appointmentDate = 'Дата обязательна';
    }
    if (!appointmentTime) {
      newErrors.appointmentTime = 'Время обязательно';
    }
    if (!doctorId) {
      newErrors.doctorId = 'Выберите врача';
    }
    if (!duration || parseInt(duration) <= 0) {
      newErrors.duration = 'Длительность должна быть больше 0';
    }
    if (amount && (isNaN(parseFloat(amount)) || parseFloat(amount) < 0)) {
      newErrors.amount = 'Сумма должна быть положительным числом';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка сохранения
  const handleSave = async () => {
    if (!validateForm() || !canEditAppointment || !appointment) {
      return;
    }

    setIsLoading(true);
    try {
      // Обновляем данные пациента (если не завершена запись)
      if (appointment.patient?.id && !isCompleted) {
        await updatePatientMutation.mutateAsync({
          id: appointment.patient.id,
          data: {
            name: patientName.trim(),
            phone: patientPhone.trim(),
            email: patientEmail.trim() || undefined,
          },
        });
      }

      const originalStatus = appointment.status;
      const statusChanged = status !== originalStatus;
      
      // Если статус изменился, используем отдельный endpoint для изменения статуса
      if (statusChanged) {
        console.log('🔄 [APPOINTMENT DETAIL] Статус изменился, используем updateStatus:', {
          from: originalStatus,
          to: status,
        });
        
        // Для завершенных записей передаем amount при изменении статуса
        const amountValue = amount ? parseFloat(amount) : undefined;
        
        await updateAppointmentStatusMutation.mutateAsync({
          id: appointment.id,
          status: status,
          amount: status === 'completed' ? amountValue : undefined,
        });
        
        // Если статус изменился с completed на другой, обновляем остальные поля отдельно
        // Если статус меняется на completed, другие поля не обновляем (только amount через updateStatus)
        if (originalStatus === 'completed' && status !== 'completed') {
          const appointmentData: any = {};
          const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);
          appointmentData.appointmentDate = dateTime.toISOString();
          appointmentData.duration = parseInt(duration);
          appointmentData.doctorId = doctorId;
          appointmentData.reason = reason.trim() || undefined;
          appointmentData.notes = notes.trim() || undefined;
          appointmentData.amount = amountValue;
          
          // Удаляем пустые поля
          Object.keys(appointmentData).forEach(key => {
            if (appointmentData[key] === undefined) {
              delete appointmentData[key];
            }
          });
          
          if (Object.keys(appointmentData).length > 0) {
            await updateAppointmentMutation.mutateAsync({
              id: appointment.id,
              data: appointmentData as any,
            });
          }
        } else if (status !== 'completed') {
          // Если статус меняется между незавершенными статусами, обновляем все поля
          const appointmentData: any = {};
          const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);
          appointmentData.appointmentDate = dateTime.toISOString();
          appointmentData.duration = parseInt(duration);
          appointmentData.doctorId = doctorId;
          appointmentData.reason = reason.trim() || undefined;
          appointmentData.notes = notes.trim() || undefined;
          appointmentData.amount = amountValue;
          
          // Удаляем пустые поля
          Object.keys(appointmentData).forEach(key => {
            if (appointmentData[key] === undefined) {
              delete appointmentData[key];
            }
          });
          
          if (Object.keys(appointmentData).length > 0) {
            await updateAppointmentMutation.mutateAsync({
              id: appointment.id,
              data: appointmentData as any,
            });
          }
        }
      } else {
        // Статус не изменился, обновляем обычным способом
        const appointmentData: any = {};
        
        if (isCompleted) {
          // Для завершенных записей можно обновлять только сумму
          // Отправляем undefined если поле пустое (для очистки суммы на бэкенде)
          appointmentData.amount = amount ? parseFloat(amount) : undefined;
        } else {
          // Для незавершенных записей можно обновлять все поля кроме статуса
          const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);
          appointmentData.appointmentDate = dateTime.toISOString();
          appointmentData.duration = parseInt(duration);
          appointmentData.doctorId = doctorId;
          appointmentData.reason = reason.trim() || undefined;
          appointmentData.notes = notes.trim() || undefined;
          appointmentData.amount = amount ? parseFloat(amount) : undefined;
        }
        
        // Удаляем пустые поля
        Object.keys(appointmentData).forEach(key => {
          if (appointmentData[key] === undefined) {
            delete appointmentData[key];
          }
        });
        
        // Проверяем, что есть что обновлять
        if (Object.keys(appointmentData).length > 0) {
          await updateAppointmentMutation.mutateAsync({
            id: appointment.id,
            data: appointmentData as any,
          });
        }
      }

      console.log('✅ [APPOINTMENT DETAIL] Данные успешно сохранены');
      
      // Закрываем модальное окно после успешного сохранения
      onClose();
    } catch (error: any) {
      console.error('❌ [APPOINTMENT DETAIL] Ошибка сохранения:', error);
      setErrors({
        submit: error.message || 'Ошибка при сохранении. Попробуйте позже.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Получаем текст статуса
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'confirmed':
        return 'Подтвержден';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  // Опции статусов с цветами
  const statusOptions = [
    { value: 'pending', label: 'Ожидает', color: STATUS_COLORS.pending },
    { value: 'confirmed', label: 'Подтвержден', color: STATUS_COLORS.confirmed },
    { value: 'completed', label: 'Завершен', color: STATUS_COLORS.completed },
    { value: 'cancelled', label: 'Отменен', color: STATUS_COLORS.cancelled },
  ];

  const patientInitial = patientName.charAt(0).toUpperCase() || 'П';

  // Если пользователь не может редактировать, не показываем модальное окно
  if (!canEdit) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактирование записи на приём"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            isLoading={isLoading}
            disabled={!canEditAppointment}
          >
            Сохранить
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-sm p-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {isCancelled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3">
            <p className="text-sm text-yellow-700">
              ⚠️ Отмененные записи нельзя редактировать
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="bg-blue-50 border border-blue-200 rounded-sm p-3">
            <p className="text-sm text-blue-700">
              ℹ️ Для завершенных записей можно редактировать только сумму оплаты
            </p>
          </div>
        )}

        {/* Дата, время и статус */}
        <Card padding="md" className="bg-main-10/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-text-10 mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Дата {!isCompleted && '*'}
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setErrors((prev) => ({ ...prev, appointmentDate: '' }));
                }}
                disabled={isCompleted || isCancelled}
                className={`w-full px-3 py-2 border rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all ${
                  errors.appointmentDate ? 'border-red-500' : 'border-stroke'
                } ${(isCompleted || isCancelled) ? 'bg-bg-primary cursor-not-allowed' : ''}`}
              />
              {errors.appointmentDate && (
                <p className="mt-1 text-xs text-red-600">{errors.appointmentDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs text-text-10 mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Время {!isCompleted && '*'}
              </label>
              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => {
                  setAppointmentTime(e.target.value);
                  setErrors((prev) => ({ ...prev, appointmentTime: '' }));
                }}
                disabled={isCompleted || isCancelled}
                className={`w-full px-3 py-2 border rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all ${
                  errors.appointmentTime ? 'border-red-500' : 'border-stroke'
                } ${(isCompleted || isCancelled) ? 'bg-bg-primary cursor-not-allowed' : ''}`}
              />
              {errors.appointmentTime && (
                <p className="mt-1 text-xs text-red-600">{errors.appointmentTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs text-text-10 mb-2">Статус</label>
              <div className="relative" ref={statusDropdownRef}>
                <button
                  type="button"
                  onClick={() => !isCompleted && !isCancelled && setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  disabled={isCompleted || isCancelled}
                  className={`w-full px-3 py-2 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all flex items-center justify-between ${
                    (isCompleted || isCancelled) ? 'bg-bg-primary cursor-not-allowed' : 'cursor-pointer hover:border-main-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(status) }}
                    />
                    <span>{getStatusLabel(status)}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-text-10 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isStatusDropdownOpen && !isCompleted && !isCancelled && (
                  <div className="absolute z-50 w-full mt-1 bg-bg-white border border-stroke rounded-sm shadow-lg">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setStatus(option.value);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-bg-primary transition-colors ${
                          status === option.value ? 'bg-main-10' : ''
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: option.color }}
                        />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-stroke">
            <div>
              <label className="block text-xs text-text-10 mb-2">Длительность (минут) {!isCompleted && '*'}</label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  setErrors((prev) => ({ ...prev, duration: '' }));
                }}
                disabled={isCompleted || isCancelled}
                className={`w-full px-3 py-2 border rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all ${
                  errors.duration ? 'border-red-500' : 'border-stroke'
                } ${(isCompleted || isCancelled) ? 'bg-bg-primary cursor-not-allowed' : ''}`}
              />
              {errors.duration && (
                <p className="mt-1 text-xs text-red-600">{errors.duration}</p>
              )}
            </div>

            <div>
              <label className="block text-xs text-text-10 mb-2 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                Сумма оплаты (֏)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                placeholder="0"
                className={`w-full px-3 py-2 border rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all ${
                  errors.amount ? 'border-red-500' : 'border-stroke'
                }`}
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Информация о пациенте */}
        <Card padding="md">
          <h4 className="text-sm font-semibold text-text-100 mb-4 flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Информация о пациенте
          </h4>
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-16 h-16 bg-main-10 rounded-sm flex items-center justify-center">
              <span className="text-2xl text-main-100 font-medium">
                {patientInitial}
              </span>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs text-text-10 mb-2">Имя пациента {!isCompleted && '*'}</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => {
                    setPatientName(e.target.value);
                    setErrors((prev) => ({ ...prev, patientName: '' }));
                  }}
                  disabled={isCompleted || isCancelled}
                  className={`w-full px-3 py-2 border rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all ${
                    errors.patientName ? 'border-red-500' : 'border-stroke'
                  } ${(isCompleted || isCancelled) ? 'bg-bg-primary cursor-not-allowed' : ''}`}
                  placeholder="Введите имя пациента"
                />
                {errors.patientName && (
                  <p className="mt-1 text-xs text-red-600">{errors.patientName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-text-10 mb-2 flex items-center gap-1">
                  <img src={phoneIcon} alt="Телефон" className="w-3.5 h-3.5" />
                  Телефон {!isCompleted && '*'}
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => {
                    setPatientPhone(e.target.value);
                    setErrors((prev) => ({ ...prev, patientPhone: '' }));
                  }}
                  disabled={isCompleted || isCancelled}
                  className={`w-full px-3 py-2 border rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all ${
                    errors.patientPhone ? 'border-red-500' : 'border-stroke'
                  } ${(isCompleted || isCancelled) ? 'bg-bg-primary cursor-not-allowed' : ''}`}
                  placeholder="+374 XX XXX XXX"
                />
                {errors.patientPhone && (
                  <p className="mt-1 text-xs text-red-600">{errors.patientPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-text-10 mb-2 flex items-center gap-1">
                  <img src={mailIcon} alt="Email" className="w-3.5 h-3.5" />
                  Email
                </label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => {
                    setPatientEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, patientEmail: '' }));
                  }}
                  disabled={isCompleted || isCancelled}
                  className={`w-full px-3 py-2 border rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all ${
                    errors.patientEmail ? 'border-red-500' : 'border-stroke'
                  } ${(isCompleted || isCancelled) ? 'bg-bg-primary cursor-not-allowed' : ''}`}
                  placeholder="email@example.com"
                />
                {errors.patientEmail && (
                  <p className="mt-1 text-xs text-red-600">{errors.patientEmail}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Информация о враче */}
        <Card padding="md">
          <h4 className="text-sm font-semibold text-text-100 mb-4 flex items-center gap-2">
            <img src={doctorIcon} alt="Врач" className="w-4 h-4" />
            Информация о враче
          </h4>
          <div>
            <label className="block text-xs text-text-10 mb-2">Врач {!isCompleted && '*'}</label>
            {isLoadingDoctors ? (
              <div className="flex items-center gap-2 py-2">
                <Spinner size="sm" />
                <span className="text-xs text-text-10">Загрузка врачей...</span>
              </div>
            ) : (
              <select
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  setErrors((prev) => ({ ...prev, doctorId: '' }));
                }}
                disabled={isCompleted || isCancelled}
                className={`w-full px-3 py-2 border rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all ${
                  errors.doctorId ? 'border-red-500' : 'border-stroke'
                } ${(isCompleted || isCancelled) ? 'bg-bg-primary cursor-not-allowed' : ''}`}
              >
                <option value="">Выберите врача</option>
                {doctorsList.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} {doctor.specialization ? `(${doctor.specialization})` : ''}
                  </option>
                ))}
              </select>
            )}
            {errors.doctorId && (
              <p className="mt-1 text-xs text-red-600">{errors.doctorId}</p>
            )}
          </div>
        </Card>

        {/* Причина визита */}
        <Card padding="md">
          <h4 className="text-sm font-semibold text-text-100 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Причина визита
          </h4>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isCompleted || isCancelled}
            rows={3}
            className={`w-full px-3 py-2 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all resize-none ${
              (isCompleted || isCancelled) ? 'bg-bg-primary cursor-not-allowed' : ''
            }`}
            placeholder="Введите причину визита..."
          />
        </Card>

        {/* Заметки */}
        <Card padding="md">
          <h4 className="text-sm font-semibold text-text-100 mb-4">Заметки</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isCompleted || isCancelled}
            rows={3}
            className={`w-full px-3 py-2 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all resize-none ${
              (isCompleted || isCancelled) ? 'bg-bg-primary cursor-not-allowed' : ''
            }`}
            placeholder="Дополнительные заметки..."
          />
        </Card>

        {/* Информация о регистрации (только для просмотра) */}
        {appointment.registeredAt && (
          <Card padding="md" className="bg-bg-primary">
            <div className="text-xs">
              <p className="text-text-10 mb-1">Время регистрации на сайте</p>
              <p className="text-text-100">
                {format(parseISO(appointment.registeredAt.toString()), 'd MMM yyyy, HH:mm', { locale: ru })}
              </p>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};
