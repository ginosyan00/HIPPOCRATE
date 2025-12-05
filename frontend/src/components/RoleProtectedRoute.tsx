import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { getRoleRedirectPath, canAccessPath } from '../utils/roleRedirect';
import { UserRole } from '../types/api.types';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Разрешенные роли для доступа к этому роуту
   * Если не указано, проверяется доступ на основе пути
   */
  allowedRoles?: (UserRole | string)[];
  /**
   * Если true, разрешает доступ только для ACTIVE пользователей
   * По умолчанию: true
   */
  requireActive?: boolean;
}

/**
 * Role Protected Route Component
 * Защищенный маршрут с проверкой роли и статуса пользователя
 * 
 * @example
 * <RoleProtectedRoute allowedRoles={[UserRole.ADMIN]}>
 *   <AdminDashboard />
 * </RoleProtectedRoute>
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireActive = true,
}) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const location = useLocation();

  useEffect(() => {
    console.log('🔵 [ROLE PROTECTED ROUTE] Проверка доступа:', {
      path: location.pathname,
      isAuthenticated,
      userRole: user?.role,
      userStatus: user?.status,
      allowedRoles,
      requireActive,
    });
  }, [location, isAuthenticated, user, allowedRoles, requireActive]);

  // Шаг 1: Проверка аутентификации
  if (!isAuthenticated || !user || !token) {
    console.log('🔴 [ROLE PROTECTED ROUTE] Не авторизован -> redirect to /login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Шаг 2: Специальная проверка для страницы pending-approval
  if (location.pathname === '/pending-approval') {
    // Страница pending-approval доступна только для пользователей со статусом PENDING
    if (user.status !== 'PENDING') {
      console.log('🚫 [ROLE PROTECTED ROUTE] Доступ к /pending-approval только для PENDING, текущий статус:', user.status);
      const redirectPath = getRoleRedirectPath({
        role: user.role,
        status: user.status,
        clinicId: user.clinicId,
      });
      return <Navigate to={redirectPath} replace />;
    }
    // Если статус PENDING и путь /pending-approval - разрешаем доступ
    console.log('✅ [ROLE PROTECTED ROUTE] Доступ к /pending-approval разрешен (PENDING)');
    return <>{children}</>;
  }

  // Шаг 3: Проверка статуса (если требуется ACTIVE)
  if (requireActive && user.status !== 'ACTIVE') {
    console.log('⏳ [ROLE PROTECTED ROUTE] Статус не ACTIVE:', user.status);
    const redirectPath = getRoleRedirectPath({
      role: user.role,
      status: user.status,
      clinicId: user.clinicId,
    });
    return <Navigate to={redirectPath} replace />;
  }

  // Шаг 4: Проверка роли
  // ВАЖНО: Сначала проверяем, доступен ли текущий путь для роли пользователя
  // Это позволяет сохранить текущую страницу при обновлении, если путь доступен
  const currentPathAccessible = canAccessPath(user.role, location.pathname);
  
  if (allowedRoles && allowedRoles.length > 0) {
    // Если указаны конкретные роли, проверяем их
    const hasAccess = allowedRoles.includes(user.role);
    
    if (!hasAccess) {
      console.log('🚫 [ROLE PROTECTED ROUTE] Доступ запрещен. Роль:', user.role, 'Разрешенные:', allowedRoles);
      
      // Если текущий путь доступен для роли пользователя, разрешаем доступ
      // Это позволяет остаться на текущей странице при обновлении
      if (currentPathAccessible) {
        console.log('✅ [ROLE PROTECTED ROUTE] Текущий путь доступен для роли, остаемся на странице:', location.pathname);
        return <>{children}</>;
      }
      
      // Редирект на правильный dashboard для роли пользователя только если текущий путь недоступен
      const redirectPath = getRoleRedirectPath({
        role: user.role,
        status: user.status,
        clinicId: user.clinicId,
      });
      return <Navigate to={redirectPath} replace />;
    }
  } else {
    // Если роли не указаны, проверяем доступ на основе пути
    const hasAccess = canAccessPath(user.role, location.pathname);
    
    if (!hasAccess) {
      console.log('🚫 [ROLE PROTECTED ROUTE] Доступ запрещен для пути:', location.pathname);
      // Редирект на правильный dashboard для роли пользователя
      const redirectPath = getRoleRedirectPath({
        role: user.role,
        status: user.status,
        clinicId: user.clinicId,
      });
      return <Navigate to={redirectPath} replace />;
    }
  }

  console.log('✅ [ROLE PROTECTED ROUTE] Доступ разрешен');
  return <>{children}</>;
};

