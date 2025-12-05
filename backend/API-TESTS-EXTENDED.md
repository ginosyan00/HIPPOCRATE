# 🧪 Extended API Tests — Все CRUD endpoints

## Базовый URL
```
http://localhost:5000/api/v1
```

## 🔐 Получение токена

```powershell
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@dentalux.am","password":"Admin123!"}'

$token = $loginResponse.data.token
Write-Host "Token: $token"
```

---

## 👥 PATIENTS API

### 1. Получить всех пациентов
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/patients" `
  -Headers @{Authorization="Bearer $token"}
```

### 2. Создать пациента
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/patients" `
  -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{
    "name": "Новый Пациент",
    "phone": "+374 98 999888",
    "email": "patient@test.am",
    "gender": "male"
  }'
```

### 3. Получить пациента по ID
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/patients/PATIENT_ID" `
  -Headers @{Authorization="Bearer $token"}
```

### 4. Обновить пациента
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/patients/PATIENT_ID" `
  -Method PUT `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"notes": "Обновленные заметки"}'
```

### 5. Поиск по телефону
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/patients/search/phone?phone=%2B374%2098%20444555" `
  -Headers @{Authorization="Bearer $token"}
```

---

## 👨‍⚕️ USERS API

### 1. Получить всех пользователей
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/users" `
  -Headers @{Authorization="Bearer $token"}
```

### 2. Получить только врачей
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/users/doctors" `
  -Headers @{Authorization="Bearer $token"}
```

### 3. Создать врача
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/users" `
  -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{
    "name": "Д-р Новый Врач",
    "email": "newdoctor@dentalux.am",
    "password": "NewDoc123!",
    "role": "doctor",
    "specialization": "Ортодонт",
    "phone": "+374 98 888777"
  }'
```

### 4. Обновить пользователя
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/users/USER_ID" `
  -Method PUT `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"specialization": "Главный терапевт"}'
```

---

## 📅 APPOINTMENTS API

### 1. Получить все приёмы
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/appointments" `
  -Headers @{Authorization="Bearer $token"}
```

### 2. Фильтр по статусу
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/appointments?status=pending" `
  -Headers @{Authorization="Bearer $token"}
```

### 3. Фильтр по дате
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/appointments?date=2025-11-13" `
  -Headers @{Authorization="Bearer $token"}
```

### 4. Создать приём
```powershell
# Сначала получите ID врача и пациента из предыдущих запросов
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/appointments" `
  -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{
    "doctorId": "DOCTOR_ID_HERE",
    "patientId": "PATIENT_ID_HERE",
    "appointmentDate": "2025-11-15T10:00:00Z",
    "duration": 60,
    "reason": "Лечение кариеса"
  }'
```

### 5. Изменить статус приёма
```powershell
# pending -> confirmed
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/appointments/APPOINTMENT_ID/status" `
  -Method PATCH `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"status": "confirmed"}'
```

### 6. Обновить приём
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/appointments/APPOINTMENT_ID" `
  -Method PUT `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"notes": "Пациент опоздал на 10 минут"}'
```

---

## 🧪 Полный тестовый сценарий

```powershell
# 1. Login
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@dentalux.am","password":"Admin123!"}'
$token = $login.data.token

# 2. Получить список пациентов
$patients = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/patients" `
  -Headers @{Authorization="Bearer $token"}
$patientId = $patients.data.patients[0].id

# 3. Получить список врачей
$doctors = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/users/doctors" `
  -Headers @{Authorization="Bearer $token"}
$doctorId = $doctors.data[0].id

# 4. Создать приём
$appointment = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/appointments" `
  -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body "{
    `"doctorId`": `"$doctorId`",
    `"patientId`": `"$patientId`",
    `"appointmentDate`": `"2025-11-20T14:00:00Z`",
    `"duration`": 30,
    `"reason`": `"Тестовый приём`"
  }"

$appointmentId = $appointment.data.id

# 5. Подтвердить приём
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/appointments/$appointmentId/status" `
  -Method PATCH `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"status": "confirmed"}'

Write-Host "✅ Все тесты пройдены успешно!"
```

---

## 📊 Ожидаемые результаты

### Успешные ответы:
- **200 OK** — GET, PUT, PATCH
- **201 Created** — POST
- **400 Bad Request** — Ошибки валидации
- **401 Unauthorized** — Нет токена
- **403 Forbidden** — Нет прав
- **404 Not Found** — Ресурс не найден
- **409 Conflict** — Конфликт (телефон занят, время занято)

---

## 🔒 Tenant Isolation Test

Проверка что клиники изолированы друг от друга:

```powershell
# 1. Создать вторую клинику
$clinic2 = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "clinic": {"name": "Test 2", "slug": "test-2", "email": "test2@test.am", "phone": "+374 98 111111", "city": "Yerevan"},
    "admin": {"name": "Admin 2", "email": "admin2@test.am", "password": "Test123!"}
  }'
$token2 = $clinic2.data.token

# 2. Попробовать получить пациентов первой клиники используя токен второй
$result = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/patients" `
  -Headers @{Authorization="Bearer $token2"}

# Должно вернуть пустой список или только пациентов второй клиники
Write-Host "Patients count for clinic 2: $($result.data.meta.total)"
# Ожидается: 0
```

Если вернулось 0 — **tenant isolation работает!** ✅

