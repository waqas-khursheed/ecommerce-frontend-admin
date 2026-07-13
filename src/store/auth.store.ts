import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAuthToken, setAuthToken } from "@/lib/auth-token";
import type { Admin } from "@/types/auth";

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  setSession: (admin: Admin, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      setSession: (admin, token) => {
        setAuthToken(token);
        set({ admin, isAuthenticated: true });
      },
      logout: () => {
        clearAuthToken();
        set({ admin: null, isAuthenticated: false });
      },
    }),
    {
      name: "admin-auth",
      partialize: (state) => ({ admin: state.admin, isAuthenticated: state.isAuthenticated }),
    }
  )
);
