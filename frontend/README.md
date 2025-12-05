# Hippocrates Dental - Frontend

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev
```

Frontend: **http://localhost:5173**

---

## 📁 Структура проекта

```
frontend/src/
├── components/
│   ├── common/           # ✅ Button, Input, Card, Modal, Spinner
│   ├── dashboard/        # ✅ Sidebar, Header, DashboardLayout
│   └── ProtectedRoute.tsx ✅
│
├── pages/
│   ├── auth/             # ✅ Login, Register
│   └── dashboard/        # ✅ Dashboard (главная)
│
├── services/
│   ├── api.ts            # ✅ Axios instance + interceptors
│   └── auth.service.ts   # ✅ Auth API calls
│
├── store/
│   ├── useAuthStore.ts   # ✅ Auth state (Zustand)
│   └── useUIStore.ts     # ✅ UI state (sidebar toggle)
│
├── types/
│   └── api.types.ts      # ✅ TypeScript types
│
├── App.tsx               # ✅ Router + Routes
├── main.tsx              # ✅ Entry point
└── index.css             # ✅ Tailwind CSS
```

---

## ✅ Что работает:

### Auth:
- ✅ Login страница
- ✅ Register страница (регистрация клиники)
- ✅ Protected routes (редирект если не авторизован)
- ✅ Auto-redirect после login/register

### Dashboard:
- ✅ Layout (Sidebar + Header)
- ✅ Главная страница (Dashboard)
- ✅ Навигация между страницами
- ✅ Sidebar toggle
- ✅ User info + Logout

### UI Components:
- ✅ Button (4 варианта)
- ✅ Input (с validation)
- ✅ Card
- ✅ Modal
- ✅ Spinner

---

## 🧪 Тестирование

### 1. Откройте http://localhost:5173

### 2. Авторизуйтесь:
```
Email: admin@dentalux.am
Password: Admin123!
```

### 3. Навигация:
- Главная (Dashboard)
- Пациенты (заглушка)
- Приёмы (заглушка)
- Сотрудники (заглушка)
- Настройки (заглушка)

### 4. Logout → должен вернуть на /login

---

## 🛠️ Команды

```bash
npm run dev       # Dev сервер
npm run build     # Production build
npm run preview   # Превью build
npm run lint      # Проверка кода
```

---

## 🎨 Дизайн

### Цвета:
- Primary: `#0ea5e9` (голубой)
- Success: `#10b981` (зеленый)
- Danger: `#ef4444` (красный)
- Gray: Tailwind gray scale

### Компоненты:
- Rounded: 8-12px
- Shadow: sm, md (Tailwind)
- Transitions: 200ms

### Typography:
- Headings: font-bold
- Body: font-normal
- Минимум: 16px

---

## 📚 Следующие задачи:

- [ ] Patients page (CRUD)
- [ ] Appointments page (календарь)
- [ ] Staff page (список врачей)
- [ ] Settings page (настройки клиники)
- [ ] React Query integration
- [ ] Public site pages

---

**Версия:** 1.0.0 (MVP)  
**Дата:** 12.11.2025  
**Статус:** 🚧 60% готово
