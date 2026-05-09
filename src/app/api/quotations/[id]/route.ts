import { type NextRequest } from "next/server";

import { withAuth } from "@/lib/api-guard";
import { ok, notFound, serverError } from "@/lib/api-response";
import { quotationRepository } from "@/repositories/quotation.repository";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(req, async () => {
    try {
      const quotation = await quotationRepository.findById(params.id);
      if (!quotation) return notFound("Quotation not found");
      return ok(quotation);
    } catch (e) {
      return serverError(e);
    }
  });
}
