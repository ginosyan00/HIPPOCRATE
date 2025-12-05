import { prisma } from '../config/database.js';

/**
 * Certificate Service
 * Бизнес-логика для работы с сертификатами клиники
 */

/**
 * Получить все сертификаты клиники
 * @param {string} clinicId - ID клиники
 * @returns {Promise<Array>} Список сертификатов
 */
export async function getCertificatesByClinicId(clinicId) {
  console.log('🔵 [CERTIFICATE SERVICE] Получение сертификатов клиники:', clinicId);

  const certificates = await prisma.certificate.findMany({
    where: { clinicId },
    orderBy: { createdAt: 'desc' },
  });

  console.log('✅ [CERTIFICATE SERVICE] Найдено сертификатов:', certificates.length);
  return certificates;
}

/**
 * Получить сертификат по ID
 * @param {string} certificateId - ID сертификата
 * @param {string} clinicId - ID клиники (для проверки принадлежности)
 * @returns {Promise<object>} Сертификат
 */
export async function getCertificateById(certificateId, clinicId) {
  console.log('🔵 [CERTIFICATE SERVICE] Получение сертификата:', certificateId);

  const certificate = await prisma.certificate.findFirst({
    where: {
      id: certificateId,
      clinicId,
    },
  });

  if (!certificate) {
    throw new Error('Certificate not found');
  }

  console.log('✅ [CERTIFICATE SERVICE] Сертификат найден:', certificate.title);
  return certificate;
}

/**
 * Создать новый сертификат
 * @param {string} clinicId - ID клиники
 * @param {object} certificateData - Данные сертификата
 * @returns {Promise<object>} Созданный сертификат
 */
export async function createCertificate(clinicId, certificateData) {
  console.log('🔵 [CERTIFICATE SERVICE] Создание сертификата для клиники:', clinicId);

  // Проверяем существование клиники
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
  });

  if (!clinic) {
    throw new Error('Clinic not found');
  }

  const certificate = await prisma.certificate.create({
    data: {
      clinicId,
      ...certificateData,
      // Автоматически верифицируем сертификаты, созданные клиникой (для MVP)
      // В будущем можно добавить процесс верификации администратором
      isVerified: certificateData.isVerified !== undefined ? certificateData.isVerified : true,
    },
  });

  console.log('✅ [CERTIFICATE SERVICE] Сертификат создан:', certificate.title);
  return certificate;
}

/**
 * Обновить сертификат
 * @param {string} certificateId - ID сертификата
 * @param {string} clinicId - ID клиники (для проверки принадлежности)
 * @param {object} updateData - Данные для обновления
 * @returns {Promise<object>} Обновленный сертификат
 */
export async function updateCertificate(certificateId, clinicId, updateData) {
  console.log('🔵 [CERTIFICATE SERVICE] Обновление сертификата:', certificateId);

  // Проверяем существование и принадлежность сертификата
  const existingCertificate = await prisma.certificate.findFirst({
    where: {
      id: certificateId,
      clinicId,
    },
  });

  if (!existingCertificate) {
    throw new Error('Certificate not found');
  }

  const updatedCertificate = await prisma.certificate.update({
    where: { id: certificateId },
    data: updateData,
  });

  console.log('✅ [CERTIFICATE SERVICE] Сертификат обновлен:', updatedCertificate.title);
  return updatedCertificate;
}

/**
 * Удалить сертификат
 * @param {string} certificateId - ID сертификата
 * @param {string} clinicId - ID клиники (для проверки принадлежности)
 * @returns {Promise<object>} Результат удаления
 */
export async function deleteCertificate(certificateId, clinicId) {
  console.log('🔵 [CERTIFICATE SERVICE] Удаление сертификата:', certificateId);

  // Проверяем существование и принадлежность сертификата
  const existingCertificate = await prisma.certificate.findFirst({
    where: {
      id: certificateId,
      clinicId,
    },
  });

  if (!existingCertificate) {
    throw new Error('Certificate not found');
  }

  await prisma.certificate.delete({
    where: { id: certificateId },
  });

  console.log('✅ [CERTIFICATE SERVICE] Сертификат удален');
  return { success: true, message: 'Certificate deleted successfully' };
}

