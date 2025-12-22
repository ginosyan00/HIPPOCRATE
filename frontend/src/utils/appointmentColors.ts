import { Appointment, TreatmentCategory } from '../types/api.types';

/**
 * Цвета статусов назначений (фиксированные системные цвета)
 */
export const STATUS_COLORS = {
  completed: '#3CB371', // green
  confirmed: '#4A90E2', // blue
  pending: '#F3B63F',   // yellow
  cancelled: '#D9534F', // red
} as const;

/**
 * Цвет по умолчанию для категорий без цвета
 */
export const DEFAULT_CATEGORY_COLOR = '#9CA3AF'; // gray-400

/**
 * Получить цвет статуса назначения
 * @param status - Статус назначения
 * @returns HEX цвет статуса
 */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || DEFAULT_CATEGORY_COLOR;
}

/**
 * Получить цвет категории из назначения
 * Ищет категорию по полю reason (название категории)
 * @param appointment - Назначение
 * @param categories - Список категорий лечения
 * @returns HEX цвет категории или цвет по умолчанию
 */
export function getCategoryColor(
  appointment: Appointment,
  categories: TreatmentCategory[] = []
): string {
  // Если у назначения нет reason, возвращаем цвет по умолчанию
  if (!appointment.reason) {
    return DEFAULT_CATEGORY_COLOR;
  }

  // Ищем категорию по имени (reason)
  const category = categories.find(
    (cat) => cat.name.toLowerCase().trim() === appointment.reason?.toLowerCase().trim()
  );

  // Если категория найдена и у неё есть цвет, возвращаем его
  if (category?.color) {
    return category.color;
  }

  // Если категория найдена, но цвета нет, возвращаем цвет по умолчанию
  return DEFAULT_CATEGORY_COLOR;
}

/**
 * Получить стили для карточки назначения
 * @param appointment - Назначение
 * @param categories - Список категорий лечения
 * @returns Объект со стилями для карточки
 */
export function getAppointmentCardStyles(
  appointment: Appointment,
  categories: TreatmentCategory[] = []
) {
  const categoryColor = getCategoryColor(appointment, categories);
  const statusColor = getStatusColor(appointment.status);

  return {
    // Цвет фона карточки (цвет категории)
    backgroundColor: categoryColor,
    // Цвет индикатора статуса (левая граница или верхняя полоса)
    statusColor: statusColor,
    // Стили для применения в компонентах
    style: {
      backgroundColor: categoryColor,
      borderLeft: `4px solid ${statusColor}`,
    },
  };
}


