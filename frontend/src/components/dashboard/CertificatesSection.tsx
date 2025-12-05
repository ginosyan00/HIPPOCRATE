import React, { useState, useRef } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Certificate } from '../../types/api.types';
import { useCertificates, useCreateCertificate, useDeleteCertificate } from '../../hooks/useCertificates';
import { Spinner } from '../common/Spinner';
import { toast } from 'react-hot-toast';

interface CertificatesSectionProps {
  onUpdate?: () => void;
}

/**
 * CertificatesSection Component
 * Компонент для управления сертификатами клиники с галереей и preview
 */
export const CertificatesSection: React.FC<CertificatesSectionProps> = ({ onUpdate }) => {
  const { data: certificates, isLoading } = useCertificates();
  const createCertificateMutation = useCreateCertificate();
  const deleteCertificateMutation = useDeleteCertificate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
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

  // Открытие модального окна для добавления
  const handleAddClick = () => {
    setFormData({
      title: '',
      certificateNumber: '',
      issuedBy: '',
      issueDate: '',
      expiryDate: '',
      file: null,
      fileUrl: '',
      fileType: 'pdf',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Просмотр сертификата
  const handleViewClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCertificate(null);
    setFormData({
      title: '',
      certificateNumber: '',
      issuedBy: '',
      issueDate: '',
      expiryDate: '',
      file: null,
      fileUrl: '',
      fileType: 'pdf',
    });
    setErrors({});
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

      handleCloseModal();
      if (onUpdate) onUpdate();
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

  // Удаление сертификата
  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот сертификат?')) {
      return;
    }

    try {
      await deleteCertificateMutation.mutateAsync(id);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Ошибка удаления сертификата:', error);
    }
  };

  // Форматирование даты
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU');
  };

  // Проверка истечения срока действия
  const isExpired = (expiryDate: Date | string | undefined): boolean => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (isLoading) {
    return (
      <Card title="Сертификаты" padding="lg">
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  const certificatesList = certificates || [];

  return (
    <>
      <Card title="Сертификаты" padding="lg">
        <div className="space-y-4">
          {/* Кнопка добавления */}
          <div className="flex justify-end">
            <Button type="button" variant="primary" size="md" onClick={handleAddClick}>
              + Добавить сертификат
            </Button>
          </div>

          {/* Галерея сертификатов */}
          {certificatesList.length === 0 ? (
            <div className="text-center py-12 border border-stroke rounded-sm bg-bg-white">
              <div className="w-16 h-16 bg-main-10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-main-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-text-50 text-lg">Нет сертификатов</p>
              <p className="text-text-10 text-sm mt-2">Добавьте сертификаты для отображения на публичной странице</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificatesList.map((certificate) => (
                <div
                  key={certificate.id}
                  className="border border-stroke rounded-sm bg-bg-white p-4 hover:shadow-md transition-smooth"
                >
                  {/* Preview изображения */}
                  <div className="mb-3 relative">
                    {certificate.fileType === 'pdf' ? (
                      <div className="w-full h-32 bg-main-10 rounded-sm flex items-center justify-center">
                        <svg className="w-12 h-12 text-main-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={certificate.fileUrl}
                        alt={certificate.title}
                        className="w-full h-32 object-cover rounded-sm cursor-pointer"
                        onClick={() => handleViewClick(certificate)}
                      />
                    )}
                    {isExpired(certificate.expiryDate) && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Истёк
                      </div>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-text-100 text-sm line-clamp-2">{certificate.title}</h4>
                    {certificate.certificateNumber && (
                      <p className="text-xs text-text-50">№ {certificate.certificateNumber}</p>
                    )}
                    {certificate.issuedBy && (
                      <p className="text-xs text-text-50">Выдан: {certificate.issuedBy}</p>
                    )}
                    {certificate.issueDate && (
                      <p className="text-xs text-text-10">Выдан: {formatDate(certificate.issueDate)}</p>
                    )}
                    {certificate.expiryDate && (
                      <p className={`text-xs ${isExpired(certificate.expiryDate) ? 'text-red-500' : 'text-text-10'}`}>
                        Действителен до: {formatDate(certificate.expiryDate)}
                      </p>
                    )}
                  </div>

                  {/* Действия */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-stroke">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewClick(certificate)}
                      className="flex-1"
                    >
                      Просмотр
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(certificate.id)}
                      disabled={deleteCertificateMutation.isPending}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Модальное окно для добавления сертификата */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-text-100">Добавить сертификат</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-text-50 hover:text-text-100 transition-smooth"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Название */}
                <div>
                  <label className="block text-sm font-normal text-text-10 mb-2">
                    Название сертификата <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 focus:outline-none focus:border-main-100 transition-smooth"
                    placeholder="Например: Лицензия на медицинскую деятельность"
                    required
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                {/* Номер сертификата */}
                <div>
                  <label className="block text-sm font-normal text-text-10 mb-2">Номер сертификата</label>
                  <input
                    type="text"
                    value={formData.certificateNumber}
                    onChange={e => setFormData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 focus:outline-none focus:border-main-100 transition-smooth"
                    placeholder="Например: ЛО-77-01-012345"
                  />
                </div>

                {/* Выдан */}
                <div>
                  <label className="block text-sm font-normal text-text-10 mb-2">Выдан организацией</label>
                  <input
                    type="text"
                    value={formData.issuedBy}
                    onChange={e => setFormData(prev => ({ ...prev, issuedBy: e.target.value }))}
                    className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 focus:outline-none focus:border-main-100 transition-smooth"
                    placeholder="Например: Министерство здравоохранения"
                  />
                </div>

                {/* Даты */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-normal text-text-10 mb-2">Дата выдачи</label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={e => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                      className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 focus:outline-none focus:border-main-100 transition-smooth"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-normal text-text-10 mb-2">Дата окончания</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 focus:outline-none focus:border-main-100 transition-smooth"
                    />
                    {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                  </div>
                </div>

                {/* Файл */}
                <div>
                  <label className="block text-sm font-normal text-text-10 mb-2">
                    Файл сертификата <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="block w-full px-4 py-2.5 border border-stroke rounded-sm bg-bg-white text-sm text-text-100 focus:outline-none focus:border-main-100 transition-smooth"
                    required
                  />
                  <p className="text-xs text-text-10 mt-1">Разрешены форматы: PDF, JPG, PNG. Максимальный размер: 10 MB</p>
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
                    <label className="block text-sm font-normal text-text-10 mb-2">Предпросмотр</label>
                    <img
                      src={formData.fileUrl}
                      alt="Preview"
                      className="w-full max-h-64 object-contain border border-stroke rounded-sm"
                    />
                  </div>
                )}

                {/* Кнопки */}
                <div className="flex justify-end gap-3 pt-4 border-t border-stroke">
                  <Button type="button" variant="secondary" size="md" onClick={handleCloseModal}>
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={createCertificateMutation.isPending}
                    disabled={createCertificateMutation.isPending}
                  >
                    Добавить
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для просмотра сертификата */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCertificate(null)}>
          <div className="bg-bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-text-100">{selectedCertificate.title}</h3>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="text-text-50 hover:text-text-100 transition-smooth"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Информация о сертификате */}
              <div className="space-y-2 mb-6">
                {selectedCertificate.certificateNumber && (
                  <p className="text-sm text-text-50">
                    <span className="font-medium">Номер:</span> {selectedCertificate.certificateNumber}
                  </p>
                )}
                {selectedCertificate.issuedBy && (
                  <p className="text-sm text-text-50">
                    <span className="font-medium">Выдан:</span> {selectedCertificate.issuedBy}
                  </p>
                )}
                {selectedCertificate.issueDate && (
                  <p className="text-sm text-text-50">
                    <span className="font-medium">Дата выдачи:</span> {formatDate(selectedCertificate.issueDate)}
                  </p>
                )}
                {selectedCertificate.expiryDate && (
                  <p className={`text-sm ${isExpired(selectedCertificate.expiryDate) ? 'text-red-500' : 'text-text-50'}`}>
                    <span className="font-medium">Действителен до:</span> {formatDate(selectedCertificate.expiryDate)}
                  </p>
                )}
              </div>

              {/* Изображение/PDF */}
              {selectedCertificate.fileType === 'pdf' ? (
                <div className="border border-stroke rounded-sm p-8 bg-bg-white text-center">
                  <svg className="w-24 h-24 text-main-100 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-text-50 mb-4">PDF файл</p>
                  <a
                    href={selectedCertificate.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-main-100 hover:text-main-100/80 underline"
                  >
                    Открыть в новой вкладке
                  </a>
                </div>
              ) : (
                <img
                  src={selectedCertificate.fileUrl}
                  alt={selectedCertificate.title}
                  className="w-full h-auto border border-stroke rounded-sm"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

