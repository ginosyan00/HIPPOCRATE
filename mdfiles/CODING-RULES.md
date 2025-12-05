# ПРАВИЛА КОДИРОВАНИЯ

> **Цель:** Единый стиль кода. AI пишет как senior developer.

---

## 📐 ОБЩИЕ ПРАВИЛА

### Размеры

| Что | Максимум | Если превышено |
|-----|----------|----------------|
| Функция | 50 строк | Разбей на меньшие |
| Файл | 400 строк | Разбей на модули |
| Компонент | 200 строк | Извлеки подкомпоненты |
| Строка кода | 100 символов | Перенеси на новую строку |

### Naming Conventions

| Тип | Формат | Пример |
|-----|--------|--------|
| Файлы (backend) | kebab-case | `patient.service.js` |
| Файлы (frontend) | PascalCase | `PatientCard.tsx` |
| Переменные | camelCase | `const patientName = ...` |
| Константы | UPPER_SNAKE_CASE | `const MAX_PATIENTS = 100` |
| Функции | camelCase | `function findPatient() {}` |
| React Components | PascalCase | `function PatientCard() {}` |
| Interfaces/Types | PascalCase | `interface Patient {}` |
| Enums | PascalCase | `enum AppointmentStatus {}` |
| Classes | PascalCase | `class PatientService {}` |
| Private methods | _camelCase | `function _internalMethod() {}` |

---

## 💻 BACKEND (Express + Prisma + JavaScript)

### 1. Структура Controller

**✅ ПРАВИЛЬНО — Тонкий контроллер:**
```javascript
// controllers/patient.controller.js
const patientService = require('../services/patient.service');

/**
 * Get all patients for current clinic
 * @route GET /api/patients
 */
async function getAll(req, res, next) {
  try {
    const patients = await patientService.findAll(req.user.clinicId);
    
    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new patient
 * @route POST /api/patients
 */
async function create(req, res, next) {
  try {
    const patient = await patientService.create(
      req.user.clinicId,
      req.body
    );
    
    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  create
};
```

**❌ НЕПРАВИЛЬНО — Логика в контроллере:**
```javascript
async function create(req, res) {
  // ❌ Валидация в контроллере
  if (!req.body.name) {
    return res.status(400).json({ error: 'Name required' });
  }
  
  // ❌ Бизнес-логика в контроллере
  const existing = await prisma.patient.findFirst({
    where: { phone: req.body.phone }
  });
  
  if (existing) {
    return res.status(409).json({ error: 'Already exists' });
  }
  
  // ❌ Прямой доступ к Prisma
  const patient = await prisma.patient.create({
    data: { ...req.body, clinicId: req.user.clinicId }
  });
  
  res.json(patient);
}
```

---

### 2. Структура Service

**✅ ПРАВИЛЬНО — Толстый сервис:**
```javascript
// services/patient.service.js
const { prisma } = require('../config/database');

/**
 * Find all patients for clinic
 * @param {string} clinicId - Clinic ID
 * @returns {Promise<Patient[]>}
 */
async function findAll(clinicId) {
  return await prisma.patient.findMany({
    where: { clinicId },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Find patient by ID
 * @param {string} clinicId - Clinic ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<Patient>}
 */
async function findById(clinicId, patientId) {
  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      clinicId // ОБЯЗАТЕЛЬНО!
    }
  });
  
  if (!patient) {
    throw new Error('Patient not found');
  }
  
  return patient;
}

/**
 * Create new patient
 * @param {string} clinicId - Clinic ID
 * @param {object} data - Patient data
 * @returns {Promise<Patient>}
 */
async function create(clinicId, data) {
  // Валидация (дополнительная к Joi)
  if (!data.phone) {
    throw new Error('Phone is required');
  }
  
  // Бизнес-правило: уникальность телефона в клинике
  const existing = await prisma.patient.findFirst({
    where: {
      clinicId,
      phone: data.phone
    }
  });
  
  if (existing) {
    throw new Error('Patient with this phone already exists in your clinic');
  }
  
  // Создание
  return await prisma.patient.create({
    data: {
      ...data,
      clinicId
    }
  });
}

/**
 * Update patient
 * @param {string} clinicId - Clinic ID
 * @param {string} patientId - Patient ID
 * @param {object} data - Update data
 * @returns {Promise<Patient>}
 */
async function update(clinicId, patientId, data) {
  // Проверка существования и прав
  await findById(clinicId, patientId);
  
  // Обновление
  return await prisma.patient.update({
    where: { id: patientId },
    data
  });
}

/**
 * Delete patient
 * @param {string} clinicId - Clinic ID
 * @param {string} patientId - Patient ID
 */
async function remove(clinicId, patientId) {
  // Проверка существования и прав
  await findById(clinicId, patientId);
  
  // Удаление
  await prisma.patient.delete({
    where: { id: patientId }
  });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};
```

**Правила Services:**
- ✅ Вся бизнес-логика здесь
- ✅ Валидация бизнес-правил
- ✅ ВСЕГДА фильтровать по `clinicId`
- ✅ JSDoc комментарии для всех функций
- ✅ Понятные названия функций
- ✅ Возвращать Promise
- ✅ Throw ошибки, не возвращать { success: false }

---

### 3. Routes

**✅ ПРАВИЛЬНО:**
```javascript
// routes/patient.routes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { tenantMiddleware } = require('../middlewares/tenant.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { createPatientSchema, updatePatientSchema } = require('../validators/patient.validator');

// Применяем auth и tenant middleware ко всем routes
router.use(authenticate);
router.use(tenantMiddleware);

// Routes
router.get('/', patientController.getAll);
router.get('/:id', patientController.getById);
router.post('/', validate(createPatientSchema), patientController.create);
router.put('/:id', validate(updatePatientSchema), patientController.update);
router.delete('/:id', patientController.remove);

module.exports = router;
```

---

### 4. Validation (Joi)

**✅ ПРАВИЛЬНО:**
```javascript
// validators/patient.validator.js
const Joi = require('joi');

const createPatientSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must be at most 100 characters',
      'any.required': 'Name is required'
    }),
  
  phone: Joi.string()
    .pattern(/^\+374\s?\d{2}\s?\d{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone must be in format +374 XX XXXXXX',
      'any.required': 'Phone is required'
    }),
  
  email: Joi.string()
    .email()
    .optional()
    .allow(''),
  
  dateOfBirth: Joi.date()
    .iso()
    .max('now')
    .optional(),
  
  gender: Joi.string()
    .valid('male', 'female', 'other')
    .optional(),
  
  notes: Joi.string()
    .max(1000)
    .optional()
});

const updatePatientSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().pattern(/^\+374\s?\d{2}\s?\d{6}$/),
  email: Joi.string().email().allow(''),
  dateOfBirth: Joi.date().iso().max('now'),
  gender: Joi.string().valid('male', 'female', 'other'),
  notes: Joi.string().max(1000)
}).min(1); // Хотя бы одно поле обязательно

module.exports = {
  createPatientSchema,
  updatePatientSchema
};
```

---

### 5. Error Handling

**✅ ПРАВИЛЬНО — Централизованный error handler:**
```javascript
// middlewares/error.middleware.js

function errorHandler(err, req, res, next) {
  // Логирование
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
    clinicId: req.user?.clinicId
  });
  
  // Определяем статус код
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'Internal server error';
  
  if (err.message.includes('not found')) {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    message = err.message;
  } else if (err.message.includes('already exists')) {
    statusCode = 409;
    errorCode = 'CONFLICT';
    message = err.message;
  } else if (err.message.includes('required') || err.message.includes('invalid')) {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  }
  
  // Ответ
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message
    }
  });
}

module.exports = { errorHandler };
```

---

### 6. Prisma Queries

**✅ ПРАВИЛЬНО — ВСЕГДА фильтровать по clinicId:**
```javascript
// ✅ Список с фильтром
const patients = await prisma.patient.findMany({
  where: {
    clinicId, // ОБЯЗАТЕЛЬНО!
    name: { contains: searchQuery }
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: (page - 1) * 20
});

// ✅ Один элемент с проверкой tenant
const patient = await prisma.patient.findFirst({
  where: {
    id: patientId,
    clinicId // ОБЯЗАТЕЛЬНО!
  }
});

// ✅ Создание
const patient = await prisma.patient.create({
  data: {
    ...data,
    clinicId // ОБЯЗАТЕЛЬНО!
  }
});

// ✅ С отношениями
const appointments = await prisma.appointment.findMany({
  where: { clinicId },
  include: {
    patient: true,
    doctor: true
  }
});
```

**❌ НЕПРАВИЛЬНО — без clinicId:**
```javascript
// ❌ ОПАСНО — вернёт данные ВСЕХ клиник!
const patients = await prisma.patient.findMany();

// ❌ ОПАСНО — может вернуть пациента другой клиники
const patient = await prisma.patient.findUnique({
  where: { id: patientId }
});
```

---

## 🎨 FRONTEND (React + TypeScript)

### 1. Структура Компонента

**✅ ПРАВИЛЬНО:**
```typescript
// components/dashboard/PatientCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '@/types/models.types';
import { Button } from '@/components/common/Button';

interface PatientCardProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patientId: string) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  
  const handleView = () => {
    navigate(`/patients/${patient.id}`);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">{patient.name}</h3>
      <p className="text-gray-600 mb-1">{patient.phone}</p>
      {patient.email && (
        <p className="text-gray-600 mb-3">{patient.email}</p>
      )}
      
      <div className="flex gap-2">
        <Button size="sm" onClick={handleView}>
          Открыть
        </Button>
        {onEdit && (
          <Button size="sm" variant="secondary" onClick={() => onEdit(patient)}>
            Редактировать
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (confirm(`Удалить пациента ${patient.name}?`)) {
                onDelete(patient.id);
              }
            }}
          >
            Удалить
          </Button>
        )}
      </div>
    </div>
  );
};
```

**Правила компонентов:**
- ✅ TypeScript interfaces для props
- ✅ React.FC type
- ✅ Destructure props
- ✅ Tailwind классы для стилей
- ✅ Один компонент = один файл
- ✅ Export named component
- ✅ < 200 строк (иначе разбить)

---

### 2. Структура Page

**✅ ПРАВИЛЬНО:**
```typescript
// pages/dashboard/Patients.tsx
import React, { useState } from 'react';
import { usePatients } from '@/hooks/usePatients';
import { PatientCard } from '@/components/dashboard/PatientCard';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Input } from '@/components/common/Input';

export const PatientsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: patients, isLoading, error } = usePatients(searchQuery);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded">
          Ошибка загрузки: {error.message}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Пациенты</h1>
        <Button onClick={() => navigate('/patients/new')}>
          Добавить пациента
        </Button>
      </div>
      
      <div className="mb-4">
        <Input
          placeholder="Поиск по имени или телефону..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {patients && patients.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Пациенты не найдены
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients?.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
};
```

**Правила страниц:**
- ✅ Обработка loading/error состояний
- ✅ Используй React Query hooks
- ✅ Tailwind для стилей
- ✅ Responsive grid (mobile-first)
- ✅ Понятная структура

---

### 3. API Service

**✅ ПРАВИЛЬНО:**
```typescript
// services/patient.service.ts
import api from './api';
import { Patient, CreatePatientDTO, UpdatePatientDTO } from '@/types/models.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const patientService = {
  /**
   * Get all patients
   */
  async getAll(): Promise<Patient[]> {
    const { data } = await api.get<ApiResponse<Patient[]>>('/patients');
    return data.data;
  },
  
  /**
   * Get patient by ID
   */
  async getById(id: string): Promise<Patient> {
    const { data } = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
    return data.data;
  },
  
  /**
   * Create new patient
   */
  async create(patient: CreatePatientDTO): Promise<Patient> {
    const { data } = await api.post<ApiResponse<Patient>>('/patients', patient);
    return data.data;
  },
  
  /**
   * Update patient
   */
  async update(id: string, patient: UpdatePatientDTO): Promise<Patient> {
    const { data } = await api.put<ApiResponse<Patient>>(`/patients/${id}`, patient);
    return data.data;
  },
  
  /**
   * Delete patient
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  }
};
```

---

### 4. Custom Hook (React Query)

**✅ ПРАВИЛЬНО:**
```typescript
// hooks/usePatients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services/patient.service';
import { CreatePatientDTO, UpdatePatientDTO } from '@/types/models.types';

/**
 * Hook for fetching patients list
 */
export function usePatients(searchQuery?: string) {
  return useQuery({
    queryKey: ['patients', searchQuery],
    queryFn: () => patientService.getAll(searchQuery),
    staleTime: 30000 // 30 секунд
  });
}

/**
 * Hook for fetching single patient
 */
export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientService.getById(id),
    enabled: !!id
  });
}

/**
 * Hook for creating patient
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePatientDTO) => patientService.create(data),
    onSuccess: () => {
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });
}

/**
 * Hook for updating patient
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientDTO }) =>
      patientService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.id] });
    }
  });
}

/**
 * Hook for deleting patient
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => patientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });
}
```

---

### 5. TypeScript Types

**✅ ПРАВИЛЬНО:**
```typescript
// types/models.types.ts

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address?: string;
  city: string;
  about?: string;
  logo?: string;
  workingHours?: WorkingHours;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string | null;
  close: string | null;
  isOpen: boolean;
}

export interface User {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  role: UserRole;
  specialization?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  Admin = 'admin',
  Doctor = 'doctor',
  Assistant = 'assistant'
}

export interface Patient {
  id: string;
  clinicId: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other'
}

export interface Appointment {
  id: string;
  clinicId: string;
  doctorId: string;
  patientId: string;
  appointmentDate: Date;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (опционально, если include)
  doctor?: User;
  patient?: Patient;
}

export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

// DTO types
export interface CreatePatientDTO {
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: Gender;
  notes?: string;
}

export interface UpdatePatientDTO {
  name?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: Gender;
  notes?: string;
}

export interface CreateAppointmentDTO {
  doctorId: string;
  patientId: string;
  appointmentDate: string;
  duration?: number;
  reason?: string;
}
```

---

### 6. Zustand Store

**✅ ПРАВИЛЬНО:**
```typescript
// store/useAuthStore.ts
import { create } from 'zustand';
import { User } from '@/types/models.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({
      user,
      token,
      isAuthenticated: true
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  }
}));
```

---

## 📋 CHECKLIST ПЕРЕД КОММИТОМ

### Backend:
- [ ] Код следует naming conventions
- [ ] Controllers тонкие (только роутинг)
- [ ] Services толстые (вся логика)
- [ ] ВСЕГДА фильтровать по `clinicId`
- [ ] Используется Prisma (не native queries)
- [ ] Joi валидация для всех endpoints
- [ ] JSDoc комментарии
- [ ] Обработка ошибок через try/catch
- [ ] Нет `console.log` (используй logger)
- [ ] Функции < 50 строк
- [ ] Файлы < 400 строк

### Frontend:
- [ ] TypeScript строгий (no `any`)
- [ ] Props имеют interface
- [ ] React Query для API
- [ ] Zustand для UI state
- [ ] Tailwind для стилей (no inline styles)
- [ ] Loading/error состояния обработаны
- [ ] Компоненты < 200 строк
- [ ] Responsive design (mobile-first)
- [ ] Нет unused imports
- [ ] Нет console.log

### Общее:
- [ ] ESLint ошибок нет
- [ ] Prettier применён
- [ ] Нет дублирования кода
- [ ] Понятные названия переменных
- [ ] Код понятен без комментариев
- [ ] Тесты написаны (если критично)

---

**Последнее обновление:** 11.11.2025  
**Версия:** 1.0  
**Следующий review:** При появлении новых паттернов

