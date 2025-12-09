import Joi from 'joi';

/**
 * Appointment Validators
 * Joi schemas для валидации appointment endpoints
 */

/**
 * Создание приёма
 */
export const createAppointmentSchema = Joi.object({
  doctorId: Joi.string().required().messages({
    'any.required': 'Doctor ID is required',
  }),
  patientId: Joi.string().required().messages({
    'any.required': 'Patient ID is required',
  }),
  appointmentDate: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'Appointment date must be in the future',
    'any.required': 'Appointment date is required',
  }),
  duration: Joi.number().integer().min(15).max(240).default(30).messages({
    'number.min': 'Duration must be at least 15 minutes',
    'number.max': 'Duration must be at most 240 minutes',
  }),
  reason: Joi.string().max(500).allow('').optional(),
  amount: Joi.number().min(0).optional().messages({
    'number.min': 'Amount must be a positive number',
  }),
  notes: Joi.string().max(1000).allow('').optional(),
  registeredAt: Joi.date().iso().optional().messages({
    'date.base': 'RegisteredAt must be a valid date',
  }),
});

/**
 * Обновление приёма
 */
export const updateAppointmentSchema = Joi.object({
  doctorId: Joi.string().optional(),
  patientId: Joi.string().optional(),
  appointmentDate: Joi.date().iso().greater('now').optional(),
  duration: Joi.number().integer().min(15).max(240).optional(),
  reason: Joi.string().max(500).allow('').optional(),
  amount: Joi.number().min(0).optional().messages({
    'number.min': 'Amount must be a positive number',
  }),
  notes: Joi.string().max(1000).allow('').optional(),
}).min(1); // Хотя бы одно поле обязательно

/**
 * Изменение статуса
 * При статусе 'completed' можно передать amount (сумму оплаты)
 * При статусе 'cancelled' обязательно передать cancellationReason и опционально suggestedNewDate
 */
export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'completed', 'cancelled')
    .required()
    .messages({
      'any.only': 'Status must be one of: pending, confirmed, completed, cancelled',
      'any.required': 'Status is required',
    }),
  amount: Joi.number().min(0).optional().messages({
    'number.min': 'Amount must be a positive number',
    'number.base': 'Amount must be a number',
  }),
  cancellationReason: Joi.string().allow('').optional(),
  suggestedNewDate: Joi.date().iso().optional().messages({
    'date.base': 'SuggestedNewDate must be a valid ISO date',
    'date.format': 'SuggestedNewDate must be in ISO format (e.g., 2025-01-15T10:30:00.000Z)',
  }),
}).custom((value, helpers) => {
  // Кастомная валидация: если статус 'cancelled', cancellationReason обязателен
  if (value.status === 'cancelled') {
    if (!value.cancellationReason || value.cancellationReason.trim() === '') {
      return helpers.error('any.custom', {
        message: 'Cancellation reason is required when status is cancelled',
      });
    }
  }
  return value;
}, 'custom validation');

