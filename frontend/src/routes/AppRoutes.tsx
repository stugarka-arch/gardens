import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { Loading } from "../components/common/Loading";
import { AuthPage } from "../pages/AuthPage/AuthPage";
import { CatalogPage } from "../pages/CatalogPage/CatalogPage";
import { DashboardPage } from "../pages/DashboardPage/DashboardPage";
import { FlowerbedEditorPage } from "../pages/FlowerbedEditorPage/FlowerbedEditorPage";
import { HomePage } from "../pages/HomePage/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage/NotFoundPage";
import { PlantDetailsPage } from "../pages/PlantDetailsPage/PlantDetailsPage";
import { useAuthStore } from "../stores/authStore";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { routePaths } from "./routePaths";
export function AppRoutes() {
  const isSessionLoading = useAuthStore((state) => state.isSessionLoading);
  if (isSessionLoading) return <Loading />;
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={routePaths.home} element={<HomePage />} />
        <Route path={routePaths.catalog} element={<CatalogPage />} />
        <Route
          path={routePaths.plantDetails()}
          element={<PlantDetailsPage />}
        />
        <Route element={<GuestRoute />}>
          <Route path={routePaths.auth} element={<AuthPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path={routePaths.dashboard} element={<DashboardPage />} />
          <Route
            path={routePaths.newFlowerbed}
            element={<FlowerbedEditorPage />}
          />
          <Route
            path={routePaths.flowerbed()}
            element={<FlowerbedEditorPage />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
