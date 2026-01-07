import * as userService from '../services/user.service.js';
import * as doctorScheduleService from '../services/doctorSchedule.service.js';
import { successResponse } from '../utils/response.util.js';

/**
 * User Controller
 * Обработчики для user endpoints
 */

/**
 * GET /api/v1/users
 * Получить список пользователей
 */
export async function getAll(req, res, next) {
  try {
    const { role, page, limit } = req.query;
    const clinicId = req.user.clinicId;

    const result = await userService.findAll(clinicId, {
      role,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });

    successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/users/doctors
 * Получить список врачей
 * Query params:
 *   - onlyActive (boolean): Если true, возвращает только активных врачей (status: 'ACTIVE')
 *                           По умолчанию false - возвращает всех врачей для управления
 */
export async function getDoctors(req, res, next) {
  try {
    const clinicId = req.user.clinicId;
    const onlyActive = req.query.onlyActive === 'true' || req.query.onlyActive === true;

    console.log('🔵 [USER CONTROLLER] Получение списка врачей:', { clinicId, onlyActive });

    const doctors = await userService.findDoctors(clinicId, { onlyActive });

    console.log(`✅ [USER CONTROLLER] Получено врачей: ${doctors.length} (onlyActive: ${onlyActive})`);
    successResponse(res, doctors, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/users/:id
 * Получить пользователя по ID
 * Доступ: ADMIN (может получить любого), CLINIC (может получить своих врачей)
 */
export async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinicId; // Может быть null для ADMIN
    const userRole = req.user.role;

    // Для ADMIN clinicId может быть null
    // Для CLINIC clinicId обязателен
    if (userRole !== 'ADMIN' && !clinicId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Clinic ID is required',
        },
      });
    }

    const user = await userService.findById(clinicId, id);

    successResponse(res, user, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/users
 * Создать нового пользователя
 */
export async function create(req, res, next) {
  try {
    const clinicId = req.user.clinicId;

    const user = await userService.create(clinicId, req.body);

    successResponse(res, user, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/users/:id
 * Обновить пользователя
 * Доступ: ADMIN (может обновлять любого), CLINIC (может обновлять своих врачей)
 */
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinicId; // Может быть null для ADMIN
    const userRole = req.user.role;

    // Для ADMIN clinicId может быть null
    // Для CLINIC clinicId обязателен
    if (userRole !== 'ADMIN' && !clinicId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Clinic ID is required',
        },
      });
    }

    const user = await userService.update(clinicId, id, req.body);

    successResponse(res, user, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/users/:id
 * Удалить пользователя
 */
export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinicId;

    await userService.remove(clinicId, id);

    successResponse(res, { message: 'User deleted successfully' }, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/users/pending
 * Получить всех пользователей со статусом PENDING (только для ADMIN)
 */
export async function getPendingUsers(req, res, next) {
  try {
    console.log('🔵 [USER CONTROLLER] Запрос pending пользователей');

    const users = await userService.findPendingUsers();

    successResponse(res, users, 200);
  } catch (error) {
    console.log('🔴 [USER CONTROLLER] Ошибка:', error.message);
    next(error);
  }
}

/**
 * POST /api/v1/users/:id/approve
 * Одобрить пользователя (PENDING -> ACTIVE) (только для ADMIN)
 */
export async function approveUser(req, res, next) {
  try {
    const { id } = req.params;

    console.log('🔵 [USER CONTROLLER] Одобрение пользователя:', id);

    const user = await userService.approveUser(id);

    successResponse(res, user, 200);
  } catch (error) {
    console.log('🔴 [USER CONTROLLER] Ошибка:', error.message);
    next(error);
  }
}

/**
 * POST /api/v1/users/:id/reject
 * Отклонить пользователя (PENDING -> REJECTED) (только для ADMIN)
 */
export async function rejectUser(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log('🔵 [USER CONTROLLER] Отклонение пользователя:', id);

    const user = await userService.rejectUser(id, reason);

    successResponse(res, user, 200);
  } catch (error) {
    console.log('🔴 [USER CONTROLLER] Ошибка:', error.message);
    next(error);
  }
}

/**
 * POST /api/v1/users/doctors
 * Создать врача в клинике (только для CLINIC role - владелец клиники)
 */
export async function createDoctor(req, res, next) {
  try {
    const clinicId = req.user.clinicId;

    console.log('🔵 [USER CONTROLLER] Создание врача для клиники:', clinicId);

    if (!clinicId) {
      throw new Error('Clinic ID is required');
    }

    const doctor = await userService.createDoctorByClinic(clinicId, req.body);

    console.log('✅ [USER CONTROLLER] Врач успешно создан:', doctor.id);
    successResponse(res, doctor, 201);
  } catch (error) {
    console.log('🔴 [USER CONTROLLER] Ошибка:', error.message);
    next(error);
  }
}

/**
 * GET /api/v1/users/me
 * Получить профиль текущего пользователя
 * Доступ: любой авторизованный пользователь
 */
export async function getMyProfile(req, res, next) {
  try {
    const userId = req.user.userId;

    console.log('🔵 [USER CONTROLLER] Получение профиля пользователя:', userId);

    const user = await userService.getMyProfile(userId);

    console.log('✅ [USER CONTROLLER] Профиль получен:', user.id);
    successResponse(res, user, 200);
  } catch (error) {
    console.log('🔴 [USER CONTROLLER] Ошибка:', error.message);
    next(error);
  }
}

/**
 * PUT /api/v1/users/me
 * Обновить профиль текущего пользователя
 * Доступ: любой авторизованный пользователь
 */
export async function updateMyProfile(req, res, next) {
  try {
    const userId = req.user.userId;

    console.log('🔵 [USER CONTROLLER] Обновление профиля пользователя:', userId);

    const user = await userService.updateMyProfile(userId, req.body);

    console.log('✅ [USER CONTROLLER] Профиль обновлен:', user.id);
    successResponse(res, user, 200);
  } catch (error) {
    console.log('🔴 [USER CONTROLLER] Ошибка:', error.message);
    next(error);
  }
}

/**
 * PUT /api/v1/users/me/password
 * Изменить пароль текущего пользователя
 * Доступ: любой авторизованный пользователь
 */
export async function updateMyPassword(req, res, next) {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    console.log('🔵 [USER CONTROLLER] Изменение пароля пользователя:', userId);

    await userService.updateMyPassword(userId, currentPassword, newPassword);

    console.log('✅ [USER CONTROLLER] Пароль изменен:', userId);
    successResponse(res, { message: 'Password updated successfully' }, 200);
  } catch (error) {
    console.log('🔴 [USER CONTROLLER] Ошибка:', error.message);
    next(error);
  }
}

/**
 * DELETE /api/v1/users/me
 * Удалить собственный аккаунт
 * Доступ: любой авторизованный пользователь
 * Примечание: Данные (appointments) остаются в клинике, удаляется только аккаунт
 */
export async function deleteMyAccount(req, res, next) {
  try {
    const userId = req.user.userId;

    console.log('🔵 [USER CONTROLLER] Удаление собственного аккаунта:', userId);

    await userService.removeMyAccount(userId);

    console.log('✅ [USER CONTROLLER] Аккаунт успешно удален:', userId);
    successResponse(res, { message: 'Account deleted successfully' }, 200);
  } catch (error) {
    console.log('🔴 [USER CONTROLLER] Ошибка:', error.message);
    next(error);
  }
}

/**
 * GET /api/v1/users/:id/schedule
 * Получить расписание врача
 * Доступ: ADMIN, CLINIC (клиника может получать расписание своих врачей)
 */
export async function getDoctorSchedule(req, res, next) {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinicId;
    const userRole = req.user.role;

    console.log('🔵 [USER CONTROLLER] Получение расписания врача:', { doctorId: id, clinicId, userRole });

    // Для ADMIN clinicId может быть null, для CLINIC - обязателен
    if (userRole !== 'ADMIN' && !clinicId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Clinic ID is required',
        },
      });
    }

    // Проверяем что пользователь существует и является врачом
    // Для ADMIN передаем null, чтобы не фильтровать по clinicId
    const doctor = await userService.findById(userRole === 'ADMIN' ? null : clinicId, id);
    
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
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'User is not a doctor',
        },
      });
    }

    // Для CLINIC проверяем, что врач принадлежит их клинике
    if (userRole === 'CLINIC' && doctor.clinicId !== clinicId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this doctor schedule',
        },
      });
    }

    // Получаем расписание
    const schedule = await doctorScheduleService.getSchedule(id);

    console.log('✅ [USER CONTROLLER] Расписание врача успешно получено');
    successResponse(res, schedule, 200);
  } catch (error) {
    console.error('🔴 [USER CONTROLLER] Ошибка при получении расписания врача:', {
      message: error.message,
      stack: error.stack,
    });
    next(error);
  }
}

/**
 * PUT /api/v1/users/:id/schedule
 * Обновить расписание врача
 * Доступ: ADMIN, CLINIC (клиника может обновлять расписание своих врачей)
 */
export async function updateDoctorSchedule(req, res, next) {
  try {
    const { id } = req.params;
    const { schedule } = req.body;
    const clinicId = req.user.clinicId;
    const userRole = req.user.role;

    console.log('🔵 [USER CONTROLLER] Обновление расписания врача:', { doctorId: id, clinicId, userRole });

    // Для ADMIN clinicId может быть null, для CLINIC - обязателен
    if (userRole !== 'ADMIN' && !clinicId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Clinic ID is required',
        },
      });
    }

    // Проверяем что пользователь существует и является врачом
    // Для ADMIN передаем null, чтобы не фильтровать по clinicId
    const doctor = await userService.findById(userRole === 'ADMIN' ? null : clinicId, id);
    
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
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'User is not a doctor',
        },
      });
    }

    // Для CLINIC проверяем, что врач принадлежит их клинике
    if (userRole === 'CLINIC' && doctor.clinicId !== clinicId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this doctor schedule',
        },
      });
    }

    // Обновляем расписание
    const updatedSchedule = await doctorScheduleService.updateSchedule(id, schedule);

    console.log('✅ [USER CONTROLLER] Расписание врача успешно обновлено');
    successResponse(res, updatedSchedule, 200);
  } catch (error) {
    console.error('🔴 [USER CONTROLLER] Ошибка при обновлении расписания врача:', {
      message: error.message,
      stack: error.stack,
    });
    next(error);
  }
}

