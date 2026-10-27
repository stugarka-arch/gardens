import { Outlet } from "react-router-dom";
import { Header } from "../navigation/Header";
export function AppLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
