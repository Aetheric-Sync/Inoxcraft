import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Phone, Mail, MapPin, Ruler, Package, FileText, ExternalLink } from "lucide-react";

import { requireSession } from "@/lib/session";
import { projectRepository } from "@/repositories/project.repository";
import { ProjectStatusUpdater } from "@/components/features/projects/project-status-updater";
import { GenerateQuotationButton } from "@/components/features/projects/generate-quotation-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { formatNaira } from "@/lib/utils/money";
import type { ProjectStatus } from "@/types";

export const metadata: Metadata = { title: "Project Detail" };

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const project = await projectRepository.findById(id);
  if (!project) notFound();

  const dims = project.dimensionsMm as { l: number; w: number; h: number };
  const hasQuotation = project.quotations.length > 0;
  const canGenerate = !hasQuotation || project.status === "accepted";

  const materialsData = project.materials.map((m) => ({
    id: m.id,
    name: m.material.name,
    unit: m.material.unitType,
    qty: Number(m.quantity),
    price: m.unitCostKobo,
    total: Number(m.quantity) * m.unitCostKobo,
  }));

  const materialSubtotal = materialsData.reduce((acc, m) => acc + m.total, 0);

  return (
    <div className="animate-fade-in flex flex-col gap-6 lg:flex-row">
      {/* ── LEFT COLUMN (2/3) ─────────────────────────── */}
      <div className="flex-1 space-y-6">
        {/* Project Header Card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-md">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {project.projectType}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Created on{" "}
                {new Date(project.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                by {project.createdBy.name}
              </p>
            </div>
            <div className="flex-shrink-0">
              <StatusBadge status={project.status} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Ruler className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Dimensions (mm)
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {dims.l} × {dims.w} × {dims.h}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Complexity
                </p>
                <p className="text-sm font-semibold capitalize text-foreground">
                  {project.complexity}
                </p>
              </div>
            </div>
          </div>

          {project.notes && (
            <div className="mt-4 rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </p>
              <p className="mt-1 text-sm text-foreground">{project.notes}</p>
            </div>
          )}
        </div>

        {/* Materials Table Card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-md">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            Materials
          </h2>
          <DataTable
            data={materialsData}
            columns={[
              {
                key: "name",
                header: "Material",
                cell: (row) => <span className="font-medium">{row.name}</span>,
              },
              {
                key: "unit",
                header: "Unit",
                cell: (row) => <span className="capitalize text-muted-foreground">{row.unit}</span>,
              },
              {
                key: "qty",
                header: "Qty",
                className: "text-right",
                cell: (row) => row.qty,
              },
              {
                key: "price",
                header: "Unit Price",
                className: "text-right font-mono",
                cell: (row) => formatNaira(row.price),
              },
              {
                key: "total",
                header: "Line Total",
                className: "text-right font-mono font-medium text-foreground",
                cell: (row) => formatNaira(row.total),
              },
            ]}
          />
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
            <span className="text-sm font-medium text-muted-foreground">Material Subtotal</span>
            <span className="font-mono text-base font-semibold text-foreground">
              {formatNaira(materialSubtotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN (1/3) ────────────────────────── */}
      <div className="w-full space-y-6 lg:w-80 flex-shrink-0">
        {/* Actions Card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-md">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Actions
          </h3>
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Update Status</p>
              <ProjectStatusUpdater projectId={project.id} currentStatus={project.status} />
            </div>

            {canGenerate && (
              <div>
                <GenerateQuotationButton projectId={project.id} />
              </div>
            )}

            {project.quotations.length > 0 && (
              <div className="pt-2">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Existing Quotations</p>
                <div className="space-y-2">
                  {project.quotations.map((q) => (
                    <Link
                      key={q.id}
                      href={`/quotations/${q.id}`}
                      className="group flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-inox-600" />
                        <span className="font-mono text-sm font-semibold text-foreground group-hover:text-inox-600 transition-colors">
                          {q.reference}
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-md">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Customer
          </h3>
          <div className="space-y-3">
            <p className="text-base font-semibold text-foreground">{project.customer.name}</p>
            
            {project.customer.phone && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-inox-600" />
                <span>{project.customer.phone}</span>
              </div>
            )}
            
            {project.customer.email && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-inox-600" />
                <span className="truncate">{project.customer.email}</span>
              </div>
            )}
            
            {project.customer.address && (
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-inox-600" />
                <span>{project.customer.address}</span>
              </div>
            )}

            <Link
              href={`/customers/${project.customerId}`}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-inox-600 transition-colors hover:text-inox-700"
            >
              View customer profile
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Cost Summary Card */}
        <div className="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-md">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Cost Summary
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Materials (Adj.)</span>
              <span className="font-mono">{formatNaira(materialSubtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Labour</span>
              <span className="font-mono">{formatNaira(project.labourCostKobo)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Transport</span>
              <span className="font-mono">{formatNaira(project.transportCostKobo)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Profit Margin</span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                +{project.profitMarginPct}%
              </span>
            </div>
            <div className="my-3 h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-mono text-xl font-bold text-inox-600">
                {formatNaira(project.totalCostKobo)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
