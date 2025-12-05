import * as certificateService from '../services/certificate.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

/**
 * Certificate Controller
 * Обработчики для certificate endpoints
 */

/**
 * GET /api/v1/certificates
 * Получить все сертификаты клиники
 */
export async function getCertificates(req, res, next) {
  try {
    const { clinicId } = req.user;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    const certificates = await certificateService.getCertificatesByClinicId(clinicId);
    successResponse(res, certificates);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/certificates/:id
 * Получить сертификат по ID
 */
export async function getCertificate(req, res, next) {
  try {
    const { clinicId } = req.user;
    const { id } = req.params;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    const certificate = await certificateService.getCertificateById(id, clinicId);
    successResponse(res, certificate);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/certificates
 * Создать новый сертификат
 */
export async function createCertificate(req, res, next) {
  try {
    const { clinicId } = req.user;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    const certificate = await certificateService.createCertificate(clinicId, req.body);
    successResponse(res, certificate, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/certificates/:id
 * Обновить сертификат
 */
export async function updateCertificate(req, res, next) {
  try {
    const { clinicId } = req.user;
    const { id } = req.params;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    const certificate = await certificateService.updateCertificate(id, clinicId, req.body);
    successResponse(res, certificate);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/certificates/:id
 * Удалить сертификат
 */
export async function deleteCertificate(req, res, next) {
  try {
    const { clinicId } = req.user;
    const { id } = req.params;

    if (!clinicId) {
      return errorResponse(res, 'User is not associated with a clinic', 403);
    }

    const result = await certificateService.deleteCertificate(id, clinicId);
    successResponse(res, result);
  } catch (error) {
    next(error);
  }
}

