import type { Metadata } from "next";

import { requireRole } from "@/lib/session";
import { materialRepository } from "@/repositories/material.repository";
import { MaterialsManager } from "@/components/features/admin/materials-manager";

export const metadata: Metadata = { title: "Materials Admin" };

export default async function AdminMaterialsPage() {
  await requireRole("admin");
  const materials = await materialRepository.findAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Materials Catalogue</h1>
        <p className="text-sm text-slate-500">{materials.length} materials · Admin only</p>
      </div>
      <MaterialsManager initialMaterials={materials} />
    </div>
  );
}
