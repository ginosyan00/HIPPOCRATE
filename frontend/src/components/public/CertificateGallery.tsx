import React, { useState } from 'react';
import { Certificate } from '../../types/api.types';

interface CertificateGalleryProps {
  certificates: Certificate[];
}

/**
 * CertificateGallery Component
 * Professional gallery with lightbox for displaying clinic certificates
 */
export const CertificateGallery: React.FC<CertificateGalleryProps> = ({ certificates }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedIndex(null);
    document.body.style.overflow = 'unset';
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < certificates.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLightboxOpen, selectedIndex]);

  // Check if certificate is expired
  const isExpired = (certificate: Certificate): boolean => {
    if (!certificate.expiryDate) return false;
    return new Date(certificate.expiryDate) < new Date();
  };

  // Format date
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const selectedCertificate = selectedIndex !== null ? certificates[selectedIndex] : null;

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {certificates.map((certificate, index) => (
          <div
            key={certificate.id}
            className="group relative bg-bg-white border border-stroke rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => openLightbox(index)}
          >
            {/* Certificate Preview */}
            <div className="relative aspect-[4/3] bg-bg-primary overflow-hidden">
              {certificate.fileType === 'pdf' ? (
                <div className="w-full h-full bg-main-10 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-main-100 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xs text-text-50 font-medium">PDF Document</p>
                  </div>
                </div>
              ) : (
                <img
                  src={certificate.fileUrl}
                  alt="Сертификат клиники"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              )}

              {/* Hover Overlay - No expired badge, patients only see images */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                    <svg
                      className="w-6 h-6 text-main-100"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Info - Hidden for patients, only image is shown */}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedCertificate && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation Arrows */}
          {certificates.length > 1 && (
            <>
              {selectedIndex! > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
                  aria-label="Previous"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
              {selectedIndex! < certificates.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
                  aria-label="Next"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </>
          )}

          {/* Certificate Content - Only image, no details for patients */}
          <div
            className="relative max-w-6xl w-full max-h-[95vh] bg-transparent rounded-lg overflow-hidden shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Certificate Image/PDF - No header, no metadata, just the image */}
            <div className="relative bg-transparent p-2 md:p-4 flex items-center justify-center min-h-[400px] max-h-[90vh] overflow-auto">
              {selectedCertificate.fileType === 'pdf' ? (
                <div className="text-center">
                  <div className="bg-main-10 rounded-lg p-8 mb-4 inline-block">
                    <svg
                      className="w-24 h-24 text-main-100 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-text-50 mb-4">PDF документ</p>
                  <a
                    href={selectedCertificate.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-main-10 text-main-100 hover:bg-main-100 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Открыть в новой вкладке
                  </a>
                </div>
              ) : (
                <img
                  src={selectedCertificate.fileUrl}
                  alt="Сертификат клиники"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              )}
            </div>

            {/* Counter - Simple counter at bottom */}
            {certificates.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                {selectedIndex! + 1} / {certificates.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add fadeIn and scaleIn animations to global CSS if not already present */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

