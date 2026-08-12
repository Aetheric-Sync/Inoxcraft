import { type NextRequest } from "next/server";

import { withAuth } from "@/lib/api-guard";
import { ok, noContent, badRequest, forbidden, notFound, serverError } from "@/lib/api-response";
import { projectRepository } from "@/repositories/project.repository";
import { materialRepository } from "@/repositories/material.repository";
import { updateProjectStatusSchema, updateProjectSchema } from "@/lib/validators/project.schema";
import { calculateCost } from "@/services/cost-engine.service";

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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, async (userId, role) => {
    try {
      const project = await projectRepository.findById(id);
      if (!project) return notFound("Project not found");

      if (role !== "admin" && project.createdById !== userId) {
        return forbidden("You do not have permission to edit this project");
      }
      if (project.status === "completed") {
        return badRequest("Completed projects can no longer be edited");
      }

      const body: unknown = await req.json();
      const parsed = updateProjectSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");

      const allMaterials = await materialRepository.findAll();
      const materialMap = new Map(allMaterials.map((m) => [m.id, m]));

      const materialLines = parsed.data.materials.map((line) => {
        const mat = materialMap.get(line.materialId);
        if (!mat) throw new Error(`Material ${line.materialId} not found`);
        return {
          materialId: mat.id,
          materialName: mat.name,
          unitType: mat.unitType,
          quantity: line.quantity,
          unitCostKobo: mat.pricePerUnitKobo,
        };
      });

      const { breakdown } = calculateCost({
        materials: materialLines,
        complexity: parsed.data.complexity,
        labourCostKobo: parsed.data.labourCostKobo,
        transportCostKobo: parsed.data.transportCostKobo,
        profitMarginPct: parsed.data.profitMarginPct,
      });

      const updated = await projectRepository.update(id, {
        ...parsed.data,
        totalCostKobo: breakdown.totalCostKobo,
        materials: materialLines.map((m) => ({
          materialId: m.materialId,
          quantity: m.quantity,
          unitCostKobo: m.unitCostKobo,
        })),
      });

      return ok(updated);
    } catch (e) {
      if (e instanceof Error) return badRequest(e.message);
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
