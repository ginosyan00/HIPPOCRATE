import { prisma } from '../config/database.js';

/**
 * Daily Advice Service
 * Բիզնես-լոգիկա օրական խորհուրդների համար
 */

/**
 * Ստանալ օրվա խորհուրդը
 * @param {number} dayOfYear - Տարվա օրը (1-365)
 * @param {string} language - Լեզու (ru | en | am), default: 'ru'
 * @returns {Promise<object>} DailyAdvice
 */
export async function getAdviceByDay(dayOfYear, language = 'ru') {
  // Վալիդացիա
  if (!dayOfYear || dayOfYear < 1 || dayOfYear > 365) {
    throw new Error('Day of year must be between 1 and 365');
  }

  const validLanguages = ['ru', 'en', 'am'];
  if (!validLanguages.includes(language)) {
    throw new Error(`Language must be one of: ${validLanguages.join(', ')}`);
  }

  // Գտնել խորհուրդը
  const advice = await prisma.dailyAdvice.findUnique({
    where: {
      dayOfYear_language: {
        dayOfYear: parseInt(dayOfYear),
        language,
      },
    },
  });

  if (!advice || !advice.isActive) {
    // Եթե չկա այս լեզվով, փորձել գտնել ռուսերենով
    if (language !== 'ru') {
      const fallbackAdvice = await prisma.dailyAdvice.findUnique({
        where: {
          dayOfYear_language: {
            dayOfYear: parseInt(dayOfYear),
            language: 'ru',
          },
        },
      });
      if (fallbackAdvice && fallbackAdvice.isActive) {
        return fallbackAdvice;
      }
    }
    throw new Error('Advice not found for this day');
  }

  return advice;
}

/**
 * Ստանալ այսօրվա խորհուրդը
 * @param {string} language - Լեզու (ru | en | am), default: 'ru'
 * @returns {Promise<object>} DailyAdvice
 */
export async function getTodayAdvice(language = 'ru') {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

  return getAdviceByDay(dayOfYear, language);
}

/**
 * Ստանալ բոլոր խորհուրդները
 * @param {object} options - Options (language, isActive, page, limit)
 * @returns {Promise<object>} { advices, meta }
 */
export async function findAll(options = {}) {
  const { language, isActive, page = 1, limit = 100 } = options;
  const skip = (page - 1) * limit;

  const where = {};

  if (language) {
    where.language = language;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true' || isActive === true;
  }

  const [advices, total] = await Promise.all([
    prisma.dailyAdvice.findMany({
      where,
      orderBy: { dayOfYear: 'asc' },
      take: limit,
      skip,
    }),
    prisma.dailyAdvice.count({ where }),
  ]);

  return {
    advices,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Ստեղծել նոր խորհուրդ
 * @param {object} data - Advice data
 * @returns {Promise<object>} Created DailyAdvice
 */
export async function create(data) {
  const { dayOfYear, title, content, language = 'ru', isActive = true } = data;

  // Վալիդացիա
  if (!dayOfYear || dayOfYear < 1 || dayOfYear > 365) {
    throw new Error('Day of year must be between 1 and 365');
  }

  if (!content) {
    throw new Error('Content is required');
  }

  const validLanguages = ['ru', 'en', 'am'];
  if (!validLanguages.includes(language)) {
    throw new Error(`Language must be one of: ${validLanguages.join(', ')}`);
  }

  // Ստուգել արդյոք արդեն գոյություն ունի
  const existing = await prisma.dailyAdvice.findUnique({
    where: {
      dayOfYear_language: {
        dayOfYear: parseInt(dayOfYear),
        language,
      },
    },
  });

  if (existing) {
    throw new Error(`Advice for day ${dayOfYear} in language ${language} already exists`);
  }

  return prisma.dailyAdvice.create({
    data: {
      dayOfYear: parseInt(dayOfYear),
      title: title || null,
      content,
      language,
      isActive: isActive === true || isActive === 'true',
    },
  });
}

/**
 * Թարմացնել խորհուրդ
 * @param {string} id - Advice ID
 * @param {object} data - Update data
 * @returns {Promise<object>} Updated DailyAdvice
 */
export async function update(id, data) {
  const { title, content, isActive } = data;

  const updateData = {};

  if (title !== undefined) {
    updateData.title = title || null;
  }

  if (content !== undefined) {
    if (!content) {
      throw new Error('Content cannot be empty');
    }
    updateData.content = content;
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive === true || isActive === 'true';
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('No fields to update');
  }

  return prisma.dailyAdvice.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Ջնջել խորհուրդ
 * @param {string} id - Advice ID
 * @returns {Promise<object>} Deleted DailyAdvice
 */
export async function remove(id) {
  return prisma.dailyAdvice.delete({
    where: { id },
  });
}

/**
 * Ստեղծել բազմաթիվ խորհուրդներ (bulk create)
 * @param {array} advices - Array of advice objects
 * @returns {Promise<object>} { created, errors }
 */
export async function createMany(advices) {
  const created = [];
  const errors = [];

  for (const advice of advices) {
    try {
      const result = await create(advice);
      created.push(result);
    } catch (error) {
      errors.push({
        advice,
        error: error.message,
      });
    }
  }

  return { created, errors };
}

