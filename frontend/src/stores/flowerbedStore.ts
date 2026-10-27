import { create } from "zustand";
import { flowerbedService } from "../services/flowerbedService";
import type { Flowerbed } from "../types/domain";
type FlowerbedState = {
  items: Flowerbed[];
  current: Flowerbed | null;
  isLoading: boolean;
  load: () => Promise<void>;
  loadOne: (id: string) => Promise<void>;
  setCurrent: (flowerbed: Flowerbed | null) => void;
};
export const useFlowerbedStore = create<FlowerbedState>((set) => ({
  items: [],
  current: null,
  isLoading: false,
  setCurrent: (current) => set({ current }),
  load: async () => {
    set({ isLoading: true });
    try {
      set({ items: await flowerbedService.list() });
    } finally {
      set({ isLoading: false });
    }
  },
  loadOne: async (id) => {
    set({ isLoading: true });
    try {
      set({ current: await flowerbedService.one(id) });
    } finally {
      set({ isLoading: false });
    }
  },
}));
