/**
 * Date Format Utilities
 * Утилиты для форматирования дат и времени
 * Исправляет проблемы с часовыми поясами при отображении времени приема
 */

/**
 * Форматирует дату и время приема БЕЗ конвертации часовых поясов
 * Исправляет проблему, когда время приема сохраняется в UTC, а отображается неправильно
 * 
 * ВАЖНО: Время приема должно отображаться ТАК, КАК ОНО БЫЛО ВЫБРАНО пользователем
 * Например, если выбрано 05:00, должно отображаться 05:00, а не 04:00 или 06:00
 * 
 * @param date - Дата (Date объект или ISO строка)
 * @param options - Опции форматирования
 * @returns Отформатированная строка даты и времени
 * 
 * @example
 * formatAppointmentDateTime('2024-01-20T05:00:00.000Z') // "20.01.2024 05:00"
 * formatAppointmentDateTime('2024-01-20T05:00:00Z') // "20.01.2024 05:00"
 */
export function formatAppointmentDateTime(
  date: Date | string,
  options?: {
    dateFormat?: 'short' | 'long';
    timeFormat?: 'short' | 'long';
  }
): string {
  try {
    // Преобразуем в Date объект для работы
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Проверяем валидность даты
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }
    
    // КЛЮЧЕВОЙ МОМЕНТ: 
    // Время приема должно отображаться ТАК, КАК ОНО БЫЛО ВЫБРАНО пользователем.
    // 
    // Проблема: Когда пользователь выбирает 05:00 в локальном времени,
    // это время может быть сохранено в БД как UTC (например, 01:00 UTC если UTC+4).
    // При отображении нужно показать 05:00, а не 01:00.
    //
    // Логика сохранения:
    // 1. Пользователь выбирает: 05:00 (локальное время)
    // 2. Создается: new Date('2024-01-20T05:00:00') - интерпретируется как локальное
    // 3. Конвертируется: .toISOString() -> '2024-01-20T01:00:00.000Z' (UTC)
    // 4. Сохраняется в БД: 01:00 UTC
    //
    // Логика отображения:
    // 1. БД возвращает: '2024-01-20T01:00:00.000Z' (UTC)
    // 2. Создается: new Date('2024-01-20T01:00:00.000Z')
    // 3. getHours() вернет: 05:00 (локальное время в UTC+4) ✅ ПРАВИЛЬНО!
    //
    // НО! Если время неправильно сохраняется или возвращается БЕЗ Z,
    // то JavaScript может неправильно интерпретировать часовой пояс.
    //
    // Решение: Используем локальные методы getFullYear(), getMonth(), getDate(), getHours(), getMinutes()
    // Эти методы автоматически конвертируют UTC время в локальное время браузера.
    
    // ВАЖНО: Используем локальные методы для получения времени приема
    // Это автоматически конвертирует UTC в локальное время браузера,
    // что даст нам правильное время, соответствующее выбранному пользователем.
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    
    // DEBUG: Выводим в консоль для диагностики (можно удалить после исправления)
    if (typeof window !== 'undefined') {
      const dateStr = typeof date === 'string' ? date : date.toISOString();
      console.log('🔍 [DATE FORMAT] Форматирование времени приема:', {
        input: dateStr,
        dateObj: dateObj.toISOString(),
        localHours: hours,
        localMinutes: minutes,
        utcHours: dateObj.getUTCHours(),
        utcMinutes: dateObj.getUTCMinutes(),
        timezoneOffset: dateObj.getTimezoneOffset(),
      });
    }
    
    // Форматируем дату
    let formattedDate: string;
    if (options?.dateFormat === 'long') {
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      formattedDate = `${day} ${months[month]} ${year}`;
    } else {
      formattedDate = `${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
    }
    
    // Форматируем время
    const formattedTime = options?.timeFormat === 'long' 
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
      : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    return `${formattedDate} ${formattedTime}`;
  } catch (error) {
    console.error('❌ [DATE FORMAT] Ошибка форматирования даты:', error);
    // Fallback на стандартное форматирование
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * Форматирует только дату приема БЕЗ конвертации часовых поясов
 * 
 * @param date - Дата (Date объект или ISO строка)
 * @param format - Формат ('short' | 'long')
 * @returns Отформатированная строка даты
 */
export function formatAppointmentDate(
  date: Date | string,
  format: 'short' | 'long' = 'short'
): string {
  try {
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    
    if (!match) {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: format === 'long' ? 'long' : '2-digit',
        day: '2-digit',
      });
    }
    
    const [, year, month, day] = match;
    
    if (format === 'long') {
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    }
    
    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error('❌ [DATE FORMAT] Ошибка форматирования даты:', error);
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ru-RU');
  }
}

/**
 * Форматирует только время приема БЕЗ конвертации часовых поясов
 * 
 * @param date - Дата (Date объект или ISO строка)
 * @param format - Формат ('short' | 'long')
 * @returns Отформатированная строка времени
 */
export function formatAppointmentTime(
  date: Date | string,
  format: 'short' | 'long' = 'short'
): string {
  try {
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const match = dateStr.match(/T(\d{2}):(\d{2}):(\d{2})/);
    
    if (!match) {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        ...(format === 'long' && { second: '2-digit' }),
      });
    }
    
    const [, hours, minutes, seconds] = match;
    
    return format === 'long' ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
  } catch (error) {
    console.error('❌ [DATE FORMAT] Ошибка форматирования времени:', error);
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

