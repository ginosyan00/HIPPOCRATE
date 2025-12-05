import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BackButtonProps {
  /**
   * Fallback путь, если нет истории браузера
   * По умолчанию: '/' для публичных страниц, '/dashboard' для дашбордов
   */
  fallback?: string;
  /**
   * Дополнительные CSS классы
   */
  className?: string;
  /**
   * Показывать ли текст "Назад" или только иконку
   */
  showText?: boolean;
}

/**
 * BackButton Component - Universal Back Navigation
 * Универсальная кнопка "Назад" с навигацией через React Router
 * 
 * Использование:
 * <BackButton />
 * <BackButton fallback="/dashboard" showText />
 */
export const BackButton: React.FC<BackButtonProps> = ({
  fallback,
  className = '',
  showText = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Определяем fallback на основе текущего пути
  const getDefaultFallback = (): string => {
    if (fallback) return fallback;
    
    // Если мы на странице дашборда, fallback на /dashboard
    if (location.pathname.startsWith('/dashboard')) {
      return '/dashboard';
    }
    
    // Для публичных страниц - на главную
    return '/';
  };

  // Проверяем, есть ли валидная страница для возврата
  const canGoBack = (): boolean => {
    // Не показываем на главной странице
    if (location.pathname === '/') {
      return false;
    }

    // Проверяем, есть ли история браузера
    // Если window.history.length <= 1, значит пользователь зашел напрямую на страницу
    // В этом случае нет валидной страницы для возврата - скрываем кнопку
    if (window.history.length <= 1) {
      return false;
    }

    return true;
  };

  const handleBack = () => {
    // Проверяем, есть ли история
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Если нет истории, но есть fallback - перенаправляем на fallback
      // Но это не должно происходить, так как мы уже проверили canGoBack
      navigate(getDefaultFallback(), { replace: true });
    }
  };

  // Скрываем кнопку, если нет валидной страницы для возврата
  if (!canGoBack()) {
    return null;
  }

  const baseStyles =
    'inline-flex items-center gap-2 text-sm font-normal text-text-50 hover:text-main-100 transition-smooth focus:outline-none';

  return (
    <button
      onClick={handleBack}
      className={`${baseStyles} ${className}`}
      aria-label="Вернуться назад"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {showText && <span>Назад</span>}
    </button>
  );
};

