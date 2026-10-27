import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { routePaths } from "./routePaths";
export function AdminRoute() {
  return useAuthStore((state) => state.user?.role === "ADMIN") ? (
    <Outlet />
  ) : (
    <Navigate to={routePaths.home} replace />
  );
}
