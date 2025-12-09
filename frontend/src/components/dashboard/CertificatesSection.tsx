import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Certificate } from '../../types/api.types';
import { useCertificates, useDeleteCertificate } from '../../hooks/useCertificates';
import { Spinner } from '../common/Spinner';

interface CertificatesSectionProps {
  onUpdate?: () => void;
}

/**
 * CertificatesSection Component
 * Компонент для управления сертификатами клиники с галереей и preview
 */
export const CertificatesSection: React.FC<CertificatesSectionProps> = ({ onUpdate }) => {
  const navigate = useNavigate();
  const { data: certificates, isLoading } = useCertificates();
  const deleteCertificateMutation = useDeleteCertificate();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Навигация на страницу добавления сертификата
  const handleAddClick = () => {
    navigate('/dashboard/web/certificates/add');
  };

  // Просмотр сертификата
  const handleViewClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
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

