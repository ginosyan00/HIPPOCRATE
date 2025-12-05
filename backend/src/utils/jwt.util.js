import jwt from 'jsonwebtoken';
import { config } from '../config/app.js';

/**
 * JWT Utility
 * Генерация и верификация JWT токенов
 */

/**
 * Генерирует JWT токен
 * @param {object} payload - Данные для токена (userId, clinicId, role)
 * @returns {string} JWT токен
 */
export function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Верифицирует JWT токен
 * @param {string} token - JWT токен
 * @returns {object} Decoded payload
 * @throws {Error} Если токен невалиден
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Извлекает токен из Authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} Токен или null
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Убираем 'Bearer '
}

