# 🦷 Hippocrates Dental — SaaS-платформа для стоматологических клиник

> Облачная CRM-система с multi-tenancy и публичными лендингами для онлайн-записи пациентов.

[![Status](https://img.shields.io/badge/status-in_development-yellow)](https://github.com/your-org/hippocrates)
[![Node](https://img.shields.io/badge/node-20.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-7.0-green)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/react-18.3-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)

---

## 🎯 О проекте

**Hippocrates Dental** — это SaaS-платформа, которая объединяет:

1. **Админ-панель (Dashboard)** — управление клиникой, врачами, пациентами, расписанием
2. **Публичный веб-сайт** — каталог клиник + индивидуальные лендинги для онлайн-записи

### Для кого
- ✅ Малые и средние стоматологические клиники (1-10 врачей)
- ✅ Администраторы и врачи
- ✅ Пациенты (онлайн-запись без звонков)

### Ключевые возможности MVP
- 🏥 Multi-tenancy (полная изоляция данных между клиниками)
- 👥 Управление сотрудниками, пациентами, приёмами
- 📅 Календарь расписания врачей
- 🌐 Публичные лендинги клиник
- 📝 Онлайн-запись пациентов
- 🔐 JWT аутентификация + bcrypt

---

## 🚀 Быстрый старт

### Требования
- Node.js 20 LTS
- MongoDB 7.0+ (или MongoDB Atlas)
- npm или yarn

### Установка

```bash
# 1. Клонировать репозиторий
git clone https://github.com/your-org/hippocrates.git
cd hippocrates

# 2. Backend
cd backend
npm install
cp .env.example .env
# Отредактировать .env (DATABASE_URL, JWT_SECRET)
npx prisma generate
npx prisma db push
npm run dev
# Backend: http://localhost:5000

# 3. Frontend (в новом терминале)
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:5000" > .env
npm run dev
# Frontend: http://localhost:5173
```

### Первый вход
Откройте `http://localhost:5173` и зарегистрируйте первую клинику.

---

## 📚 Документация

### 🔥 Для AI и разработчиков

**Читай в порядке приоритета:**

1. **[Documentation/RULES.md](Documentation/RULES.md)** 🔥🔥🔥 — **ГЛАВНЫЙ** файл с правилами
2. **[Documentation/ENVIRONMENT.md](Documentation/ENVIRONMENT.md)** 🔥 — Что установлено, запреты
3. **[Documentation/ARCHITECTURE.md](Documentation/ARCHITECTURE.md)** — Структура проекта
4. **[Documentation/CODING-RULES.md](Documentation/CODING-RULES.md)** — Стандарты кодирования
5. **[Documentation/PROGRESS.md](Documentation/PROGRESS.md)** — Текущий прогресс

### Для понимания проекта

6. **[TECHNICAL-SPEC.md](TECHNICAL-SPEC.md)** — Полное техническое задание (800+ строк)
7. **[Documentation/PLAN.md](Documentation/PLAN.md)** — План разработки по этапам
8. **[Documentation/README.md](Documentation/README.md)** — Обзор документации

### Для деплоя

9. **[Documentation/DEPLOYMENT.md](Documentation/DEPLOYMENT.md)** — Инструкции по деплою
10. **[Documentation/env.example.txt](Documentation/env.example.txt)** — Пример конфигурации

---

## 🏗️ Технологии

### Backend
- **Node.js 20** + Express.js
- **JavaScript** (ES6 modules)
- **Prisma ORM** + MongoDB
- **JWT** + bcrypt (auth)
- **Joi** (validation)

### Frontend
- **React 18.3** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS** (styles)
- **React Query** (data fetching)
- **Zustand** (state management)
- **React Router** (routing)

### Infrastructure
- **MongoDB Atlas** (database)
- **Render** (backend hosting)
- **Vercel** (frontend hosting)

---

## 📁 Структура проекта

```
hippocrates/
├── frontend/           # React SPA (TypeScript + Vite + Tailwind)
├── backend/            # Express API (JavaScript + Prisma + MongoDB)
├── Documentation/      # 📚 Вся документация
├── .cursor/
│   └── rules/
│       └── rules.mdc   # Правила для Cursor AI
├── TECHNICAL-SPEC.md   # Полное ТЗ
└── README.md           # Этот файл
```

---

## 🛠️ Команды

### Development
```bash
# Backend
cd backend
npm run dev          # Запустить dev сервер
npm test             # Запустить тесты
npm run lint         # Проверить код

# Frontend
cd frontend
npm run dev          # Запустить dev сервер
npm run build        # Собрать production
npm run type-check   # Проверить TypeScript
```

### Database
```bash
cd backend
npx prisma generate       # Сгенерировать Prisma Client
npx prisma db push        # Применить схему к БД
npx prisma studio         # Открыть GUI для БД
npm run db:seed           # Заполнить тестовыми данными
```

---

## 📊 Прогресс разработки

| Этап | Статус | Прогресс |
|------|--------|----------|
| Документация | ✅ Завершено | 100% |
| Этап 1: Фундамент | ⏳ Ожидает | 0% |
| Этап 2: Backend Auth | ⏳ Ожидает | 0% |
| Этап 3: Backend CRUD | ⏳ Ожидает | 0% |
| Этап 4: Public API | ⏳ Ожидает | 0% |
| Этап 5: Frontend Dashboard | ⏳ Ожидает | 0% |
| Этап 6: Frontend Public | ⏳ Ожидает | 0% |

**Детали:** См. [Documentation/PROGRESS.md](Documentation/PROGRESS.md)

---

## 🎯 MVP Roadmap

### v1.0 (MVP) — 6 недель
- ✅ Базовая CRM для клиник
- ✅ Публичные лендинги
- ✅ Онлайн-запись пациентов
- ✅ Multi-tenancy

### v1.1 (1-2 месяца)
- 📧 Email/SMS уведомления
- 📄 История лечения
- 📤 Экспорт данных

### v1.2 (3-4 месяца)
- 💳 Онлайн-оплата
- 🌐 Многоязычность (AM/RU/EN)
- 📊 Расширенная статистика

### v1.3 (6 месяцев)
- 📱 Мобильное приложение
- 🎥 Онлайн-консультации

---

## 🤝 Contributing

1. Прочитай [Documentation/RULES.md](Documentation/RULES.md) 🔥
2. Прочитай [Documentation/CODING-RULES.md](Documentation/CODING-RULES.md)
3. Создай feature branch
4. Сделай изменения
5. Напиши тесты
6. Отправь Pull Request
7. Обнови [Documentation/PROGRESS.md](Documentation/PROGRESS.md)

---

## 📞 Контакты

**Email:** info@hippocrates.am  
**Website:** https://hippocrates.am  
**Support:** support@hippocrates.am

---

## 📄 Лицензия

Proprietary — Все права защищены.

---

**Версия:** 1.0.0 (MVP)  
**Дата:** 11.11.2025  
**Статус:** 🚧 В разработке

---

**Команда:**
- Product Owner: Neetreino Specialist
- Lead Developer: [TBD]
- AI Assistant: Claude (Anthropic)

