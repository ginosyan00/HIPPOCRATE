import { create } from 'zustand';

/**
 * UI Store
 * Глобальное состояние UI (sidebar, модальные окна и т.д.)
 */

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
}));


