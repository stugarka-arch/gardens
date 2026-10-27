import type { ReactNode } from "react";
import type { Plant } from "../../types/domain";
export function PlantCard({
  plant,
  action,
}: {
  plant: Plant;
  action?: ReactNode;
}) {
  const primary =
    plant.images.find((image) => image.isPrimary) || plant.images[0];
  const common =
    plant.names.find((name) => name.isPrimary)?.name || plant.names[0]?.name;
  return (
    <article className="plant-card">
      {primary ? (
        <img
          src={primary.url}
          alt={primary.alt || common || plant.scientificName}
        />
      ) : (
        <div className="plant-card__image">Фото відсутнє</div>
      )}
      <div className="plant-card__body">
        <p className="eyebrow">{plant.category}</p>
        <h3>{common || plant.scientificName}</h3>
        {common && <em>{plant.scientificName}</em>}
        <p className="plant-card__facts">
          {plant.lightRequirements.join(" · ") || "Умови не вказано"}
        </p>
        {action}
      </div>
    </article>
  );
}
