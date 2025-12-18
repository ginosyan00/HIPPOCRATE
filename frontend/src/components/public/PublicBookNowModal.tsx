import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Input, Spinner, Calendar } from '../common';
import { useClinics, useClinicDoctors, useCreatePublicAppointment } from '../../hooks/usePublic';
import { useAuthStore } from '../../store/useAuthStore';
import { publicService } from '../../services/public.service';
import { Clinic, User } from '../../types/api.types';

// Import icons
import warningIcon from '../../assets/icons/warning.svg';
import lightbulbIcon from '../../assets/icons/lightbulb.svg';

interface PublicBookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * PublicBookNowModal Component
 * Универсальное модальное окно для бронирования приёма
 * Работает для авторизованных и неавторизованных пользователей
 */
export const PublicBookNowModal: React.FC<PublicBookNowModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [selectedClinicSlug, setSelectedClinicSlug] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busySlots, setBusySlots] = useState<Array<{ start: string; end: string; appointmentId: string }>>([]);
  const [isLoadingBusySlots, setIsLoadingBusySlots] = useState(false);

  // Данные для неавторизованных пользователей
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');

  // Загружаем клиники
  const { data: clinicsData, isLoading: isLoadingClinics } = useClinics();
  const clinics = clinicsData?.data || [];

  // Загружаем врачей выбранной клиники
  const { data: doctors, isLoading: isLoadingDoctors } = useClinicDoctors(selectedClinicSlug || '');

  const createMutation = useCreatePublicAppointment();

  // Автозаполнение для авторизованных пользователей
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      setPatientName(user.name || '');
      setPatientPhone(user.phone || '');
      setPatientEmail(user.email || '');
    } else if (isOpen && !isAuthenticated) {
      // Сброс для неавторизованных
      setPatientName('');
      setPatientPhone('');
      setPatientEmail('');
    }
  }, [isOpen, isAuthenticated, user]);

  // Сброс формы при закрытии
  useEffect(() => {
    if (!isOpen) {
      setSelectedClinicId('');
      setSelectedClinicSlug('');
      setSelectedDoctorId('');
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
      setError('');
      setPatientName('');
      setPatientPhone('');
      setPatientEmail('');
    }
  }, [isOpen]);

  // Сброс врача при смене клиники
  useEffect(() => {
    setSelectedDoctorId('');
    setBusySlots([]);
  }, [selectedClinicId]);

  // Загрузка занятых слотов при изменении врача, клиники или даты
  useEffect(() => {
    const loadBusySlots = async () => {
      if (!selectedClinicSlug || !selectedDoctorId || !selectedDate) {
        setBusySlots([]);
        return;
      }

      try {
        setIsLoadingBusySlots(true);
        const dateStr = selectedDate.toISOString().split('T')[0];
        const slots = await publicService.getBusySlots(selectedClinicSlug, selectedDoctorId, dateStr);
        setBusySlots(slots);
        console.log('✅ [PUBLIC BOOK NOW MODAL] Занятые слоты загружены:', slots);
      } catch (err) {
        console.error('🔴 [PUBLIC BOOK NOW MODAL] Ошибка загрузки занятых слотов:', err);
        setBusySlots([]);
      } finally {
        setIsLoadingBusySlots(false);
      }
    };

    loadBusySlots();
  }, [selectedClinicSlug, selectedDoctorId, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!selectedClinicSlug) {
      setError('Выберите клинику');
      return;
    }

    if (!selectedDoctorId) {
      setError('Выберите врача');
      return;
    }

    if (!selectedDate) {
      setError('Выберите дату');
      return;
    }

    if (!selectedTime) {
      setError('Выберите время');
      return;
    }

    // Валидация данных пациента
    if (!isAuthenticated) {
      if (!patientName.trim()) {
        setError('Укажите ваше ФИО');
        return;
      }
      if (!patientPhone.trim()) {
        setError('Укажите ваш телефон');
        return;
      }
    } else if (isAuthenticated && user) {
      // Для авторизованных проверяем, что есть имя и телефон
      if (!user.name && !patientName.trim()) {
        setError('Укажите ваше ФИО');
        return;
      }
      if (!user.phone && !patientPhone.trim()) {
        setError('Укажите ваш телефон');
        return;
      }
    }

    // Создаем объект даты и времени
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDateTime = new Date(selectedDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    
    // Проверяем, что дата в будущем
    if (appointmentDateTime <= new Date()) {
      setError('Выберите дату и время в будущем');
      return;
    }

    setIsSubmitting(true);

    try {
      // Подготовка данных пациента
      const patientData = isAuthenticated && user
        ? {
            name: user.name || patientName,
            phone: user.phone || patientPhone,
            email: user.email || patientEmail || undefined,
          }
        : {
            name: patientName,
            phone: patientPhone,
            email: patientEmail || undefined,
          };

      // Записываем локальное время пользователя
      const now = new Date();
      const timezoneOffset = -now.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
      const offsetMinutes = Math.abs(timezoneOffset) % 60;
      const offsetSign = timezoneOffset >= 0 ? '+' : '-';
      const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
      const registeredAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}${offsetString}`;

      await createMutation.mutateAsync({
        clinicSlug: selectedClinicSlug,
        doctorId: selectedDoctorId,
        patient: patientData,
        appointmentDate: appointmentDateTime.toISOString(),
        reason: reason || undefined,
        registeredAt: registeredAt,
      });

      // Успешно создано
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('❌ [PUBLIC BOOK NOW MODAL] Ошибка создания записи:', err);
      setError(err.message || 'Ошибка при создании записи. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Записаться на приём"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Информация об авторизованном пользователе */}
        {isAuthenticated && user && (
          <div className="bg-secondary-10 border border-secondary-50 px-4 py-3 rounded-sm">
            <p className="text-xs text-text-10 mb-1">Вы записываетесь как:</p>
            <p className="text-sm font-medium text-text-100">{user.name}</p>
            {user.email && <p className="text-xs text-text-50 mt-1">{user.email}</p>}
            {user.phone && <p className="text-xs text-text-50">{user.phone}</p>}
            {!user.phone && (
              <p className="text-xs text-text-10 mt-2">
                <span className="flex items-center gap-1">
                  <img src={warningIcon} alt="Предупреждение" className="w-4 h-4" />
                  Пожалуйста, укажите ваш телефон для записи
                </span>
              </p>
            )}
          </div>
        )}

        {/* Выбор клиники */}
        <div>
          <label className="block text-sm font-medium text-text-50 mb-2">
            Клиника <span className="text-red-500">*</span>
          </label>
          {isLoadingClinics ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <select
              value={selectedClinicId}
              onChange={(e) => {
                const clinicId = e.target.value;
                setSelectedClinicId(clinicId);
                const clinic = clinics.find((c: Clinic) => c.id === clinicId);
                if (clinic) {
                  setSelectedClinicSlug(clinic.slug);
                }
              }}
              className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
              required
            >
              <option value="">Выберите клинику</option>
              {clinics.map((clinic: Clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name} {clinic.city ? `(${clinic.city})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Выбор врача */}
        {selectedClinicSlug && (
          <div>
            <label className="block text-sm font-medium text-text-50 mb-2">
              Врач <span className="text-red-500">*</span>
            </label>
            {isLoadingDoctors ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : doctors && doctors.length > 0 ? (
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
                required
              >
                <option value="">Выберите врача</option>
                {doctors.map((doctor: User) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} {doctor.specialization ? `(${doctor.specialization})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-text-10">Врачи не найдены в этой клинике</p>
            )}
          </div>
        )}

        {/* Поля для неавторизованных пользователей */}
        {!isAuthenticated && (
          <>
            <Input
              label="Ваше ФИО"
              placeholder="Иван Иванов"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Телефон"
                type="tel"
                placeholder="+374 98 123456"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                required
              />
              <Input
                label="Email (необязательно)"
                type="email"
                placeholder="example@mail.com"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
              />
            </div>

            {/* Ссылка на регистрацию */}
            <div className="bg-main-10 border border-stroke px-4 py-2 rounded-sm">
              <p className="text-xs text-text-50">
                <span className="flex items-center gap-1">
                  <img src={lightbulbIcon} alt="Совет" className="w-4 h-4" />
                  <Link to="/register-user" className="text-main-100 hover:underline font-medium">
                    Зарегистрируйтесь
                  </Link>
                  </span> или <Link to="/login" className="text-main-100 hover:underline font-medium">
                  войдите
                </Link>, чтобы не вводить данные каждый раз
              </p>
            </div>
          </>
        )}

        {/* Поле телефона для авторизованных пользователей без телефона */}
        {isAuthenticated && user && !user.phone && (
          <Input
            label="Телефон"
            type="tel"
            placeholder="+374 98 123456"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            required
          />
        )}

        {/* Календарь с выбором даты и времени */}
        {selectedDoctorId && selectedClinicSlug ? (
          <div>
            {isLoadingBusySlots ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-sm text-text-10">Загрузка доступных слотов...</span>
              </div>
            ) : (
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(''); // Сбрасываем время при смене даты
                }}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                minDate={new Date()}
                busySlots={busySlots}
                appointmentDuration={30}
              />
            )}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="flex items-center gap-1">
                <img src={warningIcon} alt="Предупреждение" className="w-4 h-4" />
                Выберите клинику и врача, чтобы увидеть календарь и доступные временные слоты
              </span>
            </p>
          </div>
        )}

        {/* Причина визита */}
        <div>
          <label className="block text-sm font-medium text-text-50 mb-2">
            Причина визита / Процедура
          </label>
          <Input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Опишите причину визита или процедуру"
            className="w-full"
          />
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 justify-end pt-4 border-t border-stroke">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-sm font-normal"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || !selectedClinicId || !selectedDoctorId || !selectedDate || !selectedTime}
            className="text-sm font-normal bg-main-10 text-main-100 hover:bg-main-100 hover:text-white"
          >
            Записаться
          </Button>
        </div>
      </form>
    </Modal>
  );
};

