import { type NextRequest } from "next/server";

import { withAuth } from "@/lib/api-guard";
import { ok, created, badRequest, forbidden, serverError } from "@/lib/api-response";
import { materialRepository } from "@/repositories/material.repository";
import { createMaterialSchema } from "@/lib/validators/material.schema";

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    try {
      const materials = await materialRepository.findAll();
      return ok(materials);
    } catch (e) {
      return serverError(e);
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId, role) => {
    if (role !== "admin") return forbidden();
    try {
      const body: unknown = await req.json();
      const parsed = createMaterialSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
      const material = await materialRepository.create({
        ...parsed.data,
        updatedById: userId,
      });
      return created(material);
    } catch (e) {
      return serverError(e);
    }
  });
}
