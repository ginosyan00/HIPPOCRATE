# Hippocrates Dental - Backend API

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Настройка .env
cp .env.example .env
# Отредактируйте .env файл

# Генерация Prisma Client
npm run prisma:generate

# Применение миграций
npm run prisma:migrate

# Запуск dev сервера
npm run dev
```

## 📁 Структура проекта

```
backend/
├── src/
│   ├── config/         # Конфигурация
│   ├── controllers/    # Контроллеры (тонкие)
│   ├── services/       # Сервисы (бизнес-логика)
│   ├── middlewares/    # Middleware
│   ├── routes/         # API маршруты
│   ├── validators/     # Joi schemas
│   ├── utils/          # Утилиты
│   ├── app.js          # Express app
│   └── server.js       # Server entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── .env                # Environment variables
└── package.json
```

## 🛠️ Команды

```bash
# Development
npm run dev              # Запустить dev сервер (nodemon)
npm start                # Запустить production сервер

# Database
npm run prisma:generate  # Генерация Prisma Client
npm run prisma:migrate   # Применить миграции
npm run prisma:studio    # Открыть Prisma Studio

# Code Quality
npm run lint             # Проверить код
npm run lint:fix         # Исправить код автоматически
npm run format           # Форматирование (Prettier)
```

## 🔑 Переменные окружения

См. `.env.example` для списка всех переменных.

**Критичные:**
- `DATABASE_URL` - путь к SQLite файлу
- `JWT_SECRET` - секрет для JWT (минимум 32 символа)

## 🗄️ База данных

Проект использует **SQLite** с **Prisma ORM**.

**Основные модели:**
- `Clinic` - клиника
- `User` - сотрудники (admin, doctor, assistant)
- `Patient` - пациенты
- `Appointment` - приёмы

## 📚 Документация

См. `Documentation/` в корне проекта:
- `TECHNICAL-SPEC.md` - техническое задание
- `ARCHITECTURE.md` - архитектура
- `CODING-RULES.md` - правила кодирования
- `API.md` - API документация

## 🔐 Безопасность

- JWT аутентификация
- bcrypt для паролей
- Helmet security headers
- CORS whitelist
- Rate limiting

## 📝 Логирование

Логи в development режиме включают Prisma queries.
В production логируются только ошибки.

---

**Версия:** 1.0.0 (MVP)  
**Дата:** 12.11.2025

