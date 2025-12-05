import bcrypt from 'bcrypt';

/**
 * Hash Utility
 * Хеширование и проверка паролей
 */

const SALT_ROUNDS = 12;

/**
 * Хеширует пароль
 * @param {string} password - Пароль в plaintext
 * @returns {Promise<string>} Хешированный пароль
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Проверяет пароль
 * @param {string} password - Пароль в plaintext
 * @param {string} hash - Хешированный пароль
 * @returns {Promise<boolean>} true если пароль верный
 */
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

