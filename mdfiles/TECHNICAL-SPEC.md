# 🦷 ТЕХНИЧЕСКОЕ ЗАДАНИЕ — Hippocrates Dental

**Проект:** SaaS-платформа *Hippocrates Dental*  
**Версия:** MVP v1.0  
**Дата:** 11.11.2025  
**Документ подготовлен для:** команды разработчиков  
**Ответственный:** Product Owner — Neetreino Specialist

---

## 0. ВВЕДЕНИЕ И КОНЦЕПЦИЯ

### 0.1. Цель проекта

**Создать SaaS-платформу для стоматологических клиник с multi-tenancy архитектурой, объединяющую внутреннюю CRM-систему и публичную веб-платформу для онлайн-записи пациентов.**

### 0.2. Проблема

Большинство стоматологических клиник в Армении используют:
- Бумажные блокноты или Excel для расписания
- Телефонные звонки для записи
- Разрозненные системы без централизации
- Отсутствие онлайн-присутствия

**Результат:** потеря клиентов, неэффективное управление, отсутствие цифровизации.

### 0.3. Решение

Hippocrates Dental — это облачная SaaS-платформа, где:
- Каждая клиника получает изолированный кабинет (multi-tenancy)
- Пациенты могут записываться онлайн через публичный сайт
- Все данные защищены и разделены по арендаторам
- Клиника получает готовый лендинг под брендом Hippocrates

### 0.4. Целевая аудитория

1. **Малые и средние стоматологические клиники** (1-10 врачей)
2. **Администраторы клиник** (ведут записи и координируют работу)
3. **Врачи** (просматривают свое расписание)
4. **Пациенты** (записываются онлайн)

### 0.5. Результат MVP

- ✅ Работающая multi-tenancy SaaS-система
- ✅ Админ-панель для управления клиникой
- ✅ Публичные лендинги клиник
- ✅ Онлайн-запись пациентов
- ✅ Календарь и расписание врачей
- ✅ Управление пациентами и приёмами

---

## 1. SCOPE (Область работ)

### 1.1. Что ВХОДИТ в MVP

#### Dashboard (Админ-панель клиники)

**P0 — Критично:**
- ✅ Авторизация и регистрация клиники (JWT)
- ✅ CRUD сотрудников (врачи, ассистенты)
- ✅ CRUD пациентов
- ✅ CRUD приёмов (appointments)
- ✅ Календарь расписания врачей
- ✅ Настройки клиники (контакты, логотип, график работы)

**P1 — Важно:**
- ✅ Статистика приёмов (дашборд)
- ✅ Фильтрация и поиск пациентов
- ✅ Уведомления о новых записях

#### Public Website (Публичный сайт)

**P0 — Критично:**
- ✅ Главная страница Hippocrates
- ✅ Каталог клиник (список с фильтром по городу)
- ✅ Лендинг клиники (индивидуальная страница)
- ✅ Форма онлайн-записи
- ✅ Отправка заявки (создание appointment)

**P1 — Важно:**
- ✅ SEO-оптимизация (meta tags, sitemap)
- ✅ Адаптивный дизайн (mobile-first)

### 1.2. Что НЕ ВХОДИТ (после v1.0)

**Отложено на v1.1:**
- ❌ Платежи и онлайн-оплата
- ❌ SMS-уведомления пациентам
- ❌ Email-уведомления
- ❌ История лечения пациента
- ❌ Электронная медицинская карта
- ❌ Интеграция с календарями (Google Calendar)
- ❌ Многоязычность (только русский в MVP)

**Отложено на v1.2+:**
- ❌ Мобильное приложение
- ❌ Онлайн-консультации (видеосвязь)
- ❌ Складской учёт материалов
- ❌ Финансовая отчётность

---

## 2. НЕФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ (SLA/SLO)

### 2.1. Производительность

| Метрика | Значение |
|---------|----------|
| API Response Time (p95) | ≤ 500 ms |
| Page Load (LCP) p75 | ≤ 2.5 sec |
| Time to First Byte (TTFB) | ≤ 600 ms |
| Database query time (p95) | ≤ 100 ms |

### 2.2. Доступность

| Метрика | Значение |
|---------|----------|
| SLA Uptime | ≥ 99.5% (~3.6 ч простоя/мес) |
| Error rate | ≤ 0.1% в неделю |
| Successful requests | ≥ 99.9% |

### 2.3. Масштабируемость (MVP)

| Параметр | Ограничение |
|----------|-------------|
| Количество клиник (tenants) | ≤ 100 |
| Одновременные пользователи | ≤ 500 |
| Пациентов на клинику | ≤ 10,000 |
| Appointments на клинику/мес | ≤ 2,000 |
| Врачей на клинику | ≤ 50 |

### 2.4. Безопасность

| Требование | Стандарт |
|-----------|----------|
| Аутентификация | JWT (HS256, expiry 7 дней) |
| Хеширование паролей | bcrypt (saltRounds=12) |
| HTTPS | Обязательно (TLS 1.3) |
| OWASP | ASVS Level 2 |
| Rate limiting | 100 req/min/IP |
| CORS | Whitelist origins |

---

## 3. АРХИТЕКТУРА И СТЕК

### 3.1. Выбор стека

#### Frontend

**Выбрано:**
```
- React 18.3+
- TypeScript 5.3+
- Vite 5.0+
- Tailwind CSS 3.4+
- React Query (TanStack Query) 5.0+
- Zustand 4.4+ (state management)
- React Router 6.20+
- Axios 1.6+
```

**Почему:**
- React — индустриальный стандарт, богатая экосистема
- TypeScript — type safety, снижает количество ошибок
- Vite — быстрая сборка, HMR
- Tailwind — быстрая разработка UI, консистентность
- React Query — оптимизация API запросов, кэширование
- Zustand — легковесный state manager (проще Redux)

**Альтернативы отвергнуты:**
- ❌ Next.js — избыточно для SPA, добавит сложность деплоя
- ❌ Vue.js — меньше экосистема, менее популярен
- ❌ Angular — слишком сложен, over-engineering

#### Backend

**Выбрано:**
```
- Node.js 20 LTS
- Express.js 4.18+
- JavaScript (ES6 modules)
- Prisma ORM 5.7+
- MongoDB 7.0+
- JWT (jsonwebtoken)
- bcrypt
- Helmet (security)
- Joi (validation)
```

**Почему:**
- Node.js + Express — быстрая разработка, легковесность
- JavaScript — единый язык с фронтом
- Prisma + MongoDB — гибкая схема для multi-tenancy
- MongoDB — JSONB-подобная гибкость, быстрый старт

**Альтернативы отвергнуты:**
- ❌ NestJS — over-engineering для MVP
- ❌ PostgreSQL — избыточно сложная схема для начального этапа
- ❌ Python/Django — другой язык, раздельная команда

### 3.2. Структура проекта

```
hippocrates/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/         # UI компоненты
│   │   │   ├── common/        # Button, Input, Card
│   │   │   ├── dashboard/     # Dashboard components
│   │   │   └── public/        # Public site components
│   │   ├── pages/             # Страницы
│   │   │   ├── dashboard/     # Admin panel pages
│   │   │   └── public/        # Public pages
│   │   ├── services/          # API clients
│   │   ├── store/             # Zustand stores
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utilities
│   │   └── types/             # TypeScript types
│   ├── public/
│   └── package.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Prisma models
│   │   ├── middlewares/       # Auth, validation, error
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Helpers
│   │   └── config/            # Configuration
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Test data
│   └── package.json
│
├── Documentation/               # 📚 Документация
│   ├── README.md
│   ├── RULES.md
│   ├── ARCHITECTURE.md
│   ├── CODING-RULES.md
│   ├── PLAN.md
│   ├── PROGRESS.md
│   ├── DEPLOYMENT.md
│   └── env.example.txt
│
└── .cursor/
    └── rules/
        └── rules.mdc           # Cursor AI rules
```

---

## 4. ДОМЕННАЯ МОДЕЛЬ

### 4.1. Основные сущности

```
Clinic (Клиника)
  └── User (Сотрудники: admin, doctor, assistant)
  └── Patient (Пациенты)
  └── Appointment (Приёмы)
      └── связь с Doctor (User)
      └── связь с Patient
  └── ClinicPage (Публичная страница/лендинг)
```

### 4.2. Детальная схема сущностей

#### Clinic (Клиника)

| Поле | Тип | Описание |
|------|-----|----------|
| id | String (ObjectId) | Уникальный ID |
| name | String | Название клиники |
| slug | String (unique) | URL-friendly ID (hippocrates.am/clinic/slug) |
| email | String | Email клиники |
| phone | String | Телефон |
| address | String | Физический адрес |
| city | String | Город |
| about | String (optional) | Описание клиники |
| logo | String (optional) | URL логотипа |
| workingHours | JSON | График работы |
| createdAt | DateTime | Дата создания |
| updatedAt | DateTime | Дата обновления |

**workingHours JSON формат:**
```json
{
  "monday": { "open": "09:00", "close": "18:00", "isOpen": true },
  "tuesday": { "open": "09:00", "close": "18:00", "isOpen": true },
  "wednesday": { "open": "09:00", "close": "18:00", "isOpen": true },
  "thursday": { "open": "09:00", "close": "18:00", "isOpen": true },
  "friday": { "open": "09:00", "close": "18:00", "isOpen": true },
  "saturday": { "open": "10:00", "close": "14:00", "isOpen": true },
  "sunday": { "open": null, "close": null, "isOpen": false }
}
```

#### User (Пользователь/Сотрудник)

| Поле | Тип | Описание |
|------|-----|----------|
| id | String (ObjectId) | Уникальный ID |
| clinicId | String (ObjectId) | FK → Clinic.id |
| name | String | ФИО |
| email | String (unique) | Email (логин) |
| passwordHash | String | bcrypt hash пароля |
| role | Enum | 'admin', 'doctor', 'assistant' |
| specialization | String (optional) | Специализация врача |
| phone | String (optional) | Телефон |
| avatar | String (optional) | URL фото |
| isActive | Boolean | Активен ли аккаунт |
| createdAt | DateTime | Дата создания |
| updatedAt | DateTime | Дата обновления |

**Роли:**
- `admin` — полный доступ к клинике
- `doctor` — просмотр своих пациентов и расписания
- `assistant` — помощь администратору

#### Patient (Пациент)

| Поле | Тип | Описание |
|------|-----|----------|
| id | String (ObjectId) | Уникальный ID |
| clinicId | String (ObjectId) | FK → Clinic.id |
| name | String | ФИО пациента |
| phone | String | Телефон (обязательно) |
| email | String (optional) | Email |
| dateOfBirth | DateTime (optional) | Дата рождения |
| gender | Enum (optional) | 'male', 'female', 'other' |
| notes | String (optional) | Заметки |
| createdAt | DateTime | Дата создания |
| updatedAt | DateTime | Дата обновления |

#### Appointment (Приём)

| Поле | Тип | Описание |
|------|-----|----------|
| id | String (ObjectId) | Уникальный ID |
| clinicId | String (ObjectId) | FK → Clinic.id |
| doctorId | String (ObjectId) | FK → User.id (doctor) |
| patientId | String (ObjectId) | FK → Patient.id |
| appointmentDate | DateTime | Дата и время приёма |
| duration | Integer | Длительность (минуты), default: 30 |
| status | Enum | 'pending', 'confirmed', 'completed', 'cancelled' |
| notes | String (optional) | Заметки врача |
| reason | String (optional) | Причина визита |
| createdAt | DateTime | Дата создания заявки |
| updatedAt | DateTime | Дата обновления |

**Status State Machine:**
```
pending → confirmed → completed
   ↓
cancelled
```

**Правила переходов:**
- `pending` → `confirmed`: только admin/assistant
- `pending` → `cancelled`: admin/assistant/patient (через сайт)
- `confirmed` → `completed`: только doctor/admin после приёма
- `confirmed` → `cancelled`: admin/assistant до даты приёма
- `completed`: финальный статус
- `cancelled`: финальный статус

---

## 5. DATABASE SCHEMA (Prisma + MongoDB)

### 5.1. Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ============================================
// CLINIC
// ============================================

model Clinic {
  id            String    @id @default(uuid())
  name          String
  slug          String    @unique
  email         String
  phone         String
  address       String?
  city          String
  about         String?
  logo          String?
  workingHours  String?   // JSON as String in SQLite
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  users         User[]
  patients      Patient[]
  appointments  Appointment[]

  @@map("clinics")
}

// ============================================
// USER (Сотрудник)
// ============================================

model User {
  id             String    @id @default(uuid())
  clinicId       String
  name           String
  email          String    @unique
  passwordHash   String
  role           Role
  specialization String?
  phone          String?
  avatar         String?
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relations
  clinic         Clinic    @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  appointments   Appointment[]

  @@index([clinicId])
  @@index([email])
  @@map("users")
}

enum Role {
  admin
  doctor
  assistant
}

// ============================================
// PATIENT
// ============================================

model Patient {
  id           String    @id @default(uuid())
  clinicId     String
  name         String
  phone        String
  email        String?
  dateOfBirth  DateTime?
  gender       Gender?
  notes        String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Relations
  clinic       Clinic    @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  appointments Appointment[]

  @@index([clinicId])
  @@index([phone])
  @@map("patients")
}

enum Gender {
  male
  female
  other
}

// ============================================
// APPOINTMENT
// ============================================

model Appointment {
  id              String    @id @default(uuid())
  clinicId        String
  doctorId        String
  patientId       String
  appointmentDate DateTime
  duration        Int       @default(30)
  status          AppointmentStatus @default(pending)
  notes           String?
  reason          String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  clinic          Clinic    @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  doctor          User      @relation(fields: [doctorId], references: [id])
  patient         Patient   @relation(fields: [patientId], references: [id])

  @@index([clinicId])
  @@index([doctorId])
  @@index([patientId])
  @@index([appointmentDate])
  @@index([status])
  @@map("appointments")
}

enum AppointmentStatus {
  pending
  confirmed
  completed
  cancelled
}
```

### 5.2. Индексы для производительности

**Критичные индексы:**
Индексы настроены в Prisma schema через `@@index` директивы для оптимальной производительности запросов.

---

## 6. API ДИЗАЙН

### 6.1. API Endpoints

**Base URL:** `https://api.hippocrates.am/api/v1`

#### 6.1.1. Authentication

| Method | Endpoint | Auth | Описание |
|--------|----------|------|----------|
| POST | /auth/register | ❌ | Регистрация новой клиники |
| POST | /auth/login | ❌ | Авторизация |
| POST | /auth/refresh | ✅ | Обновление токена |
| GET | /auth/me | ✅ | Текущий пользователь |

#### 6.1.2. Clinic Management

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | /clinic/me | ✅ | all | Данные клиники |
| PUT | /clinic/me | ✅ | admin | Обновить данные клиники |
| PUT | /clinic/logo | ✅ | admin | Загрузить логотип |

#### 6.1.3. Users (Staff)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | /users | ✅ | admin | Список сотрудников |
| POST | /users | ✅ | admin | Добавить сотрудника |
| GET | /users/:id | ✅ | admin | Детали сотрудника |
| PUT | /users/:id | ✅ | admin | Обновить сотрудника |
| DELETE | /users/:id | ✅ | admin | Удалить сотрудника |

#### 6.1.4. Patients

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | /patients | ✅ | admin, assistant | Список пациентов |
| POST | /patients | ✅ | admin, assistant | Добавить пациента |
| GET | /patients/:id | ✅ | admin, assistant, doctor | Детали пациента |
| PUT | /patients/:id | ✅ | admin, assistant | Обновить пациента |
| DELETE | /patients/:id | ✅ | admin | Удалить пациента |
| GET | /patients/search | ✅ | admin, assistant | Поиск по телефону/имени |

#### 6.1.5. Appointments

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | /appointments | ✅ | all | Список приёмов (с фильтрами) |
| POST | /appointments | ❌ | public | Создать запись (публичная) |
| GET | /appointments/:id | ✅ | all | Детали приёма |
| PATCH | /appointments/:id/status | ✅ | admin, assistant | Изменить статус |
| PUT | /appointments/:id | ✅ | admin, assistant | Обновить приём |
| DELETE | /appointments/:id | ✅ | admin | Удалить приём |

#### 6.1.6. Public API (для сайта)

| Method | Endpoint | Auth | Описание |
|--------|----------|------|----------|
| GET | /public/clinics | ❌ | Список всех клиник |
| GET | /public/clinics/:slug | ❌ | Детали клиники (лендинг) |
| GET | /public/clinics/:slug/doctors | ❌ | Врачи клиники |
| POST | /public/appointments | ❌ | Создать заявку на приём |

### 6.2. API Примеры

#### POST /auth/register — Регистрация клиники

**Request:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "clinic": {
    "name": "Дента Люкс",
    "slug": "denta-lux",
    "email": "info@dentalux.am",
    "phone": "+374 98 123456",
    "city": "Yerevan",
    "address": "ул. Абовяна 10"
  },
  "admin": {
    "name": "Арам Григорян",
    "email": "admin@dentalux.am",
    "password": "SecurePass123!"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "clinic": {
      "id": "6547a1b2c3d4e5f6g7h8i9j0",
      "name": "Дента Люкс",
      "slug": "denta-lux",
      "email": "info@dentalux.am"
    },
    "user": {
      "id": "1234567890abcdef12345678",
      "name": "Арам Григорян",
      "email": "admin@dentalux.am",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation:**
- `clinic.slug`: уникальный, lowercase, только a-z, 0-9, дефис
- `admin.password`: минимум 8 символов, 1 заглавная, 1 цифра
- `clinic.email` и `admin.email`: валидный email

---

#### POST /auth/login — Авторизация

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@dentalux.am",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1234567890abcdef12345678",
      "name": "Арам Григорян",
      "email": "admin@dentalux.am",
      "role": "admin",
      "clinicId": "6547a1b2c3d4e5f6g7h8i9j0"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Неверный email или пароль"
  }
}
```

---

#### GET /appointments — Список приёмов

**Request:**
```http
GET /api/v1/appointments?date=2025-11-15&status=pending&doctorId=123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `date` (ISO 8601): фильтр по дате
- `status`: pending | confirmed | completed | cancelled
- `doctorId`: фильтр по врачу
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "app123456789",
      "patient": {
        "id": "pat123",
        "name": "Анна Петросян",
        "phone": "+374 98 111222"
      },
      "doctor": {
        "id": "doc456",
        "name": "Д-р Карен Саркисян",
        "specialization": "Терапевт"
      },
      "appointmentDate": "2025-11-15T10:00:00.000Z",
      "duration": 30,
      "status": "pending",
      "reason": "Профилактический осмотр",
      "createdAt": "2025-11-10T15:30:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

#### POST /public/appointments — Создать запись (публичный API)

**Request:**
```http
POST /api/v1/public/appointments
Content-Type: application/json

{
  "clinicSlug": "denta-lux",
  "doctorId": "doc456",
  "patient": {
    "name": "Мария Асатрян",
    "phone": "+374 98 333444",
    "email": "maria@example.com"
  },
  "appointmentDate": "2025-11-20T14:00:00.000Z",
  "reason": "Зубная боль"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "app789012345",
    "appointmentDate": "2025-11-20T14:00:00.000Z",
    "status": "pending",
    "message": "Ваша заявка принята. Клиника свяжется с вами для подтверждения."
  }
}
```

**Business Logic:**
1. Проверить существование клиники по slug
2. Проверить существование врача и что он принадлежит этой клинике
3. Проверить доступность времени (нет перекрывающихся appointments)
4. Найти пациента по телефону или создать нового
5. Создать appointment со статусом 'pending'
6. (v1.1) Отправить уведомление клинике

---

#### PATCH /appointments/:id/status — Изменить статус

**Request:**
```http
PATCH /api/v1/appointments/app123456789/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "app123456789",
    "status": "confirmed",
    "updatedAt": "2025-11-11T09:15:00.000Z"
  }
}
```

**Validation:**
- Переход статуса должен быть валидным (см. State Machine)
- Роль пользователя имеет право на изменение

**Error (400):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Нельзя изменить статус с 'completed' на 'pending'"
  }
}
```

---

### 6.3. Стандартные ошибки

**Формат ошибки (RFC 7807-inspired):**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Человекочитаемое сообщение",
    "details": {} // optional
  }
}
```

**Коды ошибок:**
| HTTP | Code | Описание |
|------|------|----------|
| 400 | VALIDATION_ERROR | Неверные данные |
| 401 | UNAUTHORIZED | Не авторизован |
| 403 | FORBIDDEN | Нет прав доступа |
| 404 | NOT_FOUND | Ресурс не найден |
| 409 | CONFLICT | Конфликт (например, slug занят) |
| 429 | RATE_LIMIT_EXCEEDED | Превышен лимит запросов |
| 500 | INTERNAL_ERROR | Внутренняя ошибка сервера |

---

## 7. БИЗНЕС-ПРОЦЕССЫ

### 7.1. Процесс регистрации клиники

```
1. Администратор заходит на hippocrates.am
2. Нажимает "Регистрация клиники"
3. Заполняет форму:
   - Данные клиники (название, slug, контакты)
   - Данные администратора (ФИО, email, пароль)
4. Система проверяет:
   ✓ Уникальность slug
   ✓ Уникальность email администратора
   ✓ Валидность данных
5. Создаётся:
   - Clinic (с базовыми настройками)
   - User (role: admin, привязан к клинике)
6. Генерируется JWT токен
7. Редирект в Dashboard клиники
```

### 7.2. Процесс онлайн-записи пациента

```
1. Пациент заходит на hippocrates.am
2. Выбирает город и клинику из списка
3. Переходит на лендинг клиники (hippocrates.am/clinic/denta-lux)
4. Видит:
   - Описание клиники
   - Список врачей с фото и специализацией
   - График работы
5. Выбирает врача
6. Выбирает дату и время (доступные слоты)
7. Заполняет форму:
   - ФИО
   - Телефон (обязательно)
   - Email (опционально)
   - Причина визита
8. Нажимает "Записаться"
9. Система:
   ✓ Проверяет доступность времени
   ✓ Ищет пациента по телефону или создаёт нового
   ✓ Создаёт Appointment (status: pending)
10. Показывает сообщение: "Заявка принята, клиника свяжется с вами"
11. (v1.1) Отправляется уведомление клинике
```

### 7.3. Процесс управления приёмами (Dashboard)

```
Сценарий: Подтверждение записи

1. Администратор логинится в Dashboard
2. Видит список новых заявок (status: pending)
3. Открывает детали заявки:
   - Пациент: Анна Петросян, +374 98 111222
   - Врач: Д-р Карен Саркисян
   - Дата: 20.11.2025, 14:00
   - Причина: Зубная боль
4. Администратор:
   - Звонит пациенту для подтверждения
   - Нажимает "Подтвердить"
5. Статус меняется: pending → confirmed
6. Запись появляется в календаре врача
7. (v1.1) Пациент получает SMS/Email подтверждение
```

```
Сценарий: Отмена записи

1. Администратор открывает приём
2. Нажимает "Отменить запись"
3. Выбирает причину (необязательно)
4. Подтверждает
5. Статус меняется: pending/confirmed → cancelled
6. Слот освобождается в календаре
7. (v1.1) Пациент получает уведомление об отмене
```

### 7.4. State Machine: Appointment Status

```
┌─────────┐
│ pending │ (начальный статус при создании через сайт)
└────┬────┘
     │
     ├──→ confirmed (admin/assistant подтверждает)
     │         │
     │         ├──→ completed (doctor/admin после приёма)
     │         │
     │         └──→ cancelled (admin отменяет)
     │
     └──→ cancelled (admin отменяет без подтверждения)
```

**Правила:**
- `pending` может перейти в: `confirmed`, `cancelled`
- `confirmed` может перейти в: `completed`, `cancelled`
- `completed` — финальный, нельзя изменить
- `cancelled` — финальный, нельзя изменить

**Доступ к изменению статуса:**
| Transition | admin | assistant | doctor |
|-----------|-------|-----------|--------|
| pending → confirmed | ✅ | ✅ | ❌ |
| pending → cancelled | ✅ | ✅ | ❌ |
| confirmed → completed | ✅ | ❌ | ✅ |
| confirmed → cancelled | ✅ | ✅ | ❌ |

---

## 8. БЕЗОПАСНОСТЬ

### 8.1. Аутентификация

**JWT (JSON Web Tokens):**
```javascript
// Payload
{
  "userId": "1234567890abcdef12345678",
  "clinicId": "6547a1b2c3d4e5f6g7h8i9j0",
  "role": "admin",
  "iat": 1699704000,
  "exp": 1700308800 // 7 дней
}

// Алгоритм: HS256
// Secret: env.JWT_SECRET (минимум 32 символа)
```

**Хеширование паролей:**
```javascript
// bcrypt
const saltRounds = 12;
const hash = await bcrypt.hash(password, saltRounds);
```

### 8.2. Авторизация (RBAC)

**Роли и права:**

| Ресурс | admin | doctor | assistant |
|--------|-------|--------|-----------|
| Clinic settings | R/W | R | R |
| Users | CRUD | R (себя) | R |
| Patients | CRUD | R (свои) | CRUD |
| Appointments | CRUD | R (свои) + U (status) | CRUD |
| Statistics | R | R (свои) | R |

**R** — Read, **W** — Write, **C** — Create, **U** — Update, **D** — Delete

### 8.3. Multi-tenancy Isolation

**Стратегия:** Row-level security через `clinicId`

**Реализация:**
```javascript
// Middleware для автоматической фильтрации по clinicId
async function tenantMiddleware(req, res, next) {
  // Получаем clinicId из JWT токена
  const { clinicId } = req.user;
  
  // Добавляем clinicId ко всем запросам к БД
  req.tenantFilter = { clinicId };
  
  next();
}

// Использование
const patients = await prisma.patient.findMany({
  where: {
    ...req.tenantFilter, // автоматически добавит clinicId
    // остальные фильтры
  }
});
```

**Важно:**
- ❌ НИ ОДИН запрос не должен возвращать данные другой клиники
- ✅ Все запросы ОБЯЗАТЕЛЬНО фильтруются по `clinicId`
- ✅ Тесты должны проверять tenant isolation

### 8.4. Защита от атак

**CSRF Protection:**
- Для публичного API (POST /public/appointments): CORS whitelist
- Для Dashboard: SameSite cookies + CSRF tokens (v1.1)

**XSS Protection:**
- Sanitize все пользовательские вводы
- Content-Security-Policy headers
- Escape HTML в React (автоматически)

**SQL/NoSQL Injection:**
- Использовать только Prisma ORM (параметризованные запросы)
- ❌ НЕ строить запросы вручную

**Rate Limiting:**
```javascript
// Глобальный лимит
100 requests / 1 minute / IP

// Для публичного API
POST /public/appointments: 5 requests / 1 minute / IP

// Для login
POST /auth/login: 5 requests / 5 minutes / IP
```

### 8.5. Логирование

**Что логировать:**
- ✅ Все аутентификации (успешные и неуспешные)
- ✅ Изменения критичных данных (пациенты, приёмы)
- ✅ Ошибки 500
- ✅ Rate limit violations

**Что НЕ логировать:**
- ❌ Пароли (даже хешированные)
- ❌ JWT токены
- ❌ Личные данные пациентов в plaintext

**Формат лога:**
```json
{
  "timestamp": "2025-11-11T10:30:00.000Z",
  "level": "info",
  "action": "appointment.created",
  "userId": "1234567890abcdef12345678",
  "clinicId": "6547a1b2c3d4e5f6g7h8i9j0",
  "resourceId": "app123456789",
  "ip": "93.187.x.x"
}
```

---

## 9. ИНФРАСТРУКТУРА И ДЕПЛОЙ

### 9.1. Development

**Требования:**
- Node.js 20 LTS
- MongoDB 7.0+ (local или MongoDB Atlas)
- npm/yarn

**Запуск:**
```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev  # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev  # http://localhost:5173
```

### 9.2. Production

**Хостинг (рекомендуется):**

| Компонент | Платформа | План |
|-----------|----------|------|
| Backend | Render.com | Starter ($7/мес) |
| Frontend | Vercel | Free tier |
| Database | MongoDB Atlas | M0 Free tier |

**Альтернативы:**
- Backend: Railway, Fly.io, DigitalOcean App Platform
- Frontend: Netlify, Cloudflare Pages
- Database: MongoDB Atlas M2 ($9/мес) для production

### 9.3. CI/CD

**GitHub Actions:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: cd backend && npm install
      - run: cd backend && npm run build
      - run: cd backend && npx prisma generate
      # Deploy to Render (автоматически при push)

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      # Deploy to Vercel (автоматически при push)
```

### 9.4. Environment Variables

**Backend (.env):**
```bash
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=file:./dev.db

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://hippocrates.am

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env):**
```bash
VITE_API_URL=https://api.hippocrates.am
```

---

## 10. ТЕСТИРОВАНИЕ

### 10.1. Стратегия тестирования

| Тип | Инструмент | Coverage Target |
|-----|------------|-----------------|
| Unit | Vitest | ≥ 70% (business logic) |
| Integration | Supertest | ≥ 60% (API endpoints) |
| E2E | Playwright | Критичные сценарии |

### 10.2. Критичные E2E сценарии

1. ✅ Регистрация клиники → вход в Dashboard
2. ✅ Создание пациента → создание приёма
3. ✅ Публичная запись: выбор клиники → врача → создание заявки
4. ✅ Смена статуса: pending → confirmed → completed
5. ✅ Календарь: просмотр приёмов, фильтрация по врачу

### 10.3. Unit тесты (примеры)

**Что тестировать:**
- Валидация данных (email, phone, slug)
- Бизнес-логика (проверка доступности времени)
- Переходы статусов (state machine)
- Tenant isolation

**Пример:**
```javascript
// backend/src/services/__tests__/appointment.service.test.js
describe('AppointmentService', () => {
  test('should not allow double booking', async () => {
    // Arrange
    const existingAppointment = {
      doctorId: 'doc123',
      appointmentDate: '2025-11-20T14:00:00Z',
      duration: 30
    };
    
    // Act & Assert
    await expect(
      appointmentService.create({
        ...existingAppointment,
        patientId: 'pat456'
      })
    ).rejects.toThrow('Time slot not available');
  });
});
```

---

## 11. ДОКУМЕНТАЦИЯ ПРОЕКТА

### 11.1. Обязательные файлы

```
Documentation/
├── README.md              # Быстрый старт
├── RULES.md               # 🔥 Главный файл для AI
├── ENVIRONMENT.md         # Что установлено, что запрещено
├── ARCHITECTURE.md        # Структура проекта
├── CODING-RULES.md        # Стандарты кодирования
├── PLAN.md                # План разработки
├── PROGRESS.md            # Прогресс (живой документ)
├── DEPLOYMENT.md          # Деплой на production
└── env.example.txt        # Пример .env
```

### 11.2. Cursor AI Rules

```
.cursor/
└── rules/
    └── rules.mdc          # Краткие правила для Cursor AI
```

**Содержит:**
- Ссылки на обязательные документы
- Критичные запреты (❌)
- Обязательные действия (✅)
- Workflow для AI

---

## 12. РИСКИ И РЕШЕНИЯ

### Риск 1: Конфликты времени записи

**Проблема:** Два пациента могут записаться на одно время через сайт одновременно.

**Решение:**
- Database-level unique constraint на (doctorId, appointmentDate, duration)
- Оптимистичная блокировка при создании
- Проверка доступности времени перед созданием

**Митигация:** Показывать реальное время обновления слотов (polling каждые 30 сек)

### Риск 2: Безопасность данных пациентов

**Проблема:** Утечка данных между клиниками (multi-tenancy).

**Решение:**
- Строгая tenant isolation через middleware
- Все запросы фильтруются по clinicId
- Автоматические тесты на tenant isolation

**Митигация:** Code review каждого API endpoint на проверку clinicId

### Риск 3: Производительность при росте

**Проблема:** Медленные запросы при 100+ клиниках.

**Решение:**
- Правильные индексы MongoDB
- Пагинация везде (default limit: 20)
- Кэширование на уровне React Query

**Митигация:** Мониторинг slow queries, оптимизация по мере роста

---

## 13. ROADMAP (После MVP)

### v1.1 (1 месяц после релиза)

- ✅ Email уведомления (подтверждение, напоминание)
- ✅ SMS уведомления (через провайдера)
- ✅ История лечения пациента
- ✅ Загрузка файлов (рентгеновские снимки)
- ✅ Экспорт данных (Excel, PDF)

### v1.2 (3 месяца)

- ✅ Онлайн-оплата (Stripe/идрам)
- ✅ Многоязычность (AM/RU/EN)
- ✅ Расширенная статистика и отчёты
- ✅ Интеграция с Google Calendar

### v1.3 (6 месяцев)

- ✅ Мобильное приложение (React Native)
- ✅ Онлайн-консультации (видеосвязь)
- ✅ Складской учёт материалов
- ✅ Финансовая отчётность

---

## 14. МЕТРИКИ УСПЕХА MVP

### 14.1. Функциональные метрики

- ✅ Регистрация клиники работает без ошибок
- ✅ Пациент может записаться через сайт
- ✅ Администратор может подтвердить/отменить запись
- ✅ Календарь показывает все приёмы корректно
- ✅ Tenant isolation: нет утечек данных между клиниками

### 14.2. Технические метрики

- ✅ API Response Time p95 ≤ 500 ms
- ✅ Page Load (LCP) p75 ≤ 2.5 sec
- ✅ Uptime ≥ 99.5%
- ✅ Error rate ≤ 0.1%
- ✅ Test coverage ≥ 70% (business logic)

### 14.3. Бизнес-метрики

- ✅ 10+ клиник зарегистрировано
- ✅ 50+ пациентов записалось через сайт
- ✅ Feedback от 5+ клиник собран
- ✅ 0 критичных багов в production

---

## 15. КРИТЕРИИ ГОТОВНОСТИ (Definition of Done)

### Этап можно считать завершённым если:

1. ✅ Все задачи этапа выполнены
2. ✅ Код прошёл code review
3. ✅ Написаны тесты (unit + integration)
4. ✅ Тесты проходят (coverage ≥ 70%)
5. ✅ Нет TypeScript ошибок
6. ✅ Нет ESLint warnings
7. ✅ Документация обновлена (PROGRESS.md)
8. ✅ Демо работает без ошибок
9. ✅ Деплой на staging успешен

---

**Создан:** 11.11.2025  
**Версия:** 1.0 (MVP)  
**Следующее обновление:** После завершения Этапа 1  
**Статус:** ✅ Готов к разработке

---

**Команда:**
- Product Owner: Neetreino Specialist
- Lead Developer: [TBD]
- AI Assistant: Claude (Anthropic)

**Контакты:** info@hippocrates.am

