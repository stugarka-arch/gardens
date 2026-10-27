import { request } from "./apiClient";
import type {
  Plant,
  PlantListResponse,
  PlantName,
  PlantVariant,
} from "../types/domain";
export type PlantChoice = {
  id: string;
  scientificName: string;
  names: PlantName[];
  variants: Pick<PlantVariant, "id" | "varietyName" | "isNoSpecifiedVariety">[];
};
export const plantService = {
  list: (query: URLSearchParams) =>
    request<PlantListResponse>(`/plants?${query}`),
  plant: (id: string) => request<Plant>(`/plants/${id}`),
  choices: (query: string) =>
    request<PlantChoice[]>(
      `/plants/choices/search?q=${encodeURIComponent(query)}`,
    ),
  variants: (plantId: string) =>
    request<PlantVariant[]>(`/plants/${plantId}/variants`),
  collection: () =>
    request<{ id: string; plant: Plant }[]>("/plants/collection"),
  addToCollection: (id: string) =>
    request<void>(`/plants/${id}/collection`, { method: "POST" }),
  removeFromCollection: (id: string) =>
    request<void>(`/plants/${id}/collection`, { method: "DELETE" }),
};
