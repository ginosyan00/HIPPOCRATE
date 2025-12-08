import Joi from 'joi';

/**
 * Валидация расписания врача
 */

/**
 * Схема для одного дня недели
 */
const dayScheduleSchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required()
    .messages({
      'number.base': 'dayOfWeek must be a number',
      'number.integer': 'dayOfWeek must be an integer',
      'number.min': 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)',
      'number.max': 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)',
      'any.required': 'dayOfWeek is required',
    }),
  startTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .when('isWorking', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ''),
    })
    .messages({
      'string.pattern.base': 'startTime must be in HH:mm format (e.g., "09:00")',
    }),
  endTime: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .when('isWorking', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(null, ''),
    })
    .messages({
      'string.pattern.base': 'endTime must be in HH:mm format (e.g., "18:00")',
    }),
  isWorking: Joi.boolean().default(true),
}).custom((value, helpers) => {
  // Если isWorking = true, то startTime и endTime обязательны
  if (value.isWorking && (!value.startTime || !value.endTime)) {
    return helpers.error('any.custom', {
      message: 'startTime and endTime are required when isWorking is true',
    });
  }
  // Если isWorking = false, то startTime и endTime могут быть null
  if (!value.isWorking) {
    value.startTime = null;
    value.endTime = null;
  }
  return value;
});

/**
 * Схема для обновления расписания (массив дней)
 */
export const updateScheduleSchema = Joi.object({
  schedule: Joi.array().items(dayScheduleSchema).min(1).max(7).required()
    .messages({
      'array.base': 'schedule must be an array',
      'array.min': 'schedule must contain at least 1 day',
      'array.max': 'schedule must contain at most 7 days',
      'any.required': 'schedule is required',
    }),
}).custom((value, helpers) => {
  // Проверяем что все дни недели уникальны
  const dayOfWeeks = value.schedule.map(day => day.dayOfWeek);
  const uniqueDays = new Set(dayOfWeeks);
  if (uniqueDays.size !== dayOfWeeks.length) {
    return helpers.error('any.custom', {
      message: 'Each dayOfWeek must be unique in the schedule array',
    });
  }
  return value;
});

