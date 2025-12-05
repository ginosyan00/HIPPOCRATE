import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, Conversation, Message, SendMessageRequest } from '../services/chat.service';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect, useRef } from 'react';

/**
 * useChat Hook
 * React Query hooks для работы с чатом
 */

/**
 * Получить список бесед
 */
export function useConversations() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: () => chatService.getConversations(),
    refetchInterval: 3000, // Обновление каждые 3 секунды
  });

  return {
    conversations: data?.conversations || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Получить беседу по ID
 */
export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ['chat', 'conversation', conversationId],
    queryFn: () => chatService.getConversation(conversationId!),
    enabled: !!conversationId,
  });
}

/**
 * Получить сообщения беседы
 */
export function useMessages(conversationId: string | null, enabled: boolean = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId!),
    enabled: enabled && !!conversationId,
    refetchInterval: enabled ? 2000 : false, // Обновление каждые 2 секунды когда чат открыт
  });

  // Автоматически отмечаем как прочитанные при загрузке
  useEffect(() => {
    if (query.data?.messages && enabled && conversationId) {
      const unreadMessages = query.data.messages.filter(
        (msg) => !msg.isRead && msg.senderType !== 'patient'
      );
      if (unreadMessages.length > 0) {
        chatService.markAsRead(conversationId).then(() => {
          queryClient.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
        });
      }
    }
  }, [query.data, enabled, conversationId, queryClient]);

  return {
    messages: query.data?.messages || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Отправить сообщение
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageData: SendMessageRequest) => chatService.sendMessage(messageData),
    onSuccess: (data) => {
      // Обновляем список бесед
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      // Обновляем сообщения беседы
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', data.conversation.id] });
      // Обновляем беседу
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', data.conversation.id] });
      // Обновляем счетчик непрочитанных
      queryClient.invalidateQueries({ queryKey: ['chat', 'unread-count'] });
    },
  });
}

/**
 * Отметить сообщения как прочитанные
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => chatService.markAsRead(conversationId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', data.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'unread-count'] });
    },
  });
}

/**
 * Получить количество непрочитанных сообщений
 */
export function useUnreadCount() {
  const { data, refetch } = useQuery({
    queryKey: ['chat', 'unread-count'],
    queryFn: () => chatService.getUnreadCount(),
    refetchInterval: 5000, // Обновление каждые 5 секунд
  });

  return {
    unreadCount: data?.unreadCount || 0,
    refetch,
  };
}

/**
 * Удалить сообщение
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => chatService.deleteMessage(messageId),
    onSuccess: (data) => {
      // Обновляем сообщения беседы
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', data.message.conversationId] });
      // Обновляем список бесед
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      // Обновляем беседу
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', data.message.conversationId] });
    },
  });
}

