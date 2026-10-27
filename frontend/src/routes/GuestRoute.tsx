import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { routePaths } from "./routePaths";
export function GuestRoute() {
  return useAuthStore((state) => state.isAuthenticated) ? (
    <Navigate to={routePaths.dashboard} replace />
  ) : (
    <Outlet />
  );
}
