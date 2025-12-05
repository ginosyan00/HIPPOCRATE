import express from 'express';
import * as doctorController from '../controllers/doctor.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { updateDoctorProfileSchema } from '../validators/user.validator.js';

const router = express.Router();

// Применяем auth и tenant middleware ко всем routes
router.use(authenticate);
router.use(tenantMiddleware);

/**
 * GET /api/v1/doctor/me
 * Получить данные текущего врача
 * Доступ: только DOCTOR
 */
router.get('/me', authorize('DOCTOR'), doctorController.getMyProfile);

/**
 * PUT /api/v1/doctor/me
 * Обновить данные текущего врача
 * Доступ: только DOCTOR
 */
router.put(
  '/me',
  authorize('DOCTOR'),
  validate(updateDoctorProfileSchema),
  doctorController.updateMyProfile
);

export default router;

