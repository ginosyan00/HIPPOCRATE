import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Spinner, TimeSlotPicker } from '../common';
import { useClinics, useClinicDoctors, useCreatePublicAppointment } from '../../hooks/usePublic';
import { useAuthStore } from '../../store/useAuthStore';
import { publicService } from '../../services/public.service';
import { Clinic, User } from '../../types/api.types';
import { Calendar } from 'lucide-react';

interface BookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultDate?: string;
}

/**
 * BookNowModal Component
 * Մոդալային պատուհան նոր գրանցում ստեղծելու համար
 */
export const BookNowModal: React.FC<BookNowModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDate,
}) => {
  const user = useAuthStore((state) => state.user);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [selectedClinicSlug, setSelectedClinicSlug] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busySlots, setBusySlots] = useState<Array<{ start: string; end: string; appointmentId: string }>>([]);
  const [isLoadingBusySlots, setIsLoadingBusySlots] = useState(false);

  // Загружаем клиники
  const { data: clinicsData, isLoading: isLoadingClinics } = useClinics();
  const clinics = clinicsData?.data || [];

  // Загружаем врачей выбранной клиники
  const { data: doctors, isLoading: isLoadingDoctors } = useClinicDoctors(selectedClinicSlug || '');

  const createMutation = useCreatePublicAppointment();

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
    }
  }, [isOpen]);

  // Установка даты по умолчанию при открытии модального окна
  useEffect(() => {
    if (isOpen && defaultDate) {
      setSelectedDate(defaultDate);
    }
  }, [isOpen, defaultDate]);

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
        const slots = await publicService.getBusySlots(selectedClinicSlug, selectedDoctorId, selectedDate);
        setBusySlots(slots);
        console.log('✅ [BOOK NOW MODAL] Занятые слоты загружены:', slots);
      } catch (err) {
        console.error('🔴 [BOOK NOW MODAL] Ошибка загрузки занятых слотов:', err);
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

    // Создаем объект даты и времени
    const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}`);
    
    // Проверяем, что дата в будущем
    if (appointmentDateTime <= new Date()) {
      setError('Выберите дату и время в будущем');
      return;
    }

    // Получаем данные клиники для отправки
    const clinic = clinics.find((c: Clinic) => c.id === selectedClinicId);
    if (!clinic) {
      setError('Клиника не найдена');
      return;
    }

    setIsSubmitting(true);

    try {
      // Получаем текущего пользователя (пациента) из auth store
      if (!user) {
        setError('Необходимо войти в систему');
        return;
      }

      await createMutation.mutateAsync({
        clinicSlug: selectedClinicSlug,
        doctorId: selectedDoctorId,
        patient: {
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
        },
        appointmentDate: appointmentDateTime.toISOString(),
        reason: reason || undefined,
        registeredAt: new Date().toISOString(),
      });

      // Успешно создано
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('❌ [BOOK NOW MODAL] Ошибка создания записи:', err);
      setError(err.message || 'Ошибка при создании записи. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };


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

        {/* Выбор даты */}
        <div>
          <label className="block text-sm font-medium text-text-50 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Дата <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTime(''); // Сбрасываем время при смене даты
            }}
            min={minDate}
            className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-all"
            required
          />
        </div>

        {/* Визуальный выбор времени */}
        {selectedDate && selectedDoctorId && selectedClinicSlug && (
          <div>
            {isLoadingBusySlots ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-sm text-text-10">Загрузка доступных слотов...</span>
              </div>
            ) : (
              <TimeSlotPicker
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                busySlots={busySlots}
                appointmentDuration={30}
                selectedDate={selectedDate}
                startHour={8}
                endHour={20}
                slotInterval={30}
              />
            )}
          </div>
        )}

        {selectedDate && (!selectedDoctorId || !selectedClinicSlug) && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Выберите клинику и врача, чтобы увидеть доступные временные слоты
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
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || !selectedClinicId || !selectedDoctorId || !selectedDate || !selectedTime}
          >
            Записаться
          </Button>
        </div>
      </form>
    </Modal>
  );
};

