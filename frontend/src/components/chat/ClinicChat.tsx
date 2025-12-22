import React, { useState, useEffect, useRef } from 'react';
import { useDoctors } from '../../hooks/useUsers';
import { useConversations, useMessages, useSendMessage } from '../../hooks/useChat';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '../../services/chat.service';
import { User } from '../../types/api.types';
import { Conversation } from '../../services/chat.service';
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

type TabType = 'monitoring' | 'communication';
type CommunicationMode = 'doctors' | 'patients';

/**
 * ClinicChat Component
 * Компонент чата для клиники с двумя режимами:
 * 1. Мониторинг - просмотр бесед врачей с пациентами (существующий функционал)
 * 2. Общение - прямое общение клиники с врачами и пациентами (новый функционал)
 */
export const ClinicChat: React.FC<ClinicChatProps> = ({
  isOpen,
  onClose,
  mode = 'sidebar',
  width = '800px',
  height = '100vh',
}) => {
  const user = useAuthStore((state) => state.user);
  
  // Режим работы: мониторинг или общение
  const [activeTab, setActiveTab] = useState<TabType>('monitoring');
  
  // Для режима мониторинга
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showDoctorsList, setShowDoctorsList] = useState(true);
  const [showConversationsList, setShowConversationsList] = useState(false);
  
  // Для режима общения
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('doctors');
  const [selectedDoctorForChat, setSelectedDoctorForChat] = useState<User | null>(null);
  const [selectedPatientForChat, setSelectedPatientForChat] = useState<{
    id: string;
    name: string;
    phone: string;
    email: string | null;
    avatar: string | null;
  } | null>(null);
  const [newConversationId, setNewConversationId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Загружаем список врачей
  const { data: doctors = [], isLoading: isLoadingDoctors } = useDoctors();

  // Загружаем все беседы клиники
  const { conversations, isLoading: isLoadingConversations, refetch: refetchConversations } = useConversations();

  // Загружаем доступные контакты для общения
  const { data: availableContacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['chat', 'available-contacts'],
    queryFn: () => chatService.getAvailableContacts(),
    enabled: activeTab === 'communication' && isOpen,
  });

  // Определяем текущую беседу для загрузки сообщений
  const currentConversationId = activeTab === 'monitoring' 
    ? selectedConversation 
    : newConversationId;

  // Загружаем сообщения выбранной беседы
  const { messages, isLoading: isLoadingMessages } = useMessages(
    currentConversationId,
    isOpen && !!currentConversationId
  );

  const sendMessageMutation = useSendMessage();

  // Фильтруем беседы по выбранному врачу (для мониторинга)
  const doctorConversations = selectedDoctor
    ? conversations.filter((conv) => conv.userId === selectedDoctor.id && conv.type !== 'clinic_doctor')
    : [];

  // Фильтруем беседы клиники с врачами (для режима общения)
  const clinicDoctorConversations = conversations.filter((conv) => conv.type === 'clinic_doctor');

  // Фильтруем беседы клиники с пациентами (для режима общения)
  // Показываем только беседы с registered пациентами (не guest)
  const clinicPatientConversations = conversations.filter(
    (conv) => conv.type === 'patient_clinic' && !conv.userId && conv.patient?.status !== 'guest'
  );

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
      setSelectedDoctorForChat(null);
      setSelectedPatientForChat(null);
      setNewConversationId(null);
      setActiveTab('monitoring');
    }
  }, [isOpen]);

  // Обработка выбора врача (мониторинг)
  const handleSelectDoctor = (doctor: User) => {
    setSelectedDoctor(doctor);
    setSelectedConversation(null);
    setShowDoctorsList(false);
    setShowConversationsList(true);
  };

  // Обработка выбора беседы (мониторинг)
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (mode === 'sidebar') {
      setShowConversationsList(false);
    }
  };

  // Обработка выбора врача для общения
  const handleSelectDoctorForChat = async (doctor: User) => {
    setSelectedDoctorForChat(doctor);
    setSelectedPatientForChat(null);
    
    // Проверяем, есть ли уже беседа с этим врачом
    const existingConversation = clinicDoctorConversations.find((conv) => conv.userId === doctor.id);
    if (existingConversation) {
      setNewConversationId(existingConversation.id);
    } else {
      setNewConversationId(null);
    }
  };

  // Обработка выбора пациента для общения
  const handleSelectPatientForChat = async (patient: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    avatar: string | null;
  }) => {
    setSelectedPatientForChat(patient);
    setSelectedDoctorForChat(null);
    
    // Проверяем, есть ли уже беседа с этим пациентом
    const existingConversation = clinicPatientConversations.find((conv) => conv.patientId === patient.id);
    if (existingConversation) {
      setNewConversationId(existingConversation.id);
    } else {
      setNewConversationId(null);
    }
  };

  // Обработка отправки сообщения
  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (activeTab === 'monitoring') {
      // Режим мониторинга - отправка в существующую беседу
      if (!selectedConversation) return;

      // Проверяем, не является ли пациент в беседе гостем
      const conv = conversations.find((c) => c.id === selectedConversation);
      if (conv?.patient?.status === 'guest') {
        alert('Нельзя отправить сообщение гостевому пациенту. Гости не могут получать и отвечать на сообщения.');
        return;
      }

      try {
        await sendMessageMutation.mutateAsync({
          conversationId: selectedConversation,
          content: content || '',
          imageUrl,
        });
      } catch (error: any) {
        console.error('Ошибка отправки сообщения:', error);
        const errorCode = error?.response?.data?.error?.code;
        const errorMessage = error?.response?.data?.error?.message;
        
        if (errorCode === 'GUEST_CANNOT_SEND_MESSAGES' || errorCode === 'CANNOT_CREATE_CONVERSATION_WITH_GUEST') {
          alert(errorMessage || 'Нельзя отправить сообщение гостевому пациенту. Гости не могут получать и отвечать на сообщения.');
        }
      }
    } else {
      // Режим общения - создание новой беседы или отправка в существующую
      
      // Проверяем статус пациента перед отправкой
      if (selectedPatientForChat) {
        // Проверяем статус в списке доступных контактов
        const patientInContacts = availableContacts?.patients.find((p) => p.id === selectedPatientForChat.id);
        if (patientInContacts?.status === 'guest') {
          alert('Нельзя отправить сообщение гостевому пациенту. Гости не могут получать и отвечать на сообщения.');
          return;
        }

        // Также проверяем в активной беседе, если она есть
        if (newConversationId) {
          const conv = conversations.find((c) => c.id === newConversationId);
          if (conv?.patient?.status === 'guest') {
            alert('Нельзя отправить сообщение гостевому пациенту. Гости не могут получать и отвечать на сообщения.');
            return;
          }
        }
      }

      try {
        let result;
        if (selectedDoctorForChat) {
          // Создаем или отправляем в беседу с врачом
          result = await sendMessageMutation.mutateAsync({
            doctorId: selectedDoctorForChat.id,
            content: content || '',
            imageUrl,
          });
        } else if (selectedPatientForChat) {
          // Создаем или отправляем в беседу с пациентом
          result = await sendMessageMutation.mutateAsync({
            patientId: selectedPatientForChat.id,
            content: content || '',
            imageUrl,
          });
        } else {
          return;
        }

        if (result.conversation) {
          setNewConversationId(result.conversation.id);
          // Обновляем список бесед
          refetchConversations();
        }
      } catch (error: any) {
        console.error('Ошибка отправки сообщения:', error);
        const errorCode = error?.response?.data?.error?.code;
        const errorMessage = error?.response?.data?.error?.message;
        
        if (errorCode === 'GUEST_CANNOT_SEND_MESSAGES' || errorCode === 'CANNOT_CREATE_CONVERSATION_WITH_GUEST') {
          alert(errorMessage || 'Нельзя отправить сообщение гостевому пациенту. Гости не могут получать и отвечать на сообщения.');
        }
      }
    }
  };

  // Получить название беседы
  const getConversationTitle = (conversation: Conversation | null) => {
    if (!conversation) return 'Беседа';
    
    if (conversation.type === 'clinic_doctor') {
      return conversation.user?.name || 'Врач';
    } else if (conversation.type === 'patient_clinic' || conversation.type === 'patient_doctor') {
      return conversation.patient?.name || 'Пациент';
    }
    
    return 'Беседа';
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
      {/* Header с вкладками */}
      <div className="flex flex-col border-b border-stroke bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Кнопка назад */}
            {(selectedDoctor || selectedConversation || selectedDoctorForChat || selectedPatientForChat) && (
              <button
                onClick={() => {
                  if (activeTab === 'monitoring') {
                    if (selectedConversation) {
                      setSelectedConversation(null);
                      setShowConversationsList(true);
                    } else if (selectedDoctor) {
                      setSelectedDoctor(null);
                      setShowDoctorsList(true);
                      setShowConversationsList(false);
                    }
                  } else {
                    setSelectedDoctorForChat(null);
                    setSelectedPatientForChat(null);
                    setNewConversationId(null);
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
              {currentConversationId
                ? (() => {
                    const conv = conversations.find((c) => c.id === currentConversationId);
                    return getConversationTitle(conv);
                  })()
                : activeTab === 'monitoring'
                ? selectedDoctor
                  ? `Беседы ${selectedDoctor.name}`
                  : 'Мониторинг'
                : selectedDoctorForChat
                ? selectedDoctorForChat.name
                : selectedPatientForChat
                ? selectedPatientForChat.name
                : 'Общение'}
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
        
        {/* Вкладки */}
        <div className="flex border-t border-stroke">
          <button
            onClick={() => {
              setActiveTab('monitoring');
              setSelectedDoctorForChat(null);
              setSelectedPatientForChat(null);
              setNewConversationId(null);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-smooth ${
              activeTab === 'monitoring'
                ? 'text-main-100 border-b-2 border-main-100 bg-main-10'
                : 'text-text-10 hover:text-text-100 hover:bg-bg-white'
            }`}
          >
            Мониторинг
          </button>
          <button
            onClick={() => {
              setActiveTab('communication');
              setSelectedDoctor(null);
              setSelectedConversation(null);
              setShowDoctorsList(true);
              setShowConversationsList(false);
            }}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-smooth ${
              activeTab === 'communication'
                ? 'text-main-100 border-b-2 border-main-100 bg-main-10'
                : 'text-text-10 hover:text-text-100 hover:bg-bg-white'
            }`}
          >
            Общение
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Левая панель */}
        {activeTab === 'monitoring' ? (
          // Режим мониторинга
          <>
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
                      const doctorConvs = conversations.filter(
                        (c) => c.userId === doctor.id && c.type !== 'clinic_doctor'
                      );
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
          </>
        ) : (
          // Режим общения
          <>
            {!selectedDoctorForChat && !selectedPatientForChat ? (
              <div className="w-80 border-r border-stroke bg-white flex flex-col">
                <div className="px-4 py-3 border-b border-stroke">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setCommunicationMode('doctors')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-smooth ${
                        communicationMode === 'doctors'
                          ? 'bg-main-100 text-white'
                          : 'bg-bg-white text-text-10 hover:bg-bg-primary'
                      }`}
                    >
                      Врачи
                    </button>
                    <button
                      onClick={() => setCommunicationMode('patients')}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-smooth ${
                        communicationMode === 'patients'
                          ? 'bg-main-100 text-white'
                          : 'bg-bg-white text-text-10 hover:bg-bg-primary'
                      }`}
                    >
                      Пациенты
                    </button>
                  </div>
                  <p className="text-xs text-text-10">
                    {communicationMode === 'doctors'
                      ? 'Выберите врача для общения'
                      : 'Выберите пациента для общения'}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {isLoadingContacts ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner />
                    </div>
                  ) : communicationMode === 'doctors' ? (
                    <>
                      {/* Существующие беседы с врачами */}
                      {clinicDoctorConversations.length > 0 && (
                        <div className="px-4 py-2 border-b border-stroke bg-bg-white">
                          <p className="text-xs font-medium text-text-50">Активные беседы</p>
                        </div>
                      )}
                      {clinicDoctorConversations.map((conv) => {
                        const unreadCount = conv._count?.messages || 0;
                        return (
                          <button
                            key={conv.id}
                            onClick={() => {
                              const doctor = doctors.find((d) => d.id === conv.userId);
                              if (doctor) {
                                handleSelectDoctorForChat(doctor);
                                setNewConversationId(conv.id);
                              }
                            }}
                            className="w-full px-4 py-3 text-left border-b border-stroke transition-smooth hover:bg-bg-white"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-main-10 flex items-center justify-center">
                                  {conv.user?.avatar ? (
                                    <img
                                      src={conv.user.avatar}
                                      alt={conv.user.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm text-main-100 font-medium">
                                      {conv.user?.name?.charAt(0).toUpperCase() || 'В'}
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
                                  {conv.user?.name || 'Врач'}
                                </p>
                                {conv.user?.specialization && (
                                  <p className="text-xs text-text-10 truncate">
                                    {conv.user.specialization}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {/* Доступные врачи для начала беседы */}
                      {availableContacts?.doctors && availableContacts.doctors.length > 0 && (
                        <div className="px-4 py-2 border-b border-stroke bg-bg-white">
                          <p className="text-xs font-medium text-text-50">Начать новую беседу</p>
                        </div>
                      )}
                      {availableContacts?.doctors.map((doctor) => (
                        <button
                          key={doctor.id}
                          onClick={() => handleSelectDoctorForChat(doctor)}
                          className="w-full px-4 py-3 text-left border-b border-stroke transition-smooth hover:bg-bg-white"
                        >
                          <div className="flex items-center gap-3">
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
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-text-100">
                                {doctor.name}
                              </p>
                              {doctor.specialization && (
                                <p className="text-xs text-text-10 truncate">
                                  {doctor.specialization}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                      {(!availableContacts?.doctors || availableContacts.doctors.length === 0) &&
                        clinicDoctorConversations.length === 0 && (
                          <div className="px-4 py-8 text-center text-text-10 text-sm">
                            Нет доступных врачей
                          </div>
                        )}
                    </>
                  ) : (
                    <>
                      {/* Существующие беседы с пациентами (только registered) */}
                      {clinicPatientConversations.length > 0 && (
                        <div className="px-4 py-2 border-b border-stroke bg-bg-white">
                          <p className="text-xs font-medium text-text-50">Активные беседы</p>
                          <p className="text-xs text-text-10 mt-1">
                            Только с зарегистрированными пациентами
                          </p>
                        </div>
                      )}
                      {clinicPatientConversations.map((conv) => {
                        // Дополнительная проверка на frontend
                        if (conv.patient?.status === 'guest') {
                          return null;
                        }
                        const unreadCount = conv._count?.messages || 0;
                        return (
                          <button
                            key={conv.id}
                            onClick={() => {
                              if (conv.patient) {
                                handleSelectPatientForChat(conv.patient);
                                setNewConversationId(conv.id);
                              }
                            }}
                            className="w-full px-4 py-3 text-left border-b border-stroke transition-smooth hover:bg-bg-white"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-main-10 flex items-center justify-center">
                                  {conv.patient?.avatar ? (
                                    <img
                                      src={conv.patient.avatar}
                                      alt={conv.patient.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-sm text-main-100 font-medium">
                                      {conv.patient?.name?.charAt(0).toUpperCase() || 'П'}
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
                                  {conv.patient?.name || 'Пациент'}
                                </p>
                                {conv.patient?.phone && (
                                  <p className="text-xs text-text-10 truncate">
                                    {conv.patient.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {/* Доступные пациенты для начала беседы (только registered) */}
                      {availableContacts?.patients && availableContacts.patients.length > 0 && (
                        <div className="px-4 py-2 border-b border-stroke bg-bg-white">
                          <p className="text-xs font-medium text-text-50">Начать новую беседу</p>
                          <p className="text-xs text-text-10 mt-1">
                            Только зарегистрированные пациенты могут общаться
                          </p>
                        </div>
                      )}
                      {availableContacts?.patients
                        .filter((patient) => patient.status !== 'guest') // Дополнительная фильтрация на frontend
                        .map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatientForChat(patient)}
                          className="w-full px-4 py-3 text-left border-b border-stroke transition-smooth hover:bg-bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-main-10 flex items-center justify-center">
                              {patient.avatar ? (
                                <img
                                  src={patient.avatar}
                                  alt={patient.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm text-main-100 font-medium">
                                  {patient.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate text-text-100">
                                {patient.name}
                              </p>
                              {patient.phone && (
                                <p className="text-xs text-text-10 truncate">{patient.phone}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                      {(!availableContacts?.patients || 
                        availableContacts.patients.filter((p) => p.status !== 'guest').length === 0) &&
                        clinicPatientConversations.length === 0 && (
                          <div className="px-4 py-8 text-center text-text-10 text-sm">
                            Нет доступных пациентов для общения
                            <br />
                            <span className="text-xs text-text-10 mt-1 block">
                              Только зарегистрированные пациенты могут общаться
                            </span>
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* Правая панель - Сообщения */}
        {currentConversationId ? (
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
        ) : (selectedDoctorForChat || selectedPatientForChat) ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-bg-white to-bg-white/50 px-4 text-center">
              <div>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-main-10 flex items-center justify-center">
                  {selectedDoctorForChat ? (
                    selectedDoctorForChat.avatar ? (
                      <img
                        src={selectedDoctorForChat.avatar}
                        alt={selectedDoctorForChat.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-main-100 font-medium">
                        {selectedDoctorForChat.name.charAt(0).toUpperCase()}
                      </span>
                    )
                  ) : selectedPatientForChat ? (
                    selectedPatientForChat.avatar ? (
                      <img
                        src={selectedPatientForChat.avatar}
                        alt={selectedPatientForChat.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-main-100 font-medium">
                        {selectedPatientForChat.name.charAt(0).toUpperCase()}
                      </span>
                    )
                  ) : null}
                </div>
                <h3 className="text-lg font-medium text-text-100 mb-1">
                  {selectedDoctorForChat?.name || selectedPatientForChat?.name}
                </h3>
                {selectedDoctorForChat?.specialization && (
                  <p className="text-sm text-text-10 mb-4">
                    {selectedDoctorForChat.specialization}
                  </p>
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
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-text-10 text-sm">
                {activeTab === 'monitoring'
                  ? 'Выберите врача для просмотра его бесед'
                  : 'Выберите врача или пациента для общения'}
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
