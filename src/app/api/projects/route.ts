import { type NextRequest } from "next/server";

import { withAuth } from "@/lib/api-guard";
import { ok, created, badRequest, serverError } from "@/lib/api-response";
import { projectRepository } from "@/repositories/project.repository";
import { materialRepository } from "@/repositories/material.repository";
import { createProjectSchema } from "@/lib/validators/project.schema";
import { calculateCost } from "@/services/cost-engine.service";
import type { ProjectStatus } from "@/types";

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") ?? "1", 10);
      const limit = parseInt(searchParams.get("limit") ?? "20", 10);
      const status = searchParams.get("status") as ProjectStatus | undefined;

      const filters = status ? { status } : undefined;
      const [projects, total] = await Promise.all([
        projectRepository.findAll(filters, page, limit),
        projectRepository.count(filters),
      ]);

      return ok({
        items: projects,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (e) {
      return serverError(e);
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId) => {
    try {
      const body: unknown = await req.json();
      const parsed = createProjectSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");

      const allMaterials = await materialRepository.findAll();
      const materialMap = new Map(allMaterials.map((m: any) => [m.id, m]));

      const materialLines = parsed.data.materials.map((line: any) => {
        const mat = materialMap.get(line.materialId) as any;
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

      const project = await projectRepository.create({
        ...parsed.data,
        createdById: userId,
        complexity: parsed.data.complexity,
        totalCostKobo: breakdown.totalCostKobo,
        materials: materialLines.map((m: any) => ({
          materialId: m.materialId,
          quantity: m.quantity,
          unitCostKobo: m.unitCostKobo,
        })),
      });

      return created(project);
    } catch (e) {
      if (e instanceof Error) return badRequest(e.message);
      return serverError(e);
    }
  });
}
