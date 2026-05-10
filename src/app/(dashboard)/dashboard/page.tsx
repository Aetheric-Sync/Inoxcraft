import Link from "next/link";
import type { Metadata } from "next";
import { LayoutDashboard, Plus, Briefcase, TrendingUp, Calendar, DollarSign } from "lucide-react";

import { requireSession } from "@/lib/session";
import { projectRepository } from "@/repositories/project.repository";
import { StatsCard } from "@/components/features/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  quoted: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-inox-100 text-inox-700",
};

export default async function DashboardPage() {
  await requireSession();
  const stats = await projectRepository.getDashboardStats();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-inox-600 h-7 w-7" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Overview of your fabrication business</p>
          </div>
        </div>
        <Button
          render={<Link href="/projects/new" />}
          className="bg-inox-600 hover:bg-inox-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Projects"
          value={String(stats.totalProjects)}
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatsCard
          label="Total Revenue"
          value={formatNaira(stats.totalRevenueKobo)}
          icon={<TrendingUp className="h-5 w-5" />}
          deltaType="positive"
        />
        <StatsCard
          label="Jobs This Month"
          value={String(stats.monthProjects)}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatsCard
          label="Avg Job Value"
          value={formatNaira(stats.avgJobValueKobo)}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-800">Recent Projects</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Customer</TableHead>
                <TableHead>Project Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-400">
                    No projects yet. Create your first project to get started.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">{project.customer.name}</TableCell>
                    <TableCell className="text-slate-600">{project.projectType}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[project.status] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNaira(project.totalCostKobo)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(project.createdAt).toLocaleDateString("en-NG")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
