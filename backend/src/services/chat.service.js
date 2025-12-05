import { prisma } from '../config/database.js';

/**
 * Chat Service
 * Бизнес-логика для работы с чатом
 */

/**
 * Найти или создать беседу между пациентом и врачом/клиникой
 * @param {string} clinicId - ID клиники
 * @param {string} patientId - ID пациента
 * @param {string} userId - ID врача или сотрудника (опционально)
 * @returns {Promise<object>} Conversation
 */
export async function findOrCreateConversation(clinicId, patientId, userId = null) {
  // Проверяем, существует ли уже беседа
  const existing = await prisma.conversation.findFirst({
    where: {
      clinicId,
      patientId,
      userId: userId || null,
    },
  });

  if (existing) {
    return existing;
  }

  // Создаем новую беседу
  const type = userId ? 'patient_doctor' : 'patient_clinic';
  return await prisma.conversation.create({
    data: {
      clinicId,
      patientId,
      userId,
      type,
    },
  });
}

/**
 * Получить все беседы для пользователя
 * @param {string} clinicId - ID клиники
 * @param {string} userRole - Роль пользователя (PATIENT, DOCTOR, ADMIN)
 * @param {string} userId - ID пользователя
 * @param {string} patientId - ID пациента (если роль PATIENT)
 * @param {object} options - Опции (page, limit)
 * @returns {Promise<object>} { conversations, meta }
 */
export async function getConversations(clinicId, userRole, userId, patientId = null, options = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  let where = {};

  // Для пациентов показываем только их беседы
  if (userRole === 'PATIENT') {
    // Если patientId не найден, возвращаем пустой список
    if (!patientId) {
      return {
        conversations: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }
    
    // Для PATIENT фильтруем только по patientId
    // clinicId может быть null, поэтому не добавляем его в where
    where.patientId = patientId;
    
    // Если clinicId есть, добавляем его для дополнительной фильтрации
    if (clinicId) {
      where.clinicId = clinicId;
    }
  }
  // Для врачей и админов показываем беседы их клиники
  else if (userRole === 'DOCTOR' || userRole === 'ADMIN' || userRole === 'CLINIC') {
    // Для этих ролей clinicId обязателен
    if (!clinicId) {
      throw new Error('CLINIC_ID_REQUIRED');
    }
    
    // Врачи видят беседы, где они участники, или все беседы клиники
    if (userRole === 'DOCTOR') {
      where = {
        clinicId,
        OR: [
          { userId },
          { userId: null }, // Беседы с клиникой (без конкретного врача)
        ],
      };
    } else {
      // Админы видят все беседы клиники
      where.clinicId = clinicId;
    }
  }

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            specialization: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderType: userRole === 'PATIENT' ? { not: 'patient' } : 'patient',
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.conversation.count({ where }),
  ]);

  return {
    conversations,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Получить беседу по ID
 * @param {string} conversationId - ID беседы
 * @param {string} clinicId - ID клиники (для проверки доступа)
 * @param {string} userRole - Роль пользователя
 * @param {string} userId - ID пользователя
 * @param {string} patientId - ID пациента (если роль PATIENT)
 * @returns {Promise<object>} Conversation
 */
export async function getConversationById(conversationId, clinicId, userRole, userId, patientId = null) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      patient: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          avatar: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          specialization: true,
        },
      },
      clinic: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new Error('CONVERSATION_NOT_FOUND');
  }

  // Проверка доступа
  // Для PATIENT clinicId может быть null, поэтому проверяем только если он указан
  if (clinicId && conversation.clinicId !== clinicId) {
    throw new Error('ACCESS_DENIED');
  }

  // Для PATIENT проверяем, что беседа принадлежит этому пациенту
  if (userRole === 'PATIENT') {
    if (!patientId || conversation.patientId !== patientId) {
      throw new Error('ACCESS_DENIED');
    }
  }

  // Врачи имеют доступ к беседам, где они участники, или к беседам с клиникой (userId = null)
  if (userRole === 'DOCTOR') {
    if (conversation.userId !== null && conversation.userId !== userId) {
      throw new Error('ACCESS_DENIED');
    }
  }

  // ADMIN и CLINIC имеют доступ ко всем беседам своей клиники (для мониторинга)
  // Это уже проверено выше через clinicId, поэтому дополнительная проверка не нужна

  return conversation;
}

/**
 * Получить сообщения беседы
 * @param {string} conversationId - ID беседы
 * @param {string} clinicId - ID клиники (для проверки доступа)
 * @param {object} options - Опции (page, limit, before)
 * @returns {Promise<object>} { messages, meta }
 */
export async function getMessages(conversationId, clinicId, options = {}) {
  const { page = 1, limit = 50, before } = options;
  const skip = (page - 1) * limit;

  // Проверяем доступ к беседе
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('CONVERSATION_NOT_FOUND');
  }

  // Если clinicId указан, проверяем соответствие
  // Если clinicId null (для PATIENT), пропускаем проверку
  if (clinicId && conversation.clinicId !== clinicId) {
    throw new Error('ACCESS_DENIED');
  }

  const where = {
    conversationId,
  };

  if (before) {
    where.createdAt = {
      lt: new Date(before),
    };
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
      skip,
      take: limit,
    }),
    prisma.message.count({ where }),
  ]);

  return {
    messages,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Отправить сообщение
 * @param {string} conversationId - ID беседы
 * @param {string} senderId - ID отправителя
 * @param {string} senderType - Тип отправителя (patient, doctor, clinic, system)
 * @param {string} content - Текст сообщения
 * @param {string} clinicId - ID клиники (для проверки доступа)
 * @param {string} imageUrl - URL изображения (опционально)
 * @returns {Promise<object>} Message
 */
export async function sendMessage(conversationId, senderId, senderType, content, clinicId, imageUrl = null) {
  // Проверяем доступ к беседе
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('CONVERSATION_NOT_FOUND');
  }

  // Для PATIENT clinicId может быть null, поэтому проверяем только если он указан
  // Для других ролей clinicId обязателен
  if (senderType !== 'patient' && !clinicId) {
    throw new Error('CLINIC_ID_REQUIRED');
  }

  if (clinicId && conversation.clinicId !== clinicId) {
    throw new Error('ACCESS_DENIED');
  }

  // Создаем сообщение
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      senderType,
      content: content?.trim() || '',
      imageUrl: imageUrl || null,
    },
  });

  // Обновляем беседу (последнее сообщение)
  const previewText = imageUrl 
    ? '📷 Изображение' 
    : (content?.trim() || '').substring(0, 100);
  
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessageText: previewText,
    },
  });

  return message;
}

/**
 * Удалить сообщение
 * @param {string} messageId - ID сообщения
 * @param {string} senderId - ID отправителя (для проверки прав)
 * @param {string} clinicId - ID клиники (для проверки доступа)
 * @returns {Promise<object>} Удаленное сообщение
 */
export async function deleteMessage(messageId, senderId, clinicId) {
  // Находим сообщение
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: true,
    },
  });

  if (!message) {
    throw new Error('MESSAGE_NOT_FOUND');
  }

  // Проверяем доступ к беседе
  // Если clinicId указан, проверяем соответствие
  // Если clinicId null (для PATIENT), пропускаем проверку clinicId
  if (clinicId && message.conversation.clinicId !== clinicId) {
    throw new Error('ACCESS_DENIED');
  }

  // Проверяем, что пользователь является отправителем сообщения
  if (message.senderId !== senderId) {
    throw new Error('ACCESS_DENIED');
  }

  // Удаляем сообщение
  await prisma.message.delete({
    where: { id: messageId },
  });

  // Обновляем последнее сообщение в беседе, если удаленное было последним
  const lastMessage = await prisma.message.findFirst({
    where: { conversationId: message.conversationId },
    orderBy: { createdAt: 'desc' },
  });

  await prisma.conversation.update({
    where: { id: message.conversationId },
    data: {
      lastMessageAt: lastMessage ? lastMessage.createdAt : null,
      lastMessageText: lastMessage
        ? lastMessage.imageUrl
          ? '📷 Изображение'
          : lastMessage.content?.substring(0, 100) || null
        : null,
    },
  });

  return message;
}

/**
 * Отметить сообщения как прочитанные
 * @param {string} conversationId - ID беседы
 * @param {string} userId - ID пользователя, который читает
 * @param {string} userRole - Роль пользователя
 * @param {string} clinicId - ID клиники (для проверки доступа)
 * @returns {Promise<number>} Количество обновленных сообщений
 */
export async function markAsRead(conversationId, userId, userRole, clinicId) {
  // Проверяем доступ к беседе
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('CONVERSATION_NOT_FOUND');
  }

  // Для PATIENT clinicId может быть null, поэтому проверяем только если он указан
  // Для других ролей clinicId обязателен
  if (userRole !== 'PATIENT' && !clinicId) {
    throw new Error('CLINIC_ID_REQUIRED');
  }

  if (clinicId && conversation.clinicId !== clinicId) {
    throw new Error('ACCESS_DENIED');
  }

  // Определяем, какие сообщения нужно отметить как прочитанные
  // Пациенты читают сообщения от врачей/клиники
  // Врачи/админы читают сообщения от пациентов
  const senderTypeFilter = userRole === 'PATIENT' ? { not: 'patient' } : 'patient';

  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      senderType: senderTypeFilter,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result.count;
}

/**
 * Получить количество непрочитанных сообщений
 * @param {string} clinicId - ID клиники
 * @param {string} userRole - Роль пользователя
 * @param {string} userId - ID пользователя
 * @param {string} patientId - ID пациента (если роль PATIENT)
 * @returns {Promise<number>} Количество непрочитанных сообщений
 */
export async function getUnreadCount(clinicId, userRole, userId, patientId = null) {
  // Если PATIENT и patientId не найден, возвращаем 0
  if (userRole === 'PATIENT' && !patientId) {
    return 0;
  }

  let where = {
    isRead: false,
  };

  if (userRole === 'PATIENT' && patientId) {
    // Пациенты видят непрочитанные сообщения от врачей/клиники
    where.senderType = { not: 'patient' };
    const conversationWhere = {
      patientId,
    };
    
    // Если clinicId есть, добавляем его для фильтрации
    if (clinicId) {
      conversationWhere.clinicId = clinicId;
    }
    
    where.conversation = conversationWhere;
  } else if (userRole === 'DOCTOR') {
    // Врачи видят непрочитанные сообщения от пациентов в своих беседах
    if (!clinicId) {
      throw new Error('CLINIC_ID_REQUIRED');
    }
    
    where.senderType = 'patient';
    where.conversation = {
      clinicId,
      OR: [
        { userId },
        { userId: null },
      ],
    };
  } else if (userRole === 'ADMIN' || userRole === 'CLINIC') {
    // Админы видят все непрочитанные сообщения от пациентов в клинике
    if (!clinicId) {
      throw new Error('CLINIC_ID_REQUIRED');
    }
    
    where.senderType = 'patient';
    where.conversation = {
      clinicId,
    };
  }

  return await prisma.message.count({
    where,
  });
}

/**
 * Создать беседу и отправить первое сообщение
 * @param {string} clinicId - ID клиники
 * @param {string} patientId - ID пациента
 * @param {string} userId - ID врача (опционально)
 * @param {string} senderId - ID отправителя
 * @param {string} senderType - Тип отправителя
 * @param {string} content - Текст сообщения
 * @returns {Promise<object>} { conversation, message }
 */
export async function createConversationWithMessage(
  clinicId,
  patientId,
  userId,
  senderId,
  senderType,
  content,
  imageUrl = null
) {
  // Создаем или находим беседу
  const conversation = await findOrCreateConversation(clinicId, patientId, userId);

  // Отправляем сообщение
  const message = await sendMessage(conversation.id, senderId, senderType, content, clinicId, imageUrl);

  return {
    conversation,
    message,
  };
}

