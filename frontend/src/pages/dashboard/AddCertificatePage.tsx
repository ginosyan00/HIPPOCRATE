import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewDashboardLayout } from '../../components/dashboard/NewDashboardLayout';
import { Button, Input, Card, BackButton } from '../../components/common';
import { useCreateCertificate } from '../../hooks/useCertificates';
import { toast } from 'react-hot-toast';

/**
 * AddCertificatePage
 * Отдельная страница для добавления сертификата клиники
 * Доступ: только CLINIC (владелец клиники)
 */
export const AddCertificatePage: React.FC = () => {
  const navigate = useNavigate();
  const createCertificateMutation = useCreateCertificate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    certificateNumber: '',
    issuedBy: '',
    issueDate: '',
    expiryDate: '',
    file: null as File | null,
    fileUrl: '',
    fileType: 'pdf' as 'pdf' | 'jpg' | 'jpeg' | 'png',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Валидация файла
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Неподдерживаемый формат файла. Разрешены: PDF, JPG, PNG');
      return false;
    }

    if (file.size > maxSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      toast.error(`Размер файла (${fileSizeMB} MB) превышает максимально допустимый размер 10 MB. Пожалуйста, выберите файл меньшего размера.`);
      return false;
    }

    return true;
  };

  // Конвертация файла в base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Обработка выбора файла
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    const fileType = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1] as 'jpg' | 'jpeg' | 'png';
    const fileUrl = await fileToBase64(file);

    setFormData(prev => ({
      ...prev,
      file,
      fileUrl,
      fileType,
    }));
  };

  // Валидация формы
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    }

    if (!formData.fileUrl && !formData.file) {
      newErrors.file = 'Файл обязателен';
    }

    if (formData.issueDate && formData.expiryDate) {
      const issue = new Date(formData.issueDate);
      const expiry = new Date(formData.expiryDate);
      if (expiry < issue) {
        newErrors.expiryDate = 'Дата окончания должна быть после даты выдачи';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Создание сертификата
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await createCertificateMutation.mutateAsync({
        title: formData.title,
        certificateNumber: formData.certificateNumber || undefined,
        issuedBy: formData.issuedBy || undefined,
        issueDate: formData.issueDate ? new Date(formData.issueDate).toISOString() : undefined,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
        fileUrl: formData.fileUrl,
        fileType: formData.fileType,
        fileSize: formData.file?.size,
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

  const handleCancel = () => {
    navigate('/dashboard/web');
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
            ➕ Добавить сертификат
          </h1>
          <p className="text-text-10 text-sm">
            Заполните форму для добавления нового сертификата клиники
          </p>
        </div>

        {/* Form */}
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Название */}
            <div>
              <label className="block text-sm font-medium text-text-50 mb-2">
                Название сертификата <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="block w-full px-4 py-3 border border-stroke rounded-lg bg-bg-white text-sm text-text-100 focus:outline-none focus:ring-2 focus:ring-main-100 transition-smooth"
                placeholder="Например: Лицензия на медицинскую деятельность"
                required
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Номер сертификата */}
            <div>
              <label className="block text-sm font-medium text-text-50 mb-2">
                Номер сертификата
              </label>
              <input
                type="text"
                value={formData.certificateNumber}
                onChange={e => setFormData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                className="block w-full px-4 py-3 border border-stroke rounded-lg bg-bg-white text-sm text-text-100 focus:outline-none focus:ring-2 focus:ring-main-100 transition-smooth"
                placeholder="Например: ЛО-77-01-012345"
              />
            </div>

            {/* Выдан */}
            <div>
              <label className="block text-sm font-medium text-text-50 mb-2">
                Выдан организацией
              </label>
              <input
                type="text"
                value={formData.issuedBy}
                onChange={e => setFormData(prev => ({ ...prev, issuedBy: e.target.value }))}
                className="block w-full px-4 py-3 border border-stroke rounded-lg bg-bg-white text-sm text-text-100 focus:outline-none focus:ring-2 focus:ring-main-100 transition-smooth"
                placeholder="Например: Министерство здравоохранения"
              />
            </div>

            {/* Даты */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-50 mb-2">
                  Дата выдачи
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={e => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  className="block w-full px-4 py-3 border border-stroke rounded-lg bg-bg-white text-sm text-text-100 focus:outline-none focus:ring-2 focus:ring-main-100 transition-smooth"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-50 mb-2">
                  Дата окончания
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="block w-full px-4 py-3 border border-stroke rounded-lg bg-bg-white text-sm text-text-100 focus:outline-none focus:ring-2 focus:ring-main-100 transition-smooth"
                />
                {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
              </div>
            </div>

            {/* Файл */}
            <div>
              <label className="block text-sm font-medium text-text-50 mb-2">
                Файл сертификата <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="block w-full px-4 py-3 border border-stroke rounded-lg bg-bg-white text-sm text-text-100 focus:outline-none focus:ring-2 focus:ring-main-100 transition-smooth"
                required
              />
              <p className="text-xs text-text-10 mt-1">
                Разрешены форматы: PDF, JPG, PNG. Максимальный размер: 10 MB
              </p>
              {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
              {formData.file && (
                <p className="text-xs text-main-100 mt-1">
                  Выбран файл: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Preview */}
            {formData.fileUrl && formData.fileType !== 'pdf' && (
              <div>
                <label className="block text-sm font-medium text-text-50 mb-2">
                  Предпросмотр
                </label>
                <img
                  src={formData.fileUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-contain border border-stroke rounded-lg"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-stroke">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={createCertificateMutation.isPending}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={createCertificateMutation.isPending}
                disabled={createCertificateMutation.isPending}
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

