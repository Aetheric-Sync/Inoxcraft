import { z } from "zod";

export const createMaterialSchema = z.object({
  name: z.string().min(2).max(200),
  unitType: z.enum(["kg", "metre", "piece", "litre", "sqmetre"]),
  pricePerUnitKobo: z.number().int().positive("Price must be a positive integer in kobo"),
});

export const updateMaterialSchema = createMaterialSchema.partial();
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
