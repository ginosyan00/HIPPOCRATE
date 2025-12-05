import express from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  sendMessageSchema,
  getMessagesSchema,
  getConversationsSchema,
} from '../validators/chat.validator.js';

const router = express.Router();

/**
 * Chat Routes
 * Все маршруты требуют аутентификации
 */

// Получить список бесед
router.get(
  '/conversations',
  authenticate,
  validate(getConversationsSchema, 'query'),
  chatController.getConversations
);

// Получить беседу по ID
router.get('/conversations/:id', authenticate, chatController.getConversation);

// Получить сообщения беседы
router.get(
  '/messages/:conversationId',
  authenticate,
  validate(getMessagesSchema, 'query'),
  chatController.getMessages
);

// Отправить сообщение
router.post(
  '/messages',
  authenticate,
  validate(sendMessageSchema, 'body'),
  chatController.sendMessage
);

// Отметить сообщения как прочитанные
router.post('/conversations/:id/read', authenticate, chatController.markAsRead);

// Получить количество непрочитанных сообщений
router.get('/unread-count', authenticate, chatController.getUnreadCount);

// Удалить сообщение
router.delete('/messages/:id', authenticate, chatController.deleteMessage);

export default router;

