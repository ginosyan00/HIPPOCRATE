import { prisma } from '../config/database.js';
import * as userService from '../services/user.service.js';
import { successResponse } from '../utils/response.util.js';

/**
 * Doctor Controller
 * Обработчики для doctor endpoints (врач обновляет свои данные)
 */

/**
 * GET /api/v1/doctor/me
 * Получить данные текущего врача
 */
export async function getMyProfile(req, res, next) {
  try {
    const userId = req.user.userId;

    console.log('🔵 [DOCTOR CONTROLLER] Получение профиля врача:', userId);

    // Получаем данные врача напрямую по ID (это его собственный профиль)
    const doctor = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        clinicId: true,
        name: true,
        email: true,
        role: true,
        status: true,
        specialization: true,
        licenseNumber: true,
        experience: true,
        phone: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Doctor not found',
        },
      });
    }

    if (doctor.role !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not a doctor',
        },
      });
    }

    successResponse(res, doctor, 200);
  } catch (error) {
    console.log('🔴 [DOCTOR CONTROLLER] Ошибка:', error.message);
    next(error);
  }
}

/**
 * PUT /api/v1/doctor/me
 * Обновить данные текущего врача
 */
export async function updateMyProfile(req, res, next) {
  try {
    const userId = req.user.userId;

    console.log('🔵 [DOCTOR CONTROLLER] Обновление профиля врача:', userId);

    const updatedDoctor = await userService.updateDoctorProfile(userId, req.body);

    console.log('✅ [DOCTOR CONTROLLER] Профиль врача успешно обновлен');
    successResponse(res, updatedDoctor, 200);
  } catch (error) {
    console.log('🔴 [DOCTOR CONTROLLER] Ошибка:', error.message);
    next(error);
  }
}

