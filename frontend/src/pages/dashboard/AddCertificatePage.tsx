import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Button, Card, BackButton } from '../../components/common';
import { useCreateCertificate } from '../../hooks/useCertificates';
import { toast } from 'react-hot-toast';

// Import icons
import plusIcon from '../../assets/icons/plus.svg';

/**
 * AddCertificatePage
 * Отдельная страница для добавления сертификата клиники
 * Доступ: только CLINIC (владелец клиники)
 * Упрощенная версия: только загрузка изображения
 */
export const AddCertificatePage: React.FC = () => {
  const navigate = useNavigate();
  const createCertificateMutation = useCreateCertificate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileType, setFileType] = useState<'jpg' | 'jpeg' | 'png'>('jpg');
  const [error, setError] = useState<string>('');

  /**
   * Генерация названия сертификата из имени файла
   * Убирает расширение и форматирует название
   */
  const generateTitleFromFileName = (fileName: string): string => {
    // Убираем расширение файла
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    // Заменяем подчеркивания и дефисы на пробелы
    const formattedName = nameWithoutExt.replace(/[_-]/g, ' ');
    // Делаем первую букву заглавной
    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1) || 'Сертификат';
  };

  /**
   * Валидация файла
   * Проверяет тип (только изображения) и размер
   */
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Неподдерживаемый формат файла. Разрешены только изображения: JPG, PNG');
      return false;
    }

    if (file.size > maxSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      toast.error(`Размер файла (${fileSizeMB} MB) превышает максимально допустимый размер 10 MB. Пожалуйста, выберите файл меньшего размера.`);
      return false;
    }

    return true;
  };

  /**
   * Конвертация файла в base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  /**
   * Обработка выбора файла
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');

    if (!validateFile(selectedFile)) {
      return;
    }

    try {
      const type = selectedFile.type.split('/')[1] as 'jpg' | 'jpeg' | 'png';
      const url = await fileToBase64(selectedFile);

      setFile(selectedFile);
      setFileUrl(url);
      setFileType(type);
    } catch (error) {
      console.error('Ошибка обработки файла:', error);
      toast.error('Ошибка при обработке файла');
      setError('Ошибка при обработке файла');
    }
  };

  /**
   * Создание сертификата
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !fileUrl) {
      setError('Пожалуйста, выберите изображение');
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    try {
      // Генерируем название из имени файла
      const title = generateTitleFromFileName(file.name);

      await createCertificateMutation.mutateAsync({
        title,
        fileUrl,
        fileType,
        fileSize: file.size,
      });

      toast.success('Сертификат успешно добавлен');
      
      // Редирект обратно на страницу веб-информации
      navigate('/dashboard/web');
    } catch (error: any) {
      console.error('Ошибка создания сертификата:', error);
      
      // Более информативное сообщение об ошибке
      if (error.status === 413 || error.message?.includes('413') || error.message?.includes('too large')) {
        toast.error('Файл слишком большой. Максимальный размер: 10 MB. Попробуйте сжать изображение или использовать файл меньшего размера.');
      } else {
        toast.error(error.message || 'Ошибка при создании сертификата');
      }
    }
  };

  return (
    <NewDashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton fallback="/dashboard/web" />
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-text-100 mb-2">
            <span className="flex items-center gap-2">
              <img src={plusIcon} alt="Добавить" className="w-5 h-5" />
              Добавить сертификат
            </span>
          </h1>
          <p className="text-text-10 text-sm">
            Загрузите изображение сертификата. Название будет сгенерировано автоматически.
          </p>
        </div>

        {/* Form */}
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Загрузка изображения */}
            <div>
              <label className="block text-sm font-medium text-text-50 mb-2">
                Изображение сертификата <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  required
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 border border-stroke rounded-lg bg-bg-white text-sm text-text-100 hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-main-100 transition-smooth text-left"
                >
                  {file ? file.name : 'Выбрать изображение'}
                </button>
                {!file && (
                  <p className="text-xs text-text-10 mt-1">
                    Изображение не выбрано
                  </p>
                )}
              </div>
              <p className="text-xs text-text-10 mt-1">
                Разрешены форматы: JPG, PNG. Максимальный размер: 10 MB
              </p>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              {file && (
                <p className="text-xs text-main-100 mt-1">
                  Выбран файл: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Preview */}
            {fileUrl && (
              <div>
                <label className="block text-sm font-medium text-text-50 mb-2">
                  Предпросмотр
                </label>
                <img
                  src={fileUrl}
                  alt="Предпросмотр сертификата"
                  className="w-full max-h-96 object-contain border border-stroke rounded-lg bg-bg-secondary"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-stroke">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard/web')}
                disabled={createCertificateMutation.isPending}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createCertificateMutation.isPending}
                disabled={createCertificateMutation.isPending || !file}
                className="flex-1"
              >
                Добавить сертификат
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </NewDashboardLayout>
  );
};

