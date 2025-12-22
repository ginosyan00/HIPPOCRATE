import { prisma } from '../config/database.js';
import { hashPassword, verifyPassword } from '../utils/hash.util.js';
import { createSlug } from '../utils/slug.util.js';

/**
 * Clinic Service
 * Бизнес-логика для работы с клиникой и её настройками
 */

/**
 * Получить данные клиники по ID
 * @param {string} clinicId - ID клиники
 * @returns {Promise<object>} Clinic с настройками
 */
export async function getClinicById(clinicId) {
  console.log('🔵 [CLINIC SERVICE] Получение клиники:', clinicId);

  // Валидация clinicId
  if (!clinicId || typeof clinicId !== 'string' || clinicId.trim() === '') {
    console.error('🔴 [CLINIC SERVICE] Невалидный clinicId:', clinicId);
    throw new Error('Invalid clinic ID');
  }

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        settings: true,
      },
    });

    if (!clinic) {
      console.error('🔴 [CLINIC SERVICE] Клиника не найдена:', clinicId);
      throw new Error('Clinic not found');
    }

    // Парсим workingHours из JSON string
    if (clinic.workingHours) {
      try {
        clinic.workingHours = JSON.parse(clinic.workingHours);
      } catch (e) {
        console.warn('⚠️ [CLINIC SERVICE] Ошибка парсинга workingHours:', e.message);
        clinic.workingHours = null;
      }
    }

    console.log('✅ [CLINIC SERVICE] Клиника найдена:', clinic.name);
    return clinic;
  } catch (error) {
    console.error('🔴 [CLINIC SERVICE] Ошибка при получении клиники:', {
      message: error.message,
      stack: error.stack,
      clinicId,
    });
    
    // Если это ошибка Prisma, пробрасываем её дальше
    if (error.code === 'P2002' || error.code === 'P2025') {
      throw new Error('Clinic not found');
    }
    
    throw error;
  }
}

/**
 * Обновить профиль клиники
 * @param {string} clinicId - ID клиники
 * @param {object} updateData - Данные для обновления
 * @returns {Promise<object>} Обновленная клиника
 */
export async function updateClinicProfile(clinicId, updateData) {
  console.log('🔵 [CLINIC SERVICE] Обновление профиля клиники:', clinicId, updateData);

  // Валидация clinicId
  if (!clinicId || typeof clinicId !== 'string' || clinicId.trim() === '') {
    console.error('🔴 [CLINIC SERVICE] Невалидный clinicId:', clinicId);
    throw new Error('Invalid clinic ID');
  }

  try {
    // Проверяем существование клиники
    const existingClinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!existingClinic) {
      console.error('🔴 [CLINIC SERVICE] Клиника не найдена:', clinicId);
      throw new Error('Clinic not found');
    }

    // Если обновляется slug, проверяем уникальность
    if (updateData.slug && updateData.slug !== existingClinic.slug) {
      const slugExists = await prisma.clinic.findUnique({
        where: { slug: updateData.slug },
      });

      if (slugExists) {
        throw new Error('Clinic with this slug already exists');
      }
    }

    // Если обновляется email, проверяем уникальность
    if (updateData.email && updateData.email !== existingClinic.email) {
      const emailExists = await prisma.clinic.findFirst({
        where: {
          email: updateData.email,
          NOT: { id: clinicId },
        },
      });

      if (emailExists) {
        throw new Error('Clinic with this email already exists');
      }
    }

    // Преобразуем workingHours в JSON string если это объект
    const dataToUpdate = { ...updateData };
    if (dataToUpdate.workingHours && typeof dataToUpdate.workingHours === 'object') {
      dataToUpdate.workingHours = JSON.stringify(dataToUpdate.workingHours);
    }

    // Обновляем клинику
    const updatedClinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: dataToUpdate,
      include: {
        settings: true,
      },
    });

    // Парсим workingHours обратно
    if (updatedClinic.workingHours) {
      try {
        updatedClinic.workingHours = JSON.parse(updatedClinic.workingHours);
      } catch (e) {
        console.warn('⚠️ [CLINIC SERVICE] Ошибка парсинга workingHours:', e.message);
        updatedClinic.workingHours = null;
      }
    }

    console.log('✅ [CLINIC SERVICE] Профиль обновлен:', updatedClinic.name);
    return updatedClinic;
  } catch (error) {
    console.error('🔴 [CLINIC SERVICE] Ошибка при обновлении профиля:', {
      message: error.message,
      stack: error.stack,
      clinicId,
    });

    // Если это ошибка Prisma, пробрасываем её дальше
    if (error.code === 'P2002' || error.code === 'P2025') {
      if (error.message.includes('slug')) {
        throw new Error('Clinic with this slug already exists');
      }
      throw new Error('Clinic not found');
    }

    throw error;
  }
}

/**
 * Обновить логотип клиники
 * @param {string} clinicId - ID клиники
 * @param {string} logoUrl - URL логотипа (base64 или URL)
 * @returns {Promise<object>} Обновленная клиника
 */
export async function updateClinicLogo(clinicId, logoUrl) {
  console.log('🔵 [CLINIC SERVICE] Обновление логотипа клиники:', clinicId);

  // Валидация clinicId
  if (!clinicId || typeof clinicId !== 'string' || clinicId.trim() === '') {
    console.error('🔴 [CLINIC SERVICE] Невалидный clinicId:', clinicId);
    throw new Error('Invalid clinic ID');
  }

  try {
    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: { logo: logoUrl },
      select: {
        id: true,
        name: true,
        logo: true,
        updatedAt: true,
      },
    });

    console.log('✅ [CLINIC SERVICE] Логотип обновлен');
    return clinic;
  } catch (error) {
    console.error('🔴 [CLINIC SERVICE] Ошибка при обновлении логотипа:', {
      message: error.message,
      stack: error.stack,
      clinicId,
    });

    if (error.code === 'P2025') {
      throw new Error('Clinic not found');
    }

    throw error;
  }
}

/**
 * Обновить главное изображение клиники
 * @param {string} clinicId - ID клиники
 * @param {string} heroImageUrl - URL главного изображения (base64 или URL)
 * @returns {Promise<object>} Обновленная клиника
 */
export async function updateClinicHeroImage(clinicId, heroImageUrl) {
  console.log('🔵 [CLINIC SERVICE] Обновление главного изображения клиники:', clinicId);

  // Валидация clinicId
  if (!clinicId || typeof clinicId !== 'string' || clinicId.trim() === '') {
    console.error('🔴 [CLINIC SERVICE] Невалидный clinicId:', clinicId);
    throw new Error('Invalid clinic ID');
  }

  try {
    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: { heroImage: heroImageUrl },
      select: {
        id: true,
        name: true,
        heroImage: true,
        updatedAt: true,
      },
    });

    console.log('✅ [CLINIC SERVICE] Главное изображение обновлено');
    return clinic;
  } catch (error) {
    console.error('🔴 [CLINIC SERVICE] Ошибка при обновлении главного изображения:', {
      message: error.message,
      stack: error.stack,
      clinicId,
    });

    if (error.code === 'P2025') {
      throw new Error('Clinic not found');
    }

    throw error;
  }
}

/**
 * Получить настройки клиники (создает дефолтные если не существуют)
 * @param {string} clinicId - ID клиники
 * @returns {Promise<object>} Настройки клиники
 */
export async function getClinicSettings(clinicId) {
  console.log('🔵 [CLINIC SERVICE] Получение настроек клиники:', clinicId);

  // Валидация clinicId
  if (!clinicId || typeof clinicId !== 'string' || clinicId.trim() === '') {
    console.error('🔴 [CLINIC SERVICE] Невалидный clinicId:', clinicId);
    throw new Error('Invalid clinic ID');
  }

  try {
    // Проверяем подключение к базе данных
    await prisma.$connect().catch(() => {
      // Игнорируем ошибку если уже подключено
    });
    // Проверяем существование клиники
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true },
    });

    if (!clinic) {
      console.error('🔴 [CLINIC SERVICE] Клиника не найдена:', clinicId);
      throw new Error('Clinic not found');
    }

    let settings = await prisma.clinicSettings.findUnique({
      where: { clinicId },
    });

    // Если настроек нет, создаем дефолтные
    if (!settings) {
      console.log('📝 [CLINIC SERVICE] Создание дефолтных настроек для клиники');
      try {
        settings = await prisma.clinicSettings.create({
          data: {
            clinicId,
          },
        });
        console.log('✅ [CLINIC SERVICE] Дефолтные настройки созданы');
      } catch (createError) {
        console.error('🔴 [CLINIC SERVICE] Ошибка при создании настроек:', {
          message: createError.message,
          code: createError.code,
          meta: createError.meta,
        });
        
        // Если настройки уже созданы (race condition), получаем их снова
        if (createError.code === 'P2002') {
          console.log('🔄 [CLINIC SERVICE] Race condition detected, получаем настройки снова');
          settings = await prisma.clinicSettings.findUnique({
            where: { clinicId },
          });
          
          if (!settings) {
            console.error('🔴 [CLINIC SERVICE] Настройки не найдены после race condition');
            throw new Error('Failed to retrieve clinic settings');
          }
        } else {
          throw createError;
        }
      }
    }

    if (!settings) {
      console.error('🔴 [CLINIC SERVICE] Настройки не найдены после всех попыток');
      throw new Error('Clinic settings not found');
    }

    console.log('✅ [CLINIC SERVICE] Настройки получены:', settings.id);
    return settings;
  } catch (error) {
    console.error('🔴 [CLINIC SERVICE] Ошибка при получении настроек:', {
      message: error.message,
      stack: error.stack,
      clinicId,
    });

    // Если это ошибка Prisma, пробрасываем её дальше
    if (error.code === 'P2002' || error.code === 'P2025') {
      throw new Error('Clinic not found');
    }

    throw error;
  }
}

/**
 * Обновить настройки клиники
 * @param {string} clinicId - ID клиники
 * @param {object} settingsData - Данные настроек
 * @returns {Promise<object>} Обновленные настройки
 */
export async function updateClinicSettings(clinicId, settingsData) {
  console.log('🔵 [CLINIC SERVICE] Обновление настроек клиники:', clinicId, settingsData);

  // Валидация clinicId
  if (!clinicId || typeof clinicId !== 'string' || clinicId.trim() === '') {
    console.error('🔴 [CLINIC SERVICE] Невалидный clinicId:', clinicId);
    throw new Error('Invalid clinic ID');
  }

  try {
    // Проверяем существование клиники
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true },
    });

    if (!clinic) {
      console.error('🔴 [CLINIC SERVICE] Клиника не найдена:', clinicId);
      throw new Error('Clinic not found');
    }

    // Обновляем или создаем настройки
    const settings = await prisma.clinicSettings.upsert({
      where: { clinicId },
      update: settingsData,
      create: {
        clinicId,
        ...settingsData,
      },
    });

    console.log('✅ [CLINIC SERVICE] Настройки обновлены');
    return settings;
  } catch (error) {
    console.error('🔴 [CLINIC SERVICE] Ошибка при обновлении настроек:', {
      message: error.message,
      stack: error.stack,
      clinicId,
    });

    // Если это ошибка Prisma, пробрасываем её дальше
    if (error.code === 'P2002' || error.code === 'P2025') {
      throw new Error('Clinic not found');
    }

    throw error;
  }
}

/**
 * Обновить пароль пользователя клиники (для всех ролей)
 * @param {string} clinicId - ID клиники
 * @param {string} userId - ID пользователя
 * @param {string} currentPassword - Текущий пароль
 * @param {string} newPassword - Новый пароль
 * @returns {Promise<object>} Результат обновления
 */
export async function updateClinicPassword(clinicId, userId, currentPassword, newPassword) {
  console.log('🔵 [CLINIC SERVICE] Обновление пароля пользователя:', userId);

  // Получаем пользователя (любая роль, но должен принадлежать клинике)
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      clinicId,
    },
  });

  if (!user) {
    throw new Error('User not found or does not belong to this clinic');
  }

  // Проверяем текущий пароль
  const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Хешируем новый пароль
  const newPasswordHash = await hashPassword(newPassword);

  // Обновляем пароль
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  console.log('✅ [CLINIC SERVICE] Пароль обновлен');
  return { success: true, message: 'Password updated successfully' };
}

