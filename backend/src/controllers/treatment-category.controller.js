import * as treatmentCategoryService from '../services/treatment-category.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

/**
 * Treatment Category Controller
 * Обработчики запросов для категорий лечения
 */

/**
 * GET /api/v1/clinic/treatment-categories
 * Получить все категории лечения клиники
 */
export async function getCategories(req, res, next) {
  try {
    const { clinicId } = req.user;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    const categories = await treatmentCategoryService.getTreatmentCategories(clinicId);
    successResponse(res, categories);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/clinic/treatment-categories/:id
 * Получить категорию по ID
 */
export async function getCategoryById(req, res, next) {
  try {
    const { clinicId } = req.user;
    const { id } = req.params;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    const category = await treatmentCategoryService.getTreatmentCategoryById(clinicId, id);
    successResponse(res, category);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/clinic/treatment-categories
 * Создать категорию лечения
 */
export async function createCategory(req, res, next) {
  try {
    const { clinicId } = req.user;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    const category = await treatmentCategoryService.createTreatmentCategory(clinicId, req.body);
    successResponse(res, category, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/clinic/treatment-categories/:id
 * Обновить категорию лечения
 */
export async function updateCategory(req, res, next) {
  try {
    const { clinicId } = req.user;
    const { id } = req.params;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    const category = await treatmentCategoryService.updateTreatmentCategory(
      clinicId,
      id,
      req.body
    );
    successResponse(res, category);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/clinic/treatment-categories/:id
 * Удалить категорию лечения
 */
export async function deleteCategory(req, res, next) {
  try {
    const { clinicId } = req.user;
    const { id } = req.params;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    await treatmentCategoryService.deleteTreatmentCategory(clinicId, id);
    successResponse(res, { message: 'Treatment category deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/users/:id/treatment-categories
 * Получить категории врача
 */
export async function getDoctorCategories(req, res, next) {
  try {
    const { clinicId } = req.user;
    const { id } = req.params;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    // Проверяем, что врач принадлежит той же клинике
    const { prisma } = await import('../config/database.js');
    const doctor = await prisma.user.findFirst({
      where: {
        id,
        clinicId,
        role: 'DOCTOR',
      },
    });

    if (!doctor) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    const categories = await treatmentCategoryService.getDoctorCategories(id);
    successResponse(res, categories);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/users/:id/treatment-categories
 * Обновить категории врача
 */
export async function updateDoctorCategories(req, res, next) {
  try {
    const { clinicId } = req.user;
    const { id } = req.params;
    const { categoryIds } = req.body;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    // Проверяем, что врач принадлежит той же клинике
    const { prisma } = await import('../config/database.js');
    const doctor = await prisma.user.findFirst({
      where: {
        id,
        clinicId,
        role: 'DOCTOR',
      },
    });

    if (!doctor) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    await treatmentCategoryService.updateDoctorCategories(id, categoryIds || []);
    successResponse(res, { message: 'Doctor categories updated successfully' });
  } catch (error) {
    next(error);
  }
}
