import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2).max(200),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number")
    .optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
