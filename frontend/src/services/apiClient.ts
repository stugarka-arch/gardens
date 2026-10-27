import type { ApiErrorBody } from "../types/api";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    ...init,
  });
  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as ApiErrorBody | null;
    const message = Array.isArray(body?.message)
      ? body.message.join(" ")
      : body?.message || "Не вдалося виконати запит";
    throw new ApiError(message, response.status);
  }
  return response.status === 204
    ? (undefined as T)
    : (response.json() as Promise<T>);
}
export { baseUrl };
