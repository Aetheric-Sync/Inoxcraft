import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import type { Role } from "@/types";

export async function getSession() {
  return auth();
}

export async function requireSession() {
  const session = await auth();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireSession();
  if (session.user.role !== role) redirect("/dashboard");
  return session;
}
