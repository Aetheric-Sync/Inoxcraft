import { redirect } from "next/navigation";

import { requireSession } from "@/lib/session";

export default async function Home() {
  await requireSession();
  redirect("/dashboard");
}
