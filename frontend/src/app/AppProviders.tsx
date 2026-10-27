import { useEffect, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
export function AppProviders({ children }: { children: ReactNode }) {
  const loadSession = useAuthStore((state) => state.loadSession);
  useEffect(() => {
    void loadSession();
  }, [loadSession]);
  return <BrowserRouter>{children}</BrowserRouter>;
}
