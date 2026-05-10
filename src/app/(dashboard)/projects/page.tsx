import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Eye } from "lucide-react";

import { requireSession } from "@/lib/session";
import { projectRepository } from "@/repositories/project.repository";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import type { ProjectStatus } from "@/types";

export const metadata: Metadata = { title: "Projects" };

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  quoted: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  accepted: "bg-green-100 text-green-700 hover:bg-green-100",
  rejected: "bg-red-100 text-red-700 hover:bg-red-100",
  completed: "bg-inox-100 text-inox-700 hover:bg-inox-100",
};

const COMPLEXITY_LABELS: Record<string, string> = {
  standard: "Standard",
  complex: "Complex",
  bespoke: "Bespoke",
};

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">{total} total projects</p>
        </div>
        <Button
          render={<Link href="/projects/new" />}
          className="bg-inox-600 hover:bg-inox-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link key={s} href={s === "all" ? "/projects" : `/projects?status=${s}`}>
            <Badge
              variant="secondary"
              className={`cursor-pointer px-3 py-1 text-sm capitalize ${
                (s === "all" && !status) || s === status
                  ? "bg-inox-600 hover:bg-inox-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s === "all" ? "All" : s}
            </Badge>
          </Link>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Customer</TableHead>
                <TableHead>Project Type</TableHead>
                <TableHead>Complexity</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    No projects found.{" "}
                    {!status && (
                      <Link href="/projects/new" className="text-inox-600 hover:underline">
                        Create the first one.
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">{project.customer.name}</TableCell>
                    <TableCell className="text-slate-600">{project.projectType}</TableCell>
                    <TableCell className="text-slate-600 capitalize">
                      {COMPLEXITY_LABELS[project.complexity] ?? project.complexity}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNaira(project.totalCostKobo)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[project.status] ?? ""}`}
                      >
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(project.createdAt).toLocaleDateString("en-NG")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        render={<Link href={`/projects/${project.id}`} />}
                        variant="ghost"
                        size="sm"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button
                render={
                  <Link href={`/projects?page=${page - 1}${status ? `&status=${status}` : ""}`} />
                }
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
            )}
            {page < totalPages && (
              <Button
                render={
                  <Link href={`/projects?page=${page + 1}${status ? `&status=${status}` : ""}`} />
                }
                variant="outline"
                size="sm"
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
