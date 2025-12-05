import express from 'express';
import * as certificateController from '../controllers/certificate.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createCertificateSchema,
  updateCertificateSchema,
} from '../validators/certificate.validator.js';

const router = express.Router();

/**
 * Certificate Routes
 * Все маршруты требуют аутентификации
 */

// GET /api/v1/certificates - Получить все сертификаты клиники
router.get('/', authenticate, certificateController.getCertificates);

// GET /api/v1/certificates/:id - Получить сертификат по ID
router.get('/:id', authenticate, certificateController.getCertificate);

// POST /api/v1/certificates - Создать новый сертификат
router.post(
  '/',
  authenticate,
  validate(createCertificateSchema),
  certificateController.createCertificate
);

// PUT /api/v1/certificates/:id - Обновить сертификат
router.put(
  '/:id',
  authenticate,
  validate(updateCertificateSchema),
  certificateController.updateCertificate
);

// DELETE /api/v1/certificates/:id - Удалить сертификат
router.delete('/:id', authenticate, certificateController.deleteCertificate);

export default router;

