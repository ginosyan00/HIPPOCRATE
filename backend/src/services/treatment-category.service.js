import { prisma } from '../config/database.js';

/**
 * Treatment Category Service
 * Бизнес-логика для работы с категориями лечения клиники
 */

/**
 * Получить все категории лечения клиники
 * @param {string} clinicId - ID клиники
 * @returns {Promise<Array>} Список категорий
 */
export async function getTreatmentCategories(clinicId) {
  console.log('🔵 [TREATMENT CATEGORY SERVICE] Получение категорий клиники:', clinicId);

  const categories = await prisma.treatmentCategory.findMany({
    where: { clinicId },
    orderBy: { name: 'asc' },
  });

  console.log('✅ [TREATMENT CATEGORY SERVICE] Найдено категорий:', categories.length);
  return categories;
}

/**
 * Получить категорию по ID
 * @param {string} clinicId - ID клиники
 * @param {string} categoryId - ID категории
 * @returns {Promise<object>} Категория
 */
export async function getTreatmentCategoryById(clinicId, categoryId) {
  console.log('🔵 [TREATMENT CATEGORY SERVICE] Получение категории:', clinicId, categoryId);

  const category = await prisma.treatmentCategory.findFirst({
    where: {
      id: categoryId,
      clinicId, // Проверка принадлежности к клинике
    },
  });

  if (!category) {
    throw new Error('Treatment category not found');
  }

  console.log('✅ [TREATMENT CATEGORY SERVICE] Категория найдена:', category.name);
  return category;
}

/**
 * Создать категорию лечения
 * @param {string} clinicId - ID клиники
 * @param {object} data - Данные категории
 * @returns {Promise<object>} Созданная категория
 */
export async function createTreatmentCategory(clinicId, data) {
  console.log('🔵 [TREATMENT CATEGORY SERVICE] Создание категории:', clinicId, data);

  // Проверка существования клиники
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
  });

  if (!clinic) {
    throw new Error('Clinic not found');
  }

  // Проверка уникальности названия в рамках клиники
  const existing = await prisma.treatmentCategory.findFirst({
    where: {
      clinicId,
      name: data.name,
    },
  });

  if (existing) {
    throw new Error('Treatment category with this name already exists');
  }

  const category = await prisma.treatmentCategory.create({
    data: {
      clinicId,
      name: data.name,
      defaultDuration: data.defaultDuration || 30,
      description: data.description || null,
      color: data.color || null, // Сохраняем цвет, если он передан
    },
  });

  console.log('✅ [TREATMENT CATEGORY SERVICE] Категория создана:', category.id, 'Цвет:', category.color);
  return category;
}

/**
 * Обновить категорию лечения
 * @param {string} clinicId - ID клиники
 * @param {string} categoryId - ID категории
 * @param {object} data - Данные для обновления
 * @returns {Promise<object>} Обновленная категория
 */
export async function updateTreatmentCategory(clinicId, categoryId, data) {
  console.log('🔵 [TREATMENT CATEGORY SERVICE] Обновление категории:', clinicId, categoryId, data);
  console.log('🔵 [TREATMENT CATEGORY SERVICE] Данные для обновления:', JSON.stringify(data, null, 2));

  // Проверка существования и принадлежности категории
  const existing = await prisma.treatmentCategory.findFirst({
    where: {
      id: categoryId,
      clinicId,
    },
  });

  if (!existing) {
    throw new Error('Treatment category not found');
  }

  // Если обновляется название, проверяем уникальность
  if (data.name && data.name !== existing.name) {
    const duplicate = await prisma.treatmentCategory.findFirst({
      where: {
        clinicId,
        name: data.name,
        NOT: { id: categoryId },
      },
    });

    if (duplicate) {
      throw new Error('Treatment category with this name already exists');
    }
  }

  // Подготавливаем данные для обновления - обновляем только переданные поля
  const updateData = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.defaultDuration !== undefined) updateData.defaultDuration = data.defaultDuration;
  if (data.description !== undefined) updateData.description = data.description || null;
  
  // Для цвета: обрабатываем только если поле передано явно
  // Если color === null - удаляем цвет, если color === строка - сохраняем
  if ('color' in data) {
    updateData.color = data.color || null;
    console.log('🎨 [TREATMENT CATEGORY SERVICE] Обновление цвета:', data.color, '→', updateData.color);
  }

  console.log('🔵 [TREATMENT CATEGORY SERVICE] Данные для Prisma update:', JSON.stringify(updateData, null, 2));

  // Проверяем, что есть хотя бы одно поле для обновления
  if (Object.keys(updateData).length === 0) {
    throw new Error('No fields to update');
  }

  const category = await prisma.treatmentCategory.update({
    where: { id: categoryId },
    data: updateData,
  });

  console.log('✅ [TREATMENT CATEGORY SERVICE] Категория обновлена:', category.id, 'Цвет:', category.color);
  return category;
}

/**
 * Удалить категорию лечения
 * @param {string} clinicId - ID клиники
 * @param {string} categoryId - ID категории
 * @returns {Promise<object>} Результат удаления
 */
export async function deleteTreatmentCategory(clinicId, categoryId) {
  console.log('🔵 [TREATMENT CATEGORY SERVICE] Удаление категории:', clinicId, categoryId);

  // Проверка существования и принадлежности категории
  const existing = await prisma.treatmentCategory.findFirst({
    where: {
      id: categoryId,
      clinicId,
    },
  });

  if (!existing) {
    throw new Error('Treatment category not found');
  }

  // Удаляем категорию (связи с врачами удалятся автоматически через onDelete: Cascade)
  await prisma.treatmentCategory.delete({
    where: { id: categoryId },
  });

  console.log('✅ [TREATMENT CATEGORY SERVICE] Категория удалена:', categoryId);
  return { success: true };
}

/**
 * Получить категории врача
 * @param {string} doctorId - ID врача
 * @returns {Promise<Array>} Список категорий врача
 */
export async function getDoctorCategories(doctorId) {
  console.log('🔵 [TREATMENT CATEGORY SERVICE] Получение категорий врача:', doctorId);

  const doctorCategories = await prisma.doctorTreatmentCategory.findMany({
    where: { doctorId },
    include: {
      treatmentCategory: true,
    },
  });

  const categories = doctorCategories.map(dc => dc.treatmentCategory);

  console.log('✅ [TREATMENT CATEGORY SERVICE] Найдено категорий у врача:', categories.length);
  return categories;
}

/**
 * Обновить категории врача
 * @param {string} doctorId - ID врача
 * @param {Array<string>} categoryIds - Массив ID категорий
 * @returns {Promise<object>} Результат обновления
 */
export async function updateDoctorCategories(doctorId, categoryIds) {
  console.log('🔵 [TREATMENT CATEGORY SERVICE] Обновление категорий врача:', doctorId, categoryIds);

  // Проверка существования врача
  const doctor = await prisma.user.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  if (doctor.role !== 'DOCTOR') {
    throw new Error('User is not a doctor');
  }

  // Удаляем все существующие связи
  await prisma.doctorTreatmentCategory.deleteMany({
    where: { doctorId },
  });

  // Создаем новые связи
  if (categoryIds && categoryIds.length > 0) {
    // Проверяем, что все категории принадлежат той же клинике
    const clinicId = doctor.clinicId;
    if (!clinicId) {
      throw new Error('Doctor is not associated with a clinic');
    }

    const categories = await prisma.treatmentCategory.findMany({
      where: {
        id: { in: categoryIds },
        clinicId,
      },
    });

    if (categories.length !== categoryIds.length) {
      throw new Error('Some treatment categories not found or belong to different clinic');
    }

    // Создаем связи
    await prisma.doctorTreatmentCategory.createMany({
      data: categoryIds.map(categoryId => ({
        doctorId,
        treatmentCategoryId: categoryId,
      })),
    });
  }

  console.log('✅ [TREATMENT CATEGORY SERVICE] Категории врача обновлены');
  return { success: true };
}


