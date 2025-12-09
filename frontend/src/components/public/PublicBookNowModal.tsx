import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button, Input, Spinner } from '../common';
import { useClinics, useClinicDoctors, useCreatePublicAppointment } from '../../hooks/usePublic';
import { useAuthStore } from '../../store/useAuthStore';
import { Clinic, User } from '../../types/api.types';
import { Calendar, Clock } from 'lucide-react';

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
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [selectedClinicId]);

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
    const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}`);
    
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

  // Генерируем доступные временные слоты (каждые 30 минут)
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Минимальная дата - сегодня
  const minDate = new Date().toISOString().split('T')[0];

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
                ⚠️ Пожалуйста, укажите ваш телефон для записи
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
                💡 <Link to="/register-user" className="text-main-100 hover:underline font-medium">
                  Зарегистрируйтесь
                </Link> или <Link to="/login" className="text-main-100 hover:underline font-medium">
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

        {/* Выбор даты */}
        <div>
          <label className="block text-sm font-medium text-text-50 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Дата <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={minDate}
            className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
            required
          />
        </div>

        {/* Выбор времени */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-text-50 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Время <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
              required
            >
              <option value="">Выберите время</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
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

