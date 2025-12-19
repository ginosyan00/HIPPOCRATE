import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';
import * as treatmentCategoryController from '../controllers/treatment-category.controller.js';
import {
  createTreatmentCategorySchema,
  updateTreatmentCategorySchema,
} from '../validators/treatment-category.validator.js';
import { validate } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Применяем auth и tenant middleware ко всем routes
router.use(authenticate);
router.use(tenantMiddleware);

/**
 * Treatment Category Routes
 * Маршруты для управления категориями лечения клиники
 */

/**
 * GET /api/v1/clinic/treatment-categories
 * Получить все категории лечения клиники
 * Доступ: ADMIN с clinicId
 */
router.get('/', treatmentCategoryController.getCategories);

/**
 * GET /api/v1/clinic/treatment-categories/:id
 * Получить категорию по ID
 * Доступ: ADMIN с clinicId
 */
router.get('/:id', treatmentCategoryController.getCategoryById);

/**
 * POST /api/v1/clinic/treatment-categories
 * Создать категорию лечения
 * Доступ: ADMIN с clinicId
 */
router.post(
  '/',
  validate(createTreatmentCategorySchema),
  treatmentCategoryController.createCategory
);

/**
 * PUT /api/v1/clinic/treatment-categories/:id
 * Обновить категорию лечения
 * Доступ: ADMIN с clinicId
 */
router.put(
  '/:id',
  validate(updateTreatmentCategorySchema),
  treatmentCategoryController.updateCategory
);

/**
 * DELETE /api/v1/clinic/treatment-categories/:id
 * Удалить категорию лечения
 * Доступ: ADMIN с clinicId
 */
router.delete('/:id', treatmentCategoryController.deleteCategory);

export default router;
