import api from './api';
import { ApiResponse, PaginatedResponse } from '../types/api.types';

/**
 * Chat Service
 * API calls для работы с чатом
 */

export interface Conversation {
  id: string;
  clinicId: string;
  patientId: string | null;
  userId: string | null;
  type: 'patient_doctor' | 'patient_clinic' | 'system';
  lastMessageAt: string | null;
  lastMessageText: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    avatar: string | null;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    specialization: string | null;
  };
  clinic?: {
    id: string;
    name: string;
    logo: string | null;
  };
  _count?: {
    messages: number; // Количество непрочитанных сообщений
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'patient' | 'doctor' | 'clinic' | 'system';
  content: string;
  imageUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  conversationId?: string;
  patientId?: string;
  userId?: string;
  content?: string;
  imageUrl?: string;
}

export interface GetMessagesResponse {
  messages: Message[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetConversationsResponse {
  conversations: Conversation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const chatService = {
  /**
   * Получить список бесед
   */
  async getConversations(params?: {
    page?: number;
    limit?: number;
  }): Promise<GetConversationsResponse> {
    const { data } = await api.get<ApiResponse<GetConversationsResponse>>('/chat/conversations', {
      params,
    });
    return data.data;
  },

  /**
   * Получить беседу по ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const { data } = await api.get<ApiResponse<Conversation>>(
      `/chat/conversations/${conversationId}`
    );
    return data.data;
  },

  /**
   * Получить сообщения беседы
   */
  async getMessages(
    conversationId: string,
    params?: {
      page?: number;
      limit?: number;
      before?: string;
    }
  ): Promise<GetMessagesResponse> {
    const { data } = await api.get<ApiResponse<GetMessagesResponse>>(
      `/chat/messages/${conversationId}`,
      { params }
    );
    return data.data;
  },

  /**
   * Отправить сообщение
   */
  async sendMessage(messageData: SendMessageRequest): Promise<{ message: Message; conversation: Conversation }> {
    const { data } = await api.post<ApiResponse<{ message: Message; conversation: Conversation }>>(
      '/chat/messages',
      messageData
    );
    return data.data;
  },

  /**
   * Отметить сообщения как прочитанные
   */
  async markAsRead(conversationId: string): Promise<{ conversationId: string; readCount: number }> {
    const { data } = await api.post<ApiResponse<{ conversationId: string; readCount: number }>>(
      `/chat/conversations/${conversationId}/read`
    );
    return data.data;
  },

  /**
   * Получить количество непрочитанных сообщений
   */
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const { data } = await api.get<ApiResponse<{ unreadCount: number }>>('/chat/unread-count');
    return data.data;
  },

  /**
   * Удалить сообщение
   */
  async deleteMessage(messageId: string): Promise<{ message: Message }> {
    const { data } = await api.delete<ApiResponse<{ message: Message }>>(
      `/chat/messages/${messageId}`
    );
    return data.data;
  },
};

