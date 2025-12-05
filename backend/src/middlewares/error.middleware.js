import { config } from '../config/app.js';

/**
 * Global Error Handler Middleware
 * Централизованная обработка ошибок
 */
export function errorHandler(err, req, res, next) {
  // Логирование ошибки
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
    clinicId: req.user?.clinicId,
    timestamp: new Date().toISOString(),
  });

  // Определяем статус код
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Internal server error';

  // Специальные типы ошибок
  if (err.statusCode === 413 || err.message.includes('too large') || err.message.includes('Payload Too Large')) {
    statusCode = 413;
    errorCode = 'PAYLOAD_TOO_LARGE';
    message = 'Файл слишком большой. Максимальный размер: 10 MB. Пожалуйста, используйте файл меньшего размера.';
  } else if (err.message.includes('not found')) {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
  } else if (err.message.includes('already exists')) {
    statusCode = 409;
    errorCode = 'CONFLICT';
  } else if (err.message.includes('required') || err.message.includes('invalid')) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  } else if (err.message.includes('Unauthorized') || err.message.includes('token')) {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
  } else if (err.message.includes('Forbidden')) {
    statusCode = 403;
    errorCode = 'FORBIDDEN';
  }

  // Формируем ответ
  const response = {
    success: false,
    error: {
      code: errorCode,
      message: message,
    },
  };

  // В development режиме добавляем stack trace
  if (config.nodeEnv === 'development') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 Handler Middleware
 * Обработка несуществующих маршрутов
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

