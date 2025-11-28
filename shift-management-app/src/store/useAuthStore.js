import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      stores: [],
      isAuthenticated: false,

      setAuth: (user, token, stores = []) => {
        set({ user, token, stores, isAuthenticated: true });
      },

      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
      },

      logout: () => {
        set({ user: null, token: null, stores: [], isAuthenticated: false });
      },

      getToken: () => get().token,

      isAdmin: () => get().user?.role === 'admin',
      isManager: () => ['admin', 'manager'].includes(get().user?.role),
      isStaff: () => get().user?.role === 'staff',
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
