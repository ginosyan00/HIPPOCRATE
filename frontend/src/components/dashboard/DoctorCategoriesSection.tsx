import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';
import { TreatmentCategory } from '../../types/api.types';
import {
  useTreatmentCategories,
  useDoctorTreatmentCategories,
  useUpdateDoctorCategories,
} from '../../hooks/useTreatmentCategories';
import { toast } from 'react-hot-toast';
import plusIcon from '../../assets/icons/plus.svg';
import infoIcon from '../../assets/icons/info.svg';

/**
 * DoctorCategoriesSection Component
 * Компонент для управления категориями лечения врача
 * Позволяет врачу добавлять и удалять категории лечения
 */
interface DoctorCategoriesSectionProps {
  doctorId: string;
  isEditingSelf?: boolean;
}

export const DoctorCategoriesSection: React.FC<DoctorCategoriesSectionProps> = ({
  doctorId,
  isEditingSelf = false,
}) => {
  // Получаем все доступные категории клиники
  const { data: allCategories = [], isLoading: isLoadingAllCategories } = useTreatmentCategories();
  
  // Получаем категории текущего врача
  const { data: doctorCategories = [], isLoading: isLoadingDoctorCategories } = 
    useDoctorTreatmentCategories(doctorId);
  
  // Мутация для обновления категорий врача
  const updateCategoriesMutation = useUpdateDoctorCategories(doctorId);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Инициализируем выбранные категории из текущих категорий врача
  useEffect(() => {
    if (doctorCategories.length > 0) {
      setSelectedCategoryIds(doctorCategories.map(cat => cat.id));
    } else {
      setSelectedCategoryIds([]);
    }
  }, [doctorCategories]);

  // Открываем/закрываем форму для добавления категорий
  const handleAddClick = () => {
    setSelectedCategoryIds(doctorCategories.map(cat => cat.id));
    setIsFormVisible(!isFormVisible);
  };

  // Сохраняем изменения категорий
  const handleSaveCategories = async () => {
    try {
      console.log('🔵 [DOCTOR CATEGORIES] Сохранение категорий врача:', selectedCategoryIds);
      await updateCategoriesMutation.mutateAsync(selectedCategoryIds);
      toast.success('Категории успешно обновлены');
      setIsFormVisible(false);
    } catch (error: any) {
      console.error('🔴 [DOCTOR CATEGORIES] Ошибка сохранения:', error);
      // Ошибка уже обработана в хуке
    }
  };

  // Отменяем изменения
  const handleCancelForm = () => {
    setSelectedCategoryIds(doctorCategories.map(cat => cat.id));
    setIsFormVisible(false);
  };

  // Удаляем категорию из списка врача
  const handleRemoveCategory = async (categoryId: string) => {
    try {
      const newCategoryIds = doctorCategories
        .map(cat => cat.id)
        .filter(id => id !== categoryId);
      
      console.log('🔵 [DOCTOR CATEGORIES] Удаление категории:', categoryId);
      await updateCategoriesMutation.mutateAsync(newCategoryIds);
      toast.success('Категория успешно удалена');
    } catch (error: any) {
      console.error('🔴 [DOCTOR CATEGORIES] Ошибка удаления:', error);
      // Ошибка уже обработана в хуке
    }
  };

  // Переключаем выбор категории
  const handleToggleCategory = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== categoryId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
    }
  };

  const isLoading = isLoadingAllCategories || isLoadingDoctorCategories;

  if (isLoading) {
    return (
      <Card title="Категории лечения" padding="lg">
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card title="Категории лечения" padding="lg">
        <div className="space-y-4">
          {/* Информационное сообщение */}
          <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
            <p className="text-blue-800 text-sm">
              <span className="flex items-start gap-2">
                <img src={infoIcon} alt="Информация" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Информация:</strong> Определите категории лечения, которые предоставляет ваша клиника. 
                  При регистрации врача он сможет выбрать одну или несколько категорий. Для каждой категории можно 
                  указать длительность процедуры по умолчанию.
                </span>
              </span>
            </p>
          </div>

          {/* Кнопка добавления категории */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleAddClick}
              disabled={updateCategoriesMutation.isPending}
            >
              <span className="flex items-center gap-2">
                <img src={plusIcon} alt="Добавить" className="w-4 h-4" />
                Добавить категорию
              </span>
            </Button>
          </div>

          {/* Inline форма для выбора категорий */}
          {isFormVisible && (
            <div className="border border-stroke rounded-lg p-4 bg-bg-white">
              <p className="text-sm text-text-10 mb-4">
                Выберите одну или несколько категорий лечения, которые предоставляет этот врач.
              </p>
              {allCategories.length === 0 ? (
                <Card className="bg-yellow-50 border-yellow-200" padding="md">
                  <p className="text-yellow-800 text-sm">
                    Нет доступных категорий лечения. Добавьте категории в разделе{' '}
                    <strong>Clinic → Web → Категории лечения</strong>.
                  </p>
                </Card>
              ) : (
                <div className="space-y-2 border border-stroke rounded-lg p-4 bg-bg-white">
                  {allCategories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(category.id)}
                        onChange={() => handleToggleCategory(category.id)}
                        className="mt-1 w-4 h-4 text-main-100 border-stroke rounded focus:ring-main-100"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {category.color && (
                            <div
                              className="w-4 h-4 rounded-full border border-stroke flex-shrink-0"
                              style={{ backgroundColor: category.color }}
                              title={`Цвет категории: ${category.color}`}
                            />
                          )}
                          <div className="text-text-100 font-medium text-sm">{category.name}</div>
                        </div>
                        {category.description && (
                          <div className="text-text-10 text-xs mt-1">{category.description}</div>
                        )}
                        <div className="text-text-50 text-xs mt-1">
                          Длительность по умолчанию: {category.defaultDuration} мин
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {/* Кнопки действий */}
              <div className="flex gap-3 pt-4 mt-4 border-t border-stroke">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelForm}
                  disabled={updateCategoriesMutation.isPending}
                  size="sm"
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveCategories}
                  isLoading={updateCategoriesMutation.isPending}
                  disabled={updateCategoriesMutation.isPending}
                  size="sm"
                >
                  Сохранить
                </Button>
              </div>
            </div>
          )}

          {/* Список категорий врача */}
          {doctorCategories.length === 0 ? (
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
                Добавьте категории лечения для этого врача
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {doctorCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-stroke rounded-sm bg-bg-white hover:border-main-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {category.color && (
                        <div
                          className="w-4 h-4 rounded-full border border-stroke flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                          title={`Цвет категории: ${category.color}`}
                        />
                      )}
                      <h4 className="text-text-100 font-semibold text-base">{category.name}</h4>
                    </div>
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
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveCategory(category.id)}
                      disabled={updateCategoriesMutation.isPending}
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
    </>
  );
};
