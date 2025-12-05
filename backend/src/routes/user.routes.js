import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { 
  createUserSchema, 
  updateUserSchema, 
  createDoctorByClinicSchema,
  updateMyProfileSchema,
  updateMyPasswordSchema
} from '../validators/user.validator.js';

const router = express.Router();

// Применяем auth и tenant middleware ко всем routes
router.use(authenticate);
router.use(tenantMiddleware);

/**
 * GET /api/v1/users/me
 * Получить профиль текущего пользователя
 * Доступ: любой авторизованный пользователь
 */
router.get('/me', userController.getMyProfile);

/**
 * PUT /api/v1/users/me
 * Обновить профиль текущего пользователя
 * Доступ: любой авторизованный пользователь
 */
router.put('/me', validate(updateMyProfileSchema), userController.updateMyProfile);

/**
 * PUT /api/v1/users/me/password
 * Изменить пароль текущего пользователя
 * Доступ: любой авторизованный пользователь
 */
router.put('/me/password', validate(updateMyPasswordSchema), userController.updateMyPassword);

/**
 * GET /api/v1/users/doctors
 * Получить список врачей
 * Доступ: все авторизованные
 */
router.get('/doctors', userController.getDoctors);

/**
 * POST /api/v1/users/doctors
 * Создать врача в клинике
 * Доступ: только CLINIC (владелец клиники)
 */
router.post(
  '/doctors', 
  authorize('CLINIC'), 
  validate(createDoctorByClinicSchema), 
  userController.createDoctor
);

/**
 * GET /api/v1/users/pending
 * Получить список пользователей со статусом PENDING
 * Доступ: только ADMIN
 */
router.get('/pending', authorize('ADMIN'), userController.getPendingUsers);

/**
 * POST /api/v1/users/:id/approve
 * Одобрить пользователя (PENDING -> ACTIVE)
 * Доступ: только ADMIN
 */
router.post('/:id/approve', authorize('ADMIN'), userController.approveUser);

/**
 * POST /api/v1/users/:id/reject
 * Отклонить пользователя (PENDING -> REJECTED)
 * Доступ: только ADMIN
 */
router.post('/:id/reject', authorize('ADMIN'), userController.rejectUser);

/**
 * GET /api/v1/users
 * Получить список пользователей
 * Доступ: только admin
 */
router.get('/', authorize('ADMIN'), userController.getAll);

/**
 * GET /api/v1/users/:id
 * Получить пользователя по ID
 * Доступ: ADMIN, CLINIC (клиника может получать данные своих врачей)
 */
router.get('/:id', authorize('ADMIN', 'CLINIC'), userController.getById);

/**
 * POST /api/v1/users
 * Создать нового пользователя
 * Доступ: только admin
 */
router.post('/', authorize('ADMIN'), validate(createUserSchema), userController.create);

/**
 * PUT /api/v1/users/:id
 * Обновить пользователя
 * Доступ: ADMIN, CLINIC (клиника может обновлять своих врачей)
 */
router.put('/:id', authorize('ADMIN', 'CLINIC'), validate(updateUserSchema), userController.update);

/**
 * DELETE /api/v1/users/:id
 * Удалить пользователя
 * Доступ: только admin
 */
router.delete('/:id', authorize('ADMIN'), userController.remove);

export default router;

