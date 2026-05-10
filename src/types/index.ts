import { 
  type Role as PrismaRole, 
  type ProjectStatus as PrismaProjectStatus, 
  type Complexity as PrismaComplexity, 
  type UnitType as PrismaUnitType 
} from "@prisma/client";

export type Role = "admin" | "staff"; // Keeping as string literals for frontend convenience if needed, but the types below are better
export type ProjectStatus = PrismaProjectStatus;
export type Complexity = PrismaComplexity;
export type UnitType = PrismaUnitType;

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
