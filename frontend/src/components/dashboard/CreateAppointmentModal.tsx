import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Spinner, TimeSlotPicker } from '../common';

// Import icons
import warningIcon from '../../assets/icons/warning.svg';
import { useCreateAppointment } from '../../hooks/useAppointments';
import { userService } from '../../services/user.service';
import { patientService } from '../../services/patient.service';
import { appointmentService } from '../../services/appointment.service';
import { User } from '../../types/api.types';
import { PatientSearchInput } from './PatientSearchInput';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDoctorId?: string; // Опциональный ID врача для автоматического выбора
  defaultDate?: string; // Опциональная дата для автоматического заполнения (формат: YYYY-MM-DD)
}

/**
 * CreateAppointmentModal Component
 * Модальное окно для создания нового приёма
 */
export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDoctorId,
  defaultDate,
}) => {
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [isGuest, setIsGuest] = useState(false); // Режим гостя
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const [doctors, setDoctors] = useState<User[]>([]);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(true);
  const createMutation = useCreateAppointment();

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [busySlots, setBusySlots] = useState<Array<{ start: string; end: string; appointmentId: string }>>([]);
  const [isLoadingBusySlots, setIsLoadingBusySlots] = useState(false);

  // Загрузка списка врачей
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setIsDoctorsLoading(true);
        const doctorsList = await userService.getDoctors();
        setDoctors(doctorsList);
        // Если передан defaultDoctorId, автоматически выбираем этого врача
        if (defaultDoctorId && doctorsList.find(d => d.id === defaultDoctorId)) {
          setDoctorId(defaultDoctorId);
        }
      } catch (err) {
        console.error('Ошибка загрузки врачей:', err);
      } finally {
        setIsDoctorsLoading(false);
      }
    };
    if (isOpen) {
      loadDoctors();
    }
  }, [isOpen, defaultDoctorId]);

  // Сброс формы при открытии/закрытии
  useEffect(() => {
    if (!isOpen) {
      setDoctorId('');
      setPatientId('');
      setIsGuest(false);
      setGuestFirstName('');
      setGuestLastName('');
      setGuestPhone('');
      setAppointmentDate('');
      setAppointmentTime('');
      setDuration('30');
      setReason('');
      setNotes('');
      setError('');
      setBusySlots([]);
    } else {
      // Если модальное окно открывается, устанавливаем значения по умолчанию
      if (defaultDoctorId) {
        setDoctorId(defaultDoctorId);
      }
      if (defaultDate) {
        setAppointmentDate(defaultDate);
      }
    }
  }, [isOpen, defaultDoctorId, defaultDate]);

  // Загрузка занятых слотов при изменении врача, даты или длительности
  useEffect(() => {
    const loadBusySlots = async () => {
      if (!doctorId || !appointmentDate) {
        setBusySlots([]);
        return;
      }

      try {
        setIsLoadingBusySlots(true);
        const slots = await appointmentService.getBusySlots(doctorId, appointmentDate);
        setBusySlots(slots);
        console.log('✅ [CREATE APPOINTMENT MODAL] Занятые слоты загружены:', slots);
      } catch (err) {
        console.error('🔴 [CREATE APPOINTMENT MODAL] Ошибка загрузки занятых слотов:', err);
        setBusySlots([]);
      } finally {
        setIsLoadingBusySlots(false);
      }
    };

    loadBusySlots();
  }, [doctorId, appointmentDate, duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Валидация
      if (!doctorId) {
        throw new Error('Выберите врача');
      }
      
      let finalPatientId = patientId;

      // Если выбран режим гостя, создаём гостевого пациента
      if (isGuest) {
        if (!guestFirstName.trim()) {
          throw new Error('Введите имя гостя');
        }
        if (!guestLastName.trim()) {
          throw new Error('Введите фамилию гостя');
        }
        if (!guestPhone.trim()) {
          throw new Error('Введите телефон гостя');
        }

        // Создаём гостевого пациента
        const guestName = `${guestFirstName.trim()} ${guestLastName.trim()}`;
        const guestPatient = await patientService.create({
          name: guestName,
          phone: guestPhone.trim(),
          status: 'guest',
        });

        finalPatientId = guestPatient.id;
        console.log('✅ [CREATE APPOINTMENT MODAL] Гостевой пациент создан:', guestPatient.id);
      } else {
        // Проверяем, что выбран пациент
        if (!patientId) {
          throw new Error('Выберите пациента');
        }
      }

      if (!appointmentDate) {
        throw new Error('Выберите дату');
      }
      if (!appointmentTime) {
        throw new Error('Выберите время');
      }

      // Объединяем дату и время
      const dateTimeString = `${appointmentDate}T${appointmentTime}:00`;
      const appointmentDateTime = new Date(dateTimeString);

      // Проверяем, что дата в будущем
      if (appointmentDateTime <= new Date()) {
        throw new Error('Дата и время приёма должны быть в будущем');
      }

      // Создаём приём
      await createMutation.mutateAsync({
        doctorId,
        patientId: finalPatientId,
        appointmentDate: appointmentDateTime.toISOString(),
        duration: parseInt(duration),
        reason: reason || undefined,
        notes: notes || undefined,
        registeredAt: new Date().toISOString(), // Локальное время регистрации
      });

      console.log('✅ [CREATE APPOINTMENT MODAL] Приём успешно создан');

      // Уведомляем родительский компонент
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('🔴 [CREATE APPOINTMENT MODAL] Ошибка:', err.message);
      setError(err.message || 'Ошибка при создании приёма');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError('');
      onClose();
    }
  };

  // Получаем минимальную дату (сегодня)
  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Завтра как минимум
    return today.toISOString().split('T')[0];
  };


  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Создать приём" size="lg">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Врач */}
        <div>
          <label className="block text-sm font-normal text-text-10 mb-2">
            Врач <span className="text-red-500">*</span>
          </label>
          {isDoctorsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <select
              value={doctorId}
              onChange={e => setDoctorId(e.target.value)}
              className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-smooth"
              required
              disabled={!!defaultDoctorId} // Блокируем выбор, если передан defaultDoctorId
            >
              <option value="">Выберите врача</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} {doctor.specialization ? `(${doctor.specialization})` : ''}
                </option>
              ))}
            </select>
          )}
          {defaultDoctorId && (
            <p className="text-xs text-text-10 mt-1">
              Врач выбран автоматически (текущий пользователь)
            </p>
          )}
        </div>

        {/* Переключатель: Зарегистрированный пациент / Гость */}
        <div>
          <label className="block text-sm font-normal text-text-10 mb-2">
            Тип регистрации
          </label>
          <div className="flex gap-2 border border-stroke rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setIsGuest(false);
                setPatientId('');
                setGuestFirstName('');
                setGuestLastName('');
                setGuestPhone('');
              }}
              className={`flex-1 px-4 py-2 text-sm font-normal transition-smooth ${
                !isGuest
                  ? 'bg-main-100 text-white'
                  : 'bg-bg-white text-text-50 hover:bg-bg-primary'
              }`}
            >
              Зарегистрированный пациент
            </button>
            <button
              type="button"
              onClick={() => {
                setIsGuest(true);
                setPatientId('');
              }}
              className={`flex-1 px-4 py-2 text-sm font-normal transition-smooth ${
                isGuest
                  ? 'bg-main-100 text-white'
                  : 'bg-bg-white text-text-50 hover:bg-bg-primary'
              }`}
            >
              Гость
            </button>
          </div>
        </div>

        {/* Пациент (только для зарегистрированных) */}
        {!isGuest && (
          <div>
            <label className="block text-sm font-normal text-text-10 mb-2">
              Пациент <span className="text-red-500">*</span>
            </label>
            <PatientSearchInput
              value={patientId}
              onChange={setPatientId}
              required={!isGuest}
              placeholder="Поиск пациента по имени..."
            />
          </div>
        )}

        {/* Данные гостя (только для гостей) */}
        {isGuest && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-normal text-text-10 mb-2">
                  Имя <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Имя"
                  value={guestFirstName}
                  onChange={e => setGuestFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-normal text-text-10 mb-2">
                  Фамилия <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Фамилия"
                  value={guestLastName}
                  onChange={e => setGuestLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-normal text-text-10 mb-2">
                Телефон <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="+374 98 123456"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Дата */}
        <div>
          <label className="block text-sm font-normal text-text-10 mb-2">
            Дата <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={appointmentDate}
            onChange={e => {
              setAppointmentDate(e.target.value);
              setAppointmentTime(''); // Сбрасываем время при смене даты
            }}
            min={getMinDate()}
            className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-smooth"
            required
          />
        </div>

        {/* Визуальный выбор времени */}
        {appointmentDate && doctorId && (
          <div>
            {isLoadingBusySlots ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="sm" />
                <span className="ml-2 text-sm text-text-10">Загрузка доступных слотов...</span>
              </div>
            ) : (
              <TimeSlotPicker
                selectedTime={appointmentTime}
                onTimeSelect={setAppointmentTime}
                busySlots={busySlots}
                appointmentDuration={parseInt(duration)}
                selectedDate={appointmentDate}
                startHour={8}
                endHour={20}
                slotInterval={30}
              />
            )}
          </div>
        )}

        {appointmentDate && !doctorId && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="flex items-center gap-1">
                <img src={warningIcon} alt="Предупреждение" className="w-4 h-4" />
                Выберите врача, чтобы увидеть доступные временные слоты
              </span>
            </p>
          </div>
        )}

        {/* Длительность */}
        <div>
          <label className="block text-sm font-normal text-text-10 mb-2">
            Длительность (минуты)
          </label>
          <select
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-smooth"
          >
            <option value="15">15 минут</option>
            <option value="30">30 минут</option>
            <option value="45">45 минут</option>
            <option value="60">1 час</option>
            <option value="90">1.5 часа</option>
            <option value="120">2 часа</option>
          </select>
        </div>

        {/* Причина визита */}
        <div>
          <label className="block text-sm font-normal text-text-10 mb-2">
            Причина визита / Процедура
          </label>
          <Input
            placeholder="Например: Консультация, Лечение кариеса, Профилактический осмотр"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>

        {/* Заметки */}
        <div>
          <label className="block text-sm font-normal text-text-10 mb-2">
            Заметки
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-smooth resize-none"
            placeholder="Дополнительная информация о приёме..."
          />
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-3 pt-4 border-t border-stroke">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Создать приём
          </Button>
        </div>
      </form>
    </Modal>
  );
};

