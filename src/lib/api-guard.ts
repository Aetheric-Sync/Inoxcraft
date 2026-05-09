import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { unauthorized, forbidden } from "@/lib/api-response";
import type { Role } from "@/types";

/**
 * Wraps an API route handler with authentication and optional role checks.
 * Usage:
 *   export async function GET(req: NextRequest) {
 *     return withAuth(req, async (userId, role) => { ... });
 *   }
 */
export async function withAuth(
  _req: NextRequest,
  handler: (userId: string, role: Role) => Promise<Response>,
  requiredRole?: Role,
): Promise<Response> {
  const session = await auth();

  if (!session?.user?.id) return unauthorized();
  if (requiredRole && session.user.role !== requiredRole) return forbidden();

  return handler(session.user.id, session.user.role);
}
