import { type NextRequest } from "next/server";

import { withAuth } from "@/lib/api-guard";
import { ok, created, badRequest, serverError } from "@/lib/api-response";
import { quotationRepository } from "@/repositories/quotation.repository";
import { createQuotation } from "@/services/quotation.service";

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") ?? "1", 10);
      const limit = parseInt(searchParams.get("limit") ?? "20", 10);

      const [quotations, total] = await Promise.all([
        quotationRepository.findAll(page, limit),
        quotationRepository.count(),
      ]);

      return ok({
        items: quotations,
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
      const body = await req.json();
      const { projectId } = body;
      if (!projectId) return badRequest("Project ID is required");

      const quotation = await createQuotation(projectId, userId);
      return created(quotation);
    } catch (e) {
      if (e instanceof Error) return badRequest(e.message);
      return serverError(e);
    }
  });
}
