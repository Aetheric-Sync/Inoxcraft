import { z } from "zod";

export const materialLineSchema = z.object({
  materialId: z.string().uuid("Invalid material ID"),
  quantity: z.number().positive("Quantity must be positive"),
});

export const createProjectSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  projectType: z.string().min(2, "Project type is required").max(100),
  dimensionsMm: z.object({
    l: z.number().nonnegative("Length must be 0 or greater"),
    w: z.number().nonnegative("Width must be 0 or greater"),
    h: z.number().nonnegative("Height must be 0 or greater"),
  }),
  complexity: z.enum(["standard", "complex", "bespoke"]),
  designImageUrl: z.string().url().optional(),
  labourCostKobo: z.number().int().nonnegative(),
  transportCostKobo: z.number().int().nonnegative(),
  profitMarginPct: z.number().int().min(0).max(100).default(20),
  notes: z.string().max(1000).optional(),
  materials: z.array(materialLineSchema).min(1, "At least one material is required"),
});

export const updateProjectStatusSchema = z.object({
  status: z.enum(["draft", "quoted", "accepted", "rejected", "completed"]),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
