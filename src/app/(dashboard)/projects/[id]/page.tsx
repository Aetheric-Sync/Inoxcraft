import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Phone, Mail, MapPin, Ruler, Package } from "lucide-react";

import { requireSession } from "@/lib/session";
import { projectRepository } from "@/repositories/project.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectStatusUpdater } from "@/components/features/projects/project-status-updater";
import { GenerateQuotationButton } from "@/components/features/projects/generate-quotation-button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Project Detail" };

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

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const project = await projectRepository.findById(id);
  if (!project) notFound();

  const dims = project.dimensionsMm as { l: number; w: number; h: number };
  const hasQuotation = project.quotations.length > 0;
  const canGenerate = !hasQuotation || project.status === "accepted";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{project.projectType}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Created {new Date(project.createdAt).toLocaleDateString("en-NG")} · by{" "}
            {project.createdBy.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${STATUS_COLORS[project.status] ?? ""}`}
          >
            {project.status}
          </span>
          <ProjectStatusUpdater projectId={project.id} currentStatus={project.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold text-slate-900">{project.customer.name}</p>
            {project.customer.phone && (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4" />
                {project.customer.phone}
              </p>
            )}
            {project.customer.email && (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4" />
                {project.customer.email}
              </p>
            )}
            {project.customer.address && (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                {project.customer.address}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
              Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Ruler className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">Dimensions:</span>
              <span className="font-medium">
                {dims.l} × {dims.w} × {dims.h} mm
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">Complexity:</span>
              <span className="font-medium capitalize">{project.complexity}</span>
            </div>
            {project.notes && (
              <div className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="mb-1 font-medium text-slate-700">Notes</p>
                {project.notes}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
            Materials
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Material</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.materials.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.material.name}</TableCell>
                  <TableCell className="text-slate-500 capitalize">{m.material.unitType}</TableCell>
                  <TableCell className="text-right">{Number(m.quantity)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNaira(m.unitCostKobo)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNaira(Number(m.quantity) * m.unitCostKobo)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              { label: "Labour Cost", value: formatNaira(project.labourCostKobo) },
              { label: "Transport Cost", value: formatNaira(project.transportCostKobo) },
              { label: "Profit Margin", value: `${project.profitMarginPct}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1 text-slate-600">
                <span>{label}</span>
                <span>{value}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between py-2 text-lg font-bold text-slate-900">
              <span>Total</span>
              <span className="text-inox-700">{formatNaira(project.totalCostKobo)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
            Quotations
          </CardTitle>
          {canGenerate && <GenerateQuotationButton projectId={project.id} />}
        </CardHeader>
        <CardContent>
          {project.quotations.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">No quotations generated yet.</p>
          ) : (
            <div className="space-y-3">
              {project.quotations.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between rounded-lg border bg-slate-50 p-3"
                >
                  <div>
                    <p className="font-mono font-semibold text-slate-800">{q.reference}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(q.createdAt).toLocaleDateString("en-NG")} · Valid until{" "}
                      {new Date(q.validUntil).toLocaleDateString("en-NG")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-inox-700 font-bold">{formatNaira(q.totalAmountKobo)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
