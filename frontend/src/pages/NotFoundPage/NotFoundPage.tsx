import { Link } from "react-router-dom";
import { Empty } from "../../components/common/Empty";
import { routePaths } from "../../routes/routePaths";
export function NotFoundPage() {
  return (
    <Empty>
      Сторінку не знайдено. <Link to={routePaths.home}>На головну</Link>
    </Empty>
  );
}
