import { create } from "zustand";
import { plantService } from "../services/plantService";
import type { Pagination, Plant } from "../types/domain";
import { errorText } from "../utils/errors";
type PlantState = {
  items: Plant[];
  pagination: Pagination;
  query: string;
  category: string;
  isLoading: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  setCategory: (category: string) => void;
  setPage: (page: number) => void;
  load: () => Promise<void>;
};
export const usePlantStore = create<PlantState>((set, get) => ({
  items: [],
  pagination: { page: 1, pages: 1, total: 0 },
  query: "",
  category: "",
  isLoading: false,
  error: null,
  setQuery: (query) =>
    set({ query, pagination: { ...get().pagination, page: 1 } }),
  setCategory: (category) =>
    set({ category, pagination: { ...get().pagination, page: 1 } }),
  setPage: (page) => set({ pagination: { ...get().pagination, page } }),
  load: async () => {
    const { query, category, pagination } = get();
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: "12",
    });
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    set({ isLoading: true, error: null });
    try {
      const data = await plantService.list(params);
      set({ items: data.items, pagination: data.pagination });
    } catch (error) {
      set({ error: errorText(error) });
    } finally {
      set({ isLoading: false });
    }
  },
}));
