import Joi from 'joi';

/**
 * User Validators
 * Joi schemas для валидации user endpoints
 */

/**
 * Создание пользователя (сотрудника)
 */
export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
      'any.required': 'Password is required',
    }),
  role: Joi.string().valid('ADMIN', 'DOCTOR').required().messages({
    'any.only': 'Role must be one of: ADMIN, DOCTOR',
    'any.required': 'Role is required',
  }),
  specialization: Joi.string().max(100).allow('').optional(),
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .allow('')
    .optional(),
});

/**
 * Обновление пользователя
 */
export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .optional()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
    }),
  role: Joi.string().valid('ADMIN', 'DOCTOR').optional(),
  specialization: Joi.string().max(100).allow('').optional(),
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .allow('')
    .optional(),
  status: Joi.string().valid('ACTIVE', 'SUSPENDED').optional(),
  avatar: Joi.string().allow('').optional(), // Base64 строка для изображения
  experience: Joi.number().integer().min(0).max(70).optional(),
  licenseNumber: Joi.string().min(2).max(50).optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
}).min(1); // Хотя бы одно поле обязательно

/**
 * Создание врача клиникой
 * Clinic создает врача для своей клиники
 */
export const createDoctorByClinicSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
      'any.required': 'Password is required',
    }),
  specialization: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Specialization must be at least 2 characters',
    'any.required': 'Specialization is required',
  }),
  licenseNumber: Joi.string().min(2).max(50).required().messages({
    'string.min': 'License number must be at least 2 characters',
    'any.required': 'License number is required',
  }),
  experience: Joi.number().integer().min(0).max(70).required().messages({
    'number.base': 'Experience must be a number',
    'number.min': 'Experience cannot be negative',
    'number.max': 'Experience cannot exceed 70 years',
    'any.required': 'Experience is required',
  }),
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'Phone number format is invalid',
    }),
  dateOfBirth: Joi.date().max('now').optional().messages({
    'date.max': 'Date of birth cannot be in the future',
  }),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
});

/**
 * Обновление данных врача (врач обновляет свои данные)
 */
export const updateDoctorProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'Phone number format is invalid',
    }),
  specialization: Joi.string().min(2).max(100).optional(),
  licenseNumber: Joi.string().min(2).max(50).optional(),
  experience: Joi.number().integer().min(0).max(70).optional().messages({
    'number.base': 'Experience must be a number',
    'number.min': 'Experience cannot be negative',
    'number.max': 'Experience cannot exceed 70 years',
  }),
  dateOfBirth: Joi.date().max('now').optional().messages({
    'date.max': 'Date of birth cannot be in the future',
  }),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  avatar: Joi.string().allow('').optional(), // Base64 строка для изображения
}).min(1); // Хотя бы одно поле обязательно

/**
 * Обновление профиля текущего пользователя (для всех ролей)
 * Позволяет обновить свои личные данные
 */
export const updateMyProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'Phone number format is invalid',
    }),
  avatar: Joi.string().allow('').optional(), // Base64 строка для изображения
  dateOfBirth: Joi.date().max('now').optional().messages({
    'date.max': 'Date of birth cannot be in the future',
  }),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  // Doctor-specific fields (только для врачей)
  specialization: Joi.string().min(2).max(100).optional(),
  licenseNumber: Joi.string().min(2).max(50).optional(),
  experience: Joi.number().integer().min(0).max(70).optional().messages({
    'number.base': 'Experience must be a number',
    'number.min': 'Experience cannot be negative',
    'number.max': 'Experience cannot exceed 70 years',
  }),
  // Partner-specific fields (только для партнеров)
  organizationName: Joi.string().min(2).max(200).optional(),
  organizationType: Joi.string().valid('pharmacy', 'laboratory', 'insurance').optional(),
  inn: Joi.string().min(10).max(12).optional(),
  address: Joi.string().max(500).optional(),
}).min(1); // Хотя бы одно поле обязательно

/**
 * Изменение пароля текущего пользователя
 */
export const updateMyPasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
      'any.required': 'New password is required',
    }),
});

