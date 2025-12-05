import express from 'express';
import authRoutes from './auth.routes.js';
import patientRoutes from './patient.routes.js';
import userRoutes from './user.routes.js';
import doctorRoutes from './doctor.routes.js';
import appointmentRoutes from './appointment.routes.js';
import notificationRoutes from './notification.routes.js';
import clinicRoutes from './clinic.routes.js';
import publicRoutes from './public.routes.js';
import analyticsRoutes from './analytics.routes.js';
import certificateRoutes from './certificate.routes.js';
import chatRoutes from './chat.routes.js';
import uploadRoutes from './upload.routes.js';
import dailyAdviceRoutes from './dailyAdvice.routes.js';
import dailyAdvicePublicRoutes from './dailyAdvice.public.routes.js';

const router = express.Router();

/**
 * API Routes
 * Объединение всех маршрутов
 */

// Public routes (БЕЗ авторизации!)
router.use('/public', publicRoutes);
router.use('/public/daily-advice', dailyAdvicePublicRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Patient routes (требуют авторизацию)
router.use('/patients', patientRoutes);

// User routes (требуют авторизацию)
router.use('/users', userRoutes);

// Doctor routes (требуют авторизацию, только для DOCTOR)
router.use('/doctor', doctorRoutes);

// Appointment routes (требуют авторизацию)
router.use('/appointments', appointmentRoutes);

// Notification routes (требуют авторизацию)
router.use('/notifications', notificationRoutes);

// Clinic routes (требуют авторизацию)
router.use('/clinic', clinicRoutes);

// Analytics routes (требуют авторизацию)
router.use('/analytics', analyticsRoutes);

// Certificate routes (требуют авторизацию)
router.use('/certificates', certificateRoutes);

// Chat routes (требуют авторизацию)
router.use('/chat', chatRoutes);

// Upload routes (требуют авторизацию)
router.use('/upload', uploadRoutes);

// Daily Advice routes (публичные для чтения, защищенные для админа)
router.use('/daily-advice', dailyAdviceRoutes);

// Health check (для удобства, дублирует основной health endpoint)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;

