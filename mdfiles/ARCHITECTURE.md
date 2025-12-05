# АРХИТЕКТУРА ПРОЕКТА

> **Цель:** Понять ГДЕ что находится, ПОЧЕМУ так устроено, и КАК всё работает вместе.

---

## 🗂️ СТРУКТУРА ПРОЕКТА

```
hippocrates/
│
├── frontend/                    # 🌐 React SPA (SSR/CSR)
│   ├── src/
│   │   ├── components/         # UI компоненты
│   │   │   ├── common/        # Переиспользуемые (Button, Input, Card)
│   │   │   ├── dashboard/     # Dashboard-специфичные
│   │   │   └── public/        # Public site компоненты
│   │   │
│   │   ├── pages/             # Страницы приложения
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── dashboard/     # Админ-панель
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Patients.tsx
│   │   │   │   ├── Appointments.tsx
│   │   │   │   ├── Staff.tsx
│   │   │   │   └── Settings.tsx
│   │   │   └── public/        # Публичный сайт
│   │   │       ├── Home.tsx
│   │   │       ├── Clinics.tsx
│   │   │       └── ClinicPage.tsx
│   │   │
│   │   ├── services/          # API clients
│   │   │   ├── api.ts         # Axios instance
│   │   │   ├── auth.service.ts
│   │   │   ├── patient.service.ts
│   │   │   ├── appointment.service.ts
│   │   │   └── user.service.ts
│   │   │
│   │   ├── store/             # Zustand stores
│   │   │   ├── useAuthStore.ts
│   │   │   └── useUIStore.ts
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePatients.ts
│   │   │   └── useAppointments.ts
│   │   │
│   │   ├── utils/             # Утилиты
│   │   │   ├── formatters.ts  # Форматирование дат, телефонов
│   │   │   ├── validators.ts  # Валидация форм
│   │   │   └── constants.ts   # Константы
│   │   │
│   │   ├── types/             # TypeScript типы
│   │   │   ├── api.types.ts
│   │   │   ├── models.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── App.tsx            # Главный компонент
│   │   ├── main.tsx           # Entry point
│   │   └── router.tsx         # React Router config
│   │
│   ├── public/                # Статика
│   │   ├── logo.svg
│   │   └── favicon.ico
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                     # 🔧 Express REST API
│   ├── src/
│   │   ├── controllers/       # Route handlers (тонкие)
│   │   │   ├── auth.controller.js
│   │   │   ├── clinic.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── patient.controller.js
│   │   │   ├── appointment.controller.js
│   │   │   └── public.controller.js
│   │   │
│   │   ├── services/          # Бизнес-логика (толстые)
│   │   │   ├── auth.service.js
│   │   │   ├── clinic.service.js
│   │   │   ├── user.service.js
│   │   │   ├── patient.service.js
│   │   │   └── appointment.service.js
│   │   │
│   │   ├── middlewares/       # Middleware
│   │   │   ├── auth.middleware.js      # JWT проверка
│   │   │   ├── tenant.middleware.js    # Multi-tenancy
│   │   │   ├── validation.middleware.js # Joi validation
│   │   │   ├── error.middleware.js     # Error handler
│   │   │   └── rate-limit.middleware.js
│   │   │
│   │   ├── routes/            # API маршруты
│   │   │   ├── auth.routes.js
│   │   │   ├── clinic.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── patient.routes.js
│   │   │   ├── appointment.routes.js
│   │   │   ├── public.routes.js
│   │   │   └── index.js       # Объединение routes
│   │   │
│   │   ├── utils/             # Утилиты
│   │   │   ├── jwt.util.js
│   │   │   ├── hash.util.js
│   │   │   └── response.util.js
│   │   │
│   │   ├── config/            # Конфигурация
│   │   │   ├── database.js
│   │   │   └── app.js
│   │   │
│   │   ├── validators/        # Joi schemas
│   │   │   ├── auth.validator.js
│   │   │   ├── patient.validator.js
│   │   │   └── appointment.validator.js
│   │   │
│   │   ├── app.js             # Express app
│   │   └── server.js          # Server entry point
│   │
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema
│   │   └── seed.js            # Test data
│   │
│   ├── .env.example
│   ├── .eslintrc.js
│   ├── .prettierrc
│   └── package.json
│
├── Documentation/               # 📚 Документация (ты здесь)
│   ├── README.md
│   ├── TECHNICAL-SPEC.md
│   ├── RULES.md
│   ├── ENVIRONMENT.md
│   ├── ARCHITECTURE.md         (этот файл)
│   ├── CODING-RULES.md
│   ├── PLAN.md
│   ├── PROGRESS.md
│   ├── DEPLOYMENT.md
│   └── env.example.txt
│
├── .cursor/
│   └── rules/
│       └── rules.mdc           # Cursor AI rules
│
├── .gitignore
└── README.md                    # Root README
```

---

## 🎯 ПРИНЦИПЫ АРХИТЕКТУРЫ

### 1. Монолит-репозиторий

```
hippocrates/
├── frontend/    # Отдельный проект
└── backend/     # Отдельный проект
```

**Почему:**
- Проще управление версиями
- Единый репозиторий
- Общая документация

**Не микросервисы потому что:**
- Over-engineering для MVP
- Сложность деплоя
- Не нужно при < 100 клиниках

### 2. Чистая архитектура (упрощённая)

```
┌─────────────────────────────────────┐
│   Presentation (Frontend)           │
│   - React Components                │
│   - Pages                           │
│   - API Services                    │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│   API Layer (Backend)               │
│   - Controllers (тонкие)            │
│   - Routes                          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Business Logic Layer              │
│   - Services (толстые)              │
│   - Validation                      │
│   - Business rules                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Layer                        │
│   - Prisma ORM                      │
│   - MongoDB                         │
└─────────────────────────────────────┘
```

**Правила:**
- Controllers — только роутинг и вызов services
- Services — вся бизнес-логика
- Prisma — единственный способ работы с БД
- Frontend — взаимодействует только через API

### 3. Multi-tenancy (Row-level isolation)

**Стратегия:** Каждая запись содержит `clinicId`

```javascript
// Автоматическая фильтрация через middleware
const patients = await prisma.patient.findMany({
  where: {
    clinicId: req.user.clinicId, // ✅ ВСЕГДА!
    // остальные фильтры
  }
});
```

**Важно:**
- ❌ НЕТ отдельных БД для каждой клиники
- ✅ Одна БД, разделение через `clinicId`
- ✅ Middleware автоматически добавляет фильтр
- ✅ Тесты проверяют tenant isolation

---

## 📦 ОПИСАНИЕ МОДУЛЕЙ

### Frontend: `frontend/`

#### `src/components/` — UI Компоненты

**common/** — Переиспользуемые компоненты
```typescript
// components/common/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick
}) => {
  const classes = cn(
    'rounded font-medium transition',
    variantClasses[variant],
    sizeClasses[size]
  );
  
  return <button className={classes} onClick={onClick}>{children}</button>;
};
```

**Что здесь:**
- Button, Input, Card, Modal
- Spinner, Badge, Alert
- Table, Pagination

**Куда писать:**
- Новый переиспользуемый компонент → `common/NewComponent.tsx`

---

**dashboard/** — Dashboard-специфичные компоненты
```typescript
// components/dashboard/PatientCard.tsx
export const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => {
  return (
    <Card>
      <h3>{patient.name}</h3>
      <p>{patient.phone}</p>
      <Button onClick={() => navigate(`/patients/${patient.id}`)}>
        Открыть
      </Button>
    </Card>
  );
};
```

**Что здесь:**
- PatientCard, AppointmentCard
- Calendar, DashboardStats
- Sidebar, Header

---

**public/** — Публичный сайт компоненты
```typescript
// components/public/ClinicCard.tsx
export const ClinicCard: React.FC<{ clinic: Clinic }> = ({ clinic }) => {
  return (
    <Link to={`/clinic/${clinic.slug}`}>
      <Card>
        <img src={clinic.logo} alt={clinic.name} />
        <h3>{clinic.name}</h3>
        <p>{clinic.city}</p>
      </Card>
    </Link>
  );
};
```

**Что здесь:**
- ClinicCard, DoctorCard
- AppointmentForm
- Hero, Footer

---

#### `src/pages/` — Страницы

**Структура страницы:**
```typescript
// pages/dashboard/Patients.tsx
export const PatientsPage: React.FC = () => {
  const { data: patients, isLoading } = usePatients();
  
  if (isLoading) return <Spinner />;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Пациенты</h1>
      <div className="grid grid-cols-3 gap-4">
        {patients?.map(patient => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
};
```

**Что здесь:**
- auth/Login, auth/Register
- dashboard/Dashboard, dashboard/Patients, dashboard/Appointments
- public/Home, public/Clinics, public/ClinicPage

---

#### `src/services/` — API Clients

**Структура:**
```typescript
// services/patient.service.ts
import api from './api';

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    const { data } = await api.get('/patients');
    return data.data;
  },
  
  getById: async (id: string): Promise<Patient> => {
    const { data } = await api.get(`/patients/${id}`);
    return data.data;
  },
  
  create: async (patient: CreatePatientDTO): Promise<Patient> => {
    const { data } = await api.post('/patients', patient);
    return data.data;
  },
  
  update: async (id: string, patient: UpdatePatientDTO): Promise<Patient> => {
    const { data } = await api.put(`/patients/${id}`, patient);
    return data.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  }
};
```

**Важно:**
- Используй Axios instance (`services/api.ts`)
- Обрабатывай ошибки на уровне interceptor
- Возвращай типизированные данные

---

#### `src/store/` — Zustand State

**Когда использовать:**
- Глобальное состояние UI (sidebar открыт/закрыт)
- Аутентификация (текущий пользователь, токен)
- Настройки приложения

**Когда НЕ использовать:**
- Данные с сервера → используй React Query

**Пример:**
```typescript
// store/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  
  setUser: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));
```

---

### Backend: `backend/`

#### `src/controllers/` — Контроллеры

**Принцип:** Тонкие контроллеры — только роутинг

```javascript
// controllers/patient.controller.js
const patientService = require('../services/patient.service');

async function getAll(req, res, next) {
  try {
    const patients = await patientService.findAll(req.user.clinicId);
    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const patient = await patientService.create(req.user.clinicId, req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, create };
```

**Правила:**
- ❌ НЕТ бизнес-логики в контроллере
- ✅ Только вызов service + обработка response
- ✅ try/catch + передача в error middleware

---

#### `src/services/` — Сервисы

**Принцип:** Толстые сервисы — вся бизнес-логика

```javascript
// services/patient.service.js
const { prisma } = require('../config/database');

async function findAll(clinicId) {
  return await prisma.patient.findMany({
    where: { clinicId },
    orderBy: { createdAt: 'desc' }
  });
}

async function create(clinicId, data) {
  // Валидация
  if (!data.phone) {
    throw new Error('Phone is required');
  }
  
  // Проверка уникальности
  const existing = await prisma.patient.findFirst({
    where: { clinicId, phone: data.phone }
  });
  
  if (existing) {
    throw new Error('Patient with this phone already exists');
  }
  
  // Создание
  return await prisma.patient.create({
    data: {
      ...data,
      clinicId
    }
  });
}

module.exports = { findAll, create };
```

**Правила:**
- ✅ Вся бизнес-логика здесь
- ✅ Валидация
- ✅ Проверка прав доступа
- ✅ ВСЕГДА фильтровать по `clinicId`

---

#### `src/middlewares/` — Middleware

**auth.middleware.js** — JWT проверка
```javascript
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No token provided' }
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, clinicId, role }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid token' }
    });
  }
}
```

---

**tenant.middleware.js** — Multi-tenancy
```javascript
function tenantMiddleware(req, res, next) {
  // Добавляем clinicId фильтр из JWT
  req.tenantFilter = { clinicId: req.user.clinicId };
  next();
}

// Использование в routes
router.use(authenticate);      // Сначала проверяем JWT
router.use(tenantMiddleware);  // Затем добавляем tenant фильтр
```

---

**validation.middleware.js** — Joi validation
```javascript
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message
        }
      });
    }
    
    next();
  };
};
```

---

## 🔄 ПОТОКИ ДАННЫХ

### Создание пациента (пример полного цикла)

```
1. User action (Frontend)
   └─> PatientForm.tsx: onSubmit()
   
2. API call
   └─> patientService.create(data)
       └─> axios.post('/api/patients', data)
   
3. Backend: Controller
   └─> patient.controller.create()
       ├─> Получает req.body
       ├─> Получает req.user.clinicId (из JWT)
       └─> Вызывает patientService.create(clinicId, data)
   
4. Backend: Service
   └─> patient.service.create(clinicId, data)
       ├─> Валидация данных
       ├─> Проверка уникальности телефона
       ├─> prisma.patient.create({ data: { ...data, clinicId } })
       └─> return patient
   
5. Backend: Response
   └─> res.status(201).json({ success: true, data: patient })
   
6. Frontend: Update UI
   └─> React Query автоматически обновляет кэш
   └─> PatientList перерисовывается
```

---

## 🗄️ БАЗА ДАННЫХ

### Схема БД (Prisma)

**Основные модели:**
- `Clinic` — клиника
- `User` — сотрудники (admin, doctor, assistant)
- `Patient` — пациенты
- `Appointment` — приёмы

**Связи:**
```
Clinic
  └── User (many)
  └── Patient (many)
  └── Appointment (many)

Appointment
  ├── Clinic (one)
  ├── Doctor/User (one)
  └── Patient (one)
```

**Индексы:**
```prisma
@@index([clinicId])
@@index([doctorId])
@@index([appointmentDate])
@@index([status])
```

**Детали:** См. `TECHNICAL-SPEC.md` → раздел 5

---

## 🚀 ГДЕ ЧТО МЕНЯТЬ

### Таблица быстрого поиска:

| Что нужно сделать | Где менять | Файл |
|-------------------|-----------|------|
| Добавить API endpoint | Backend | `routes/*.routes.js` + `controllers/*.controller.js` |
| Добавить бизнес-логику | Backend | `services/*.service.js` |
| Добавить валидацию | Backend | `validators/*.validator.js` |
| Добавить страницу | Frontend | `pages/**/*.tsx` |
| Добавить UI компонент | Frontend | `components/common/*.tsx` |
| Добавить API call | Frontend | `services/*.service.ts` |
| Добавить глобальное состояние | Frontend | `store/use*Store.ts` |
| Изменить схему БД | Backend | `prisma/schema.prisma` → npx prisma db push |
| Добавить middleware | Backend | `middlewares/*.middleware.js` |
| Изменить роутинг | Frontend | `router.tsx` |

---

## ✅ CHECKLIST ПРИ СОЗДАНИИ НОВОЙ ФИЧИ

### Backend (API endpoint):
- [ ] Controller — тонкий слой (только роутинг)
- [ ] Service — вся логика
- [ ] Валидация (Joi schema)
- [ ] Фильтрация по `clinicId` (ОБЯЗАТЕЛЬНО!)
- [ ] Обработка ошибок (try/catch)
- [ ] Возвращает стандартный формат ({ success, data })

### Frontend (компонент/страница):
- [ ] Используешь React Query для API
- [ ] Используешь Zustand для UI state (если нужно)
- [ ] TypeScript типы для всех данных
- [ ] Обработка loading/error состояний
- [ ] Компонент < 200 строк (иначе разбей)

---

## 📋 SUMMARY

### Основные правила:
1. ✅ Controllers — тонкие, Services — толстые
2. ✅ ВСЕГДА фильтруй по `clinicId`
3. ✅ Только Prisma для БД
4. ✅ React Query для API calls
5. ✅ Zustand для UI state
6. ✅ Маленькие функции (< 50 строк)
7. ✅ Маленькие файлы (< 400 строк)
8. ✅ TypeScript strict mode (frontend)

---

**Последнее обновление:** 11.11.2025  
**Версия:** 1.0  
**Следующий review:** При появлении новых модулей или изменении структуры

