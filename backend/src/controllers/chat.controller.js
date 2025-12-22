import * as chatService from '../services/chat.service.js';
import { successResponse } from '../utils/response.util.js';

/**
 * Chat Controller
 * Обработчики для chat endpoints
 */

/**
 * GET /api/v1/chat/conversations
 * Получить список бесед пользователя
 */
export async function getConversations(req, res, next) {
  try {
    const { page, limit } = req.query;
    const clinicId = req.user.clinicId;
    const userRole = req.user.role;
    const userId = req.user.userId;

    // Для пациентов нужно получить patientId
    let patientId = null;
    if (userRole === 'PATIENT') {
      // Получаем данные пользователя и ищем пациента
      const { prisma } = await import('../config/database.js');
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true },
      });

      if (currentUser) {
        // Для PATIENT ищем пациента по email/phone без фильтра по clinicId
        // так как clinicId может быть null при регистрации
        const where = {
          OR: [
            { email: currentUser.email },
            { phone: currentUser.phone || '' },
          ],
        };
        
        // Если clinicId есть, добавляем его для более точного поиска
        if (clinicId) {
          where.clinicId = clinicId;
        }
        
        const patient = await prisma.patient.findFirst({
          where,
          orderBy: { createdAt: 'desc' }, // Берем самую новую запись
        });
        
        patientId = patient?.id;
        
        // Если пациент не найден, это нормально для нового пользователя
        // Вернем пустой список бесед
      }
    }

    const result = await chatService.getConversations(
      clinicId,
      userRole,
      userId,
      patientId,
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
      }
    );

    successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/chat/conversations/:id
 * Получить беседу по ID
 */
export async function getConversation(req, res, next) {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinicId;
    const userRole = req.user.role;
    const userId = req.user.userId;

    let patientId = null;
    if (userRole === 'PATIENT') {
      const { prisma } = await import('../config/database.js');
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true },
      });

      if (currentUser) {
        // Для PATIENT ищем пациента по email/phone без обязательного фильтра по clinicId
        const where = {
          OR: [
            { email: currentUser.email },
            { phone: currentUser.phone || '' },
          ],
        };
        
        // Если clinicId есть, добавляем его для более точного поиска
        if (clinicId) {
          where.clinicId = clinicId;
        }
        
        const patient = await prisma.patient.findFirst({
          where,
          orderBy: { createdAt: 'desc' },
        });
        patientId = patient?.id;
      }
    }

    const conversation = await chatService.getConversationById(
      id,
      clinicId,
      userRole,
      userId,
      patientId
    );

    successResponse(res, conversation, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/chat/messages/:conversationId
 * Получить сообщения беседы
 */
export async function getMessages(req, res, next) {
  try {
    const { conversationId } = req.params;
    const { page, limit, before } = req.query;
    const clinicId = req.user.clinicId;

    const result = await chatService.getMessages(conversationId, clinicId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      before: before ? new Date(before) : null,
    });

    successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/chat/messages
 * Отправить сообщение
 */
export async function sendMessage(req, res, next) {
  try {
    const { conversationId, patientId, userId, doctorId, content, imageUrl, conversationType } = req.body;
    const clinicId = req.user.clinicId;
    const userRole = req.user.role;
    const senderId = req.user.userId;
    // Определяем senderType: для ADMIN/CLINIC всегда 'clinic', чтобы сообщения появлялись от клиники
    const senderType = 
      userRole === 'PATIENT' ? 'patient' : 
      userRole === 'DOCTOR' ? 'doctor' : 
      'clinic'; // ADMIN, CLINIC отправляют как 'clinic'

    let message;
    let conversation;

    // Если conversationId указан, отправляем в существующую беседу
    if (conversationId) {
      // Для пациентов нужно получить patientId для проверки доступа
      let patientIdForCheck = null;
      if (userRole === 'PATIENT') {
        const { prisma } = await import('../config/database.js');
        
        // Получаем данные пользователя для поиска пациента
        const currentUser = await prisma.user.findUnique({
          where: { id: senderId },
          select: { email: true, phone: true },
        });

        if (currentUser) {
          // Ищем пациента по email/phone
          const where = {
            OR: [
              { email: currentUser.email },
              { phone: currentUser.phone || '' },
            ],
          };
          
          // Если clinicId есть, добавляем его для более точного поиска
          if (clinicId) {
            where.clinicId = clinicId;
          }
          
          const patient = await prisma.patient.findFirst({
            where,
            orderBy: { createdAt: 'desc' },
          });
          
          patientIdForCheck = patient?.id;
        }
        
        // Получаем беседу для проверки статуса пациента
        const conversationForCheck = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            patient: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        });

        if (!conversationForCheck) {
          throw new Error('CONVERSATION_NOT_FOUND');
        }

        // Проверяем, что пациент не является гостем
        if (conversationForCheck.patient?.status === 'guest') {
          return res.status(403).json({
            success: false,
            error: {
              code: 'GUEST_CANNOT_SEND_MESSAGES',
              message: 'Гостевые пациенты не могут отправлять сообщения. Пожалуйста, зарегистрируйтесь.',
            },
          });
        }
      }

      message = await chatService.sendMessage(
        conversationId,
        senderId,
        senderType,
        content,
        clinicId,
        imageUrl,
        patientIdForCheck // Передаем patientId для проверки доступа
      );
      conversation = await chatService.getConversationById(
        conversationId,
        clinicId,
        userRole,
        senderId,
        patientIdForCheck // Передаем patientId для проверки доступа
      );
    } else {
      // Создаем новую беседу
      
      // Для клиники (ADMIN/CLINIC) поддерживаем создание бесед с врачами и пациентами
      if ((userRole === 'ADMIN' || userRole === 'CLINIC') && !clinicId) {
        throw new Error('CLINIC_ID_REQUIRED');
      }

      // Если указан doctorId и роль клиники - создаем беседу клиника-врач
      if ((userRole === 'ADMIN' || userRole === 'CLINIC') && doctorId) {
        const result = await chatService.createClinicDoctorConversationWithMessage(
          clinicId,
          doctorId,
          senderId,
          senderType,
          content,
          imageUrl
        );
        message = result.message;
        conversation = result.conversation;
      }
      // Если указан patientId и роль клиники - создаем беседу клиника-пациент
      else if ((userRole === 'ADMIN' || userRole === 'CLINIC') && patientId) {
        try {
          const result = await chatService.createClinicPatientConversationWithMessage(
            clinicId,
            patientId,
            senderId,
            senderType,
            content,
            imageUrl
          );
          message = result.message;
          conversation = result.conversation;
        } catch (error) {
          if (error.message === 'CANNOT_CREATE_CONVERSATION_WITH_GUEST') {
            return res.status(403).json({
              success: false,
              error: {
                code: 'CANNOT_CREATE_CONVERSATION_WITH_GUEST',
                message: 'Нельзя создать беседу с гостевым пациентом. Гости не могут получать и отвечать на сообщения.',
              },
            });
          }
          throw error;
        }
      }
      // Для пациентов создаем обычную беседу patient_doctor или patient_clinic
      else if (userRole === 'PATIENT') {
        // Для пациентов нужно найти или создать patientId
        let finalPatientId = patientId;
        let finalClinicId = clinicId; // Объявляем вне блока для использования позже
        
        if (!finalPatientId) {
        // Используем findOrCreatePatient для автоматического создания, если пациента нет
        const patientService = await import('../services/patient.service.js');
        const { prisma } = await import('../config/database.js');
        
        // Получаем полные данные пользователя из базы
        const currentUser = await prisma.user.findUnique({
          where: { id: senderId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            clinicId: true,
          },
        });

        if (!currentUser) {
          throw new Error('USER_NOT_FOUND');
        }

        // Если clinicId null, пытаемся найти его из User
        finalClinicId = clinicId || currentUser.clinicId;

        // Если clinicId все еще null, ищем через Patient по email/phone
        if (!finalClinicId) {
          const existingPatient = await prisma.patient.findFirst({
            where: {
              OR: [
                { email: currentUser.email },
                { phone: currentUser.phone || '' },
              ],
            },
            select: { clinicId: true },
          });
          finalClinicId = existingPatient?.clinicId;
        }

        if (!finalClinicId) {
          throw new Error('CLINIC_NOT_FOUND');
        }

        // Находим или создаем пациента
        // Убеждаемся, что name не пустой
        const patientName = currentUser.name || currentUser.email?.split('@')[0] || 'Patient';
        const patientPhone = currentUser.phone || '';
        const patientEmail = currentUser.email || null;

        if (!patientName || patientName.trim() === '') {
          throw new Error('PATIENT_NAME_REQUIRED');
        }

        console.log('🔵 [CHAT CONTROLLER] Создание/поиск пациента:', {
          clinicId: finalClinicId,
          name: patientName.trim(),
          phone: patientPhone,
          email: patientEmail,
        });

        const patient = await patientService.findOrCreatePatient(finalClinicId, {
          name: patientName.trim(),
          phone: patientPhone,
          email: patientEmail,
        });
        finalPatientId = patient.id;
        console.log('✅ [CHAT CONTROLLER] Пациент найден/создан:', finalPatientId);

        // Проверяем статус пациента - гости не могут отправлять сообщения
        if (patient.status === 'guest') {
          return res.status(403).json({
            success: false,
            error: {
              code: 'GUEST_CANNOT_SEND_MESSAGES',
              message: 'Гостевые пациенты не могут отправлять сообщения. Пожалуйста, зарегистрируйтесь.',
            },
          });
        }
      }

        if (!finalPatientId) {
          throw new Error('PATIENT_NOT_FOUND');
        }

        // Дополнительная проверка статуса пациента, если patientId был передан напрямую
        if (finalPatientId && userRole === 'PATIENT') {
          const { prisma } = await import('../config/database.js');
          const patientRecord = await prisma.patient.findUnique({
            where: { id: finalPatientId },
            select: { status: true },
          });

          if (patientRecord && patientRecord.status === 'guest') {
            return res.status(403).json({
              success: false,
              error: {
                code: 'GUEST_CANNOT_SEND_MESSAGES',
                message: 'Гостевые пациенты не могут отправлять сообщения. Пожалуйста, зарегистрируйтесь.',
              },
            });
          }
        }

        // Используем finalClinicId, если он был определен
        const finalClinicIdForConversation = finalClinicId || clinicId;
        if (!finalClinicIdForConversation) {
          throw new Error('CLINIC_NOT_FOUND');
        }

        const result = await chatService.createConversationWithMessage(
          finalClinicIdForConversation,
          finalPatientId,
          userId || null,
          senderId,
          senderType,
          content,
          imageUrl
        );
        message = result.message;
        conversation = result.conversation;
      } else {
        // Для других ролей (DOCTOR) или если не указаны параметры
        throw new Error('INVALID_CONVERSATION_PARAMETERS');
      }
    }

    successResponse(
      res,
      {
        message,
        conversation,
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/chat/conversations/:id/read
 * Отметить сообщения как прочитанные
 */
export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinicId;
    const userRole = req.user.role;
    const userId = req.user.userId;

    const count = await chatService.markAsRead(id, userId, userRole, clinicId);

    successResponse(
      res,
      {
        conversationId: id,
        readCount: count,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/chat/unread-count
 * Получить количество непрочитанных сообщений
 */
export async function getUnreadCount(req, res, next) {
  try {
    const clinicId = req.user.clinicId;
    const userRole = req.user.role;
    const userId = req.user.userId;

    let patientId = null;
    if (userRole === 'PATIENT') {
      const { prisma } = await import('../config/database.js');
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true },
      });

      if (currentUser) {
        // Для PATIENT ищем пациента по email/phone без обязательного фильтра по clinicId
        const where = {
          OR: [
            { email: currentUser.email },
            { phone: currentUser.phone || '' },
          ],
        };
        
        // Если clinicId есть, добавляем его для более точного поиска
        if (clinicId) {
          where.clinicId = clinicId;
        }
        
        const patient = await prisma.patient.findFirst({
          where,
          orderBy: { createdAt: 'desc' },
        });
        patientId = patient?.id;
      }
    }

    const count = await chatService.getUnreadCount(clinicId, userRole, userId, patientId);

    successResponse(
      res,
      {
        unreadCount: count,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/chat/messages/:id
 * Удалить сообщение
 */
export async function deleteMessage(req, res, next) {
  try {
    const { id } = req.params;
    const clinicId = req.user.clinicId;
    const senderId = req.user.userId;

    const deletedMessage = await chatService.deleteMessage(id, senderId, clinicId);

    successResponse(
      res,
      {
        message: deletedMessage,
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/chat/available-contacts
 * Получить список врачей и пациентов для общения (для клиники)
 * Возвращает врачей и пациентов, с которыми можно начать беседу
 */
export async function getAvailableContacts(req, res, next) {
  try {
    const clinicId = req.user.clinicId;
    const userRole = req.user.role;

    // Только для ADMIN и CLINIC
    if (userRole !== 'ADMIN' && userRole !== 'CLINIC') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Доступно только для владельцев клиники',
        },
      });
    }

    if (!clinicId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Clinic ID is required',
        },
      });
    }

    const { prisma } = await import('../config/database.js');
    const userService = await import('../services/user.service.js');
    const patientService = await import('../services/patient.service.js');

    // Получаем всех врачей клиники
    const doctors = await userService.findDoctors(clinicId);

    // Получаем всех пациентов клиники (только registered, не guest)
    const patientsResult = await patientService.findAll(clinicId, {
      page: 1,
      limit: 1000, // Большой лимит для получения всех пациентов
      status: 'registered', // Только зарегистрированные пациенты
    });

    // Получаем существующие беседы клиники
    const existingConversations = await prisma.conversation.findMany({
      where: {
        clinicId,
      },
      select: {
        userId: true,
        patientId: true,
        type: true,
      },
    });

    // Создаем Set для быстрого поиска существующих бесед
    const doctorConversationSet = new Set();
    const patientConversationSet = new Set();

    existingConversations.forEach((conv) => {
      if (conv.type === 'clinic_doctor' && conv.userId) {
        doctorConversationSet.add(conv.userId);
      }
      if (conv.type === 'patient_clinic' && conv.patientId) {
        patientConversationSet.add(conv.patientId);
      }
    });

    // Фильтруем врачей - показываем только тех, с кем еще нет беседы
    const availableDoctors = doctors
      .filter((doctor) => !doctorConversationSet.has(doctor.id))
      .map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        phone: doctor.phone,
        avatar: doctor.avatar,
        experience: doctor.experience,
        status: doctor.status,
      }));

    // Фильтруем пациентов - показываем только тех, с кем еще нет беседы
    // Дополнительно фильтруем по статусу (только registered)
    const availablePatients = patientsResult.patients
      .filter((patient) => !patientConversationSet.has(patient.id) && patient.status === 'registered')
      .map((patient) => ({
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        avatar: patient.avatar,
        status: patient.status, // Добавляем status для проверки на frontend
      }));

    successResponse(
      res,
      {
        doctors: availableDoctors,
        patients: availablePatients,
        meta: {
          totalDoctors: availableDoctors.length,
          totalPatients: availablePatients.length,
        },
      },
      200
    );
  } catch (error) {
    next(error);
  }
}

