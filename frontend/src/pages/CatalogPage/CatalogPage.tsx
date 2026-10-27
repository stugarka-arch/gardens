
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Empty } from "../../components/common/Empty";
import { PlantCard } from "../../components/plants/PlantCard";
import {
  discoverySchema,
  type DiscoveryFormValues,
} from "../../forms/schemas/discoverySchema";
import { routePaths } from "../../routes/routePaths";
import { plantDiscoveryService } from "../../services/plantDiscoveryService";
import { plantService, type PlantChoice } from "../../services/plantService";
import { useAuthStore } from "../../stores/authStore";
import { usePlantStore } from "../../stores/plantStore";
import { errorText } from "../../utils/errors";

const categories = [
  "TREE",
  "SHRUB",
  "PERENNIAL",
  "ANNUAL",
  "BULB",
  "GRASS",
  "FERN",
  "CLIMBER",
  "GROUNDCOVER",
];

type RegistrySuggestion = {
  externalId: string;
  scientificName: string;
  rank: string;
  taxonStatus?: string;
  sourceUrl: string;
  family?: string;
  genus?: string;
};

export function CatalogPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const {
    items,
    pagination,
    query,
    category,
    isLoading,
    error,
    setQuery,
    setCategory,
    setPage,
    load,
  } = usePlantStore();

  const [draftQuery, setDraftQuery] = useState(query);
  const [notice, setNotice] = useState("");
  const [choices, setChoices] = useState<PlantChoice[]>([]);
  const [registryChoices, setRegistryChoices] = useState<
    RegistrySuggestion[]
  >([]);
  const [showingChoices, setShowingChoices] = useState(false);
  const [selectedTaxon, setSelectedTaxon] =
    useState<RegistrySuggestion | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<DiscoveryFormValues>({
    resolver: zodResolver(discoverySchema),
    defaultValues: {
      query: "",
      varietyName: "",
      color: "",
      isNoSpecifiedVariety: false,
    },
  });

  useEffect(() => {
    void load();
  }, [load, pagination.page, query, category]);

  const search = (event: FormEvent) => {
    event.preventDefault();
    setQuery(draftQuery);
  };

  const save = async (id: string) => {
    try {
      await plantService.addToCollection(id);
      setNotice("Рослину додано до вашої колекції.");
    } catch (reason) {
      setNotice(errorText(reason));
    }
  };

  const clearResults = () => {
    setChoices([]);
    setRegistryChoices([]);
    setShowingChoices(false);
    setSelectedTaxon(null);
  };

  const discover = async (values: DiscoveryFormValues) => {
    clearResults();
    setNotice("Шукаємо рослину у зовнішньому реєстрі…");

    try {
      // 1. Спочатку шукаємо в зовнішньому реєстрі.
      const registry = await plantDiscoveryService.registrySuggestions(
        values.query.trim(),
      );

      if (registry.externalRegistry.length > 0) {
        setRegistryChoices(registry.externalRegistry);
        setShowingChoices(true);
        setNotice(
          `У зовнішньому реєстрі знайдено варіантів: ${registry.externalRegistry.length}. Виберіть відповідний ботанічний вид.`,
        );
        return;
      }

      // 2. Якщо реєстр не дав результатів, перевіряємо Gardens.
      setNotice(
        "Зовнішній реєстр не повернув результатів. Перевіряємо каталог Gardens…",
      );

      const gardens = registry.gardensCatalog.length
        ? registry.gardensCatalog
        : await plantService.choices(values.query.trim());

      if (gardens.length > 0) {
        setChoices(gardens);
        setShowingChoices(true);
        setNotice(
          `У каталозі Gardens знайдено варіантів: ${gardens.length}.`,
        );
        return;
      }

      // 3. Якщо обидва джерела порожні, запускаємо основний пошук.
      setNotice(
        "У реєстрі та каталозі Gardens збігів не знайдено. Виконуємо додатковий пошук…",
      );

      const result = await plantDiscoveryService.discover({
        ...values,
        query: values.query.trim(),
        varietyName: values.varietyName || undefined,
        color: values.color || undefined,
      });

      const plantId = result.matchedPlant?.id;

      if (
        plantId &&
        (result.outcome === "CATALOG_CREATED" ||
          result.outcome === "CATALOG_EXISTING")
      ) {
        navigate(routePaths.plantDetails(plantId));
        return;
      }

      // Після додаткового пошуку знову перевіряємо обидва джерела.
      const refreshed = await plantDiscoveryService.registrySuggestions(
        values.query.trim(),
      );

      if (refreshed.externalRegistry.length > 0) {
        setRegistryChoices(refreshed.externalRegistry);
        setShowingChoices(true);
        setNotice("Знайдено варіанти у зовнішньому реєстрі.");
      } else {
        const fallback = refreshed.gardensCatalog.length
          ? refreshed.gardensCatalog
          : await plantService.choices(values.query.trim());

        if (fallback.length > 0) {
          setChoices(fallback);
          setShowingChoices(true);
          setNotice("Зовнішніх збігів немає. Ось варіанти з Gardens.");
        } else {
          setNotice(
            result.outcome === "SOURCE_UNAVAILABLE"
              ? "Зовнішній реєстр тимчасово недоступний, а в каталозі Gardens збігів немає. Спробуйте пізніше."
              : "Не знайдено відповідних рослин ні в зовнішньому реєстрі, ні в каталозі Gardens. Спробуйте ботанічну назву.",
          );
        }
      }
    } catch (reason) {
      setNotice(errorText(reason));
    }
  };

  const selectTaxon = (taxon: RegistrySuggestion) => {
    setSelectedTaxon(taxon);
    setValue("query", taxon.scientificName, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setNotice(
      `Вибрано ${taxon.scientificName}. Назву підставлено у форму. Сорт і колір потрібно перевірити окремо.`,
    );
  };

  return (
    <section className="page">
      <p className="eyebrow">Спільний каталог</p>
      <h1>Знайдіть рослину для свого саду</h1>

      <form className="catalog-tools" onSubmit={search}>
        <input
          placeholder="Назва, наукова назва або сорт"
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">Усі категорії</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <button className="button">Шукати</button>
      </form>

      {error && <p className="notice">{error}</p>}

      {isLoading ? (
        <p>Завантажуємо спільний каталог…</p>
      ) : (
        <div className="grid">
          {items.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              action={
                <>
                  <Link
                    className="text-action"
                    to={routePaths.plantDetails(plant.id)}
                  >
                    Вибрати сорт і колір
                  </Link>

                  {user ? (
                    <button
                      className="text-action"
                      onClick={() => void save(plant.id)}
                    >
                      Зберегти
                    </button>
                  ) : (
                    <Link to={routePaths.auth}>
                      Увійдіть, щоб зберегти
                    </Link>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}

      {!isLoading && !items.length && !error && (
        <Empty>
          У спільному каталозі ще немає рослин за цими параметрами.
        </Empty>
      )}

      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() => setPage(pagination.page - 1)}
        >
          ←
        </button>

        <span>
          {pagination.page} / {pagination.pages || 1}
        </span>

        <button
          disabled={pagination.page >= pagination.pages}
          onClick={() => setPage(pagination.page + 1)}
        >
          →
        </button>
      </div>

      {user && (
        <form className="ai-box" onSubmit={handleSubmit(discover)}>
          <h2>Не знайшли рослину?</h2>

          <p>
            Спочатку шукаємо у зовнішньому реєстрі. Якщо там немає
            результатів, перевіряємо каталог Gardens.
          </p>

          <label>
            Назва рослини
            <input
              placeholder="Наприклад, Hydrangea або гортензія"
              {...register("query")}
            />
          </label>

          {errors.query && (
            <p className="field-error">{errors.query.message}</p>
          )}

          <details>
            <summary>Уточнити пошук за бажанням</summary>

            <label>
              Різновид або сорт
              <input
                placeholder="Наприклад, Summer Love"
                {...register("varietyName")}
              />
            </label>

            <label>
              Колір або декоративна ознака
              <input
                placeholder="Наприклад, рожевий"
                {...register("color")}
              />
            </label>
          </details>

          <button className="button button--secondary" disabled={isSubmitting}>
            {isSubmitting ? "Шукаємо…" : "Знайти рослину"}
          </button>

          {notice && <p className="notice">{notice}</p>}

          {showingChoices && registryChoices.length > 0 && (
            <div className="catalog-choices">
              <h3>Зовнішній реєстр рослин</h3>
              <p>
                Це результати пошуку ботанічних таксонів. Наявність виду в
                реєстрі не підтверджує автоматично сорт або колір.
              </p>

              {registryChoices.map((taxon) => (
                <article className="bed-card" key={taxon.externalId}>
                  <h3>{taxon.scientificName}</h3>

                  <p>
                    {taxon.rank}
                    {taxon.family ? ` · Родина: ${taxon.family}` : ""}
                    {taxon.taxonStatus ? ` · Статус: ${taxon.taxonStatus}` : ""}
                  </p>

                  <p>
                    <a
                      href={taxon.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Переглянути в реєстрі
                    </a>
                  </p>

                  <button
                    type="button"
                    className="text-action"
                    onClick={() => selectTaxon(taxon)}
                  >
                    Вибрати цей ботанічний вид
                  </button>
                </article>
              ))}

              {selectedTaxon && (
                <p className="notice">
                  Вибрано: <em>{selectedTaxon.scientificName}</em>. Тепер
                  можна продовжити пошук із цією ботанічною назвою.
                </p>
              )}
            </div>
          )}

          {showingChoices &&
            registryChoices.length === 0 &&
            choices.length > 0 && (
              <div className="catalog-choices">
                <h3>Варіанти з каталогу Gardens</h3>

                {choices.map((choice) => (
                  <Link
                    key={choice.id}
                    className="bed-card"
                    to={routePaths.plantDetails(choice.id)}
                  >
                    <h3>
                      {choice.names.find((name) => name.isPrimary)?.name ||
                        choice.scientificName}
                    </h3>

                    <p>
                      <em>{choice.scientificName}</em>
                      {choice.variants.length
                        ? ` · ${choice.variants.map((variant) => variant.varietyName).join(", ")}`
                        : " · обрати варіант на сторінці рослини"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
        </form>
      )}
    </section>
  );
}

