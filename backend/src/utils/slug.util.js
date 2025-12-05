/**
 * Slug Utility
 * Создание URL-friendly slug из строки
 */

/**
 * Создает slug из строки
 * @param {string} text - Исходный текст
 * @returns {string} URL-friendly slug
 */
export function createSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Заменить пробелы на дефис
    .replace(/[^\w\-]+/g, '') // Удалить все не-word символы
    .replace(/\-\-+/g, '-') // Заменить множественные дефисы на один
    .replace(/^-+/, '') // Убрать дефис в начале
    .replace(/-+$/, ''); // Убрать дефис в конце
}

/**
 * Создает уникальный slug с проверкой в базе данных
 * @param {string} baseSlug - Базовый slug
 * @param {object} prisma - Prisma клиент
 * @returns {Promise<string>} Уникальный slug
 */
export async function createUniqueSlug(baseSlug, prisma) {
  if (!prisma) {
    throw new Error('Prisma client is required for createUniqueSlug');
  }

  // Проверяем, существует ли базовый slug
  let slug = baseSlug;
  let counter = 0;
  let isUnique = false;
  const maxAttempts = 100; // Защита от бесконечного цикла

  while (!isUnique && counter < maxAttempts) {
    const existingClinic = await prisma.clinic.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingClinic) {
      // Slug уникален, можем использовать
      isUnique = true;
      if (counter > 0) {
        console.log(`🔵 [SLUG UTIL] Slug "${baseSlug}" занят, использован вариант: "${slug}"`);
      }
    } else {
      // Slug занят, добавляем счетчик
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  if (counter >= maxAttempts) {
    throw new Error(`Не удалось создать уникальный slug для "${baseSlug}" после ${maxAttempts} попыток`);
  }

  return slug;
}

