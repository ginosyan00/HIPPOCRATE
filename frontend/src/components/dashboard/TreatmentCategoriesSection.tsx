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

  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TreatmentCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<TreatmentCategory | null>(null);

  // Форма добавления/редактирования
  const [formData, setFormData] = useState({
    name: '',
    defaultDuration: 30,
    description: '',
    color: '',
  });

  const handleAddClick = () => {
    setFormData({ name: '', defaultDuration: 30, description: '', color: '' });
    setIsAddFormVisible(!isAddFormVisible);
    setEditingCategory(null);
  };

  const handleEditClick = (category: TreatmentCategory) => {
    setFormData({
      name: category.name,
      defaultDuration: category.defaultDuration,
      description: category.description || '',
      color: category.color || '',
    });
    setEditingCategory(category);
    setIsAddFormVisible(true);
  };

  const handleDeleteClick = (category: TreatmentCategory) => {
    setCategoryToDelete(category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Нормализуем цвет: убеждаемся, что он в формате HEX с #
      let normalizedColor = formData.color.trim().toUpperCase();
      if (normalizedColor && !normalizedColor.startsWith('#')) {
        normalizedColor = '#' + normalizedColor;
      }
      // Проверяем валидность HEX формата
      if (normalizedColor && normalizedColor !== '#' && !/^#[0-9A-F]{6}$/.test(normalizedColor)) {
        toast.error('Цвет должен быть в формате HEX (например, #8B5CF6)');
        return;
      }

      // Подготавливаем данные
      const submitData: any = {
        name: formData.name.trim(),
        defaultDuration: formData.defaultDuration,
        description: formData.description.trim() || undefined,
      };

      // Обработка цвета
      if (normalizedColor && normalizedColor !== '#') {
        // Валидный цвет - сохраняем
        submitData.color = normalizedColor;
      } else {
        // Пустой цвет - при создании не отправляем, при обновлении удаляем (null)
        if (editingCategory) {
          submitData.color = null; // Удаляем цвет при обновлении
        }
        // При создании цвет не включается в данные (будет null по умолчанию)
      }

      console.log('🎨 [TREATMENT CATEGORY FORM] Отправка данных:', JSON.stringify(submitData, null, 2));

      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          data: submitData,
        });
        toast.success('Категория успешно обновлена');
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success('Категория успешно создана');
      }
      setIsAddFormVisible(false);
      setEditingCategory(null);
      setFormData({ name: '', defaultDuration: 30, description: '', color: '' });
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

  const handleCancelForm = () => {
    setIsAddFormVisible(false);
    setEditingCategory(null);
    setFormData({ name: '', defaultDuration: 30, description: '', color: '' });
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

          {/* Inline форма добавления/редактирования */}
          {isAddFormVisible && (
            <div className="border border-stroke rounded-sm bg-bg-white p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Горизонтальное расположение полей согласно дизайну */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-50 mb-2">
                      Название категории *
                    </label>
                    <input
                      type="text"
                      placeholder="Например: Терапевтическая стоматология"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-stroke rounded-lg bg-bg-white text-sm text-text-100 focus:outline-none focus:ring-2 focus:ring-main-100 focus:border-main-100 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-50 mb-2">
                      Длительность (мин) *
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      placeholder="30"
                      value={formData.defaultDuration.toString()}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultDuration: parseInt(e.target.value) || 30 })
                      }
                      required
                      className="w-full px-4 py-3 border border-stroke rounded-lg bg-bg-white text-sm text-text-100 focus:outline-none focus:ring-2 focus:ring-main-100 focus:border-main-100 transition-colors"
                    />
                  </div>
                </div>

                {/* Описание и цвет в одной строке */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-10 mb-2">
                      Описание (опционально)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-stroke rounded-lg bg-bg-white text-sm text-text-100 focus:outline-none focus:ring-2 focus:ring-main-100 focus:border-main-100 resize-none transition-colors"
                      rows={2}
                      placeholder="Краткое описание категории..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-50 mb-2">
                      Цвет категории (HEX)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.color && formData.color.startsWith('#') ? formData.color : '#9CA3AF'}
                        onChange={(e) => {
                          const colorValue = e.target.value.toUpperCase();
                          setFormData({ ...formData, color: colorValue });
                        }}
                        className="w-16 h-12 border border-stroke rounded-lg cursor-pointer"
                        title="Выберите цвет категории"
                      />
                      <input
                        type="text"
                        placeholder="#9CA3AF"
                        value={formData.color}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          if (value === '' || /^#[0-9A-F]{0,6}$/.test(value)) {
                            setFormData({ ...formData, color: value });
                          }
                        }}
                        className="flex-1 px-4 py-3 border border-stroke rounded-lg bg-bg-white text-sm text-text-100 focus:outline-none focus:ring-2 focus:ring-main-100 focus:border-main-100 transition-colors font-mono"
                        maxLength={7}
                      />
                    </div>
                    <p className="text-xs text-text-10 mt-1">
                      Цвет будет использоваться для карточек назначений
                    </p>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelForm}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    size="sm"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={createMutation.isPending || updateMutation.isPending}
                    size="sm"
                  >
                    {editingCategory ? 'Сохранить' : 'Добавить'}
                  </Button>
                </div>
              </form>
            </div>
          )}

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
                    <div className="flex items-center gap-3">
                      {category.color && (
                        <div
                          className="w-6 h-6 rounded-sm border border-stroke flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                          title={`Цвет категории: ${category.color}`}
                        />
                      )}
                      <h4 className="text-text-100 font-semibold text-base">{category.name}</h4>
                    </div>
                    {category.description && (
                      <p className="text-text-10 text-sm mt-1">{category.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-text-50 text-sm">
                        Длительность по умолчанию: <strong>{category.defaultDuration} мин</strong>
                      </span>
                      {category.color && (
                        <span className="text-text-50 text-sm font-mono">
                          Цвет: <strong>{category.color}</strong>
                        </span>
                      )}
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

