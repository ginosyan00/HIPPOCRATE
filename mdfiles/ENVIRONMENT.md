# ОКРУЖЕНИЕ ПРОЕКТА — Что установлено и что запрещено

> ⚠️ **ДЛЯ AI**: Читай ОБЯЗАТЕЛЬНО перед началом работы!  
> Здесь описано что УЖЕ установлено и что НЕЛЬЗЯ менять.

---

## ✅ ЧТО УЖЕ УСТАНОВЛЕНО

### Development Environment

| Инструмент | Версия | Статус |
|------------|--------|--------|
| **Node.js** | 20 LTS | ✅ Установлен |
| **npm** | 10.x | ✅ Установлен |
| **MongoDB** | 7.0+ | ✅ Установлен (локально или Atlas) |

**❌ НЕ переустанавливай эти инструменты!**

---

## 📦 ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Backend

**Обязательно используй:**

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `express` | ^4.18.0 | Web framework |
| `@prisma/client` | ^5.7.0 | Database ORM |
| `prisma` | ^5.7.0 | Prisma CLI |
| `jsonwebtoken` | ^9.0.0 | JWT auth |
| `bcrypt` | ^5.1.0 | Password hashing |
| `joi` | ^17.11.0 | Validation |
| `helmet` | ^7.1.0 | Security headers |
| `cors` | ^2.8.5 | CORS middleware |
| `dotenv` | ^16.3.0 | Environment variables |

**Dev dependencies:**
| Пакет | Назначение |
|-------|------------|
| `nodemon` | Dev server hot reload |
| `eslint` | Code linting |
| `prettier` | Code formatting |
| `vitest` | Unit testing |
| `supertest` | API testing |

### Frontend

**Обязательно используй:**

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `react` | ^18.3.0 | UI library |
| `react-dom` | ^18.3.0 | React DOM |
| `typescript` | ^5.3.0 | Type safety |
| `vite` | ^5.0.0 | Build tool |
| `tailwindcss` | ^3.4.0 | CSS framework |
| `@tanstack/react-query` | ^5.0.0 | Data fetching |
| `zustand` | ^4.4.0 | State management |
| `react-router-dom` | ^6.20.0 | Routing |
| `axios` | ^1.6.0 | HTTP client |
| `react-hook-form` | ^7.48.0 | Form management |
| `zod` | ^3.22.0 | Schema validation |

**Dev dependencies:**
| Пакет | Назначение |
|-------|------------|
| `@vitejs/plugin-react` | Vite React plugin |
| `eslint` | Code linting |
| `prettier` | Code formatting |
| `@types/react` | TypeScript types |
| `@types/node` | Node types |
| `vitest` | Unit testing |
| `@testing-library/react` | React testing |
| `playwright` | E2E testing |

---

## 🚫 ЧТО ЗАПРЕЩЕНО

### Инфраструктура

❌ **НЕ используй:**
- PostgreSQL, MySQL, MongoDB (только SQLite для MVP!)
- Redis (не нужен для MVP)
- RabbitMQ, Kafka (over-engineering)
- Docker в development (только для production)

❌ **НЕ переустанавливай:**
- Node.js (уже установлен)
- MongoDB (уже установлен)
- npm (уже установлен)

❌ **НЕ меняй:**
- Мажорные версии пакетов без согласования
- Database provider в Prisma (только MongoDB!)
- Build tool (только Vite для frontend)

### Backend Framework

❌ **НЕ используй вместо Express:**
- NestJS (over-engineering для MVP)
- Fastify (не нужна extra скорость)
- Koa (меньше экосистема)
- Hapi (устарел)

❌ **НЕ используй вместо JavaScript:**
- TypeScript для backend (решили оставить JS для простоты MVP)
- Python, Go, Rust (разные языки — сложность)

### Frontend Framework

❌ **НЕ используй вместо React:**
- Next.js (избыточно для SPA)
- Vue.js (другая экосистема)
- Angular (over-engineering)
- Svelte (меньше библиотек)

❌ **НЕ используй вместо Vite:**
- Webpack (медленнее)
- Create React App (устарел)
- Parcel (меньше контроль)

### Database

✅ **ИСПОЛЬЗУЙ SQLite для MVP:**
- Простая файловая БД, не требует установки сервера
- Prisma отлично поддерживает SQLite
- Для production можно мигрировать на PostgreSQL
- Firebase (vendor lock-in) — не используй

❌ **НЕ пиши SQL вручную:**
- Только через Prisma ORM
- Никаких raw queries
- Никаких нативных SQL запросов

### State Management

❌ **НЕ используй вместо Zustand:**
- Redux (over-engineering)
- MobX (сложнее)
- Context API везде (производительность)
- Recoil (experimental)

### Styling

❌ **НЕ используй вместо Tailwind:**
- CSS Modules (больше кода)
- Styled Components (runtime overhead)
- Emotion (то же самое)
- Plain CSS (нет консистентности)

❌ **НЕ используй:**
- UI библиотеки (Material-UI, Ant Design) — избыточны
- CSS-in-JS (кроме Tailwind)
- Sass/Less (не нужно с Tailwind)

---

## ✅ ОБЯЗАТЕЛЬНО ИСПОЛЬЗУЙ

### Database

✅ **ТОЛЬКО Prisma + SQLite:**
```javascript
// ✅ ПРАВИЛЬНО
const patients = await prisma.patient.findMany({
  where: { clinicId: 'clinic123' }
});

// ❌ НЕПРАВИЛЬНО — прямые SQL запросы
const db = require('sqlite3');
db.all('SELECT * FROM patients', callback);
```

### Backend Structure

✅ **ТОЛЬКО Express + Services:**
```javascript
// ✅ ПРАВИЛЬНО — Thin controllers
// controllers/patient.controller.js
async function getPatients(req, res) {
  const patients = await patientService.findAll(req.user.clinicId);
  res.json({ success: true, data: patients });
}

// services/patient.service.js
async function findAll(clinicId) {
  return await prisma.patient.findMany({
    where: { clinicId }
  });
}

// ❌ НЕПРАВИЛЬНО — Business logic в контроллере
async function getPatients(req, res) {
  const patients = await prisma.patient.findMany({
    where: { clinicId: req.user.clinicId }
  });
  res.json(patients);
}
```

### Frontend Structure

✅ **ТОЛЬКО React Query + Zustand:**
```typescript
// ✅ ПРАВИЛЬНО — React Query для API
const { data, isLoading } = useQuery('patients', fetchPatients);

// ✅ ПРАВИЛЬНО — Zustand для UI state
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));

// ❌ НЕПРАВИЛЬНО — fetch в useEffect
useEffect(() => {
  fetch('/api/patients')
    .then(res => res.json())
    .then(data => setPatients(data));
}, []);
```

### TypeScript (Frontend ТОЛЬКО)

✅ **Strict mode включён:**
```typescript
// ✅ ПРАВИЛЬНО
interface Patient {
  id: string;
  name: string;
  phone: string;
}

const patient: Patient = {
  id: '123',
  name: 'John',
  phone: '+374 98 123456'
};

// ❌ НЕПРАВИЛЬНО
const patient: any = {
  id: '123',
  name: 'John'
};
```

### Validation

✅ **Backend: Joi, Frontend: Zod:**
```javascript
// Backend (Joi)
const createPatientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().required(),
});

// Frontend (Zod)
const patientSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string(),
});
```

---

## 🛠️ ИНСТРУМЕНТЫ РАЗРАБОТКИ

### Code Quality

✅ **Используй обязательно:**
- **ESLint** — линтинг (настроен в проекте)
- **Prettier** — форматирование (настроен в проекте)
- **TypeScript** — type checking (только frontend)

**Команды:**
```bash
# Backend
npm run lint          # Проверить код
npm run lint:fix      # Исправить автоматически
npm run format        # Prettier

# Frontend
npm run lint
npm run type-check    # TypeScript
npm run format
```

### Testing

✅ **Используй:**
- **Vitest** — unit/integration tests
- **Supertest** — API tests (backend)
- **Testing Library** — React component tests (frontend)
- **Playwright** — E2E tests

**Команды:**
```bash
npm test              # Запустить тесты
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## 🔐 БЕЗОПАСНОСТЬ

### Environment Variables

✅ **ОБЯЗАТЕЛЬНО используй .env:**
```bash
# backend/.env (НЕ коммитить!)
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/hippocrates
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

✅ **ОБЯЗАТЕЛЬНО создай .env.example:**
```bash
# backend/.env.example (коммитить!)
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/hippocrates
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

❌ **НИКОГДА не коммить:**
- `.env` файлы
- Пароли, токены, API keys
- Секреты любого рода

### Passwords

✅ **ТОЛЬКО bcrypt:**
```javascript
// ✅ ПРАВИЛЬНО
const bcrypt = require('bcrypt');
const saltRounds = 12;
const hash = await bcrypt.hash(password, saltRounds);

// ❌ НЕПРАВИЛЬНО
const crypto = require('crypto');
const hash = crypto.createHash('md5').update(password).digest('hex');
```

### JWT

✅ **ТОЛЬКО jsonwebtoken:**
```javascript
// ✅ ПРАВИЛЬНО
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId, clinicId, role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// ❌ НЕПРАВИЛЬНО (без expiry)
const token = jwt.sign({ userId }, 'hardcoded-secret');
```

---

## 📋 CHECKLIST ПЕРЕД НАЧАЛОМ РАБОТЫ

### Проверь что установлено:

```bash
# Node.js
node --version  # должен быть v20.x.x

# npm
npm --version   # должен быть 10.x.x

# MongoDB (если локально)
mongosh --version  # должен быть 2.x.x или MongoDB Atlas URL
```

### Проверь что запущено:

```bash
# Backend
cd backend
npm run dev  # http://localhost:5000

# Frontend
cd frontend  
npm run dev  # http://localhost:5173

# MongoDB (если локально)
# Должен быть запущен на localhost:27017
# Или использовать MongoDB Atlas
```

---

## 🚀 НАСТРОЙКА ОКРУЖЕНИЯ

### Первый запуск (один раз):

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env
# Отредактировать .env (DATABASE_URL, JWT_SECRET)
npx prisma generate
npx prisma db push
npm run dev

# 2. Frontend
cd ../frontend
npm install
# Создать .env
echo "VITE_API_URL=http://localhost:5000" > .env
npm run dev
```

### Обновление зависимостей (редко):

```bash
# ⚠️ ОСТОРОЖНО! Только с разрешения
npm update        # Обновить minor/patch версии
npm outdated      # Посмотреть устаревшие

# ❌ НЕ делай без согласования:
npm install package@latest  # Мажорное обновление
```

---

## 🐛 TROUBLESHOOTING

### SQLite файл не создается

```bash
# Проверить путь к файлу БД
# В .env должно быть:
DATABASE_URL=file:./dev.db

# SQLite автоматически создаст файл при первом запуске
# Проверить что файл dev.db появился в папке backend/
```

### Prisma ошибки

```bash
# Пересоздать Prisma Client
cd backend
npx prisma generate

# Применить схему к БД
npx prisma db push

# Открыть Prisma Studio (GUI)
npx prisma studio
```

### Port already in use

```bash
# Backend (порт 5000 занят)
# Убей процесс:
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5000 | xargs kill -9
```

### Ошибки TypeScript (Frontend)

```bash
cd frontend
npm run type-check  # Проверить ошибки

# Если нужно, переустанови types
npm install -D @types/react @types/node
```

---

## 💡 ВАЖНЫЕ ЗАМЕТКИ

### 1. Не меняй стек без крайней необходимости

Текущий стек выбран для:
- ✅ Быстрой разработки MVP
- ✅ Простоты поддержки
- ✅ Единого языка (JavaScript/TypeScript)
- ✅ Богатой экосистемы

### 2. SQLite для MVP

**Почему SQLite для MVP:**
- Не требует установки отдельного сервера
- Простой файл на диске — легко переносить
- Быстрый старт разработки
- Prisma отлично поддерживает SQLite
- Для production можно мигрировать на PostgreSQL

**Ограничения SQLite:**
- Один writer одновременно (но для MVP это ОК)
- До ~100k записей работает отлично
- Concurrent connections ограничены

### 3. Vite vs Webpack

**Почему Vite:**
- Мгновенный HMR
- Быстрая сборка
- Out-of-the-box TypeScript
- Меньше конфигурации

**НЕ переходи на Webpack** — нет причин.

---

**Последнее обновление:** 11.11.2025  
**Версия:** 1.0  
**Следующий review:** При изменении инфраструктуры или добавлении инструментов

