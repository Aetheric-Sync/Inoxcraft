import { type NextRequest } from "next/server";

import { withAuth } from "@/lib/api-guard";
import { ok, created, badRequest, serverError } from "@/lib/api-response";
import { customerRepository } from "@/repositories/customer.repository";
import { createCustomerSchema } from "@/lib/validators/customer.schema";

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") ?? "1", 10);
      const limit = parseInt(searchParams.get("limit") ?? "20", 10);

      const search = searchParams.get("search") ?? "";

      const [customers, total] = await Promise.all([
        customerRepository.findAll(search, page, limit),
        customerRepository.count(search),
      ]);

      return ok({
        items: customers,
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
  return withAuth(req, async () => {
    try {
      const body: unknown = await req.json();
      const parsed = createCustomerSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");

      const customer = await customerRepository.create(parsed.data);
      return created(customer);
    } catch (e) {
      return serverError(e);
    }
  });
}
