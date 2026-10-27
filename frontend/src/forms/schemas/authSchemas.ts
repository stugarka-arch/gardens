import { z } from "zod";
export const loginSchema = z.object({
  email: z.email("Введіть коректний email"),
  password: z.string().min(1, "Введіть пароль").max(128),
});
export const registerSchema = z.object({
  email: z.email("Введіть коректний email"),
  password: z
    .string()
    .min(8, "Пароль має містити щонайменше 8 символів")
    .max(128),
});
export const forgotPasswordSchema = z.object({
  email: z.email("Введіть коректний email"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
