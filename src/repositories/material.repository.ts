import { db } from "@/lib/db";
import type { UnitType } from "@/types";

export const materialRepository = {
  findAll: () =>
    db.material.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: { updatedBy: { select: { name: true } } },
    }),

  findById: (id: string) => db.material.findFirst({ where: { id, deletedAt: null } }),

  create: (data: {
    name: string;
    unitType: UnitType;
    pricePerUnitKobo: number;
    updatedById: string;
  }) => db.material.create({ data }),

  update: (
    id: string,
    data: Partial<{ name: string; pricePerUnitKobo: number }>,
    updatedById: string,
  ) => db.material.update({ where: { id }, data: { ...data, updatedById } }),

  softDelete: (id: string) =>
    db.material.update({ where: { id }, data: { deletedAt: new Date() } }),
};
