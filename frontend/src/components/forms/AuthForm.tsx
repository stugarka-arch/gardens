import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";
import { errorText } from "../../utils/errors";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "../../forms/schemas/authSchemas";
import { routePaths } from "../../routes/routePaths";
export type AuthMode = "login" | "register" | "reset";
type AuthFormValues = { email: string; password: string };
export function AuthForm({
  mode,
  onModeChange,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}) {
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const nav = useNavigate();
  const schema =
    mode === "login"
      ? loginSchema
      : mode === "register"
        ? registerSchema
        : forgotPasswordSchema;
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<AuthFormValues>,
    defaultValues: { email: "", password: "" },
  });
  const submit = async (values: AuthFormValues) => {
    try {
      if (mode === "reset") {
        await authService.forgotPassword(values.email);
        onModeChange("login");
        return;
      }
      if (mode === "login") await login(values.email, values.password);
      else await register(values.email, values.password);
      nav(routePaths.dashboard);
    } catch (error) {
      setError("root", { message: errorText(error) });
    }
  };
  return (
    <form onSubmit={handleSubmit(submit)}>
      <label>
        Email
        <input type="email" autoComplete="email" {...field("email")} />
      </label>
      {errors.email && <p className="field-error">{errors.email.message}</p>}
      {mode !== "reset" && (
        <>
          <label>
            Пароль
            <input
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              {...field("password")}
            />
          </label>
          {errors.password && (
            <p className="field-error">{errors.password.message}</p>
          )}
        </>
      )}
      <button className="button" disabled={isSubmitting}>
        {mode === "login"
          ? "Увійти"
          : mode === "register"
            ? "Зареєструватися"
            : "Надіслати посилання"}
      </button>
      {errors.root && <p className="notice">{errors.root.message}</p>}
      <div className="auth__links">
        <button
          type="button"
          onClick={() => onModeChange(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Створити обліковий запис"
            : "Уже є обліковий запис"}
        </button>
        <button type="button" onClick={() => onModeChange("reset")}>
          Не пам’ятаю пароль
        </button>
      </div>
    </form>
  );
}
