import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUpload: (avatar: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * AvatarUpload Component
 * Компонент для загрузки аватара врача
 */
export const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  currentAvatar, 
  onUpload, 
  isLoading = false 
}) => {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обновляем preview при изменении currentAvatar
  React.useEffect(() => {
    setPreview(currentAvatar || null);
  }, [currentAvatar]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    setError(null);

    // Читаем файл как base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      // Вызываем onUpload callback для обновления preview в родительском компоненте
      if (onUpload) {
        onUpload(base64String);
      }
    };
    reader.onerror = () => {
      setError('Ошибка при чтении файла');
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Если удаляем, вызываем onUpload с пустой строкой
    if (onUpload) {
      onUpload('');
    }
  };

  const handleSelectFileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-6">
        {/* Preview */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 border-2 border-stroke rounded-full overflow-hidden bg-bg-primary flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-text-10 text-sm text-center p-4">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-text-20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-xs">Нет фото</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-3">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-upload"
            />
            <Button 
              variant="secondary" 
              size="md" 
              onClick={handleSelectFileClick}
              type="button"
            >
              Выбрать фото
            </Button>
            <p className="text-xs text-text-10 mt-2">
              Форматы: JPG, PNG, GIF. Максимальный размер: 5MB
            </p>
          </div>

          {preview && (
            <div className="flex gap-2">
              <Button variant="secondary" size="md" onClick={handleRemove} disabled={isLoading}>
                Удалить
              </Button>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

