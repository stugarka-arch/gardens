import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Empty } from "../../components/common/Empty";
import { PlantCard } from "../../components/plants/PlantCard";
import { routePaths } from "../../routes/routePaths";
import { plantService } from "../../services/plantService";
import { userService } from "../../services/userService";
import { useFlowerbedStore } from "../../stores/flowerbedStore";
import type { Plant, User } from "../../types/domain";
import { errorText } from "../../utils/errors";
export function DashboardPage() {
  const beds = useFlowerbedStore((state) => state.items);
  const loadBeds = useFlowerbedStore((state) => state.load);
  const [profile, setProfile] = useState<User | null>(null);
  const [collection, setCollection] = useState<{ id: string; plant: Plant }[]>(
    [],
  );
  const [error, setError] = useState("");
  useEffect(() => {
    void Promise.all([
      userService.profile(),
      loadBeds(),
      plantService.collection(),
    ])
      .then(([user, , plants]) => {
        setProfile(user);
        setCollection(plants);
      })
      .catch((reason: unknown) => setError(errorText(reason)));
  }, [loadBeds]);
  return (
    <section className="page">
      <p className="eyebrow">Особистий кабінет</p>
      <h1>{profile?.name || profile?.email || "Ваш сад"}</h1>
      {error && <p className="notice">{error}</p>}
      <div className="section-heading">
        <h2>Мої клумби</h2>
        <Link className="button button--small" to={routePaths.newFlowerbed}>
          Нова клумба
        </Link>
      </div>
      {beds.length ? (
        <div className="beds">
          {beds.map((bed) => (
            <Link
              className="bed-card"
              to={routePaths.flowerbed(bed.id)}
              key={bed.id}
            >
              <span>✾</span>
              <h3>{bed.name}</h3>
              <p>
                {bed._count?.plants || 0} розміщень ·{" "}
                {bed.areaM2
                  ? `${bed.areaM2.toFixed(1)} м²`
                  : "Розміри не задані"}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <Empty>
          Ще немає клумб.{" "}
          <Link to={routePaths.newFlowerbed}>Створити першу</Link>
        </Empty>
      )}
      <div className="section-heading">
        <h2>Моя колекція</h2>
        <Link to={routePaths.catalog}>Відкрити каталог</Link>
      </div>
      <div className="grid grid--compact">
        {collection.map(({ id, plant }) => (
          <PlantCard key={id} plant={plant} />
        ))}
      </div>
      {!collection.length && <Empty>Тут з’являться збережені рослини.</Empty>}
    </section>
  );
}
