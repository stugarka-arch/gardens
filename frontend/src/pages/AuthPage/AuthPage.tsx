import { useState } from "react";
import { AuthForm, type AuthMode } from "../../components/forms/AuthForm";
export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const title =
    mode === "login"
      ? "Раді знову вас бачити"
      : mode === "register"
        ? "Створіть свій сад"
        : "Відновлення пароля";
  return (
    <section className="auth">
      <p className="eyebrow">Gardens account</p>
      <h1>{title}</h1>
      <AuthForm mode={mode} onModeChange={setMode} />
    </section>
  );
}
