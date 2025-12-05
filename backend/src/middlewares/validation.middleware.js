/**
 * Validation Middleware
 * Валидация запросов с использованием Joi
 */

/**
 * Создает middleware для валидации
 * @param {object} schema - Joi schema
 * @returns {Function} Express middleware
 */
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Показать все ошибки сразу
      stripUnknown: true, // Удалить неизвестные поля
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      console.log('🔴 [VALIDATION] Validation failed:', JSON.stringify(details, null, 2));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      });
    }

    // Заменяем body на валидированные данные
    req.body = value;
    next();
  };
}

