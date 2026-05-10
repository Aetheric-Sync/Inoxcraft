import { type NextRequest } from "next/server";

import { withAuth } from "@/lib/api-guard";
import { ok, noContent, badRequest, forbidden, serverError } from "@/lib/api-response";
import { userRepository } from "@/repositories/user.repository";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, async (userId, role) => {
    if (role !== "admin") return forbidden();
    if (id === userId) return badRequest("You cannot change your own role");

    try {
      const body = await req.json();
      const { role: newRole } = body;
      if (newRole !== "admin" && newRole !== "staff") {
        return badRequest("Invalid role");
      }

      const updated = await userRepository.update(id, { role: newRole });
      return ok(updated);
    } catch (e) {
      return serverError(e);
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, async (userId, role) => {
    if (role !== "admin") return forbidden();
    if (id === userId) return badRequest("You cannot delete your own account");

    try {
      await userRepository.softDelete(id);
      return noContent();
    } catch (e) {
      return serverError(e);
    }
  });
}
