import type { Metadata } from "next";

import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { userRepository } from "@/repositories/user.repository";
import { UsersManager } from "@/components/features/admin/users-manager";

export const metadata: Metadata = { title: "Users Admin" };

export default async function AdminUsersPage() {
  await requireRole("admin");
  const session = await auth();
  const currentUserId = session?.user?.id ?? "";
  const users = await userRepository.findAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
        <p className="text-sm text-slate-500">{users.length} users · Admin only</p>
      </div>
      <UsersManager initialUsers={users} currentUserId={currentUserId} />
    </div>
  );
}
