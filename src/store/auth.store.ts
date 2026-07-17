import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAuthToken, setAuthToken } from "@/lib/auth-token";
import type { Admin } from "@/types/auth";

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  setSession: (admin: Admin, token: string) => void;
  updateAdmin: (admin: Admin) => void;
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
      // Refreshes the session's admin object in place (e.g. after the admin
      // edits their own name/email/image on /profile) without touching the
      // token — a full setSession would need a fresh login for no reason.
      updateAdmin: (admin) => set({ admin }),
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
