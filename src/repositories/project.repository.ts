import { db } from "@/lib/db";
import type { Complexity, ProjectStatus } from "@/types";

export const projectRepository = {
  findAll: (filters?: { status?: ProjectStatus; customerId?: string }, page = 1, limit = 20) =>
    db.project.findMany({
      where: { deletedAt: null, ...filters },
      include: {
        customer: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        materials: {
          include: { material: { select: { name: true, unitType: true } } },
        },
        _count: { select: { quotations: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),

  count: (filters?: { status?: ProjectStatus }) =>
    db.project.count({ where: { deletedAt: null, ...filters } }),

  findById: (id: string) =>
    db.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true } },
        materials: { include: { material: true } },
        quotations: { orderBy: { createdAt: "desc" } },
      },
    }),

  create: (data: {
    customerId: string;
    createdById: string;
    projectType: string;
    dimensionsMm: { l: number; w: number; h: number };
    complexity: Complexity;
    designImageUrl?: string;
    labourCostKobo: number;
    transportCostKobo: number;
    profitMarginPct: number;
    totalCostKobo: number;
    notes?: string;
    materials: Array<{
      materialId: string;
      quantity: number;
      unitCostKobo: number;
    }>;
  }) =>
    db.project.create({
      data: {
        customerId: data.customerId,
        createdById: data.createdById,
        projectType: data.projectType,
        dimensionsMm: data.dimensionsMm,
        complexity: data.complexity,
        designImageUrl: data.designImageUrl ?? null,
        labourCostKobo: data.labourCostKobo,
        transportCostKobo: data.transportCostKobo,
        profitMarginPct: data.profitMarginPct,
        totalCostKobo: data.totalCostKobo,
        notes: data.notes ?? null,
        materials: {
          create: data.materials.map((m) => ({
            materialId: m.materialId,
            quantity: m.quantity,
            unitCostKobo: m.unitCostKobo,
          })),
        },
      },
      include: { materials: true, customer: true },
    }),

  updateStatus: (id: string, status: ProjectStatus) =>
    db.project.update({ where: { id }, data: { status } }),

  softDelete: (id: string) => db.project.update({ where: { id }, data: { deletedAt: new Date() } }),

  getDashboardStats: async () => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [totalProjects, revenueAggregate, monthProjects, recentProjects, avgJobValue] =
      await Promise.all([
        db.project.count({ where: { deletedAt: null } }),
        db.project.aggregate({
          where: {
            deletedAt: null,
            status: { in: ["accepted", "completed"] },
          },
          _sum: { totalCostKobo: true },
        }),
        db.project.count({
          where: { deletedAt: null, createdAt: { gte: startOfMonth } },
        }),
        db.project.findMany({
          where: { deletedAt: null },
          include: { customer: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        db.project.aggregate({
          where: { deletedAt: null, status: { in: ["accepted", "completed"] } },
          _avg: { totalCostKobo: true },
        }),
      ]);

    return {
      totalProjects,
      totalRevenueKobo: revenueAggregate._sum.totalCostKobo ?? 0,
      monthProjects,
      recentProjects,
      avgJobValueKobo: Math.round(avgJobValue._avg.totalCostKobo ?? 0),
    };
  },
};
