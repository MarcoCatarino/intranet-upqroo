import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { usersApi, authApi } from "@/services/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionVerified: boolean;
  setUser: (user: User | null) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      sessionVerified: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const user = await usersApi.me();
          set({ user, isAuthenticated: true, sessionVerified: true });
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            sessionVerified: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            sessionVerified: false,
          });
        }
      },
    }),
    {
      name: "upqroo-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
