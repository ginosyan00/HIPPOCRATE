import { UserRole, UserStatus } from '../types/api.types';

/**
 * Role Redirect Utility
 * Централизованная логика редиректов на основе роли и статуса пользователя
 */

export interface RedirectConfig {
  role: UserRole | string;
  status?: UserStatus | string;
  clinicId?: string | null;
}

/**
 * Определяет путь редиректа на основе роли и статуса пользователя
 * 
 * @param config - Конфигурация с ролью, статусом и clinicId
 * @returns Путь для редиректа
 * 
 * @example
 * getRoleRedirectPath({ role: 'PATIENT', status: 'ACTIVE' }) // '/dashboard/patient'
 * getRoleRedirectPath({ role: 'DOCTOR', status: 'PENDING' }) // '/pending-approval'
 */
export const getRoleRedirectPath = (config: RedirectConfig): string => {
  const { role, status, clinicId } = config;

  console.log('🔵 [ROLE REDIRECT] Определение пути:', { role, status, clinicId });

  // Приоритет 1: Проверка статуса (PENDING, SUSPENDED, REJECTED)
  if (status === 'PENDING') {
    console.log('⏳ [ROLE REDIRECT] Статус PENDING -> /pending-approval');
    return '/pending-approval';
  }

  if (status === 'SUSPENDED' || status === 'REJECTED') {
    console.log('🚫 [ROLE REDIRECT] Статус заблокирован -> /login');
    return '/login';
  }

  // Приоритет 2: Редирект на основе роли
  switch (role) {
    case UserRole.PATIENT:
      console.log('👤 [ROLE REDIRECT] PATIENT -> /dashboard/patient');
      return '/dashboard/patient';

    case UserRole.DOCTOR:
      console.log('⚕️ [ROLE REDIRECT] DOCTOR -> /dashboard/doctor');
      return '/dashboard/doctor';

    case UserRole.PARTNER:
      console.log('🏢 [ROLE REDIRECT] PARTNER -> /dashboard/partner');
      return '/dashboard/partner';

    case UserRole.ADMIN:
      // ADMIN с clinicId = владелец клиники -> основной Dashboard
      // ADMIN без clinicId = супер-админ -> Admin Dashboard
      if (clinicId) {
        console.log('🏥 [ROLE REDIRECT] ADMIN с clinicId -> /dashboard');
        return '/dashboard';
      } else {
        console.log('🔑 [ROLE REDIRECT] Супер-ADMIN -> /dashboard/admin');
        return '/dashboard/admin';
      }

    case 'CLINIC':
      // Для обратной совместимости со старыми данными
      console.log('🏥 [ROLE REDIRECT] CLINIC -> /dashboard');
      return '/dashboard';

    default:
      // Fallback для неизвестных ролей или старых данных
      console.log('📊 [ROLE REDIRECT] Неизвестная роль -> /dashboard (fallback)');
      return '/dashboard';
  }
};

/**
 * Проверяет, может ли пользователь с данной ролью получить доступ к указанному пути
 * 
 * @param userRole - Роль пользователя
 * @param path - Путь для проверки
 * @returns true если доступ разрешен, false если запрещен
 * 
 * @example
 * canAccessPath('PATIENT', '/dashboard/patient') // true
 * canAccessPath('PATIENT', '/dashboard/admin') // false
 */
export const canAccessPath = (userRole: UserRole | string, path: string): boolean => {
  // Публичные пути доступны всем
  const publicPaths = ['/', '/login', '/register', '/register-user', '/clinics', '/clinic'];
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return true;
  }

  // Маппинг ролей на разрешенные пути
  const rolePathMap: Record<string, string[]> = {
    [UserRole.PATIENT]: ['/dashboard/patient', '/dashboard/patient/appointments', '/dashboard/patient/clinics', '/dashboard/patient/analytics'],
    [UserRole.DOCTOR]: ['/dashboard/doctor'],
    [UserRole.PARTNER]: ['/dashboard/partner'],
    [UserRole.ADMIN]: ['/dashboard', '/dashboard/admin', '/dashboard/patients', '/dashboard/appointments', '/dashboard/staff', '/dashboard/analytics', '/dashboard/web', '/dashboard/settings'],
    CLINIC: ['/dashboard', '/dashboard/patients', '/dashboard/appointments', '/dashboard/staff', '/dashboard/analytics', '/dashboard/web', '/dashboard/settings'],
  };

  const allowedPaths = rolePathMap[userRole] || [];
  const isAllowed = allowedPaths.some(allowedPath => path.startsWith(allowedPath));

  console.log('🔵 [ROLE REDIRECT] Проверка доступа:', {
    role: userRole,
    path,
    isAllowed,
  });

  return isAllowed;
};

/**
 * Получает список разрешенных путей для роли
 * 
 * @param userRole - Роль пользователя
 * @returns Массив разрешенных путей
 */
export const getAllowedPaths = (userRole: UserRole | string): string[] => {
  const rolePathMap: Record<string, string[]> = {
    [UserRole.PATIENT]: ['/dashboard/patient', '/dashboard/patient/appointments', '/dashboard/patient/clinics', '/dashboard/patient/analytics'],
    [UserRole.DOCTOR]: ['/dashboard/doctor'],
    [UserRole.PARTNER]: ['/dashboard/partner'],
    [UserRole.ADMIN]: ['/dashboard', '/dashboard/admin', '/dashboard/patients', '/dashboard/appointments', '/dashboard/staff', '/dashboard/analytics', '/dashboard/web', '/dashboard/settings'],
    CLINIC: ['/dashboard', '/dashboard/patients', '/dashboard/appointments', '/dashboard/staff', '/dashboard/analytics', '/dashboard/web', '/dashboard/settings'],
  };

  return rolePathMap[userRole] || ['/dashboard'];
};

