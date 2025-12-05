# 🎨 Frontend Guide — Hippocrates Dental

## 🚀 Запуск

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173

---

## 📁 Структура

```
frontend/src/
├── components/
│   ├── common/           # Переиспользуемые компоненты
│   │   ├── Button.tsx   ✅
│   │   ├── Input.tsx    ✅
│   │   ├── Card.tsx     ✅
│   │   ├── Modal.tsx    ✅
│   │   ├── Spinner.tsx  ✅
│   │   └── index.ts     ✅
│   │
│   ├── dashboard/       # Dashboard компоненты
│   │   ├── Sidebar.tsx      ✅
│   │   ├── Header.tsx       ✅
│   │   └── DashboardLayout.tsx ✅
│   │
│   ├── ProtectedRoute.tsx   ✅
│   └── public/          # Public site компоненты
│
├── pages/
│   ├── auth/
│   │   ├── Login.tsx    ✅
│   │   └── Register.tsx ✅
│   │
│   ├── dashboard/
│   │   ├── Dashboard.tsx    ✅
│   │   ├── Patients.tsx     (в разработке)
│   │   ├── Appointments.tsx (в разработке)
│   │   ├── Staff.tsx        (в разработке)
│   │   └── Settings.tsx     (в разработке)
│   │
│   └── public/          (в разработке)
│
├── services/
│   ├── api.ts           ✅ Axios instance
│   └── auth.service.ts  ✅ Auth API calls
│
├── store/
│   ├── useAuthStore.ts  ✅ Auth state
│   └── useUIStore.ts    ✅ UI state
│
├── types/
│   └── api.types.ts     ✅ TypeScript types
│
├── App.tsx              ✅ Router + Routes
└── main.tsx             ✅ Entry point
```

---

## 🎯 Что работает:

### ✅ Auth Flow:
1. Login страница → авторизация → редирект на /dashboard
2. Register страница → регистрация клиники → автоматический login → /dashboard
3. Protected routes → проверка токена → редирект на /login если не авторизован
4. Logout → очистка токена → редирект на /login

### ✅ Dashboard Layout:
- Sidebar с навигацией
- Header с кнопкой toggle sidebar
- Responsive design
- User info + logout button

### ✅ UI Components:
- **Button** — 4 варианта (primary, secondary, danger, success)
- **Input** — с label, error, helperText
- **Card** — с title и footer
- **Modal** — с backdrop, закрытие на ESC
- **Spinner** — индикатор загрузки

---

## 🧪 Как протестировать:

### 1. Откройте http://localhost:5173

Должна появиться страница **Login**

### 2. Авторизуйтесь:
```
Email: admin@dentalux.am
Password: Admin123!
```

### 3. После входа:
- Должен открыться Dashboard
- Sidebar слева
- Header сверху
- 4 статистических карточки
- Навигация работает

### 4. Попробуйте регистрацию:
- Нажмите "Зарегистрировать клинику"
- Заполните форму
- После успешной регистрации должен появиться Dashboard

---

## 🔑 Тестовые данные:

**Существующая клиника (из seed):**
- Email: admin@dentalux.am
- Password: Admin123!

**Для регистрации новой клиники:**
- Clinic Name: Тест Клиника
- Slug: test-clinic
- Email: test@clinic.am
- Phone: +374 98 999999
- City: Yerevan
- Admin Name: Тест Админ
- Admin Email: admin@test.am
- Admin Password: Test123!

---

## 🎨 UI/UX фичи:

### Дизайн:
- ✅ Современный, минималистичный
- ✅ Tailwind CSS (чистые цвета)
- ✅ Primary color: #0ea5e9 (голубой)
- ✅ Rounded corners: 8-12px
- ✅ Shadow для cards
- ✅ Hover effects

### Доступность:
- ✅ Кнопки минимум 44px
- ✅ Шрифт минимум 16px
- ✅ Контрастные цвета
- ✅ Focus states для всех интерактивных элементов

### Responsive:
- ✅ Mobile-first подход
- ✅ Grid адаптируется под экран
- ✅ Sidebar скрывается на мобильных (toggle)

---

## 📝 Следующие задачи:

### Dashboard Pages:
- [ ] Patients page — список + создание + редактирование
- [ ] Appointments page — календарь + фильтры + создание
- [ ] Staff page — список сотрудников + управление
- [ ] Settings page — настройки клиники

### React Query Integration:
- [ ] usePatients hook
- [ ] useAppointments hook
- [ ] useUsers hook
- [ ] Query caching + optimistic updates

---

## 🎉 Статус:

| Компонент | Статус |
|-----------|--------|
| UI Components | ✅ 5/5 |
| Auth Pages | ✅ 2/2 |
| Dashboard Layout | ✅ Работает |
| Router | ✅ Настроен |
| Protected Routes | ✅ Работает |
| Stores | ✅ 2/2 |
| API Services | ✅ Настроены |
| **Этап 5** | 🚧 **60% готово** |

---

**Следующий шаг:** Создание страниц Dashboard (Patients, Appointments, Staff, Settings)


