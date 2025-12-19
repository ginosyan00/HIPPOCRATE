import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { TreatmentCategory } from '../../types/api.types';
import {
  useTreatmentCategories,
  useCreateTreatmentCategory,
  useUpdateTreatmentCategory,
  useDeleteTreatmentCategory,
} from '../../hooks/useTreatmentCategories';
import { Spinner } from '../common/Spinner';
import { toast } from 'react-hot-toast';

/**
 * TreatmentCategoriesSection Component
 * Компонент для управления категориями лечения клиники
 */
export const TreatmentCategoriesSection: React.FC = () => {
  const { data: categories, isLoading } = useTreatmentCategories();
  const createMutation = useCreateTreatmentCategory();
  const updateMutation = useUpdateTreatmentCategory();
  const deleteMutation = useDeleteTreatmentCategory();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TreatmentCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<TreatmentCategory | null>(null);

  // Форма добавления/редактирования
  const [formData, setFormData] = useState({
    name: '',
    defaultDuration: 30,
    description: '',
  });

  const handleAddClick = () => {
    setFormData({ name: '', defaultDuration: 30, description: '' });
    setIsAddModalOpen(true);
  };

  const handleEditClick = (category: TreatmentCategory) => {
    setFormData({
      name: category.name,
      defaultDuration: category.defaultDuration,
      description: category.description || '',
    });
    setEditingCategory(category);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (category: TreatmentCategory) => {
    setCategoryToDelete(category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data: formData,
        });
        toast.success('Категория успешно обновлена');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Категория успешно создана');
      }
      setIsAddModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', defaultDuration: 30, description: '' });
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при сохранении категории');
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteMutation.mutateAsync(categoryToDelete.id);
      toast.success('Категория успешно удалена');
      setCategoryToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении категории');
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', defaultDuration: 30, description: '' });
  };

  if (isLoading) {
    return (
      <Card title="Категории лечения" padding="lg">
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  const categoriesList = categories || [];

  return (
    <>
      <Card title="Категории лечения" padding="lg">
        <div className="space-y-4">
          {/* Описание */}
          <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
            <p className="text-blue-800 text-sm">
              <strong>Информация:</strong> Определите категории лечения, которые предоставляет ваша клиника.
              При регистрации врача он сможет выбрать одну или несколько категорий. Для каждой категории можно
              указать длительность процедуры по умолчанию.
            </p>
          </div>

          {/* Кнопка добавления */}
          <div className="flex justify-end">
            <Button type="button" variant="primary" size="md" onClick={handleAddClick}>
              + Добавить категорию
            </Button>
          </div>

          {/* Список категорий */}
          {categoriesList.length === 0 ? (
            <div className="text-center py-12 border border-stroke rounded-sm bg-bg-white">
              <div className="w-16 h-16 bg-main-10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-main-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-text-50 text-lg">Нет категорий лечения</p>
              <p className="text-text-10 text-sm mt-2">
                Добавьте категории лечения для вашей клиники
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoriesList.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-stroke rounded-sm bg-bg-white hover:border-main-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="text-text-100 font-semibold text-base">{category.name}</h4>
                    {category.description && (
                      <p className="text-text-10 text-sm mt-1">{category.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-text-50 text-sm">
                        Длительность по умолчанию: <strong>{category.defaultDuration} мин</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditClick(category)}
                    >
                      Редактировать
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(category)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Модальное окно добавления/редактирования */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Название категории *"
            placeholder="Например: Терапевтическая стоматология"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Длительность по умолчанию (минуты) *"
            type="number"
            min="5"
            max="480"
            value={formData.defaultDuration.toString()}
            onChange={(e) =>
              setFormData({ ...formData, defaultDuration: parseInt(e.target.value) || 30 })
            }
            required
            helperText="Минимум 5 минут, максимум 480 минут (8 часов)"
          />

          <div>
            <label className="block text-sm font-medium text-text-50 mb-2">
              Описание (опционально)
            </label>
            <textarea
              className="w-full px-4 py-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-main-100 text-sm resize-none"
              rows={3}
              placeholder="Краткое описание категории..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingCategory ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title="Подтверждение удаления"
      >
        <div className="space-y-4">
          <p className="text-text-50">
            Вы уверены, что хотите удалить категорию{' '}
            <strong>{categoryToDelete?.name}</strong>?
          </p>
          <p className="text-text-10 text-sm">
            Это действие нельзя отменить. Все связи с врачами будут удалены.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCategoryToDelete(null)}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={deleteMutation.isPending}
              className="flex-1"
            >
              Удалить
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
