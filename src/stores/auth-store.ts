// Store Zustand pour la gestion de l'authentification
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  role: "CLIENT" | "PRESTATAIRE" | "ADMIN";
  firstName: string;
  lastName: string;
  city?: string | null;
  phone?: string | null;
  avatar?: string | null;
  emailVerified: boolean;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_data", JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      logout: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("refresh_token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      clearAuth: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("refresh_token");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "tasky-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
