import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { routePaths } from "./routePaths";
export function ProtectedRoute() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  return authenticated ? <Outlet /> : <Navigate to={routePaths.auth} replace />;
}
