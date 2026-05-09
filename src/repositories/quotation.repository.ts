import { db } from "@/lib/db";

export const quotationRepository = {
  findAll: (page = 1, limit = 20) =>
    db.quotation.findMany({
      include: {
        project: {
          include: { customer: { select: { name: true } } },
        },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),

  count: () => db.quotation.count(),

  findById: (id: string) =>
    db.quotation.findFirst({
      where: { id },
      include: {
        project: {
          include: {
            customer: true,
            materials: { include: { material: true } },
          },
        },
        createdBy: { select: { name: true } },
      },
    }),

  findByReference: (reference: string) => db.quotation.findUnique({ where: { reference } }),

  create: (data: {
    projectId: string;
    createdById: string;
    reference: string;
    totalAmountKobo: number;
    validUntil: Date;
  }) => db.quotation.create({ data }),

  updatePdfUrl: (id: string, pdfUrl: string) =>
    db.quotation.update({ where: { id }, data: { pdfUrl } }),

  markEmailed: (id: string) =>
    db.quotation.update({ where: { id }, data: { emailedAt: new Date() } }),

  getLastReferenceNumber: async (): Promise<number> => {
    const year = new Date().getFullYear();
    const last = await db.quotation.findFirst({
      where: { reference: { startsWith: `INX-${year}-` } },
      orderBy: { createdAt: "desc" },
    });
    if (!last) return 0;
    const parts = last.reference.split("-");
    return parseInt(parts[2] ?? "0", 10);
  },
};
