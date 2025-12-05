import Joi from 'joi';

/**
 * Chat Validators
 * Валидация данных для чата
 */

/**
 * Схема для отправки сообщения
 */
export const sendMessageSchema = Joi.object({
  conversationId: Joi.string().uuid().optional(),
  patientId: Joi.string().uuid().optional(), // Если создаем новую беседу
  userId: Joi.string().uuid().optional(), // ID врача (опционально)
  content: Joi.string().trim().max(5000).allow('').optional(),
  imageUrl: Joi.string()
    .pattern(/^\/uploads\/chat\/[a-zA-Z0-9\-_.]+\.(jpg|jpeg|png|gif|webp)$/i)
    .optional()
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Некорректный путь к изображению',
    }),
})
  .custom((value, helpers) => {
    // Проверяем, что есть хотя бы content или imageUrl
    const hasContent = value.content && value.content.trim().length > 0;
    const hasImage = value.imageUrl && value.imageUrl.trim().length > 0;
    
    if (!hasContent && !hasImage) {
      return helpers.error('object.missing');
    }
    
    return value;
  })
  .messages({
    'object.missing': 'Сообщение должно содержать текст или изображение',
  });

/**
 * Схема для получения сообщений
 */
export const getMessagesSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(50),
  before: Joi.date().iso().optional(), // Для пагинации "до даты"
});

/**
 * Схема для получения бесед
 */
export const getConversationsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(50),
});

