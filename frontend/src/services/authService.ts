import { request } from "./apiClient";
import type { User } from "../types/domain";
export const authService = {
  me: () => request<{ user: User | null }>("/auth/me"),
  login: (email: string, password: string) =>
    request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string) =>
    request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};
