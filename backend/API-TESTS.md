# 🧪 API Testing Guide — Hippocrates Dental

## 📋 Тестовые данные (из seed)

**Клиника:**
- Name: Дента Люкс
- Slug: denta-lux

**Admin:**
- Email: `admin@dentalux.am`
- Password: `Admin123!`

**Doctor:**
- Email: `karen@dentalux.am`
- Password: `Doctor123!`

**Пациенты:**
- Мария Асатрян (+374 98 444555)
- Давид Манукян (+374 98 555666)

---

## 1. Health Check

```bash
curl http://localhost:5000/health
```

## 2. Авторизация (Login)

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@dentalux.am\",\"password\":\"Admin123!\"}"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "clinicId": "...",
      "name": "Арам Григорян",
      "email": "admin@dentalux.am",
      "role": "admin",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

## 3. Получить текущего пользователя (GET /me)

```bash
# Сначала получите токен из login response, затем:
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 4. Регистрация новой клиники

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"clinic\": {
      \"name\": \"Стоматология Смайл\",
      \"slug\": \"smile-dental\",
      \"email\": \"info@smile-dental.am\",
      \"phone\": \"+374 98 777888\",
      \"city\": \"Yerevan\",
      \"address\": \"ул. Туманяна 5\"
    },
    \"admin\": {
      \"name\": \"Тигран Асатрян\",
      \"email\": \"admin@smile-dental.am\",
      \"password\": \"MyPassword123!\"
    }
  }"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "data": {
    "clinic": {
      "id": "...",
      "name": "Стоматология Смайл",
      "slug": "smile-dental",
      ...
    },
    "user": {
      "id": "...",
      "name": "Тигран Асатрян",
      "email": "admin@smile-dental.am",
      "role": "admin",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## PowerShell команды (для Windows)

### Login:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@dentalux.am","password":"Admin123!"}'
```

### Register:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "clinic": {
      "name": "Стоматология Смайл",
      "slug": "smile-dental",
      "email": "info@smile-dental.am",
      "phone": "+374 98 777888",
      "city": "Yerevan"
    },
    "admin": {
      "name": "Тигран Асатрян",
      "email": "admin@smile-dental.am",
      "password": "MyPassword123!"
    }
  }'
```

### Get Me (с токеном):
```powershell
$token = "YOUR_TOKEN_HERE"
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/me" `
  -Headers @{Authorization="Bearer $token"}
```

---

## Тестирование с помощью Postman

1. Импортируйте следующую коллекцию
2. Установите переменную `{{baseUrl}}` = `http://localhost:5000`
3. После login сохраните токен в переменную `{{token}}`

**Collection JSON:** (импортировать в Postman)

```json
{
  "info": {
    "name": "Hippocrates Dental API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@dentalux.am\",\n  \"password\": \"Admin123!\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "login"]
            }
          }
        },
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"clinic\": {\n    \"name\": \"Test Clinic\",\n    \"slug\": \"test-clinic\",\n    \"email\": \"test@clinic.am\",\n    \"phone\": \"+374 98 999999\",\n    \"city\": \"Yerevan\"\n  },\n  \"admin\": {\n    \"name\": \"Test Admin\",\n    \"email\": \"admin@test.am\",\n    \"password\": \"Test123!\"\n  }\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "register"]
            }
          }
        },
        {
          "name": "Get Me",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/v1/auth/me",
              "host": ["{{baseUrl}}"],
              "path": ["api", "v1", "auth", "me"]
            }
          }
        }
      ]
    }
  ]
}
```

