import Joi from 'joi';

/**
 * Certificate Validators
 * Joi schemas для валидации certificate endpoints
 */

// Поддерживаемые типы файлов
const ALLOWED_FILE_TYPES = ['pdf', 'jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Создание сертификата
 */
export const createCertificateSchema = Joi.object({
  title: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Title must be at least 2 characters',
    'string.max': 'Title must be at most 200 characters',
    'any.required': 'Title is required',
  }),
  certificateNumber: Joi.string().max(100).allow('').optional().messages({
    'string.max': 'Certificate number must be at most 100 characters',
  }),
  issuedBy: Joi.string().max(200).allow('').optional().messages({
    'string.max': 'Issued by must be at most 200 characters',
  }),
  issueDate: Joi.date().iso().allow(null).optional().messages({
    'date.base': 'Issue date must be a valid date',
  }),
  expiryDate: Joi.date().iso().min(Joi.ref('issueDate')).allow(null).optional().messages({
    'date.base': 'Expiry date must be a valid date',
    'date.min': 'Expiry date must be after issue date',
  }),
  fileUrl: Joi.string().required().messages({
    'any.required': 'File URL is required',
  }),
  fileType: Joi.string()
    .valid(...ALLOWED_FILE_TYPES)
    .required()
    .messages({
      'any.only': `File type must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`,
      'any.required': 'File type is required',
    }),
  fileSize: Joi.number().integer().min(1).max(MAX_FILE_SIZE).optional().messages({
    'number.min': 'File size must be at least 1 byte',
    'number.max': `File size must be at most ${MAX_FILE_SIZE / 1024 / 1024} MB`,
  }),
});

/**
 * Обновление сертификата
 */
export const updateCertificateSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional().messages({
    'string.min': 'Title must be at least 2 characters',
    'string.max': 'Title must be at most 200 characters',
  }),
  certificateNumber: Joi.string().max(100).allow('').optional().messages({
    'string.max': 'Certificate number must be at most 100 characters',
  }),
  issuedBy: Joi.string().max(200).allow('').optional().messages({
    'string.max': 'Issued by must be at most 200 characters',
  }),
  issueDate: Joi.date().iso().allow(null).optional().messages({
    'date.base': 'Issue date must be a valid date',
  }),
  expiryDate: Joi.date()
    .iso()
    .min(Joi.ref('issueDate'))
    .allow(null)
    .optional()
    .messages({
      'date.base': 'Expiry date must be a valid date',
      'date.min': 'Expiry date must be after issue date',
    }),
  fileUrl: Joi.string().optional(),
  fileType: Joi.string()
    .valid(...ALLOWED_FILE_TYPES)
    .optional()
    .messages({
      'any.only': `File type must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`,
    }),
  fileSize: Joi.number().integer().min(1).max(MAX_FILE_SIZE).optional().messages({
    'number.min': 'File size must be at least 1 byte',
    'number.max': `File size must be at most ${MAX_FILE_SIZE / 1024 / 1024} MB`,
  }),
  isVerified: Joi.boolean().optional(),
});

/**
 * Валидация файла (для проверки перед загрузкой)
 */
export function validateFile(fileBuffer, fileType, fileSize) {
  // Проверка типа файла
  if (!ALLOWED_FILE_TYPES.includes(fileType.toLowerCase())) {
    throw new Error(`File type must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`);
  }

  // Проверка размера
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File size must be at most ${MAX_FILE_SIZE / 1024 / 1024} MB`);
  }

  // Дополнительная проверка для изображений (можно добавить проверку magic numbers)
  if (['jpg', 'jpeg', 'png'].includes(fileType.toLowerCase())) {
    // Минимальный размер для валидного изображения
    if (fileSize < 100) {
      throw new Error('File is too small to be a valid image');
    }
  }

  return true;
}

