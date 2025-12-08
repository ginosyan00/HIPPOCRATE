import { prisma } from '../config/database.js';

/**
 * Doctor Schedule Service
 * Бизнес-логика для работы с расписанием врачей
 */

/**
 * Получить полное расписание врача (все дни недели)
 * @param {string} doctorId - ID врача
 * @returns {Promise<array>} Массив записей расписания
 */
export async function getSchedule(doctorId) {
  try {
    console.log('🔵 [DOCTOR SCHEDULE SERVICE] Получение расписания врача:', doctorId);

    // Проверяем что пользователь существует и является врачом
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, role: true },
    });

    if (!doctor) {
      console.log('🔴 [DOCTOR SCHEDULE SERVICE] Врач не найден');
      throw new Error('Doctor not found');
    }

    if (doctor.role !== 'DOCTOR') {
      console.log('🔴 [DOCTOR SCHEDULE SERVICE] Пользователь не является врачом');
      throw new Error('User is not a doctor');
    }

    // Получаем расписание
    const schedule = await prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });

    console.log(`✅ [DOCTOR SCHEDULE SERVICE] Найдено ${schedule.length} записей расписания`);
    return schedule || [];
  } catch (error) {
    console.error('🔴 [DOCTOR SCHEDULE SERVICE] Ошибка при получении расписания:', {
      message: error.message,
      stack: error.stack,
      doctorId,
    });
    throw error;
  }
}

/**
 * Получить расписание врача для конкретного дня недели
 * @param {string} doctorId - ID врача
 * @param {number} dayOfWeek - День недели (0=воскресенье, 1=понедельник, ..., 6=суббота)
 * @returns {Promise<object|null>} Запись расписания или null
 */
export async function getScheduleByDay(doctorId, dayOfWeek) {
  console.log('🔵 [DOCTOR SCHEDULE SERVICE] Получение расписания для дня:', { doctorId, dayOfWeek });

  const schedule = await prisma.doctorSchedule.findUnique({
    where: {
      doctorId_dayOfWeek: {
        doctorId,
        dayOfWeek,
      },
    },
  });

  return schedule;
}

/**
 * Обновить или создать расписание врача
 * @param {string} doctorId - ID врача
 * @param {array} scheduleData - Массив объектов расписания для каждого дня недели
 * @returns {Promise<array>} Обновленное расписание
 */
export async function updateSchedule(doctorId, scheduleData) {
  console.log('🔵 [DOCTOR SCHEDULE SERVICE] Обновление расписания врача:', doctorId);

  // Проверяем что пользователь существует и является врачом
  const doctor = await prisma.user.findUnique({
    where: { id: doctorId },
    select: { id: true, role: true },
  });

  if (!doctor) {
    console.log('🔴 [DOCTOR SCHEDULE SERVICE] Врач не найден');
    throw new Error('Doctor not found');
  }

  if (doctor.role !== 'DOCTOR') {
    console.log('🔴 [DOCTOR SCHEDULE SERVICE] Пользователь не является врачом');
    throw new Error('User is not a doctor');
  }

  // Валидация: проверяем что все дни недели от 0 до 6
  const validDays = [0, 1, 2, 3, 4, 5, 6];
  for (const day of scheduleData) {
    if (!validDays.includes(day.dayOfWeek)) {
      throw new Error(`Invalid dayOfWeek: ${day.dayOfWeek}. Must be between 0 and 6`);
    }
    if (day.isWorking && (!day.startTime || !day.endTime)) {
      throw new Error(`Day ${day.dayOfWeek} is marked as working but missing startTime or endTime`);
    }
    // Валидация формата времени (HH:mm)
    if (day.startTime && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(day.startTime)) {
      throw new Error(`Invalid startTime format: ${day.startTime}. Expected HH:mm`);
    }
    if (day.endTime && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(day.endTime)) {
      throw new Error(`Invalid endTime format: ${day.endTime}. Expected HH:mm`);
    }
  }

  // Используем транзакцию для атомарного обновления
  const result = await prisma.$transaction(
    scheduleData.map(day =>
      prisma.doctorSchedule.upsert({
        where: {
          doctorId_dayOfWeek: {
            doctorId,
            dayOfWeek: day.dayOfWeek,
          },
        },
        update: {
          startTime: day.startTime || '09:00',
          endTime: day.endTime || '18:00',
          isWorking: day.isWorking !== undefined ? day.isWorking : true,
        },
        create: {
          doctorId,
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime || '09:00',
          endTime: day.endTime || '18:00',
          isWorking: day.isWorking !== undefined ? day.isWorking : true,
        },
      })
    )
  );

  console.log(`✅ [DOCTOR SCHEDULE SERVICE] Расписание успешно обновлено: ${result.length} записей`);
  return result;
}

/**
 * Удалить расписание врача (все записи)
 * @param {string} doctorId - ID врача
 */
export async function deleteSchedule(doctorId) {
  console.log('🔵 [DOCTOR SCHEDULE SERVICE] Удаление расписания врача:', doctorId);

  await prisma.doctorSchedule.deleteMany({
    where: { doctorId },
  });

  console.log('✅ [DOCTOR SCHEDULE SERVICE] Расписание удалено');
}

