import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Eye, FileText } from "lucide-react";

import { requireSession } from "@/lib/session";
import { projectRepository } from "@/repositories/project.repository";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";
import type { ProjectStatus } from "@/types";

export const metadata: Metadata = { title: "Projects" };

interface SearchParams {
  page?: string;
  status?: string;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireSession();
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1", 10);
  const status = sp.status as ProjectStatus | undefined;
  const limit = 20;

  const filters = status ? { status } : undefined;
  const [projects, total] = await Promise.all([
    projectRepository.findAll(filters, page, limit),
    projectRepository.count(filters),
  ]);

  const totalPages = Math.ceil(total / limit);
  const STATUSES = ["all", "draft", "quoted", "accepted", "rejected", "completed"] as const;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Projects"
        description={`${total} total projects`}
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

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const isActive = (s === "all" && !status) || s === status;
          return (
            <Link
              key={s}
              href={s === "all" ? "/projects" : `/projects?status=${s}`}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-200",
                isActive
                  ? "bg-inox-600 text-white shadow-inox"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {s}
            </Link>
          );
        })}
      </div>

      <DataTable
        data={projects}
        emptyMessage="No projects found."
        columns={[
          {
            key: "project",
            header: "Project",
            cell: (row) => (
              <div>
                <p className="font-medium text-foreground transition-colors group-hover:text-inox-600">
                  {row.projectType}
                </p>
                <p className="text-xs text-muted-foreground sm:hidden">
                  {row.customer.name}
                </p>
              </div>
            ),
          },
          {
            key: "customer",
            header: "Customer",
            className: "hidden sm:table-cell",
            cell: (row) => (
              <span className="text-muted-foreground">{row.customer.name}</span>
            ),
          },
          {
            key: "complexity",
            header: "Complexity",
            className: "hidden md:table-cell",
            cell: (row) => {
              const dotColor =
                row.complexity === "standard"
                  ? "bg-blue-400"
                  : row.complexity === "complex"
                  ? "bg-amber-400"
                  : "bg-purple-400";
              return (
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
                  <span className="capitalize text-muted-foreground">
                    {row.complexity}
                  </span>
                </div>
              );
            },
          },
          {
            key: "cost",
            header: "Total Cost",
            className: "text-right",
            cell: (row) => (
              <span className="font-semibold text-foreground">
                {formatNaira(row.totalCostKobo)}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (row) => <StatusBadge status={row.status as ProjectStatus} />,
          },
          {
            key: "date",
            header: "Date",
            className: "hidden lg:table-cell",
            cell: (row) => (
              <span className="text-xs text-muted-foreground">
                {new Date(row.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (row) => (
              <div className="flex items-center justify-end gap-2">
                <Button
                  render={<Link href={`/projects/${row.id}`} />}
                  nativeButton={false}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground transition-colors hover:text-inox-600"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
              </div>
            ),
          },
        ]}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button
                render={
                  <Link
                    href={`/projects?page=${page - 1}${
                      status ? `&status=${status}` : ""
                    }`}
                  />
                }
                variant="outline"
                size="sm"
                className="transition-colors hover:bg-muted/50"
              >
                Previous
              </Button>
            )}
            {page < totalPages && (
              <Button
                render={
                  <Link
                    href={`/projects?page=${page + 1}${
                      status ? `&status=${status}` : ""
                    }`}
                  />
                }
                variant="outline"
                size="sm"
                className="transition-colors hover:bg-muted/50"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
