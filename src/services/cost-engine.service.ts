import type { Complexity, CostBreakdown, ProjectMaterialLine, UnitType } from "@/types";

const COMPLEXITY_MULTIPLIERS: Record<Complexity, number> = {
  standard: 1.0,
  complex: 1.35,
  bespoke: 1.7,
};

export interface CostEngineInput {
  materials: Array<{
    materialId: string;
    materialName: string;
    unitType: UnitType;
    quantity: number;
    unitCostKobo: number;
  }>;
  complexity: Complexity;
  labourCostKobo: number;
  transportCostKobo: number;
  profitMarginPct: number;
}

export interface CostEngineResult {
  lines: ProjectMaterialLine[];
  breakdown: CostBreakdown;
}

export function calculateCost(input: CostEngineInput): CostEngineResult {
  if (input.materials.length === 0) {
    throw new Error("At least one material is required");
  }
  if (input.profitMarginPct < 0 || input.profitMarginPct > 100) {
    throw new Error("Profit margin must be between 0 and 100");
  }
  if (input.labourCostKobo < 0) {
    throw new Error("Labour cost cannot be negative");
  }
  if (input.transportCostKobo < 0) {
    throw new Error("Transport cost cannot be negative");
  }

  const lines: ProjectMaterialLine[] = input.materials.map((m: any) => {
    if (m.quantity <= 0) {
      throw new Error(`Quantity for "${m.materialName}" must be greater than 0`);
    }
    if (m.unitCostKobo <= 0) {
      throw new Error(`Unit cost for "${m.materialName}" must be greater than 0`);
    }
    const lineTotalKobo = Math.round(m.quantity * m.unitCostKobo);
    return {
      materialId: m.materialId,
      materialName: m.materialName,
      unitType: m.unitType,
      quantity: m.quantity,
      unitCostKobo: m.unitCostKobo,
      lineTotalKobo,
    };
  });

  const rawMaterialCostKobo = lines.reduce((sum: number, l: any) => sum + l.lineTotalKobo, 0);
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[input.complexity];
  const adjustedMaterialCostKobo = Math.round(rawMaterialCostKobo * complexityMultiplier);
  const subtotalKobo = adjustedMaterialCostKobo + input.labourCostKobo + input.transportCostKobo;
  const profitAmountKobo = Math.round(subtotalKobo * (input.profitMarginPct / 100));
  const totalCostKobo = subtotalKobo + profitAmountKobo;

  const breakdown: CostBreakdown = {
    materialCostKobo: rawMaterialCostKobo,
    complexityMultiplier,
    adjustedMaterialCostKobo,
    labourCostKobo: input.labourCostKobo,
    transportCostKobo: input.transportCostKobo,
    subtotalKobo,
    profitMarginPct: input.profitMarginPct,
    profitAmountKobo,
    totalCostKobo,
  };

  return { lines, breakdown };
}
