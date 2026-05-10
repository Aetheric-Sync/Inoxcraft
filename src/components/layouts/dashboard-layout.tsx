import { requireSession } from "@/lib/session";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <SidebarNav session={session} />

      {/* ── Main ──────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (desktop only) */}
        <header className="hidden items-center justify-end border-b border-border bg-background px-6 py-3 lg:flex">
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          <div className="page-container py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
