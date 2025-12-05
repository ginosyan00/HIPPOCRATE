import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Component
 * Защищенный маршрут - требует авторизации
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const location = useLocation();

  useEffect(() => {
    console.log('🔵 [PROTECTED ROUTE] Проверка доступа:', {
      path: location.pathname,
      isAuthenticated,
      user: user?.email,
      role: user?.role,
      status: user?.status,
      hasToken: !!token,
    });
  }, [location, isAuthenticated, user, token]);

  if (!isAuthenticated) {
    console.log('🔴 [PROTECTED ROUTE] Не авторизован -> redirect to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ [PROTECTED ROUTE] Доступ разрешен');
  return <>{children}</>;
};


