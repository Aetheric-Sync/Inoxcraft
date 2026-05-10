import type { Metadata } from "next";

import { requireRole } from "@/lib/session";
import { materialRepository } from "@/repositories/material.repository";
import { MaterialsManager } from "@/components/features/admin/materials-manager";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Materials Admin" };

export default async function AdminMaterialsPage() {
  await requireRole("admin");
  const materials = await materialRepository.findAll();

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Materials Catalogue"
        description="Manage your material prices and catalogue"
      />
      <MaterialsManager initialMaterials={materials} />
    </div>
  );
}
