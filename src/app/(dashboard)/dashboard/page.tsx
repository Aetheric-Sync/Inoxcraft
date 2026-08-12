import { FolderOpen, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { requireSession } from "@/lib/session";
import { projectRepository } from "@/repositories/project.repository";
import { StatsCard } from "@/components/features/dashboard/stats-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils/money";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession();
  const stats = await projectRepository.getDashboardStats();

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title={`Good ${getTimeOfDay()}, ${firstName} 👋`}
        description="Here's what's happening with your business today."
        action={
          <Button
            render={<Link href="/projects/new" />}
            nativeButton={false}
            className="bg-inox-600 shadow-inox hover:bg-inox-700 text-white transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        }
      />

      {/* ── KPI grid ────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total Projects"
          value={stats.totalProjects}
          icon="projects"
          animateCount
          description="All time"
        />
        <StatsCard
          label="Total Revenue"
          value={formatNaira(stats.totalRevenueKobo)}
          icon="revenue"
          description="Accepted & completed jobs"
          iconColor="text-emerald-600"
        />
        <StatsCard
          label="Jobs This Month"
          value={stats.monthProjects}
          icon="month"
          animateCount
          description={new Date().toLocaleString("default", { month: "long", year: "numeric" })}
        />
        <StatsCard
          label="Avg. Job Value"
          value={formatNaira(stats.avgJobValueKobo)}
          icon="users"
          description="Per completed project"
          iconColor="text-purple-600"
        />
      </div>

      {/* ── Recent projects ──────────────────── */}
      <div className="border-border bg-card shadow-card hover:shadow-card-md overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-0.5">
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-foreground text-sm font-semibold">Recent Projects</h2>
            <p className="text-muted-foreground mt-0.5 text-xs">Your latest 5 projects</p>
          </div>
          <Link
            href="/projects"
            className="text-inox-600 hover:text-inox-700 flex items-center gap-1 text-xs font-medium transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {stats.recentProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <FolderOpen className="text-muted-foreground h-6 w-6" />
            </div>
            <p className="text-foreground text-sm font-medium">No projects yet</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Create your first project to get started.
            </p>
            <Button
              render={<Link href="/projects/new" />}
              nativeButton={false}
              size="sm"
              className="bg-inox-600 hover:bg-inox-700 mt-4 text-white transition-all duration-200 active:scale-[0.98]"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Project
            </Button>
          </div>
        ) : (
          <div className="divide-border divide-y">
            {stats.recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group hover:bg-muted/30 flex items-center gap-4 px-5 py-3.5 transition-colors"
              >
                <div className="bg-inox-50 dark:bg-inox-900/30 ring-inox-200/50 dark:ring-inox-700/40 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1">
                  <FolderOpen className="text-inox-600 h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground group-hover:text-inox-600 truncate text-sm font-medium transition-colors">
                    {project.projectType}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {project.customer.name} ·{" "}
                    {new Date(project.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <StatusBadge status={project.status} />
                  <span className="text-foreground text-sm font-semibold">
                    {formatNaira(project.totalCostKobo)}
                  </span>
                  <ArrowRight className="text-muted-foreground h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
