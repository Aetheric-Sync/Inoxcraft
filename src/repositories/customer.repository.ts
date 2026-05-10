import { db } from "@/lib/db";

export const customerRepository = {
  findAll: (search = "", page = 1, limit = 20) => {
    const where = search
      ? {
          deletedAt: null,
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : { deletedAt: null };
    return db.customer.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  },

  count: (search = "") => {
    const where = search
      ? {
          deletedAt: null,
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : { deletedAt: null };
    return db.customer.count({ where });
  },

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

  create: (data: {
    name: string;
    phone?: string | null | undefined;
    email?: string | null | undefined;
    address?: string | null | undefined;
  }) =>
    db.customer.create({
      data: {
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        address: data.address ?? null,
      },
    }),

  update: (
    id: string,
    data: Partial<{
      name: string | undefined;
      phone: string | null | undefined;
      email: string | null | undefined;
      address: string | null | undefined;
    }>,
  ) => {
    const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    return db.customer.update({ where: { id }, data: cleanData });
  },

  softDelete: (id: string) =>
    db.customer.update({ where: { id }, data: { deletedAt: new Date() } }),
};
