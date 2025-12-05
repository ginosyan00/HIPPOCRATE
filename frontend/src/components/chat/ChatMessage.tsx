import React, { useState, useRef, useEffect } from 'react';
import { Message, Conversation } from '../../services/chat.service';
import { useAuthStore } from '../../store/useAuthStore';
import { useDeleteMessage } from '../../hooks/useChat';

interface ChatMessageProps {
  message: Message;
  conversation?: Conversation; // Данные беседы для получения аватара врача
  showAvatar?: boolean;
  isGrouped?: boolean; // Группировка с предыдущим сообщением
  onDelete?: (messageId: string) => void; // Callback для удаления сообщения
}

/**
 * ChatMessage Component
 * Современный дизайн сообщения в стиле мессенджеров
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  conversation,
  showAvatar = false,
  isGrouped = false,
  onDelete,
}) => {
  const user = useAuthStore((state) => state.user);
  // Определяем, является ли сообщение "своим" в зависимости от роли пользователя
  // Clinic messages (from ADMIN/CLINIC) are always shown on the right as "own" messages
  const isOwnMessage = 
    (user?.role === 'PATIENT' && message.senderType === 'patient') ||
    (user?.role === 'DOCTOR' && message.senderType === 'doctor') ||
    ((user?.role === 'ADMIN' || user?.role === 'CLINIC') && message.senderType === 'clinic');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const messageRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const deleteMessageMutation = useDeleteMessage();

  // Закрываем context menu при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node) &&
        messageRef.current &&
        !messageRef.current.contains(event.target as Node)
      ) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showContextMenu]);

  // Обработка правого клика
  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isOwnMessage) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Получаем позицию сообщения относительно viewport
    if (messageRef.current) {
      const rect = messageRef.current.getBoundingClientRect();
      // Позиционируем menu прямо под сообщением, выровненным по правому краю
      setContextMenuPosition({ 
        x: rect.right, // Правая граница сообщения
        y: rect.bottom + 2 // 2px отступ снизу, прямо под сообщением
      });
      setShowContextMenu(true);
    }
  };

  // Обработка удаления
  const handleDelete = async () => {
    setShowContextMenu(false);
    if (window.confirm('Вы уверены, что хотите удалить это сообщение?')) {
      try {
        await deleteMessageMutation.mutateAsync(message.id);
        if (onDelete) {
          onDelete(message.id);
        }
      } catch (error) {
        console.error('Ошибка удаления сообщения:', error);
        alert('Не удалось удалить сообщение');
      }
    }
  };

  // Получаем аватар врача из беседы
  const getDoctorAvatar = () => {
    if (conversation?.user?.avatar) {
      return conversation.user.avatar;
    }
    if (conversation?.user?.name) {
      return null; // Вернем null, чтобы показать инициал
    }
    return null;
  };

  const getDoctorInitial = () => {
    if (conversation?.user?.name) {
      return conversation.user.name.charAt(0).toUpperCase();
    }
    return message.senderType === 'doctor' ? 'Д' : 'К';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days === 1) return 'вчера';
    if (days < 7) return `${days} дн назад`;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
        isGrouped ? 'mt-1' : 'mt-4'
      } px-4 animate-fade-in`}
    >
      {!isOwnMessage && (
        <div className="flex-shrink-0 mr-2">
          {showAvatar && !isGrouped ? (
            <div className="w-10 h-10 rounded-full bg-main-10 flex items-center justify-center ring-2 ring-white shadow-sm overflow-hidden">
              {message.senderType === 'patient' && conversation?.patient?.avatar ? (
                <img
                  src={conversation.patient.avatar}
                  alt={conversation.patient.name || 'Пациент'}
                  className="w-full h-full object-cover"
                />
              ) : message.senderType === 'doctor' && conversation?.user?.avatar ? (
                <img
                  src={conversation.user.avatar}
                  alt={conversation.user.name || 'Врач'}
                  className="w-full h-full object-cover"
                />
              ) : message.senderType === 'clinic' && conversation?.clinic?.logo ? (
                <img
                  src={conversation.clinic.logo}
                  alt={conversation.clinic.name || 'Клиника'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-main-100 font-semibold">
                  {message.senderType === 'patient'
                    ? conversation?.patient?.name?.charAt(0).toUpperCase() || 'П'
                    : message.senderType === 'doctor'
                    ? conversation?.user?.name?.charAt(0).toUpperCase() || 'В'
                    : conversation?.clinic?.name?.charAt(0).toUpperCase() || 'К'}
                </span>
              )}
            </div>
          ) : (
            <div className="w-10" /> // Spacer для выравнивания
          )}
        </div>
      )}

      {/* Avatar для своих сообщений */}
      {isOwnMessage && (
        <div className="flex-shrink-0 ml-2">
          {showAvatar && !isGrouped ? (
            <div className="w-10 h-10 rounded-full bg-main-10 flex items-center justify-center ring-2 ring-white shadow-sm overflow-hidden">
              {user?.role === 'PATIENT' && conversation?.patient?.avatar ? (
                <img
                  src={conversation.patient.avatar}
                  alt={conversation.patient.name || 'Пациент'}
                  className="w-full h-full object-cover"
                />
              ) : user?.role === 'DOCTOR' && conversation?.user?.avatar ? (
                <img
                  src={conversation.user.avatar}
                  alt={conversation.user.name || 'Врач'}
                  className="w-full h-full object-cover"
                />
              ) : (user?.role === 'ADMIN' || user?.role === 'CLINIC') && conversation?.clinic?.logo ? (
                <img
                  src={conversation.clinic.logo}
                  alt={conversation.clinic.name || 'Клиника'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-main-100 font-semibold">
                  {user?.role === 'PATIENT'
                    ? conversation?.patient?.name?.charAt(0).toUpperCase() || 'П'
                    : user?.role === 'DOCTOR'
                    ? conversation?.user?.name?.charAt(0).toUpperCase() || 'В'
                    : conversation?.clinic?.name?.charAt(0).toUpperCase() || 'К'}
                </span>
              )}
            </div>
          ) : (
            <div className="w-10" /> // Spacer для выравнивания
          )}
        </div>
      )}

      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {!isOwnMessage && !isGrouped && (
          <span className="text-xs text-text-50 font-medium mb-1 px-1">
            {message.senderType === 'patient'
              ? conversation?.patient?.name || 'Пациент'
              : message.senderType === 'doctor'
              ? conversation?.user?.name || 'Врач'
              : conversation?.clinic?.name || 'Клиника'}
          </span>
        )}
        {isOwnMessage && !isGrouped && (
          <span className="text-xs text-text-50 font-medium mb-1 px-1">
            {user?.role === 'PATIENT'
              ? conversation?.patient?.name || 'Вы'
              : user?.role === 'DOCTOR'
              ? conversation?.user?.name || 'Вы'
              : conversation?.clinic?.name || 'Клиника'}
          </span>
        )}

        <div
          ref={messageRef}
          className={`relative rounded-2xl px-4 py-2.5 shadow-sm ${
            isOwnMessage
              ? 'bg-main-100 text-white rounded-br-md'
              : 'bg-white text-text-100 border border-stroke rounded-bl-md'
          }`}
          onContextMenu={handleContextMenu}
        >
          {/* Изображение */}
          {message.imageUrl && (
            <div className="mb-2 rounded-lg overflow-hidden max-w-sm">
              <img
                src={`http://localhost:5000${message.imageUrl}`}
                alt="Изображение"
                className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  // Открываем изображение в полном размере
                  window.open(`http://localhost:5000${message.imageUrl}`, '_blank');
                }}
                onError={(e) => {
                  // Fallback если изображение не загрузилось
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
            </div>
          )}

          {/* Текст сообщения */}
          {message.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          <div
            className={`flex items-center justify-end gap-1.5 mt-1.5 ${
              isOwnMessage ? 'text-white/70' : 'text-text-10'
            }`}
          >
            <span className="text-xs">{formatTimeShort(message.createdAt)}</span>
            {isOwnMessage && (
              <div className="flex items-center">
                {message.isRead ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                      opacity="0.5"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>

         {/* Context Menu (только для своих сообщений) */}
         {isOwnMessage && showContextMenu && messageRef.current && (
           <div
             ref={contextMenuRef}
             className="absolute bg-white rounded-lg shadow-xl border border-stroke py-1 z-50 min-w-[150px]"
             style={{
               right: '0px', // Выравниваем по правому краю сообщения
               top: '100%', // Прямо под сообщением
               marginTop: '2px', // 2px отступ
            }}
             onClick={(e) => e.stopPropagation()}
           >
            <button
              onClick={handleDelete}
              disabled={deleteMessageMutation.isPending}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-smooth flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteMessageMutation.isPending ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Удаление...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                   <span>Удалить</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
