import { create } from 'zustand';
import { User } from '../types/api.types';

/**
 * Auth Store
 * Глобальное состояние аутентификации
 */

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initial state
  const savedUser = (() => {
    const savedUserStr = localStorage.getItem('user');
    if (savedUserStr) {
      try {
        return JSON.parse(savedUserStr);
      } catch (err) {
        console.error('🔴 [AUTH STORE] Ошибка парсинга user из localStorage:', err);
        return null;
      }
    }
    return null;
  })();
  
  const savedToken = localStorage.getItem('token');
  const isAuth = !!savedToken;

  console.log('🔵 [AUTH STORE] Инициализация:', {
    hasUser: !!savedUser,
    userEmail: savedUser?.email,
    role: savedUser?.role,
    hasToken: !!savedToken,
    isAuthenticated: isAuth,
  });

  return {
    user: savedUser,
    token: savedToken,
    isAuthenticated: isAuth,

    // Set auth (после login/register)
    setAuth: (user, token) => {
      console.log('✅ [AUTH STORE] setAuth:', { email: user.email, role: user.role, status: user.status });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      set({
        user,
        token,
        isAuthenticated: true,
      });
    },

    // Logout
    logout: () => {
      console.log('🔴 [AUTH STORE] logout вызван');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    },

    // Update user data
    updateUser: (user) => {
      console.log('🔵 [AUTH STORE] updateUser:', { email: user.email, role: user.role });
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    },
  };
});


