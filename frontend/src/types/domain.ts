export type User = {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  status?: string;
};
export type PlantImage = {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
};
export type PlantName = {
  id: string;
  name: string;
  language: string;
  isPrimary: boolean;
};
export type Plant = {
  id: string;
  scientificName: string;
  category: string;
  description?: string | null;
  minHeightCm?: number | null;
  maxHeightCm?: number | null;
  minWidthCm?: number | null;
  maxWidthCm?: number | null;
  lightRequirements: string[];
  soilTypes: string[];
  bloomColors: string[];
  evergreen?: boolean | null;
  names: PlantName[];
  images: PlantImage[];
};
export type PlantVariantColor = {
  id: string;
  name: string;
  decorativePart?: string | null;
  season?: string | null;
  isVerified: boolean;
};
export type PlantVariant = {
  id: string;
  varietyName: string;
  isNoSpecifiedVariety: boolean;
  description?: string | null;
  colors: PlantVariantColor[];
  images: PlantImage[];
};
export type Placement = {
  id: string;
  plantId: string;
  quantity: number;
  xCm?: number | null;
  yCm?: number | null;
  rotationDeg?: number | null;
  notes?: string | null;
  plant: Plant;
};
export type Flowerbed = {
  id: string;
  name: string;
  description?: string | null;
  widthCm?: number | null;
  lengthCm?: number | null;
  areaM2?: number | null;
  lightRequirements: string[];
  soilTypes: string[];
  soilPH: string[];
  soilMoisture: string[];
  location?: string | null;
  climateZone?: number | null;
  notes?: string | null;
  isPublic: boolean;
  plants?: Placement[];
  _count?: { plants: number };
};
export type Pagination = { page: number; pages: number; total: number };
export type PlantListResponse = { items: Plant[]; pagination: Pagination };
