import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { withAuth } from "@/lib/api-guard";
import { ok, created, badRequest, forbidden, serverError } from "@/lib/api-response";
import { userRepository } from "@/repositories/user.repository";
import { createUserSchema } from "@/lib/validators/auth.schema";

export async function GET(req: NextRequest) {
  return withAuth(req, async (_uid, role) => {
    if (role !== "admin") return forbidden();
    try {
      const users = await userRepository.findAll();
      return ok(users);
    } catch (e) {
      return serverError(e);
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (_uid, role) => {
    if (role !== "admin") return forbidden();
    try {
      const body: unknown = await req.json();
      const parsed = createUserSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");

      const existing = await userRepository.findByEmail(parsed.data.email);
      if (existing) return badRequest("User already exists");

      const passwordHash = await bcrypt.hash(parsed.data.password, 12);
      const user = await userRepository.create({
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role,
      });

      return created({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } catch (e) {
      return serverError(e);
    }
  });
}
