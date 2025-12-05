# DEPLOYMENT GUIDE — Hippocrates Dental

> **Цель:** Развернуть приложение на production без ошибок.

---

## 🎯 OVERVIEW

**Stack для production:**
- **Backend:** Render ($7/мес Starter)
- **Frontend:** Vercel (Free tier)
- **Database:** MongoDB Atlas (M0 Free tier или M2 $9/мес)

**Альтернативы:**
- Backend: Railway, Fly.io, DigitalOcean App Platform
- Frontend: Netlify, Cloudflare Pages
- Database: MongoDB Atlas (разные тарифы)

---

## 🚀 БЫСТРЫЙ ДЕПЛОЙ (Recommended)

### 1. MongoDB Atlas (БД)

**Шаги:**

1. Зарегистрируйся на [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Создай новый Cluster:
   - Region: AWS / Frankfurt (ближе к Армении)
   - Tier: M0 Free (для старта)
3. Настрой Network Access:
   - Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
4. Создай Database User:
   - Username: `hippocrates`
   - Password: (сгенерируй сложный)
5. Получи Connection String:
   - Connect → Connect your application → Node.js
   - Копируй строку: `mongodb+srv://hippocrates:<password>@cluster0.xxxxx.mongodb.net/`

**Connection String:**
```
mongodb+srv://hippocrates:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hippocrates?retryWrites=true&w=majority
```

---

### 2. Backend Deployment (Render)

**Шаги:**

1. Зарегистрируйся на [Render](https://render.com/)

2. Создай новый Web Service:
   - **Repository:** Подключи GitHub репозиторий
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
   - **Plan:** Starter ($7/мес)

3. Настрой Environment Variables:
   ```bash
   NODE_ENV=production
   PORT=5000
   
   # Database
   DATABASE_URL=mongodb+srv://hippocrates:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hippocrates?retryWrites=true&w=majority
   
   # JWT
   JWT_SECRET=your-super-secret-key-at-least-32-characters-long-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # CORS (URL frontend на Vercel)
   CORS_ORIGIN=https://hippocrates-dental.vercel.app
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. Deploy:
   - Render автоматически деплоит при push в `main`
   - Получишь URL: `https://hippocrates-api.onrender.com`

5. Проверь Health Check:
   ```bash
   curl https://hippocrates-api.onrender.com/health
   # Должно вернуть: { "status": "ok" }
   ```

---

### 3. Frontend Deployment (Vercel)

**Шаги:**

1. Зарегистрируйся на [Vercel](https://vercel.com/)

2. Import Repository:
   - Add New Project → Import Git Repository
   - Выбери свой репозиторий
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. Настрой Environment Variables:
   ```bash
   VITE_API_URL=https://hippocrates-api.onrender.com
   ```

4. Deploy:
   - Vercel автоматически деплоит при push в `main`
   - Получишь URL: `https://hippocrates-dental.vercel.app`

5. Проверь:
   - Открой `https://hippocrates-dental.vercel.app`
   - Должна открыться главная страница

---

### 4. Применить миграции БД

После деплоя backend:

```bash
# Локально (подключившись к production БД)
cd backend
DATABASE_URL="mongodb+srv://..." npx prisma db push

# Или через Render Shell (Dashboard → Shell)
npx prisma db push
```

---

### 5. Создать первую клинику (Seed)

```bash
# Локально
cd backend
DATABASE_URL="mongodb+srv://..." npm run db:seed

# Или через Render Shell
npm run db:seed
```

---

## 🔄 CI/CD (GitHub Actions)

### Автоматический деплой при push

Создай `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm install
      
      - name: Generate Prisma Client
        working-directory: ./backend
        run: npx prisma generate
      
      - name: Run tests
        working-directory: ./backend
        run: npm test
      
      # Render деплоит автоматически через Git hook
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm install
      
      - name: Type check
        working-directory: ./frontend
        run: npm run type-check
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
      
      # Vercel деплоит автоматически через Git hook
```

---

## 🔒 HTTPS и Домены

### Настроить Custom Domain

#### Для Backend (Render):
1. Dashboard → Settings → Custom Domain
2. Добавь домен: `api.hippocrates.am`
3. Настрой DNS:
   ```
   Type: CNAME
   Name: api
   Value: hippocrates-api.onrender.com
   ```
4. Render автоматически выдаст SSL сертификат (Let's Encrypt)

#### Для Frontend (Vercel):
1. Project Settings → Domains
2. Добавь домен: `hippocrates.am`
3. Настрой DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel IP)
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Vercel автоматически выдаст SSL сертификат

### Обновить Environment Variables

После настройки доменов:

**Backend (Render):**
```bash
CORS_ORIGIN=https://hippocrates.am
```

**Frontend (Vercel):**
```bash
VITE_API_URL=https://api.hippocrates.am
```

**Redeploy оба приложения!**

---

## 📊 МОНИТОРИНГ

### Health Check Endpoint

Добавь в backend:

```javascript
// backend/src/routes/health.routes.js
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

module.exports = router;

// backend/src/app.js
const healthRoutes = require('./routes/health.routes');
app.use('/', healthRoutes); // /health endpoint
```

### Uptime Monitoring

**Рекомендуемые сервисы:**
- [UptimeRobot](https://uptimerobot.com/) — бесплатный
- [BetterUptime](https://betteruptime.com/) — бесплатный tier
- [Pingdom](https://www.pingdom.com/) — платный

**Настройка:**
1. Зарегистрируйся на UptimeRobot
2. Add Monitor:
   - Type: HTTP(s)
   - URL: `https://api.hippocrates.am/health`
   - Interval: 5 минут
3. Alerts: Email/Telegram при downtime

---

## 🐛 TROUBLESHOOTING

### Backend не запускается

**Проблема:** Error connecting to database

**Решение:**
```bash
# Проверь DATABASE_URL в Environment Variables
# Проверь Network Access в MongoDB Atlas (0.0.0.0/0)
# Проверь что Database User создан

# Тестируй connection локально
node -e "require('mongodb').MongoClient.connect(process.env.DATABASE_URL, (err, client) => { console.log(err || 'Connected!'); client?.close(); })"
```

---

### Frontend не видит Backend

**Проблема:** CORS error или Network error

**Решение:**
```bash
# 1. Проверь CORS_ORIGIN в backend Environment Variables
# Должен быть: https://hippocrates.am (твой frontend URL)

# 2. Проверь VITE_API_URL в frontend Environment Variables
# Должен быть: https://api.hippocrates.am (твой backend URL)

# 3. Redeploy оба приложения после изменения env vars
```

---

### Render "Service Unavailable"

**Проблема:** Backend не отвечает

**Решение:**
```bash
# Render переводит free tier в sleep после 15 мин бездействия
# Первый запрос занимает 30-60 секунд (cold start)

# Решение: используй Starter plan ($7/мес) — нет sleep
# Или: настрой cron job для ping каждые 10 минут
```

---

### Prisma ошибки

**Проблема:** Prisma Client not found

**Решение:**
```bash
# В Build Command на Render должно быть:
npm install && npx prisma generate

# Проверь что prisma есть в dependencies (не devDependencies)
# backend/package.json:
{
  "dependencies": {
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0"
  }
}
```

---

## 🔄 ROLLBACK (Откат версии)

### Render

1. Dashboard → Deploys
2. Найди последний рабочий deploy
3. Нажми "Rollback to this version"

### Vercel

1. Project → Deployments
2. Найди последний рабочий deployment
3. Нажми "..." → Promote to Production

---

## 📝 CHECKLIST ПЕРЕД ДЕПЛОЕМ

### Backend:
- [ ] Все Environment Variables настроены
- [ ] DATABASE_URL корректный
- [ ] JWT_SECRET изменён (не default!)
- [ ] CORS_ORIGIN = URL frontend
- [ ] Build Command: `npm install && npx prisma generate`
- [ ] Start Command: `npm start`
- [ ] Health check endpoint работает
- [ ] Тесты проходят

### Frontend:
- [ ] VITE_API_URL = URL backend
- [ ] Build проходит без ошибок
- [ ] TypeScript ошибок нет
- [ ] Lighthouse score > 80
- [ ] Responsive на mobile/tablet/desktop

### Database:
- [ ] MongoDB Atlas настроен
- [ ] Network Access = 0.0.0.0/0
- [ ] Database User создан
- [ ] Миграции применены (prisma db push)
- [ ] Seed данные созданы (опционально)

### Безопасность:
- [ ] HTTPS настроен
- [ ] Секреты не в коде (только в env vars)
- [ ] Rate limiting настроен
- [ ] CORS whitelist настроен

---

## 🎉 ГОТОВО!

После успешного деплоя:

1. ✅ Backend: `https://api.hippocrates.am/health`
2. ✅ Frontend: `https://hippocrates.am`
3. ✅ MongoDB Atlas работает
4. ✅ HTTPS настроен
5. ✅ Мониторинг настроен
6. ✅ CI/CD работает

**Поздравляю! MVP в production! 🚀**

---

**Последнее обновление:** 11.11.2025  
**Версия:** 1.0  
**Следующий review:** После первого деплоя

