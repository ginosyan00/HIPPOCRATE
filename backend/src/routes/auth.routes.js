import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { registerSchema, loginSchema, registerUserSchema, updatePasswordSchema, verifyPasswordSchema } from '../validators/auth.validator.js';

const router = express.Router();

/**
 * POST /api/v1/auth/register
 * Регистрация новой клиники
 * Public endpoint (старый - сохранен для совместимости)
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * POST /api/v1/auth/register-user
 * Регистрация нового пользователя (Patient, Doctor, Partner)
 * Public endpoint
 */
router.post('/register-user', (req, res, next) => {
  console.log('🔵 [AUTH ROUTES] Запрос на /register-user получен');
  console.log('🔵 [AUTH ROUTES] Method:', req.method);
  console.log('🔵 [AUTH ROUTES] Path:', req.path);
  console.log('🔵 [AUTH ROUTES] Body:', { role: req.body?.role, email: req.body?.email });
  next();
}, validate(registerUserSchema), authController.registerUser);

/**
 * POST /api/v1/auth/login
 * Авторизация пользователя (единый для всех ролей)
 * Public endpoint
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * GET /api/v1/auth/me
 * Получить текущего пользователя
 * Protected endpoint
 */
router.get('/me', authenticate, authController.getMe);

/**
 * PUT /api/v1/auth/password
 * Изменить пароль текущего пользователя (для всех ролей)
 * Protected endpoint
 */
router.put('/password', authenticate, validate(updatePasswordSchema), authController.updatePassword);

/**
 * POST /api/v1/auth/verify-password
 * Проверить пароль пользователя (для доступа к защищенным разделам)
 * Protected endpoint
 */
router.post('/verify-password', authenticate, validate(verifyPasswordSchema), authController.verifyPassword);

export default router;

