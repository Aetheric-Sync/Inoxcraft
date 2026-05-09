import { db } from "@/lib/db";
import type { Role } from "@/types";

export const userRepository = {
  findByEmail: (email: string) => db.user.findFirst({ where: { email, deletedAt: null } }),

  findById: (id: string) => db.user.findFirst({ where: { id, deletedAt: null } }),

  findAll: () =>
    db.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),

  create: (data: { name: string; email: string; passwordHash: string; role: Role }) =>
    db.user.create({ data }),

  update: (id: string, data: Partial<{ name: string; role: Role }>) =>
    db.user.update({ where: { id }, data }),

  softDelete: (id: string) => db.user.update({ where: { id }, data: { deletedAt: new Date() } }),
};
