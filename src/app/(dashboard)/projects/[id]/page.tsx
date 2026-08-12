import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Phone, Mail, MapPin, Ruler, Package, FileText, ExternalLink, Pencil } from "lucide-react";

import { requireSession } from "@/lib/session";
import { projectRepository } from "@/repositories/project.repository";
import { ProjectStatusUpdater } from "@/components/features/projects/project-status-updater";
import { GenerateQuotationButton } from "@/components/features/projects/generate-quotation-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils/money";

export const metadata: Metadata = { title: "Project Detail" };

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const project = await projectRepository.findById(id);
  if (!project) notFound();

  const dims = project.dimensionsMm as { l: number; w: number; h: number };
  const hasQuotation = project.quotations.length > 0;
  const canGenerate = !hasQuotation || project.status === "accepted";
  const canEdit =
    project.status !== "completed" &&
    (session.user.role === "admin" || project.createdById === session.user.id);

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
        <div className="border-border bg-card shadow-card hover:shadow-card-md overflow-hidden rounded-xl border p-5 transition-all duration-300">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-foreground text-3xl font-bold tracking-tight">
                {project.projectType}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Created on{" "}
                {new Date(project.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                by {project.createdBy.name}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              <StatusBadge status={project.status} />
              {canEdit && (
                <Button
                  render={<Link href={`/projects/${project.id}/edit`} />}
                  variant="outline"
                  size="sm"
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          <div className="border-border flex flex-wrap gap-6 border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-lg">
                <Ruler className="h-4 w-4" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Dimensions (mm)
                </p>
                <p className="text-foreground text-sm font-semibold">
                  {dims.l} × {dims.w} × {dims.h}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-lg">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Complexity
                </p>
                <p className="text-foreground text-sm font-semibold capitalize">
                  {project.complexity}
                </p>
              </div>
            </div>
          </div>

          {project.notes && (
            <div className="bg-muted/30 mt-4 rounded-lg p-4">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Notes
              </p>
              <p className="text-foreground mt-1 text-sm">{project.notes}</p>
            </div>
          )}
        </div>

        {/* Materials Table Card */}
        <div className="border-border bg-card shadow-card hover:shadow-card-md overflow-hidden rounded-xl border p-5 transition-all duration-300">
          <h2 className="text-foreground mb-4 text-lg font-semibold tracking-tight">Materials</h2>
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
                cell: (row) => <span className="text-muted-foreground capitalize">{row.unit}</span>,
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
          <div className="bg-muted/40 mt-4 flex items-center justify-between rounded-lg px-4 py-3">
            <span className="text-muted-foreground text-sm font-medium">Material Subtotal</span>
            <span className="text-foreground font-mono text-base font-semibold">
              {formatNaira(materialSubtotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN (1/3) ────────────────────────── */}
      <div className="w-full flex-shrink-0 space-y-6 lg:w-80">
        {/* Actions Card */}
        <div className="border-border bg-card shadow-card hover:shadow-card-md overflow-hidden rounded-xl border p-5 transition-all duration-300">
          <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
            Actions
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1.5 text-xs font-medium">Update Status</p>
              <ProjectStatusUpdater projectId={project.id} currentStatus={project.status} />
            </div>

            {canGenerate && (
              <div>
                <GenerateQuotationButton projectId={project.id} />
              </div>
            )}

            {project.quotations.length > 0 && (
              <div className="pt-2">
                <p className="text-muted-foreground mb-2 text-xs font-medium">
                  Existing Quotations
                </p>
                <div className="space-y-2">
                  {project.quotations.map((q) => (
                    <Link
                      key={q.id}
                      href={`/quotations/${q.id}`}
                      className="group border-border bg-background hover:bg-muted/50 flex items-center justify-between rounded-lg border px-3 py-2 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="text-inox-600 h-4 w-4" />
                        <span className="text-foreground group-hover:text-inox-600 font-mono text-sm font-semibold transition-colors">
                          {q.reference}
                        </span>
                      </div>
                      <ExternalLink className="text-muted-foreground h-3.5 w-3.5 opacity-0 transition-all group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Card */}
        <div className="border-border bg-card shadow-card hover:shadow-card-md overflow-hidden rounded-xl border p-5 transition-all duration-300">
          <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
            Customer
          </h3>
          <div className="space-y-3">
            <p className="text-foreground text-base font-semibold">{project.customer.name}</p>

            {project.customer.phone && (
              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                <Phone className="text-inox-600 h-4 w-4" />
                <span>{project.customer.phone}</span>
              </div>
            )}

            {project.customer.email && (
              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                <Mail className="text-inox-600 h-4 w-4" />
                <span className="truncate">{project.customer.email}</span>
              </div>
            )}

            {project.customer.address && (
              <div className="text-muted-foreground flex items-start gap-3 text-sm">
                <MapPin className="text-inox-600 mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{project.customer.address}</span>
              </div>
            )}

            <Link
              href={`/customers/${project.customerId}`}
              className="text-inox-600 hover:text-inox-700 mt-4 inline-flex items-center gap-1 text-xs font-medium transition-colors"
            >
              View customer profile
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Cost Summary Card */}
        <div className="border-border bg-card shadow-card hover:shadow-card-md overflow-hidden rounded-xl border p-5 transition-all duration-300">
          <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
            Cost Summary
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="text-muted-foreground flex justify-between">
              <span>Materials (Adj.)</span>
              <span className="font-mono">{formatNaira(materialSubtotal)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Labour</span>
              <span className="font-mono">{formatNaira(project.labourCostKobo)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Transport</span>
              <span className="font-mono">{formatNaira(project.transportCostKobo)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Profit Margin</span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                +{project.profitMarginPct}%
              </span>
            </div>
            <div className="bg-border my-3 h-px" />
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">Total</span>
              <span className="text-inox-600 font-mono text-xl font-bold">
                {formatNaira(project.totalCostKobo)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
