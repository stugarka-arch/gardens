import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { routePaths } from "../../routes/routePaths";
export function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  return (
    <header className="site-header">
      <Link className="brand" to={routePaths.home}>
        Gardens<span>.</span>
      </Link>
      <nav>
        <NavLink to={routePaths.catalog}>Каталог</NavLink>
        {user && <NavLink to={routePaths.dashboard}>Кабінет</NavLink>}
      </nav>
      <div>
        {user ? (
          <button className="link-button" onClick={() => void logout()}>
            Вийти
          </button>
        ) : (
          <Link className="button button--small" to={routePaths.auth}>
            Увійти
          </Link>
        )}
      </div>
    </header>
  );
}
