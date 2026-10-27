import { request } from "./apiClient";
import type { User } from "../types/domain";
export const userService = {
  profile: () => request<User>("/users/me"),
  updateProfile: (name: string) =>
    request<User>("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),
};
