export type Role = "admin" | "staff";

export type ProjectStatus = "draft" | "quoted" | "accepted" | "rejected" | "completed";

export type Complexity = "standard" | "complex" | "bespoke";

export type UnitType = "kg" | "metre" | "piece";

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Dimensions {
  l: number;
  w: number;
  h: number;
}

export interface CostBreakdown {
  materialCostKobo: number;
  complexityMultiplier: number;
  adjustedMaterialCostKobo: number;
  labourCostKobo: number;
  transportCostKobo: number;
  subtotalKobo: number;
  profitMarginPct: number;
  profitAmountKobo: number;
  totalCostKobo: number;
}

export interface ProjectMaterialLine {
  materialId: string;
  materialName: string;
  unitType: UnitType;
  quantity: number;
  unitCostKobo: number;
  lineTotalKobo: number;
}
