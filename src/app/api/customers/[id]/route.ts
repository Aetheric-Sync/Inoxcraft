import { type NextRequest } from "next/server";

import { withAuth } from "@/lib/api-guard";
import { ok, noContent, badRequest, notFound, serverError } from "@/lib/api-response";
import { customerRepository } from "@/repositories/customer.repository";
import { updateCustomerSchema } from "@/lib/validators/customer.schema";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, async () => {
    const customer = await customerRepository.findById(id);
    if (!customer) return notFound("Customer not found");
    return ok(customer);
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, async () => {
    try {
      const body: unknown = await req.json();
      const parsed = updateCustomerSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
      const customer = await customerRepository.update(id, parsed.data);
      return ok(customer);
    } catch (e) {
      return serverError(e);
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withAuth(req, async () => {
    try {
      await customerRepository.softDelete(id);
      return noContent();
    } catch (e) {
      return serverError(e);
    }
  });
}
