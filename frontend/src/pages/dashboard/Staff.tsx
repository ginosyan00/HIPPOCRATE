import React, { useState } from 'react';
import { Button, Card, Modal, Input, Spinner } from '../../components/common';
import { useUsers, useCreateUser, useDeleteUser } from '../../hooks/useUsers';

// Import doctor icon
import doctorIcon from '../../assets/icons/doctor.svg';

/**
 * Staff Page - Figma Design
 * Управление сотрудниками в новом стиле
 */
export const StaffPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('');

  const { data, isLoading, error } = useUsers({ role: roleFilter || undefined });
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor' as 'admin' | 'doctor' | 'assistant',
    specialization: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'doctor',
        specialization: '',
        phone: '',
      });
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Удалить сотрудника ${name}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err.message || 'Ошибка удаления');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <p className="text-red-600 text-sm">Ошибка загрузки: {(error as any).message}</p>
      </Card>
    );
  }

  const users = data?.users || [];

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-50 text-purple-700 border-purple-200',
      doctor: 'bg-main-10 text-main-100 border-main-100/20',
      assistant: 'bg-secondary-10 text-secondary-100 border-secondary-100/20',
    };
    const labels = {
      admin: 'Администратор',
      doctor: 'Врач',
      assistant: 'Ассистент',
    };
    return (
      <span className={`px-3 py-1 border rounded-sm text-xs font-normal ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-text-100">Сотрудники</h1>
          <p className="text-text-10 text-sm mt-1">Всего: {data?.meta.total || 0}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          ➕ Добавить сотрудника
        </Button>
      </div>

      {/* Filter */}
      <Card padding="md">
        <div>
          <label className="block text-sm font-normal text-text-10 mb-2">Фильтр по роли</label>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="block w-full md:w-64 px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-smooth"
          >
            <option value="">Все</option>
            <option value="admin">Администраторы</option>
            <option value="doctor">Врачи</option>
            <option value="assistant">Ассистенты</option>
          </select>
        </div>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <Card key={user.id} padding="md">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-stroke bg-main-10 flex items-center justify-center flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img src={doctorIcon} alt="Doctor" className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-text-100 truncate">{user.name}</h3>
                  <p className="text-xs text-text-10 truncate">{user.email}</p>
                  <div className="mt-1">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>

              {user.specialization && (
                <div className="text-xs">
                  <p className="text-text-10 mb-0.5">Специализация:</p>
                  <p className="text-text-50 font-medium">{user.specialization}</p>
                </div>
              )}

              {user.phone && (
                <div className="text-xs">
                  <p className="text-text-10 mb-0.5">Телефон:</p>
                  <p className="text-text-50">{user.phone}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-stroke">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(user.id, user.name)}
                  className="w-full"
                >
                  Удалить
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Добавить сотрудника"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ФИО"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Пароль"
            type="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required
            helperText="Минимум 8 символов, 1 заглавная, 1 цифра"
          />

          <div>
            <label className="block text-sm font-normal text-text-10 mb-2">
              Роль <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as any })}
              className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm focus:outline-none focus:border-main-100 transition-smooth"
              required
            >
              <option value="doctor">Врач</option>
              <option value="assistant">Ассистент</option>
              <option value="admin">Администратор</option>
            </select>
          </div>

          {formData.role === 'doctor' && (
            <Input
              label="Специализация"
              placeholder="Терапевт, Хирург, Ортодонт..."
              value={formData.specialization}
              onChange={e => setFormData({ ...formData, specialization: e.target.value })}
            />
          )}

          <Input
            label="Телефон"
            type="tel"
            placeholder="+374 98 123456"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Создать
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
