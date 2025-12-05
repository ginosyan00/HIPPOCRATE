import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Button } from '../common/Button';
import { uploadService } from '../../services/upload.service';

interface ChatInputProps {
  onSendMessage: (message: string, imageUrl?: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void; // Callback для индикатора печати
}

/**
 * ChatInput Component
 * Современное поле ввода для чата с поддержкой многострочного текста
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = 'Введите сообщение...',
  disabled = false,
  onTyping,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Автоматический resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Индикатор печати
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (message.trim() && onTyping) {
      setIsTyping(true);
      onTyping(true);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (onTyping) onTyping(false);
      }, 1000);
    } else {
      setIsTyping(false);
      if (onTyping) onTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, onTyping]);

  const handleSend = async (imageUrl?: string) => {
    const trimmedMessage = message.trim();
    if ((trimmedMessage || imageUrl) && !isLoading && !disabled && !isUploading) {
      onSendMessage(trimmedMessage, imageUrl);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер изображения не должен превышать 5MB');
      return;
    }

    try {
      setIsUploading(true);
      // Конвертируем в base64
      const base64 = await uploadService.fileToBase64(file);
      // Загружаем на сервер
      const result = await uploadService.uploadImage(base64);
      // Отправляем сообщение с изображением
      await handleSend(result.imageUrl);
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      alert('Ошибка загрузки изображения. Попробуйте снова.');
    } finally {
      setIsUploading(false);
      // Сбрасываем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-stroke bg-white px-4 py-3">
      <div className="flex items-end gap-2">
        {/* Кнопка прикрепления изображения */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-text-10 hover:text-text-100 hover:bg-bg-primary rounded-full transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          title="Прикрепить изображение"
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <svg
              className="w-5 h-5 animate-spin"
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
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className="w-full resize-none rounded-2xl border border-stroke px-4 py-2.5 pr-12 text-sm text-text-100 placeholder-text-10 focus:outline-none focus:border-main-100 focus:ring-2 focus:ring-main-100/20 disabled:bg-bg-primary disabled:cursor-not-allowed transition-all"
            style={{
              minHeight: '44px',
              maxHeight: '120px',
            }}
          />
          {(message.trim() || isUploading) && (
            <button
              onClick={() => handleSend()}
              disabled={isLoading || disabled || isUploading}
              className="absolute right-2 bottom-2 p-1.5 bg-main-100 text-white rounded-full hover:bg-main-100/90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
              title="Отправить (Enter)"
            >
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Кнопка эмодзи (заглушка) */}
        <button
          className="flex-shrink-0 p-2 text-text-10 hover:text-text-100 hover:bg-bg-primary rounded-full transition-smooth"
          title="Эмодзи"
          disabled={disabled}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
      <p className="text-xs text-text-10 mt-1.5 px-1">
        Нажмите Enter для отправки, Shift+Enter для новой строки
      </p>
    </div>
  );
};
