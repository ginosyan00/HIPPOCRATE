import React, { useState } from 'react';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { useDoctors } from '../../hooks/useUsers';
import { useConversations, useMessages, useSendMessage } from '../../hooks/useChat';
import { useAuthStore } from '../../store/useAuthStore';
import { User } from '../../types/api.types';
import { Conversation, Message } from '../../services/chat.service';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { ChatInput } from '../../components/chat/ChatInput';
import { Spinner } from '../../components/common/Spinner';
import { Card } from '../../components/common';

/**
 * ClinicChatPage
 * Страница чата для клиники - позволяет выбрать врача и просмотреть все его беседы
 */
export const ClinicChatPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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
    !!selectedConversation
  );

  const sendMessageMutation = useSendMessage();

  // Автоскролл к последнему сообщению
  React.useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Обработка выбора врача
  const handleSelectDoctor = (doctor: User) => {
    setSelectedDoctor(doctor);
    setSelectedConversation(null); // Сбрасываем выбранную беседу
  };

  // Обработка выбора беседы
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
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


  return (
    <NewDashboardLayout>
      <div className="h-[calc(100vh-120px)] flex gap-4">
        {/* Левая панель - Список врачей */}
        <Card className="w-80 flex-shrink-0 flex flex-col p-0">
          <div className="px-4 py-3 border-b border-stroke">
            <h2 className="text-lg font-semibold text-text-100">Врачи</h2>
            <p className="text-sm text-text-10 mt-1">
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
                const isSelected = selectedDoctor?.id === doctor.id;
                // Подсчитываем беседы этого врача
                const doctorConvs = conversations.filter((c) => c.userId === doctor.id);
                const unreadCount = doctorConvs.reduce(
                  (sum, conv) => sum + (conv._count?.messages || 0),
                  0
                );

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
                        <p
                          className={`text-sm font-semibold truncate ${
                            isSelected ? 'text-main-100' : 'text-text-100'
                          }`}
                        >
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
        </Card>

        {/* Средняя панель - Список бесед выбранного врача */}
        {selectedDoctor ? (
          <Card className="w-80 flex-shrink-0 flex flex-col p-0">
            <div className="px-4 py-3 border-b border-stroke">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => {
                    setSelectedDoctor(null);
                    setSelectedConversation(null);
                  }}
                  className="text-text-10 hover:text-text-100 transition-smooth p-1"
                  title="Назад к списку врачей"
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
                <h2 className="text-lg font-semibold text-text-100">
                  Беседы {selectedDoctor.name}
                </h2>
              </div>
              <p className="text-sm text-text-10">
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
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-10 text-sm">
                Выберите врача для просмотра его бесед
              </p>
            </div>
          </Card>
        )}

        {/* Правая панель - Сообщения выбранной беседы */}
        {selectedConversation ? (
          <Card className="flex-1 flex flex-col p-0">
            <div className="px-4 py-3 border-b border-stroke">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-text-10 hover:text-text-100 transition-smooth p-1"
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
                <h3 className="text-lg font-semibold text-text-100">
                  {(() => {
                    const conv = conversations.find((c) => c.id === selectedConversation);
                    return conv?.patient?.name || 'Беседа';
                  })()}
                </h3>
              </div>
            </div>

            {/* История сообщений */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-bg-white to-bg-white/50 px-4 py-4">
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
            <div className="border-t border-stroke bg-white">
              <ChatInput onSendMessage={handleSendMessage} disabled={false} />
            </div>
          </Card>
        ) : selectedDoctor ? (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-10 text-sm">
                Выберите беседу для просмотра сообщений
              </p>
            </div>
          </Card>
        ) : null}
      </div>
    </NewDashboardLayout>
  );
};

