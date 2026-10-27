import { request } from "./apiClient";
import type { Flowerbed, Placement } from "../types/domain";
export type FlowerbedInput = Partial<
  Omit<Flowerbed, "id" | "plants" | "_count" | "areaM2">
>;
export type PlacementInput = {
  plantId: string;
  quantity?: number;
  xCm?: number;
  yCm?: number;
  rotationDeg?: number;
  notes?: string;
};
export const flowerbedService = {
  list: () => request<Flowerbed[]>("/flowerbeds"),
  one: (id: string) => request<Flowerbed>(`/flowerbeds/${id}`),
  create: (body: FlowerbedInput) =>
    request<Flowerbed>("/flowerbeds", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: FlowerbedInput) =>
    request<Flowerbed>(`/flowerbeds/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    request<void>(`/flowerbeds/${id}`, { method: "DELETE" }),
  addPlacement: (id: string, body: PlacementInput) =>
    request<Placement>(`/flowerbeds/${id}/plants`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updatePlacement: (
    bedId: string,
    placementId: string,
    body: Partial<PlacementInput>,
  ) =>
    request<Placement>(`/flowerbeds/${bedId}/plants/${placementId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  removePlacement: (bedId: string, placementId: string) =>
    request<void>(`/flowerbeds/${bedId}/plants/${placementId}`, {
      method: "DELETE",
    }),
};
