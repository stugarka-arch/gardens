import { request } from "./apiClient";
export type PlantSource = {
  id: string;
  name: string;
  type: string;
  url?: string | null;
  accessedAt?: string | null;
  notes?: string | null;
};
export type CreatePlantSourceInput = Omit<PlantSource, "id">;
export const plantSourceService = {
  list: (plantId: string) =>
    request<PlantSource[]>(`/plant-sources/plant/${plantId}`),
  create: (plantId: string, body: CreatePlantSourceInput) =>
    request<PlantSource>(`/plant-sources/plant/${plantId}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    request<void>(`/plant-sources/${id}`, { method: "DELETE" }),
};
