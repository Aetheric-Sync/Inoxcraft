import { type NextRequest } from "next/server";

import { withAuth } from "@/lib/api-guard";
import { ok, notFound, serverError } from "@/lib/api-response";
import { quotationRepository } from "@/repositories/quotation.repository";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, async () => {
    try {
      const quotation = await quotationRepository.findById(id);
      if (!quotation) return notFound("Quotation not found");
      return ok(quotation);
    } catch (e) {
      return serverError(e);
    }
  });
}
