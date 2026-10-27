import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PlantCard } from "../../components/plants/PlantCard";
import {
  flowerbedService,
  type FlowerbedInput,
} from "../../services/flowerbedService";
import { plantService } from "../../services/plantService";
import { routePaths } from "../../routes/routePaths";
import type { Flowerbed, Plant } from "../../types/domain";
import { errorText } from "../../utils/errors";
export function FlowerbedEditorPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const plantIdToAdd = searchParams.get("plantId");
  const [bed, setBed] = useState<Flowerbed | null>(null);
  const [name, setName] = useState("");
  const [widthCm, setWidth] = useState("300");
  const [lengthCm, setLength] = useState("200");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<Plant[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!id) return;
    void flowerbedService
      .one(id)
      .then((value) => {
        setBed(value);
        setName(value.name);
        setWidth(String(value.widthCm || ""));
        setLength(String(value.lengthCm || ""));
        setDescription(value.description || "");
      })
      .catch((reason: unknown) => setError(errorText(reason)));
  }, [id]);
  const refresh = async (flowerbedId: string) =>
    setBed(await flowerbedService.one(flowerbedId));
  const save = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const body: FlowerbedInput = {
        name,
        description,
        widthCm: Number(widthCm) || undefined,
        lengthCm: Number(lengthCm) || undefined,
        lightRequirements: bed?.lightRequirements || [],
        soilTypes: bed?.soilTypes || [],
        soilPH: bed?.soilPH || [],
        soilMoisture: bed?.soilMoisture || [],
      };
      const value = id
        ? await flowerbedService.update(id, body)
        : await flowerbedService.create(body);
      if (!id && plantIdToAdd)
        await flowerbedService.addPlacement(value.id, {
          plantId: plantIdToAdd,
          quantity: 1,
          xCm: 0,
          yCm: 0,
        });
      setBed(value);
      if (!id) nav(routePaths.flowerbed(value.id), { replace: true });
    } catch (reason) {
      setError(errorText(reason));
    }
  };
  const find = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setFound(
        (await plantService.list(new URLSearchParams({ q: query, limit: "6" })))
          .items,
      );
    } catch (reason) {
      setError(errorText(reason));
    }
  };
  const add = async (plantId: string) => {
    if (!bed) return;
    try {
      await flowerbedService.addPlacement(bed.id, {
        plantId,
        quantity: 1,
        xCm: 0,
        yCm: 0,
      });
      await refresh(bed.id);
    } catch (reason) {
      setError(errorText(reason));
    }
  };
  const move = async (placementId: string, xCm: number, yCm: number) => {
    if (!bed) return;
    try {
      await flowerbedService.updatePlacement(bed.id, placementId, { xCm, yCm });
      await refresh(bed.id);
    } catch (reason) {
      setError(errorText(reason));
    }
  };
  return (
    <section className="page editor">
      <p className="eyebrow">{id ? "Редагування клумби" : "Нова клумба"}</p>
      <form className="bed-form" onSubmit={save}>
        <label>
          Назва
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          Ширина, см
          <input
            type="number"
            min="1"
            value={widthCm}
            onChange={(event) => setWidth(event.target.value)}
          />
        </label>
        <label>
          Довжина, см
          <input
            type="number"
            min="1"
            value={lengthCm}
            onChange={(event) => setLength(event.target.value)}
          />
        </label>
        <label className="wide">
          Опис
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <button className="button">Зберегти клумбу</button>
      </form>
      {error && <p className="notice">{error}</p>}
      {bed && (
        <>
          <div className="section-heading">
            <h2>Схема посадок</h2>
            <span>
              {bed.widthCm || "—"} × {bed.lengthCm || "—"} см
            </span>
          </div>
          <div
            className="plan"
            style={{ aspectRatio: `${bed.widthCm || 3}/${bed.lengthCm || 2}` }}
          >
            {bed.plants?.map((placement) => (
              <button
                type="button"
                key={placement.id}
                title={placement.plant.scientificName}
                className="placement"
                style={{
                  left: `${Math.min(100, ((placement.xCm || 0) / (bed.widthCm || 1)) * 100)}%`,
                  top: `${Math.min(100, ((placement.yCm || 0) / (bed.lengthCm || 1)) * 100)}%`,
                }}
                onClick={() => {
                  const x = Number(prompt("X, см", String(placement.xCm || 0)));
                  const y = Number(prompt("Y, см", String(placement.yCm || 0)));
                  if (Number.isFinite(x) && Number.isFinite(y))
                    void move(placement.id, x, y);
                }}
              >
                🌱
              </button>
            ))}
          </div>
          <form className="catalog-tools" onSubmit={find}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Пошук рослини для клумби"
            />
            <button className="button button--secondary">Знайти</button>
          </form>
          <div className="grid grid--compact">
            {found.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                action={
                  <button
                    className="text-action"
                    onClick={() => void add(plant.id)}
                  >
                    Додати на схему
                  </button>
                }
              />
            ))}
          </div>
          <ul className="placement-list">
            {bed.plants?.map((placement) => (
              <li key={placement.id}>
                <span>
                  {placement.plant.scientificName} × {placement.quantity}
                </span>
                <button
                  className="text-action"
                  onClick={() => {
                    void flowerbedService
                      .removePlacement(bed.id, placement.id)
                      .then(() => refresh(bed.id))
                      .catch((reason: unknown) => setError(errorText(reason)));
                  }}
                >
                  Видалити
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
