
import { request } from "./apiClient";
import type { Plant } from "../types/domain";
import type { PlantChoice } from "./plantService";

export type DiscoveryOutcome =
  | "CATALOG_CREATED"
  | "CATALOG_EXISTING"
  | "NEEDS_REVIEW"
  | "SOURCE_UNAVAILABLE";

export type DiscoveryResult = {
  status: string;
  outcome?: DiscoveryOutcome;
  proposedData?: {
    description?: string;
    scientificName?: string;
  };
  matchedPlant?: Plant | null;
  errorMessage?: string;
};

export type DiscoveryRequest = {
  query: string;
  varietyName?: string;
  color?: string;
  isNoSpecifiedVariety?: boolean;
  language?: string;
};

export type RegistrySuggestion = {
  externalId: string;
  scientificName: string;
  rank: string;
  taxonStatus?: string;
  sourceUrl: string;
  family?: string;
  genus?: string;
};

export type RegistrySuggestionsResult = {
  externalRegistry: RegistrySuggestion[];
  gardensCatalog: PlantChoice[];
};

export const plantDiscoveryService = {
  discover: (payload: DiscoveryRequest) =>
    request<DiscoveryResult>("/plant-discovery", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registrySuggestions: (query: string) =>
    request<RegistrySuggestionsResult>(
      `/plant-discovery/registry-suggestions?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
      },
    ),
};
