import { db } from "@/lib/db";

export const customerRepository = {
  findAll: (page = 1, limit = 20) =>
    db.customer.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),

  count: () => db.customer.count({ where: { deletedAt: null } }),

  findById: (id: string) =>
    db.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        projects: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            projectType: true,
            totalCostKobo: true,
            status: true,
            createdAt: true,
          },
        },
      },
    }),

  search: (query: string) =>
    db.customer.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { name: "asc" },
    }),

  create: (data: { name: string; phone?: string; email?: string; address?: string }) =>
    db.customer.create({ data }),

  update: (
    id: string,
    data: Partial<{ name: string; phone: string; email: string; address: string }>,
  ) => db.customer.update({ where: { id }, data }),

  softDelete: (id: string) =>
    db.customer.update({ where: { id }, data: { deletedAt: new Date() } }),
};
