import Joi from 'joi';

/**
 * Treatment Category Validators
 * Валидация данных для категорий лечения
 */

/**
 * Создание категории лечения
 */
export const createTreatmentCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Название категории должно содержать минимум 2 символа',
    'string.max': 'Название категории не должно превышать 100 символов',
    'any.required': 'Название категории обязательно',
  }),
  defaultDuration: Joi.number().integer().min(5).max(480).default(30).messages({
    'number.base': 'Длительность должна быть числом',
    'number.min': 'Длительность не может быть меньше 5 минут',
    'number.max': 'Длительность не может превышать 480 минут (8 часов)',
  }),
  description: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Описание не должно превышать 500 символов',
  }),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().allow(null, '').messages({
    'string.pattern.base': 'Цвет должен быть в формате HEX (например, #8B5CF6)',
  }),
});

/**
 * Обновление категории лечения
 */
export const updateTreatmentCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Название категории должно содержать минимум 2 символа',
    'string.max': 'Название категории не должно превышать 100 символов',
  }),
  defaultDuration: Joi.number().integer().min(5).max(480).optional().messages({
    'number.base': 'Длительность должна быть числом',
    'number.min': 'Длительность не может быть меньше 5 минут',
    'number.max': 'Длительность не может превышать 480 минут (8 часов)',
  }),
  description: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Описание не должно превышать 500 символов',
  }),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().allow(null, '').messages({
    'string.pattern.base': 'Цвет должен быть в формате HEX (например, #8B5CF6)',
  }),
}).min(1); // Хотя бы одно поле обязательно

/**
 * Обновление категорий врача
 */
export const updateDoctorCategoriesSchema = Joi.object({
  categoryIds: Joi.array().items(Joi.string().uuid()).optional().messages({
    'array.base': 'categoryIds должен быть массивом',
    'string.guid': 'ID категории должен быть валидным UUID',
  }),
});


