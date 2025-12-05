import Joi from 'joi';

/**
 * Public Validators
 * Joi schemas для валидации public endpoints
 */

/**
 * Создание публичной заявки на приём
 */
export const createPublicAppointmentSchema = Joi.object({
  clinicSlug: Joi.string().required().messages({
    'any.required': 'Clinic slug is required',
  }),
  doctorId: Joi.string().required().messages({
    'any.required': 'Doctor ID is required',
  }),
  patient: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Patient name is required',
    }),
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Must be a valid phone number',
        'any.required': 'Phone is required',
      }),
    email: Joi.string().email().allow('').optional(),
  }).required(),
  appointmentDate: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'Appointment date must be in the future',
    'any.required': 'Appointment date is required',
  }),
  reason: Joi.string().max(500).allow('').optional(),
});


