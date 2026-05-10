import {
  BarChart2,
  FolderOpen,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { requireSession } from "@/lib/session";
import { projectRepository } from "@/repositories/project.repository";
import { StatsCard } from "@/components/features/dashboard/stats-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatNaira, formatNairaCompact } from "@/lib/utils/money";
import type { ProjectStatus } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession();
  const stats   = await projectRepository.getDashboardStats();

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
            className="bg-inox-600 text-white shadow-inox hover:bg-inox-700 transition-all duration-200 active:scale-[0.98]"
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
          value={stats.totalRevenueKobo === 0 ? "₦0" : formatNairaCompact(stats.totalRevenueKobo)}
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
          value={stats.avgJobValueKobo === 0 ? "₦0" : formatNairaCompact(stats.avgJobValueKobo)}
          icon="users"
          description="Per completed project"
          iconColor="text-purple-600"
        />
      </div>

      {/* ── Recent projects ──────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-md hover:-translate-y-0.5">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Recent Projects
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your latest 5 projects
            </p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-xs font-medium text-inox-600 hover:text-inox-700 transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {stats.recentProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No projects yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first project to get started.
            </p>
            <Button
              render={<Link href="/projects/new" />}
              nativeButton={false}
              size="sm"
              className="mt-4 bg-inox-600 text-white hover:bg-inox-700 transition-all duration-200 active:scale-[0.98]"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Project
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats.recentProjects.map((project: any) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-inox-50 dark:bg-inox-900/30 ring-1 ring-inox-200/50 dark:ring-inox-700/40">
                  <FolderOpen className="h-4 w-4 text-inox-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground group-hover:text-inox-600 transition-colors">
                    {project.projectType}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {project.customer.name} ·{" "}
                    {new Date(project.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <StatusBadge status={project.status as ProjectStatus} />
                  <span className="text-sm font-semibold text-foreground">
                    {formatNaira(project.totalCostKobo)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
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
