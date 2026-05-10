import { type NextRequest } from "next/server";

import { withAuth } from "@/lib/api-guard";
import { ok, noContent, badRequest, forbidden, notFound, serverError } from "@/lib/api-response";
import { projectRepository } from "@/repositories/project.repository";
import { updateProjectStatusSchema } from "@/lib/validators/project.schema";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, async () => {
    const project = await projectRepository.findById(id);
    if (!project) return notFound("Project not found");
    return ok(project);
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, async (userId, role) => {
    try {
      const project = await projectRepository.findById(id);
      if (!project) return notFound("Project not found");

      if (role !== "admin" && project.createdById !== userId) {
        return forbidden("You do not have permission to update this project");
      }

      const body: unknown = await req.json();
      const parsed = updateProjectStatusSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");

      const updated = await projectRepository.updateStatus(id, parsed.data.status);
      return ok(updated);
    } catch (e) {
      return serverError(e);
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, async (userId, role) => {
    try {
      const project = await projectRepository.findById(id);
      if (!project) return notFound("Project not found");

      if (role !== "admin" && project.createdById !== userId) {
        return forbidden("You do not have permission to delete this project");
      }

      await projectRepository.softDelete(id);
      return noContent();
    } catch (e) {
      return serverError(e);
    }
  });
}
