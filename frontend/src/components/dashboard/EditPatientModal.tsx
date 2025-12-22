import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../common';
import { Patient, Gender } from '../../types/api.types';
import { useUpdatePatient } from '../../hooks/usePatients';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onUpdate?: () => void; // Callback после успешного обновления
}

/**
 * EditPatientModal Component
 * Модальное окно для редактирования данных пациента
 */
export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onUpdate,
}) => {
  const updateMutation = useUpdatePatient();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    notes: '',
  });

  const [error, setError] = useState('');

  // Инициализация данных при открытии модального окна
  useEffect(() => {
    if (isOpen && patient) {
      setFormData({
        name: patient.name,
        phone: patient.phone,
        email: patient.email || '',
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        gender: (patient.gender as 'male' | 'female' | 'other') || '',
        notes: patient.notes || '',
      });
      setError('');
    }
  }, [isOpen, patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setError('');

    try {
      const patientData: Partial<Patient> = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: formData.gender ? (formData.gender as Gender) : undefined,
        notes: formData.notes || undefined,
      };

      await updateMutation.mutateAsync({
        id: patient.id,
        data: patientData,
      });

      console.log('✅ [EDIT PATIENT MODAL] Пациент успешно обновлен');
      
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (err: any) {
      console.error('❌ [EDIT PATIENT MODAL] Ошибка обновления:', err);
      setError(err.message || 'Ошибка при обновлении данных пациента');
    }
  };

  if (!patient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать пациента"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={updateMutation.isPending}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            isLoading={updateMutation.isPending}
          >
            Сохранить
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Input
          label="ФИО"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Телефон"
            type="tel"
            placeholder="+374 98 123456"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="patient@example.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Дата рождения"
            type="date"
            value={formData.dateOfBirth}
            onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
          <div>
            <label className="block text-sm font-normal text-text-10 mb-2">Пол</label>
            <select
              value={formData.gender}
              onChange={e =>
                setFormData({ ...formData, gender: e.target.value as any })
              }
              className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-smooth"
            >
              <option value="">Не указан</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="other">Другой</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-normal text-text-10 mb-2">Заметки</label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-smooth resize-none"
            placeholder="Аллергии, особые указания..."
          />
        </div>
      </form>
    </Modal>
  );
};











