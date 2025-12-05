import React, { useState, useEffect, useRef } from 'react';
import { useDoctors } from '../../hooks/useUsers';
import { useConversations, useMessages, useSendMessage } from '../../hooks/useChat';
import { useAuthStore } from '../../store/useAuthStore';
import { User } from '../../types/api.types';
import { Conversation, Message } from '../../services/chat.service';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Spinner } from '../common/Spinner';

interface ClinicChatProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'modal' | 'sidebar';
  width?: string;
  height?: string;
}

/**
 * ClinicChat Component
 * Компонент чата для клиники - позволяет выбрать врача и просмотреть все его беседы
 * Работает в sidebar или modal режиме
 */
export const ClinicChat: React.FC<ClinicChatProps> = ({
  isOpen,
  onClose,
  mode = 'sidebar',
  width = '800px',
  height = '100vh',
}) => {
  const user = useAuthStore((state) => state.user);
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showDoctorsList, setShowDoctorsList] = useState(true);
  const [showConversationsList, setShowConversationsList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Загружаем список врачей
  const { data: doctors = [], isLoading: isLoadingDoctors } = useDoctors();

  // Загружаем все беседы клиники
  const { conversations, isLoading: isLoadingConversations } = useConversations();

  // Фильтруем беседы по выбранному врачу
  const doctorConversations = selectedDoctor
    ? conversations.filter((conv) => conv.userId === selectedDoctor.id)
    : [];

  // Загружаем сообщения выбранной беседы
  const { messages, isLoading: isLoadingMessages } = useMessages(
    selectedConversation,
    isOpen && !!selectedConversation
  );

  const sendMessageMutation = useSendMessage();

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!isOpen) {
      setSelectedDoctor(null);
      setSelectedConversation(null);
      setShowDoctorsList(true);
      setShowConversationsList(false);
    }
  }, [isOpen]);

  // Обработка выбора врача
  const handleSelectDoctor = (doctor: User) => {
    setSelectedDoctor(doctor);
    setSelectedConversation(null);
    setShowDoctorsList(false);
    setShowConversationsList(true);
  };

  // Обработка выбора беседы
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (mode === 'sidebar') {
      setShowConversationsList(false);
    }
  };

  // Обработка отправки сообщения
  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!selectedConversation) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        content: content || '',
        imageUrl,
      });
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  if (!isOpen) return null;

  // Стили для sidebar режима
  const sidebarStyles =
    mode === 'sidebar'
      ? {
          position: 'fixed' as const,
          right: 0,
          top: 0,
          bottom: 0,
          width,
          height: '100vh',
          zIndex: 1000,
        }
      : {};

  const content = (
    <div
      className={`bg-bg-white border border-stroke rounded-lg flex flex-col ${
        mode === 'sidebar' ? 'h-full' : ''
      }`}
      style={sidebarStyles}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stroke bg-white shadow-sm">
        <div className="flex items-center gap-3">
          {/* Кнопка назад */}
          {(selectedDoctor || selectedConversation) && (
            <button
              onClick={() => {
                if (selectedConversation) {
                  setSelectedConversation(null);
                  setShowConversationsList(true);
                } else if (selectedDoctor) {
                  setSelectedDoctor(null);
                  setShowDoctorsList(true);
                  setShowConversationsList(false);
                }
              }}
              className="text-text-10 hover:text-text-100 transition-smooth p-1.5 hover:bg-bg-primary rounded-full flex items-center justify-center"
              title="Назад"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <h3 className="text-lg font-medium text-text-50">
            {selectedConversation
              ? (() => {
                  const conv = conversations.find((c) => c.id === selectedConversation);
                  return conv?.patient?.name || 'Беседа';
                })()
              : selectedDoctor
              ? `Беседы ${selectedDoctor.name}`
              : 'Врачи'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-text-10 hover:text-text-100 transition-smooth p-1 hover:bg-bg-primary rounded-full"
          title="Закрыть чат"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Левая панель - Список врачей или бесед */}
        {showDoctorsList && !selectedDoctor ? (
          <div className="w-80 border-r border-stroke bg-white flex flex-col">
            <div className="px-4 py-3 border-b border-stroke">
              <h4 className="text-sm font-medium text-text-50">Врачи</h4>
              <p className="text-xs text-text-10 mt-1">
                Выберите врача для просмотра бесед
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingDoctors ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : doctors.length === 0 ? (
                <div className="px-4 py-8 text-center text-text-10 text-sm">
                  Нет врачей в клинике
                </div>
              ) : (
                doctors.map((doctor) => {
                  const doctorConvs = conversations.filter((c) => c.userId === doctor.id);
                  const unreadCount = doctorConvs.reduce(
                    (sum, conv) => sum + (conv._count?.messages || 0),
                    0
                  );

                  return (
                    <button
                      key={doctor.id}
                      onClick={() => handleSelectDoctor(doctor)}
                      className="w-full px-4 py-3 text-left border-b border-stroke transition-smooth hover:bg-bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-main-10 flex items-center justify-center ring-2 ring-white">
                            {doctor.avatar ? (
                              <img
                                src={doctor.avatar}
                                alt={doctor.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg text-main-100 font-medium">
                                {doctor.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-main-100 text-white text-xs rounded-full flex items-center justify-center">
                              {unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-text-100">
                            {doctor.name}
                          </p>
                          {doctor.specialization && (
                            <p className="text-xs text-text-10 truncate">
                              {doctor.specialization}
                            </p>
                          )}
                          <p className="text-xs text-text-10 mt-1">
                            {doctorConvs.length} {doctorConvs.length === 1 ? 'беседа' : 'бесед'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : showConversationsList && selectedDoctor ? (
          <div className="w-80 border-r border-stroke bg-white flex flex-col">
            <div className="px-4 py-3 border-b border-stroke">
              <h4 className="text-sm font-medium text-text-50">
                Беседы {selectedDoctor.name}
              </h4>
              <p className="text-xs text-text-10 mt-1">
                {doctorConversations.length}{' '}
                {doctorConversations.length === 1 ? 'беседа' : 'бесед'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : doctorConversations.length === 0 ? (
                <div className="px-4 py-8 text-center text-text-10 text-sm">
                  У этого врача нет бесед
                </div>
              ) : (
                doctorConversations.map((conversation) => {
                  const isSelected = conversation.id === selectedConversation;
                  const unreadCount = conversation._count?.messages || 0;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`w-full px-4 py-3 text-left border-b border-stroke transition-smooth ${
                        isSelected
                          ? 'bg-main-10 border-l-4 border-l-main-100'
                          : 'hover:bg-bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-main-10 flex items-center justify-center">
                            {conversation.patient?.avatar ? (
                              <img
                                src={conversation.patient.avatar}
                                alt={conversation.patient.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm text-main-100 font-medium">
                                {conversation.patient?.name?.charAt(0).toUpperCase() || 'П'}
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-main-100 text-white text-xs rounded-full flex items-center justify-center">
                              {unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isSelected ? 'text-main-100' : 'text-text-100'
                            }`}
                          >
                            {conversation.patient?.name || 'Пациент'}
                          </p>
                          {conversation.lastMessageText && (
                            <p className="text-xs text-text-10 truncate mt-1">
                              {conversation.lastMessageText}
                            </p>
                          )}
                          {conversation.lastMessageAt && (
                            <p className="text-xs text-text-10 mt-1">
                              {(() => {
                                const date = new Date(conversation.lastMessageAt);
                                const now = new Date();
                                const diff = now.getTime() - date.getTime();
                                const hours = Math.floor(diff / 3600000);
                                const days = Math.floor(diff / 86400000);

                                if (hours < 24) {
                                  return date.toLocaleTimeString('ru-RU', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  });
                                } else if (days === 1) {
                                  return 'Вчера';
                                } else if (days < 7) {
                                  return date.toLocaleDateString('ru-RU', { weekday: 'short' });
                                } else {
                                  return date.toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'short',
                                  });
                                }
                              })()}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : null}

        {/* Правая панель - Сообщения выбранной беседы */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* История сообщений */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto bg-gradient-to-b from-bg-white to-bg-white/50 px-2"
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-text-10 text-sm">
                  Нет сообщений. Начните переписку!
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const isGrouped =
                      prevMessage &&
                      prevMessage.senderType === message.senderType &&
                      new Date(message.createdAt).getTime() -
                        new Date(prevMessage.createdAt).getTime() <
                        5 * 60 * 1000; // 5 минут

                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        showAvatar={true}
                        isGrouped={isGrouped}
                        conversation={conversations.find((c) => c.id === message.conversationId)}
                      />
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Поле ввода сообщения */}
            <div className="border-t border-stroke bg-white shadow-md">
              <ChatInput onSendMessage={handleSendMessage} disabled={false} />
            </div>
          </div>
        ) : selectedDoctor ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-10 text-sm">
                Выберите беседу для просмотра сообщений
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-10 text-sm">
                Выберите врача для просмотра его бесед
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (mode === 'modal') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl animate-fade-in"
          style={{ width, height }}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return content;
};

