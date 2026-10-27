import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Empty } from "../../components/common/Empty";
import { PlantCard } from "../../components/plants/PlantCard";
import { routePaths } from "../../routes/routePaths";
import { flowerbedService } from "../../services/flowerbedService";
import { plantService } from "../../services/plantService";
import { useAuthStore } from "../../stores/authStore";
import type {
  Flowerbed,
  Plant,
  PlantVariant,
  PlantVariantColor,
} from "../../types/domain";
import { errorText } from "../../utils/errors";
export function PlantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [variants, setVariants] = useState<PlantVariant[]>([]);
  const [variant, setVariant] = useState<PlantVariant | null>(null);
  const [color, setColor] = useState<PlantVariantColor | null>(null);
  const [beds, setBeds] = useState<Flowerbed[]>([]);
  const [bedId, setBedId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!id) return;
    void Promise.all([plantService.plant(id), plantService.variants(id)])
      .then(([item, options]) => {
        setPlant(item);
        setVariants(options);
        if (options.length === 1) {
          setVariant(options[0]);
          if (options[0].colors.length === 1) setColor(options[0].colors[0]);
        }
      })
      .catch((reason: unknown) => setError(errorText(reason)));
  }, [id]);
  useEffect(() => {
    if (user)
      void flowerbedService
        .list()
        .then((items) => {
          setBeds(items);
          if (items.length === 1) setBedId(items[0].id);
        })
        .catch((reason: unknown) => setError(errorText(reason)));
  }, [user]);
  const addToFlowerbed = async () => {
    if (!id || !bedId) return;
    try {
      await flowerbedService.addPlacement(bedId, {
        plantId: id,
        quantity: 1,
        xCm: 0,
        yCm: 0,
      });
      navigate(routePaths.flowerbed(bedId));
    } catch (reason) {
      setMessage(errorText(reason));
    }
  };
  if (error)
    return (
      <Empty>
        {error} <Link to={routePaths.catalog}>До каталогу</Link>
      </Empty>
    );
  return (
    <section className="page">
      <p className="eyebrow">Спільний каталог</p>
      <h1>{plant?.scientificName || "Завантаження…"}</h1>
      {plant && <PlantCard plant={plant} />}
      <section className="variant-picker">
        <h2>Сорт і колір</h2>
        {variants.length ? (
          <label>
            Сорт або різновид
            <select
              value={variant?.id || ""}
              onChange={(event) => {
                const selected =
                  variants.find((item) => item.id === event.target.value) ||
                  null;
                setVariant(selected);
                setColor(
                  selected?.colors.length === 1 ? selected.colors[0] : null,
                );
              }}
            >
              <option value="">Виберіть сорт</option>
              {variants.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.varietyName}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="notice">Для цього виду ще немає варіантів.</p>
        )}
        {variant && (
          <>
            {variant.colors.length ? (
              <label>
                Колір
                <select
                  value={color?.id || ""}
                  onChange={(event) =>
                    setColor(
                      variant.colors.find(
                        (item) => item.id === event.target.value,
                      ) || null,
                    )
                  }
                >
                  <option value="">Виберіть колір</option>
                  {variant.colors.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                      {item.decorativePart ? ` · ${item.decorativePart}` : ""}
                      {item.season ? ` · ${item.season}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="notice">Для цього сорту ще не зазначено колір.</p>
            )}
          </>
        )}
        {variant && color && (
          <p className="notice">
            Обрано: {variant.varietyName}, {color.name}.
          </p>
        )}
      </section>
      {user && plant && (
        <section className="variant-picker">
          <h2>Додати до клумби</h2>
          {beds.length ? (
            <div className="actions">
              <select
                value={bedId}
                onChange={(event) => setBedId(event.target.value)}
              >
                <option value="">Виберіть клумбу</option>
                {beds.map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {bed.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="button"
                disabled={!bedId}
                onClick={() => void addToFlowerbed()}
              >
                Додати до вибраної клумби
              </button>
            </div>
          ) : (
            <p>У вас ще немає клумб.</p>
          )}
          <Link
            className="button button--secondary"
            to={`${routePaths.newFlowerbed}?plantId=${plant.id}`}
          >
            Створити нову клумбу
          </Link>
          {message && <p className="notice">{message}</p>}
        </section>
      )}
      {!user && (
        <p className="notice">
          <Link to={routePaths.auth}>Увійдіть</Link>, щоб додати рослину до
          клумби.
        </p>
      )}
    </section>
  );
}
