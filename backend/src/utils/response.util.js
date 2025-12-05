/**
 * Response Utility
 * Стандартизированные ответы API
 */

/**
 * Успешный ответ
 * @param {object} res - Express response
 * @param {*} data - Данные для ответа
 * @param {number} statusCode - HTTP статус код (default: 200)
 */
export function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Ответ с ошибкой
 * @param {object} res - Express response
 * @param {string} code - Код ошибки
 * @param {string} message - Сообщение об ошибке
 * @param {number} statusCode - HTTP статус код (default: 400)
 * @param {object} details - Дополнительные детали (optional)
 */
export function errorResponse(res, code, message, statusCode = 400, details = null) {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
}

/**
 * Ответ "не найдено"
 * @param {object} res - Express response
 * @param {string} message - Сообщение
 */
export function notFoundResponse(res, message = 'Resource not found') {
  return errorResponse(res, 'NOT_FOUND', message, 404);
}

/**
 * Ответ "не авторизован"
 * @param {object} res - Express response
 * @param {string} message - Сообщение
 */
export function unauthorizedResponse(res, message = 'Unauthorized') {
  return errorResponse(res, 'UNAUTHORIZED', message, 401);
}

/**
 * Ответ "нет прав доступа"
 * @param {object} res - Express response
 * @param {string} message - Сообщение
 */
export function forbiddenResponse(res, message = 'Forbidden') {
  return errorResponse(res, 'FORBIDDEN', message, 403);
}

/**
 * Ответ "конфликт"
 * @param {object} res - Express response
 * @param {string} message - Сообщение
 */
export function conflictResponse(res, message = 'Conflict') {
  return errorResponse(res, 'CONFLICT', message, 409);
}

