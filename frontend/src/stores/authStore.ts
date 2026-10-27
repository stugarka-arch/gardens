import { create } from "zustand";
import { authService } from "../services/authService";
import type { User } from "../types/domain";
type AuthState = {
  user: User | null;
  isSessionLoading: boolean;
  isAuthenticated: boolean;
  loadSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
};
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isSessionLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  loadSession: async () => {
    set({ isSessionLoading: true });
    try {
      const { user } = await authService.me();
      set({ user, isAuthenticated: Boolean(user) });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isSessionLoading: false });
    }
  },
  login: async (email, password) => {
    const { user } = await authService.login(email, password);
    set({ user, isAuthenticated: true });
  },
  register: async (email, password) => {
    const { user } = await authService.register(email, password);
    set({ user, isAuthenticated: true });
  },
  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
