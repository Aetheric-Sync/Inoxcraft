import { type NextRequest } from "next/server";

import { withAuth } from "@/lib/api-guard";
import { ok, noContent, badRequest, forbidden, notFound, serverError } from "@/lib/api-response";
import { materialRepository } from "@/repositories/material.repository";
import { updateMaterialSchema } from "@/lib/validators/material.schema";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async () => {
    const material = await materialRepository.findById(params.id);
    if (!material) return notFound("Material not found");
    return ok(material);
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async (userId, role) => {
    if (role !== "admin") return forbidden();
    try {
      const body: unknown = await req.json();
      const parsed = updateMaterialSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
      const material = await materialRepository.update(params.id, parsed.data, userId);
      return ok(material);
    } catch (e) {
      return serverError(e);
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async (_uid, role) => {
    if (role !== "admin") return forbidden();
    try {
      await materialRepository.softDelete(params.id);
      return noContent();
    } catch (e) {
      return serverError(e);
    }
  });
}
