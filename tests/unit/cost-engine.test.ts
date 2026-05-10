import { describe, it, expect } from "vitest";

import { calculateCost } from "@/services/cost-engine.service";
import type { UnitType } from "@/types";

const baseMat = (overrides = {}) => ({
  materialId: "mat-1",
  materialName: "Stainless Sheet 2mm",
  unitType: "kilogram" as UnitType,
  quantity: 10,
  unitCostKobo: 180_000,
  ...overrides,
});

describe("calculateCost", () => {
  // ── Material cost calculation ──────────────────────────────────────────────
  describe("material cost calculation", () => {
    it("calculates a single material line total correctly", () => {
      const result = calculateCost({
        materials: [baseMat()],
        complexity: "standard",
        labourCostKobo: 0,
        transportCostKobo: 0,
        profitMarginPct: 0,
      });
      expect(result.lines[0]?.lineTotalKobo).toBe(1_800_000);
    });

    it("sums multiple material lines correctly", () => {
      const result = calculateCost({
        materials: [
          baseMat({ quantity: 5, unitCostKobo: 100_000 }),
          baseMat({ materialId: "mat-2", quantity: 3, unitCostKobo: 200_000 }),
        ],
        complexity: "standard",
        labourCostKobo: 0,
        transportCostKobo: 0,
        profitMarginPct: 0,
      });
      expect(result.breakdown.materialCostKobo).toBe(1_100_000);
    });

    it("returns the correct number of lines", () => {
      const result = calculateCost({
        materials: [baseMat(), baseMat({ materialId: "mat-2" })],
        complexity: "standard",
        labourCostKobo: 0,
        transportCostKobo: 0,
        profitMarginPct: 0,
      });
      expect(result.lines).toHaveLength(2);
    });
  });

  // ── Complexity multipliers ─────────────────────────────────────────────────
  describe("complexity multipliers", () => {
    it("applies 1.0x multiplier for standard", () => {
      const result = calculateCost({
        materials: [baseMat({ quantity: 1, unitCostKobo: 100_000 })],
        complexity: "standard",
        labourCostKobo: 0,
        transportCostKobo: 0,
        profitMarginPct: 0,
      });
      expect(result.breakdown.complexityMultiplier).toBe(1.0);
      expect(result.breakdown.adjustedMaterialCostKobo).toBe(100_000);
    });

    it("applies 1.35x multiplier for complex", () => {
      const result = calculateCost({
        materials: [baseMat({ quantity: 1, unitCostKobo: 100_000 })],
        complexity: "complex",
        labourCostKobo: 0,
        transportCostKobo: 0,
        profitMarginPct: 0,
      });
      expect(result.breakdown.complexityMultiplier).toBe(1.35);
      expect(result.breakdown.adjustedMaterialCostKobo).toBe(135_000);
    });

    it("applies 1.7x multiplier for bespoke", () => {
      const result = calculateCost({
        materials: [baseMat({ quantity: 1, unitCostKobo: 100_000 })],
        complexity: "bespoke",
        labourCostKobo: 0,
        transportCostKobo: 0,
        profitMarginPct: 0,
      });
      expect(result.breakdown.complexityMultiplier).toBe(1.7);
      expect(result.breakdown.adjustedMaterialCostKobo).toBe(170_000);
    });
  });

  // ── Labour and transport ───────────────────────────────────────────────────
  describe("labour and transport", () => {
    it("adds labour cost to subtotal", () => {
      const result = calculateCost({
        materials: [baseMat({ quantity: 1, unitCostKobo: 100_000 })],
        complexity: "standard",
        labourCostKobo: 50_000,
        transportCostKobo: 0,
        profitMarginPct: 0,
      });
      expect(result.breakdown.subtotalKobo).toBe(150_000);
    });

    it("adds transport cost to subtotal", () => {
      const result = calculateCost({
        materials: [baseMat({ quantity: 1, unitCostKobo: 100_000 })],
        complexity: "standard",
        labourCostKobo: 0,
        transportCostKobo: 20_000,
        profitMarginPct: 0,
      });
      expect(result.breakdown.subtotalKobo).toBe(120_000);
    });

    it("includes all three cost types in subtotal", () => {
      const result = calculateCost({
        materials: [baseMat({ quantity: 1, unitCostKobo: 100_000 })],
        complexity: "standard",
        labourCostKobo: 50_000,
        transportCostKobo: 20_000,
        profitMarginPct: 0,
      });
      expect(result.breakdown.subtotalKobo).toBe(170_000);
    });
  });

  // ── Profit margin ──────────────────────────────────────────────────────────
  describe("profit margin", () => {
    it("calculates 0% profit correctly (no markup)", () => {
      const result = calculateCost({
        materials: [baseMat({ quantity: 1, unitCostKobo: 100_000 })],
        complexity: "standard",
        labourCostKobo: 0,
        transportCostKobo: 0,
        profitMarginPct: 0,
      });
      expect(result.breakdown.profitAmountKobo).toBe(0);
      expect(result.breakdown.totalCostKobo).toBe(100_000);
    });

    it("calculates 20% profit correctly", () => {
      const result = calculateCost({
        materials: [baseMat({ quantity: 1, unitCostKobo: 100_000 })],
        complexity: "standard",
        labourCostKobo: 100_000,
        transportCostKobo: 0,
        profitMarginPct: 20,
      });
      expect(result.breakdown.profitAmountKobo).toBe(40_000);
      expect(result.breakdown.totalCostKobo).toBe(240_000);
    });

    it("calculates 100% profit (doubles the subtotal)", () => {
      const result = calculateCost({
        materials: [baseMat({ quantity: 1, unitCostKobo: 50_000 })],
        complexity: "standard",
        labourCostKobo: 0,
        transportCostKobo: 0,
        profitMarginPct: 100,
      });
      expect(result.breakdown.totalCostKobo).toBe(100_000);
    });
  });

  // ── Integer rounding ───────────────────────────────────────────────────────
  describe("integer rounding (no floats)", () => {
    it("rounds fractional kobo values to integers", () => {
      const result = calculateCost({
        materials: [baseMat({ quantity: 1, unitCostKobo: 100_000 })],
        complexity: "complex",
        labourCostKobo: 0,
        transportCostKobo: 0,
        profitMarginPct: 33,
      });
      expect(Number.isInteger(result.breakdown.profitAmountKobo)).toBe(true);
      expect(Number.isInteger(result.breakdown.totalCostKobo)).toBe(true);
      expect(Number.isInteger(result.breakdown.adjustedMaterialCostKobo)).toBe(true);
    });
  });

  // ── Error validation ───────────────────────────────────────────────────────
  describe("error validation", () => {
    it("throws when materials array is empty", () => {
      expect(() =>
        calculateCost({
          materials: [],
          complexity: "standard",
          labourCostKobo: 0,
          transportCostKobo: 0,
          profitMarginPct: 20,
        }),
      ).toThrow("At least one material is required");
    });

    it("throws when profit margin exceeds 100", () => {
      expect(() =>
        calculateCost({
          materials: [baseMat()],
          complexity: "standard",
          labourCostKobo: 0,
          transportCostKobo: 0,
          profitMarginPct: 101,
        }),
      ).toThrow("Profit margin must be between 0 and 100");
    });

    it("throws when profit margin is negative", () => {
      expect(() =>
        calculateCost({
          materials: [baseMat()],
          complexity: "standard",
          labourCostKobo: 0,
          transportCostKobo: 0,
          profitMarginPct: -1,
        }),
      ).toThrow("Profit margin must be between 0 and 100");
    });

    it("throws when quantity is zero", () => {
      expect(() =>
        calculateCost({
          materials: [baseMat({ quantity: 0 })],
          complexity: "standard",
          labourCostKobo: 0,
          transportCostKobo: 0,
          profitMarginPct: 20,
        }),
      ).toThrow();
    });

    it("throws when quantity is negative", () => {
      expect(() =>
        calculateCost({
          materials: [baseMat({ quantity: -5 })],
          complexity: "standard",
          labourCostKobo: 0,
          transportCostKobo: 0,
          profitMarginPct: 20,
        }),
      ).toThrow();
    });

    it("throws when labour cost is negative", () => {
      expect(() =>
        calculateCost({
          materials: [baseMat()],
          complexity: "standard",
          labourCostKobo: -1,
          transportCostKobo: 0,
          profitMarginPct: 20,
        }),
      ).toThrow("Labour cost cannot be negative");
    });

    it("throws when unit cost is zero or negative", () => {
      expect(() =>
        calculateCost({
          materials: [baseMat({ unitCostKobo: 0 })],
          complexity: "standard",
          labourCostKobo: 0,
          transportCostKobo: 0,
          profitMarginPct: 20,
        }),
      ).toThrow();
    });
  });

  // ── Integration (realistic job) ────────────────────────────────────────────
  describe("integration — realistic fabrication job", () => {
    it("calculates a complex gate project correctly end to end", () => {
      const result = calculateCost({
        materials: [
          baseMat({
            materialId: "m1",
            materialName: "SS Sheet 2mm",
            quantity: 20,
            unitCostKobo: 180_000,
          }),
          baseMat({
            materialId: "m2",
            materialName: "SS Rod 12mm",
            unitType: "metre" as UnitType,
            quantity: 10,
            unitCostKobo: 95_000,
          }),
        ],
        complexity: "complex",
        labourCostKobo: 500_000,
        transportCostKobo: 80_000,
        profitMarginPct: 20,
      });
      expect(result.lines).toHaveLength(2);
      expect(result.breakdown.complexityMultiplier).toBe(1.35);
      expect(result.breakdown.totalCostKobo).toBeGreaterThan(0);
      expect(result.breakdown.totalCostKobo).toBe(
        result.breakdown.subtotalKobo + result.breakdown.profitAmountKobo,
      );
    });
  });
});
