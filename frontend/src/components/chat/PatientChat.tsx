import React, { useState, useEffect, useRef } from 'react';
import { useConversations, useMessages, useSendMessage, useUnreadCount } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { Conversation, Message } from '../../services/chat.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Spinner } from '../common/Spinner';
import { useDoctors } from '../../hooks/useUsers';
import { User } from '../../types/api.types';

interface PatientChatProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'modal' | 'sidebar'; // Режим отображения: модальное окно или боковая панель
  initialConversationId?: string | null; // Начальная беседа (опционально)
  width?: string; // Ширина чата (для sidebar)
  height?: string; // Высота чата
}

/**
 * PatientChat Component
 * Полнофункциональный компонент чата для стоматологической клиники
 * 
 * Функции:
 * - Отправка и получение сообщений
 * - История чата с автоскроллом
 * - Список бесед
 * - Индикатор непрочитанных сообщений
 * - Поддержка модального окна и боковой панели
 */
export const PatientChat: React.FC<PatientChatProps> = ({
  isOpen,
  onClose,
  mode = 'modal',
  initialConversationId = null,
  width = '400px',
  height = '600px',
}) => {
  const user = useAuthStore((state) => state.user);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    initialConversationId
  );
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [showConversationsList, setShowConversationsList] = useState(true);
  const [showDoctorsList, setShowDoctorsList] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { conversations, isLoading: isLoadingConversations } = useConversations();
  const { messages, isLoading: isLoadingMessages } = useMessages(
    selectedConversation,
    isOpen && !!selectedConversation
  );
  const sendMessageMutation = useSendMessage();
  const { unreadCount } = useUnreadCount();
  const { data: doctors = [], isLoading: isLoadingDoctors } = useDoctors();

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Показываем список врачей, если нет бесед и пользователь - пациент
  useEffect(() => {
    if (
      user?.role === 'PATIENT' &&
      conversations.length === 0 &&
      !selectedConversation &&
      !selectedDoctor &&
      isOpen
    ) {
      setShowDoctorsList(true);
    }
  }, [conversations, selectedConversation, selectedDoctor, isOpen, user?.role]);

  // Обработка отправки сообщения
  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!selectedConversation) {
      // Создаем новую беседу (для пациентов)
      try {
        const result = await sendMessageMutation.mutateAsync({
          content: content || '',
          imageUrl,
          userId: selectedDoctor?.id, // ID выбранного врача
          patientId: undefined, // Будет определено на бэкенде
        });
        if (result.conversation) {
          setSelectedConversation(result.conversation.id);
          setSelectedDoctor(null); // Сбрасываем выбранного врача
          setShowConversationsList(false);
          setShowDoctorsList(false);
        }
      } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
      }
    } else {
      // Отправляем в существующую беседу
      try {
        await sendMessageMutation.mutateAsync({
          conversationId: selectedConversation,
          content: content || '',
          imageUrl,
        });
      } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
      }
    }
  };

  // Обработка выбора врача
  const handleSelectDoctor = (doctor: User) => {
    setSelectedDoctor(doctor);
    setShowDoctorsList(false);
    setShowConversationsList(false); // Скрываем список после выбора врача
    // Проверяем, есть ли уже беседа с этим врачом
    const existingConversation = conversations.find((c) => c.userId === doctor.id);
    if (existingConversation) {
      setSelectedConversation(existingConversation.id);
    } else {
      setSelectedConversation(null);
    }
  };

  // Получить название беседы
  const getConversationTitle = (conversation: Conversation) => {
    if (user?.role === 'PATIENT') {
      return conversation.user?.name || 'Клиника';
    } else {
      return conversation.patient?.name || 'Пациент';
    }
  };

  // Получить аватар беседы
  const getConversationAvatar = (conversation: Conversation) => {
    if (user?.role === 'PATIENT') {
      return conversation.user?.avatar || null;
    } else {
      return null; // Можно добавить аватар пациента, если будет
    }
  };

  // Получить информацию об отправителе
  const getSenderInfo = (message: Message) => {
    const conversation = conversations.find((c) => c.id === message.conversationId);
    if (!conversation) return { name: 'Unknown', avatar: null };

    if (message.senderType === 'patient') {
      return {
        name: conversation.patient?.name || 'Пациент',
        avatar: conversation.patient?.avatar || null,
      };
    } else if (message.senderType === 'doctor') {
      return {
        name: conversation.user?.name || 'Врач',
        avatar: conversation.user?.avatar || null,
      };
    } else {
      // clinic or system
      const clinicLogo = conversation?.clinic?.logo || null;
      return { 
        name: conversation?.clinic?.name || 'Клиника', 
        avatar: clinicLogo 
      };
    }
  };

  // Выбранная беседа
  const selectedConversationData = conversations.find((c) => c.id === selectedConversation);

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
          {/* Кнопка назад - показываем если выбрана беседа или врач */}
          {(selectedConversation || selectedDoctor) && (
            <button
              onClick={() => {
                console.log('🔵 [CHAT] Кнопка назад нажата');
                setSelectedConversation(null);
                setSelectedDoctor(null);
                setShowConversationsList(true);
                setShowDoctorsList(false);
              }}
              className="text-text-10 hover:text-text-100 transition-smooth p-1.5 hover:bg-bg-primary rounded-full flex items-center justify-center"
              title="Назад к списку бесед"
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
          {mode === 'sidebar' && !selectedConversation && !selectedDoctor && (
            <button
              onClick={() => setShowConversationsList(!showConversationsList)}
              className="text-text-10 hover:text-text-100 transition-smooth md:hidden"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}
          <h3 className="text-lg font-medium text-text-50">
            {selectedConversationData
              ? getConversationTitle(selectedConversationData)
              : selectedDoctor
              ? selectedDoctor.name
              : 'Чат'}
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
        {/* Список бесед - показываем если нет выбранной беседы/врача ИЛИ если явно показан */}
        {(!selectedConversation && !selectedDoctor) || showConversationsList ? (
          <div className="w-full md:w-80 border-r border-stroke bg-white flex flex-col">
            <div className="px-4 py-3 border-b border-stroke">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-text-50">Беседы</h4>
                {user?.role === 'PATIENT' && (
                  <button
                    onClick={() => {
                      setShowDoctorsList(true);
                      setShowConversationsList(false);
                    }}
                    className="text-xs text-main-100 hover:text-main-100/80 transition-smooth"
                    title="Начать новую беседу"
                  >
                    + Новый чат
                  </button>
                )}
              </div>
              {unreadCount > 0 && (
                <span className="text-xs text-main-100">
                  {unreadCount} непрочитанных
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {showDoctorsList && user?.role === 'PATIENT' ? (
                // Список врачей для выбора
                <div>
                  <div className="px-4 py-2 border-b border-stroke bg-bg-white">
                    <button
                      onClick={() => {
                        setShowDoctorsList(false);
                        setShowConversationsList(true);
                      }}
                      className="text-xs text-text-10 hover:text-text-100 flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
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
                      Назад к беседам
                    </button>
                    <h5 className="text-sm font-medium text-text-50 mt-2">
                      Выберите врача для начала беседы
                    </h5>
                  </div>
                  {isLoadingDoctors ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner />
                    </div>
                  ) : doctors.length === 0 ? (
                    <div className="px-4 py-8 text-center text-text-10 text-sm">
                      Нет доступных врачей
                    </div>
                  ) : (
                    doctors.map((doctor) => {
                      const existingConversation = conversations.find(
                        (c) => c.userId === doctor.id
                      );
                      const isSelected = selectedDoctor?.id === doctor.id;
                      return (
                        <button
                          key={doctor.id}
                          onClick={() => handleSelectDoctor(doctor)}
                          className={`w-full px-4 py-3 text-left border-b border-stroke transition-smooth ${
                            isSelected
                              ? 'bg-main-10 border-l-4 border-l-main-100'
                              : 'hover:bg-bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-main-10 flex items-center justify-center">
                                {doctor.avatar ? (
                                  <img
                                    src={doctor.avatar}
                                    alt={doctor.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-sm text-main-100 font-medium">
                                    {doctor.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p
                                  className={`text-sm font-semibold truncate ${
                                    isSelected ? 'text-main-100' : 'text-text-100'
                                  }`}
                                >
                                  {doctor.name}
                                </p>
                                {existingConversation && (
                                  <span className="text-xs text-text-10 bg-bg-primary px-2 py-0.5 rounded">
                                    Есть беседа
                                  </span>
                                )}
                              </div>
                              {doctor.specialization && (
                                <p className="text-xs text-text-10 truncate">
                                  {doctor.specialization}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner />
                </div>
              ) : conversations.length === 0 ? (
                <div className="px-4 py-8 text-center text-text-10 text-sm">
                  Нет бесед. Начните новую беседу, выбрав врача.
                </div>
              ) : (
                conversations.map((conversation) => {
                  const unreadCount = conversation._count?.messages || 0;
                  const isSelected = conversation.id === selectedConversation;
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => {
                        console.log('🔵 [CHAT] Выбрана беседа:', conversation.id);
                        setSelectedConversation(conversation.id);
                        setSelectedDoctor(null);
                        if (mode === 'sidebar') {
                          setShowConversationsList(false);
                        }
                      }}
                      className={`w-full px-4 py-3 text-left border-b border-stroke transition-smooth ${
                        isSelected
                          ? 'bg-main-10 border-l-4 border-l-main-100'
                          : 'hover:bg-bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-main-10 flex items-center justify-center ring-2 ring-white">
                            {getConversationAvatar(conversation) ? (
                              <img
                                src={getConversationAvatar(conversation)!}
                                alt={getConversationTitle(conversation)}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg text-main-100 font-medium">
                                {getConversationTitle(conversation).charAt(0).toUpperCase()}
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
                          <div className="flex items-center justify-between mb-1">
                            <p
                              className={`text-sm font-semibold truncate ${
                                isSelected ? 'text-main-100' : 'text-text-100'
                              }`}
                            >
                              {getConversationTitle(conversation)}
                            </p>
                          </div>
                          {conversation.lastMessageText && (
                            <p className="text-xs text-text-10 truncate">
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

        {/* Область сообщений */}
        {selectedConversation && (
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

                    // Определяем, является ли сообщение "своим"
                    const isOwnMessage = 
                      (user?.role === 'PATIENT' && message.senderType === 'patient') ||
                      (user?.role === 'DOCTOR' && message.senderType === 'doctor') ||
                      ((user?.role === 'ADMIN' || user?.role === 'CLINIC') && message.senderType === 'clinic');
                    
                    const senderInfo = getSenderInfo(message);

                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        showAvatar={true}
                        isGrouped={isGrouped}
                        senderAvatar={senderInfo?.avatar}
                        senderName={senderInfo?.name || ''}
                        conversation={conversations.find((c) => c.id === message.conversationId)}
                      />
                    );
                  })}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Поле ввода сообщения */}
            <div className="border-t border-stroke bg-white shadow-md">
              <ChatInput onSendMessage={handleSendMessage} disabled={!selectedConversation} />
            </div>
          </div>
        )}

        {/* Область ввода для нового чата с врачом */}
        {selectedDoctor && !selectedConversation && (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-bg-white to-bg-white/50 px-4 text-center">
              <div>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-main-10 flex items-center justify-center">
                  {selectedDoctor.avatar ? (
                    <img
                      src={selectedDoctor.avatar}
                      alt={selectedDoctor.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-main-100 font-medium">
                      {selectedDoctor.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-text-100 mb-1">
                  {selectedDoctor.name}
                </h3>
                {selectedDoctor.specialization && (
                  <p className="text-sm text-text-10 mb-4">{selectedDoctor.specialization}</p>
                )}
                <p className="text-sm text-text-10">
                  Напишите первое сообщение, чтобы начать беседу
                </p>
              </div>
            </div>

            {/* Поле ввода для первого сообщения */}
            <div className="border-t border-stroke bg-white shadow-md">
              <ChatInput onSendMessage={handleSendMessage} disabled={false} />
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
