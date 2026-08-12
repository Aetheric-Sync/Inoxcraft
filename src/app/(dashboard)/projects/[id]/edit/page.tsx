import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { requireSession } from "@/lib/session";
import { projectRepository } from "@/repositories/project.repository";
import { ProjectEditForm } from "@/components/features/projects/project-edit-form";

export const metadata: Metadata = { title: "Edit Project" };

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const project = await projectRepository.findById(id);
  if (!project) notFound();

  const canEdit =
    project.status !== "completed" &&
    (session.user.role === "admin" || project.createdById === session.user.id);
  if (!canEdit) redirect(`/projects/${id}`);

  const dims = project.dimensionsMm as { l: number; w: number; h: number };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">Edit Project</h1>
        <p className="text-muted-foreground mt-1 text-sm">{project.projectType}</p>
      </div>

      <ProjectEditForm
        project={{
          id: project.id,
          projectType: project.projectType,
          dimensionsMm: dims,
          complexity: project.complexity,
          notes: project.notes,
          labourCostKobo: project.labourCostKobo,
          transportCostKobo: project.transportCostKobo,
          profitMarginPct: project.profitMarginPct,
          materials: project.materials.map((m) => ({
            materialId: m.materialId,
            quantity: Number(m.quantity),
          })),
        }}
      />
    </div>
  );
}
