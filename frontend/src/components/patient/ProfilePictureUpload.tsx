import React, { useState, useRef } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface ProfilePictureUploadProps {
  currentAvatar?: string | null;
  onUpload: (file: File) => Promise<void>;
  isLoading?: boolean;
}

/**
 * ProfilePictureUpload Component
 * Компонент для загрузки фото профиля пациента
 */
export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentAvatar,
  onUpload,
  isLoading = false,
}) => {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    setSelectedFile(file);

    // Создаем preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // Конвертируем файл в base64 для отправки на сервер
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Отправляем полную base64 строку (с префиксом data:image/...)
        await onUpload(base64String);
        setSelectedFile(null);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
    }
  };

  const handleRemove = async () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Отправляем пустую строку для удаления аватара
    try {
      await onUpload('');
    } catch (error) {
      console.error('Ошибка при удалении фото:', error);
    }
  };

  return (
    <Card title="Фото профиля" padding="lg">
      <div className="space-y-4">
        {/* Preview */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-stroke">
              {preview ? (
                <img
                  src={preview.startsWith('data:') ? preview : `data:image/jpeg;base64,${preview}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-main-10 flex items-center justify-center text-2xl font-semibold text-main-100">
                  {currentAvatar ? '?' : '👤'}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="inline-block cursor-pointer"
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? 'Изменить фото' : 'Загрузить фото'}
                </Button>
              </label>
            </div>
            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700"
              >
                Удалить фото
              </Button>
            )}
            <p className="text-xs text-text-10">
              Рекомендуемый размер: 200x200px. Максимальный размер: 5MB
            </p>
          </div>
        </div>

        {/* Upload button */}
        {selectedFile && preview && (
          <div className="pt-4 border-t border-stroke">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleUpload}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Сохранить фото
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

