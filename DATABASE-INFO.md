# 🗄️ База данных - Информация

## 📍 Где находится база данных?

### SQLite Database (dev.db):
```
hippocrates-main/backend/prisma/dev.db
```

**Это файл базы данных SQLite!** Все данные хранятся в этом одном файле.

---

## 🔗 DATABASE_URL

### По умолчанию (SQLite):
```env
DATABASE_URL="file:./prisma/dev.db"
```

Это означает:
- **file:** - тип подключения (файл)
- **./prisma/dev.db** - путь к файлу базы данных

### Полный путь на вашем компьютере:
```
C:\Users\Gurgen\Downloads\hippocrates-main\hippocrates-main\backend\prisma\dev.db
```

---

## 📊 Структура базы данных

### Таблицы:

1. **clinics** (Клиники)
   - id, name, slug, email, phone
   - address, city, about, logo
   - workingHours, createdAt, updatedAt

2. **users** (Сотрудники)
   - id, clinicId, name, email
   - passwordHash, role, specialization
   - phone, avatar, isActive
   - createdAt, updatedAt

3. **patients** (Пациенты)
   - id, clinicId, name, phone
   - email, dateOfBirth, gender
   - notes, createdAt, updatedAt

4. **appointments** (Приёмы)
   - id, clinicId, doctorId, patientId
   - appointmentDate, duration, status
   - notes, reason, createdAt, updatedAt

---

## 🛠️ Как посмотреть данные?

### Вариант 1: Prisma Studio (GUI) ⭐ Рекомендуется
```bash
cd hippocrates-main/backend
npx prisma studio
```

Откроется веб-интерфейс на `http://localhost:5555`

**Преимущества:**
- ✅ Красивый интерфейс
- ✅ Удобное редактирование
- ✅ Можно добавлять/удалять данные
- ✅ Видны все связи

### Вариант 2: DB Browser for SQLite
1. Скачайте: https://sqlitebrowser.org/
2. Откройте файл: `hippocrates-main/backend/prisma/dev.db`
3. Просматривайте таблицы и данные

### Вариант 3: VS Code расширение
1. Установите расширение "SQLite Viewer"
2. Откройте файл `dev.db` в VS Code
3. Просматривайте данные прямо в редакторе

### Вариант 4: Командная строка
```bash
cd hippocrates-main/backend/prisma
sqlite3 dev.db

# В SQLite консоли:
.tables                    # Список таблиц
SELECT * FROM clinics;     # Все клиники
SELECT * FROM users;       # Все пользователи
.quit                      # Выход
```

---

## 📝 Текущие данные (из seed.js)

### Тестовая клиника:
```javascript
name: "Стоматология Улыбка"
email: "info@smile-dental.am"
phone: "+374 10 123456"
city: "Yerevan"
```

### Тестовые пользователи:

**Admin:**
```
email: admin@medic.am
password: Admin123!
role: admin
```

**Doctor:**
```
email: doctor@medic.am
password: Doctor123!
role: doctor
specialization: "Терапевт"
```

---

## 🔄 Как управлять базой данных?

### Создать новую миграцию:
```bash
cd hippocrates-main/backend
npx prisma migrate dev --name your_migration_name
```

### Применить миграции:
```bash
npx prisma migrate deploy
```

### Очистить и пересоздать БД:
```bash
npx prisma migrate reset
# Это удалит все данные и создаст заново!
```

### Заполнить тестовыми данными:
```bash
node prisma/seed.js
```

---

## 🔍 Как искать данные в коде?

### Prisma Client используется в:
```
backend/src/services/*.service.js
```

### Примеры запросов:

**Найти все клиники:**
```javascript
const clinics = await prisma.clinic.findMany();
```

**Найти пользователя по email:**
```javascript
const user = await prisma.user.findUnique({
  where: { email: 'admin@medic.am' }
});
```

**Создать пациента:**
```javascript
const patient = await prisma.patient.create({
  data: {
    name: 'Иван Иванов',
    phone: '+374 98 123456',
    clinicId: 'clinic-id-here'
  }
});
```

---

## 🔐 Безопасность

### ⚠️ ВАЖНО:
- Файл `dev.db` НЕ должен попадать в Git!
- Он уже добавлен в `.gitignore`
- Для production используйте PostgreSQL или MySQL

### Backup базы данных:
```bash
# Скопировать файл
cp hippocrates-main/backend/prisma/dev.db hippocrates-main/backend/prisma/dev.db.backup

# Или экспортировать в SQL
sqlite3 dev.db .dump > backup.sql
```

---

## 🚀 Миграция на production базу

### Для production рекомендуется:

**PostgreSQL:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hippocrates"
```

**MySQL:**
```env
DATABASE_URL="mysql://user:password@localhost:3306/hippocrates"
```

### Шаги миграции:
1. Установите PostgreSQL/MySQL
2. Создайте базу данных
3. Обновите `DATABASE_URL` в `.env`
4. Измените `provider` в `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // или "mysql"
     url      = env("DATABASE_URL")
   }
   ```
5. Запустите миграции:
   ```bash
   npx prisma migrate deploy
   ```

---

## 📊 Визуализация данных

### Таблицы и связи:

```
Clinic (Клиника)
  ├── Users (Сотрудники)
  ├── Patients (Пациенты)
  └── Appointments (Приёмы)
      ├── Doctor (User)
      └── Patient
```

**Связи:**
- 1 Clinic → много Users
- 1 Clinic → много Patients
- 1 Clinic → много Appointments
- 1 User (Doctor) → много Appointments
- 1 Patient → много Appointments

---

## 💡 Полезные команды

### Проверить подключение к БД:
```bash
cd hippocrates-main/backend
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.clinic.count().then(console.log).finally(() => prisma.$disconnect())"
```

### Показать структуру БД:
```bash
npx prisma db pull
```

### Сгенерировать Prisma Client:
```bash
npx prisma generate
```

---

## 🎯 Быстрый старт:

### 1. Посмотреть данные (GUI):
```bash
cd hippocrates-main/backend
npx prisma studio
```

### 2. Проверить, что данные есть:
- Откроется браузер на http://localhost:5555
- Кликните на таблицу "Clinic"
- Должна быть клиника "Стоматология Улыбка"

### 3. Войти в систему:
- Frontend: http://localhost:5173/login
- Email: `admin@medic.am`
- Password: `Admin123!`

---

**Теперь вы знаете всё о базе данных! 🎉**





