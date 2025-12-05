# 🌐 Public API Tests — Endpoints без авторизации

## 📍 Базовый URL
```
http://localhost:5000/api/v1/public
```

**Важно:** Все эти endpoints доступны **БЕЗ токена авторизации!**

---

## 🏙️ 1. Получить список городов

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/public/cities"
```

**Ответ:**
```json
{
  "success": true,
  "data": ["Yerevan", "Gyumri", "Vanadzor"]
}
```

---

## 🏥 2. Получить список клиник

### Все клиники:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/public/clinics"
```

### Фильтр по городу:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/public/clinics?city=Yerevan"
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "clinics": [
      {
        "id": "...",
        "name": "Дента Люкс",
        "slug": "denta-lux",
        "email": "info@dentalux.am",
        "phone": "+374 98 123456",
        "city": "Yerevan",
        "about": "Современная стоматологическая клиника...",
        "logo": null
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

---

## 🏥 3. Получить детали клиники

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/public/clinics/denta-lux"
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Дента Люкс",
    "slug": "denta-lux",
    "email": "info@dentalux.am",
    "phone": "+374 98 123456",
    "address": "ул. Абовяна 10",
    "city": "Yerevan",
    "about": "Современная стоматологическая клиника в центре Еревана",
    "logo": null,
    "workingHours": {
      "monday": { "open": "09:00", "close": "18:00", "isOpen": true },
      "tuesday": { "open": "09:00", "close": "18:00", "isOpen": true },
      "wednesday": { "open": "09:00", "close": "18:00", "isOpen": true },
      "thursday": { "open": "09:00", "close": "18:00", "isOpen": true },
      "friday": { "open": "09:00", "close": "18:00", "isOpen": true },
      "saturday": { "open": "10:00", "close": "14:00", "isOpen": true },
      "sunday": { "open": null, "close": null, "isOpen": false }
    }
  }
}
```

---

## 👨‍⚕️ 4. Получить врачей клиники

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/public/clinics/denta-lux/doctors"
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Д-р Карен Саркисян",
      "specialization": "Терапевт",
      "phone": "+374 98 222333",
      "avatar": null
    },
    {
      "id": "...",
      "name": "Д-р Анна Петросян",
      "specialization": "Хирург",
      "phone": "+374 98 333444",
      "avatar": null
    }
  ]
}
```

---

## 📅 5. Создать онлайн-запись (БЕЗ авторизации!)

### Сценарий 1: Новый пациент

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/public/appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "clinicSlug": "denta-lux",
    "doctorId": "DOCTOR_ID_HERE",
    "patient": {
      "name": "Новый Пациент",
      "phone": "+374 98 777666",
      "email": "patient@example.com"
    },
    "appointmentDate": "2025-11-25T10:00:00Z",
    "reason": "Профилактический осмотр"
  }'
```

### Сценарий 2: Существующий пациент

```powershell
# Если пациент с таким телефоном уже есть, он будет найден автоматически
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/public/appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "clinicSlug": "denta-lux",
    "doctorId": "DOCTOR_ID_HERE",
    "patient": {
      "name": "Мария Асатрян",
      "phone": "+374 98 444555"
    },
    "appointmentDate": "2025-11-26T14:00:00Z",
    "reason": "Лечение кариеса"
  }'
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "...",
      "appointmentDate": "2025-11-25T10:00:00.000Z",
      "duration": 30,
      "status": "pending",
      "reason": "Профилактический осмотр"
    },
    "clinic": {
      "name": "Дента Люкс",
      "phone": "+374 98 123456"
    },
    "doctor": {
      "name": "Д-р Карен Саркисян",
      "specialization": "Терапевт"
    },
    "message": "Ваша заявка принята! Клиника свяжется с вами в ближайшее время для подтверждения."
  }
}
```

---

## 🧪 Полный сценарий онлайн-записи

```powershell
# 1. Получить список клиник в городе
$clinics = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/public/clinics?city=Yerevan"
$clinic = $clinics.data.clinics[0]
$clinicSlug = $clinic.slug

Write-Host "✅ Выбрана клиника: $($clinic.name)"

# 2. Получить врачей клиники
$doctors = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/public/clinics/$clinicSlug/doctors"
$doctor = $doctors.data[0]
$doctorId = $doctor.id

Write-Host "✅ Выбран врач: $($doctor.name) ($($doctor.specialization))"

# 3. Создать онлайн-запись
$appointment = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/public/appointments" `
  -Method POST `
  -ContentType "application/json" `
  -Body "{
    `"clinicSlug`": `"$clinicSlug`",
    `"doctorId`": `"$doctorId`",
    `"patient`": {
      `"name`": `"Тестовый Пациент`",
      `"phone`": `"+374 98 999777`",
      `"email`": `"test@example.com`"
    },
    `"appointmentDate`": `"2025-11-30T15:00:00Z`",
    `"reason`": `"Онлайн-запись тест`"
  }"

Write-Host "✅ Запись создана! ID: $($appointment.data.appointment.id)"
Write-Host "📞 Клиника свяжется по телефону: $($appointment.data.clinic.phone)"
```

---

## ✅ Бизнес-логика онлайн-записи

### Что происходит при создании заявки:

1. ✅ **Проверка клиники** — существует ли по slug
2. ✅ **Проверка врача** — активен ли, принадлежит ли клинике
3. ✅ **Поиск пациента** — ищем по телефону в базе клиники
4. ✅ **Создание пациента** — если не найден, создаем нового
5. ✅ **Проверка времени** — свободно ли выбранное время
6. ✅ **Создание приёма** — со статусом `pending`
7. ✅ **Уведомление** — возвращаем детали и сообщение

### Результат:
- Заявка создана со статусом **pending**
- Админ клиники видит её в Dashboard
- Админ может подтвердить (confirmed) или отменить (cancelled)

---

## 🔒 Безопасность Public API

### Rate Limiting (рекомендуется добавить):
```javascript
// Для публичных endpoints желательно:
POST /public/appointments: 5 запросов / 10 минут / IP
GET endpoints: 100 запросов / минуту / IP
```

### Валидация:
✅ Все входные данные валидируются (Joi schemas)  
✅ Дата приёма должна быть в будущем  
✅ Телефон должен быть валидным  
✅ Имя пациента — минимум 2 символа

---

## 📊 Тестирование в Postman

**Import Collection:**

```json
{
  "name": "Hippocrates - Public API",
  "item": [
    {
      "name": "Get Cities",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/v1/public/cities"
      }
    },
    {
      "name": "Get Clinics",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/v1/public/clinics?city=Yerevan"
      }
    },
    {
      "name": "Get Clinic Details",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/v1/public/clinics/denta-lux"
      }
    },
    {
      "name": "Get Clinic Doctors",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/v1/public/clinics/denta-lux/doctors"
      }
    },
    {
      "name": "Create Public Appointment",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"clinicSlug\": \"denta-lux\",\n  \"doctorId\": \"DOCTOR_ID\",\n  \"patient\": {\n    \"name\": \"Test Patient\",\n    \"phone\": \"+374 98 999888\",\n    \"email\": \"test@test.am\"\n  },\n  \"appointmentDate\": \"2025-11-30T10:00:00Z\",\n  \"reason\": \"Test appointment\"\n}"
        },
        "url": "{{baseUrl}}/api/v1/public/appointments"
      }
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:5000"}
  ]
}
```

---

## 🎉 Готово!

Public API полностью реализован и готов для интеграции с фронтендом! 🚀

**Следующий шаг:** Создание фронтенда (публичный сайт + админ панель)


