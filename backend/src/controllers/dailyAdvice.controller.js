import * as dailyAdviceService from '../services/dailyAdvice.service.js';
import { successResponse } from '../utils/response.util.js';

/**
 * Daily Advice Controller
 * Օրական խորհուրդների controller
 */

/**
 * GET /api/v1/public/daily-advice/today
 * Ստանալ այսօրվա խորհուրդը
 */
export async function getTodayAdvice(req, res, next) {
  try {
    const language = req.query.language || 'ru';
    const advice = await dailyAdviceService.getTodayAdvice(language);
    successResponse(res, advice, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/public/daily-advice/:dayOfYear
 * Ստանալ խորհուրդը օրվա համար
 */
export async function getAdviceByDay(req, res, next) {
  try {
    const { dayOfYear } = req.params;
    const language = req.query.language || 'ru';
    const advice = await dailyAdviceService.getAdviceByDay(dayOfYear, language);
    successResponse(res, advice, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/daily-advice
 * Ստանալ բոլոր խորհուրդները (admin only)
 */
export async function getAllAdvices(req, res, next) {
  try {
    const { language, isActive, page, limit } = req.query;
    const result = await dailyAdviceService.findAll({
      language,
      isActive,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 100,
    });
    successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/daily-advice
 * Ստեղծել նոր խորհուրդ (admin only)
 */
export async function createAdvice(req, res, next) {
  try {
    const { dayOfYear, title, content, language, isActive } = req.body;
    const advice = await dailyAdviceService.create({
      dayOfYear,
      title,
      content,
      language,
      isActive,
    });
    successResponse(res, advice, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/daily-advice/bulk
 * Ստեղծել բազմաթիվ խորհուրդներ (admin only)
 */
export async function createManyAdvices(req, res, next) {
  try {
    const { advices } = req.body;
    if (!Array.isArray(advices)) {
      throw new Error('advices must be an array');
    }
    const result = await dailyAdviceService.createMany(advices);
    successResponse(res, result, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/daily-advice/:id
 * Թարմացնել խորհուրդ (admin only)
 */
export async function updateAdvice(req, res, next) {
  try {
    const { id } = req.params;
    const { title, content, isActive } = req.body;
    const advice = await dailyAdviceService.update(id, {
      title,
      content,
      isActive,
    });
    successResponse(res, advice, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/daily-advice/:id
 * Ջնջել խորհուրդ (admin only)
 */
export async function deleteAdvice(req, res, next) {
  try {
    const { id } = req.params;
    await dailyAdviceService.remove(id);
    successResponse(res, { message: 'Advice deleted successfully' }, 200);
  } catch (error) {
    next(error);
  }
}

