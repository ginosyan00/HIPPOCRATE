# Design System - Medical Dashboard UI Kit

## 🎨 Цветовая палитра

Дизайн основан на медицинском дашборде из Figma.

### Основные цвета

```css
/* Main Color (Primary) */
--main-10: #F5F6FF;    /* Light background for buttons, cards */
--main-100: #3A6FF8;   /* Primary blue for active states, CTA */

/* Secondary Color (Success/Green) */
--secondary-10: #FFF9F6;  /* Light background */
--secondary-100: #14CC26; /* Green for success states */

/* Text Colors */
--text-10: #A9A9A9;    /* Light gray for secondary text, placeholders */
--text-50: #676767;    /* Medium gray for labels, headings */
--text-100: #1C1C1C;   /* Dark for primary text */

/* Background Colors */
--bg-primary: #FBFBFB;  /* Main page background */
--bg-white: #FFFFFF;    /* Card backgrounds */

/* Stroke/Border */
--stroke: #F1F1F1;     /* Borders for cards, inputs */
```

## 📝 Типографика

- **Шрифт:** Poppins (400, 500, 600)
- **Размеры:**
  - H1 (Page Title): 24px (font-semibold)
  - H2 (Section Title): 18px (font-medium)
  - Body: 14px (font-normal)
  - Small: 12px (font-normal)
  - Caption: 10px (font-normal)

## 🧩 Компоненты

### Buttons

**Варианты:**
- `primary`: Light blue background (#F5F6FF) with blue text (#3A6FF8)
- `secondary`: White background with border
- `danger`: Red background for destructive actions
- `success`: Light green background

**Размеры:**
- `sm`: 12px text, 6px padding
- `md`: 12px text, 8px padding (default)
- `lg`: 14px text, 12px padding

**Закругление:** 8px (rounded-sm)

### Cards

- **Background:** White (#FFFFFF)
- **Border:** 1px solid #F1F1F1
- **Border Radius:** 15px (rounded-lg)
- **Padding:** 20px (md), customizable

### Inputs

- **Border:** 1px solid #F1F1F1
- **Border Radius:** 8px (rounded-sm)
- **Focus:** Border changes to #3A6FF8
- **Padding:** 10px 16px
- **Font:** 14px

### Sidebar

- **Width:** 256px (w-64)
- **Background:** #FBFBFB
- **Border:** 1px solid #F1F1F1 on right
- **Active Menu Item:** Blue text (#3A6FF8), semibold
- **Inactive:** Gray text (#A9A9A9)

### Header

- **Background:** White (#FFFFFF)
- **Border:** 1px solid #F1F1F1 on bottom
- **Height:** 90px (sticky)
- **Search Bar:** White with border, 8px border-radius

## 📐 Spacing

- **Gap между элементами:** 16px, 24px
- **Page padding:** 32px (px-8 py-6)
- **Card padding:** 20px (p-5)

## 🎯 Используемые иконки

Все иконки скачаны из Figma:
- `dashboard.svg` - Иконка главной страницы
- `calendar.svg` - Иконка приёмов
- `doctor.svg` - Иконка врачей
- `patient.svg` - Иконка пациентов
- `analytics.svg` - Иконка аналитики
- `brain-logo.svg` - Логотип
- `search.svg` - Поиск
- `notification.svg` - Уведомления
- `settings.svg` - Настройки
- `arrow-down.svg` - Стрелка вниз
- `message.svg` - Сообщения
- `wallet.svg` - Кошелёк

## 🔄 Анимации

- **Transition:** 300ms cubic-bezier(0.4, 0, 0.2, 1)
- **Hover эффекты:** Изменение цвета фона/текста
- **Active states:** Полужирный текст + синий цвет

## 📱 Адаптивность

- **Desktop:** > 1024px - полный функционал
- **Tablet:** 768px - 1024px - сжатый sidebar
- **Mobile:** < 768px - скрытый sidebar с бургер-меню

## ✅ Принципы дизайна

1. **Минимализм** - чистый flat-дизайн без градиентов
2. **Читаемость** - контрастные цвета текста
3. **Согласованность** - единые отступы и размеры
4. **Простота** - интуитивная навигация
5. **Профессионализм** - медицинский стиль

## 🚀 Применение

Все компоненты используют Tailwind CSS классы, определённые в `tailwind.config.js`:

```tsx
// Пример использования
<Card className="p-5">
  <h3 className="text-lg font-medium text-text-50 mb-4">
    Title
  </h3>
  <Button variant="primary">Action</Button>
</Card>
```

## 📦 Компонентная структура

```
frontend/src/
├── assets/icons/          # Иконки из Figma
├── components/
│   ├── common/            # Button, Card, Input, Modal
│   └── dashboard/         # Sidebar, Header, DashboardLayout
├── pages/
│   ├── auth/              # Login, Register
│   └── dashboard/         # Dashboard, Appointments, Patients, Staff
└── index.css              # Глобальные стили и Tailwind
```

---

**Дизайн основан на:** [Medical Dashboard UI KIT (Figma)](https://www.figma.com/design/9KolheWrDvW8vP9tzleBKq/)

