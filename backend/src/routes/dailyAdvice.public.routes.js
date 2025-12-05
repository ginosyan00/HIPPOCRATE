import express from 'express';
import * as dailyAdviceController from '../controllers/dailyAdvice.controller.js';

const router = express.Router();

/**
 * Daily Advice Public Routes
 * Публичные routes для чтения оральных советов (без авторизации)
 */

/**
 * GET /api/v1/public/daily-advice/today
 * Ստանալ այսօրվա խորհուրդը
 * Query params: ?language=ru|en|am
 */
router.get('/today', dailyAdviceController.getTodayAdvice);

/**
 * GET /api/v1/public/daily-advice/:dayOfYear
 * Ստանալ խորհուրդը օրվա համար (1-365)
 * Query params: ?language=ru|en|am
 */
router.get('/:dayOfYear', dailyAdviceController.getAdviceByDay);

export default router;

