import express from 'express';
import * as dailyAdviceController from '../controllers/dailyAdvice.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Daily Advice Protected Routes
 * Защищенные routes для управления оральными советами (только для ADMIN)
 */

/**
 * GET /api/v1/daily-advice
 * Ստանալ բոլոր խորհուրդները
 * Query params: ?language=ru|en|am&isActive=true&page=1&limit=100
 */
router.get('/', authenticate, authorize('ADMIN'), dailyAdviceController.getAllAdvices);

/**
 * POST /api/v1/daily-advice
 * Ստեղծել նոր խորհուրդ
 */
router.post('/', authenticate, authorize('ADMIN'), dailyAdviceController.createAdvice);

/**
 * POST /api/v1/daily-advice/bulk
 * Ստեղծել բազմաթիվ խորհուրդներ
 */
router.post('/bulk', authenticate, authorize('ADMIN'), dailyAdviceController.createManyAdvices);

/**
 * PUT /api/v1/daily-advice/:id
 * Թարմացնել խորհուրդ
 */
router.put('/:id', authenticate, authorize('ADMIN'), dailyAdviceController.updateAdvice);

/**
 * DELETE /api/v1/daily-advice/:id
 * Ջնջել խորհուրդ
 */
router.delete('/:id', authenticate, authorize('ADMIN'), dailyAdviceController.deleteAdvice);

export default router;

