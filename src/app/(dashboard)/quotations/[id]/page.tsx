import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";

import { requireSession } from "@/lib/session";
import { quotationRepository } from "@/repositories/quotation.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { QuotationActions } from "@/components/features/quotations/quotation-actions";

export const metadata: Metadata = { title: "Quotation Detail" };

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

export default async function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const quotation = await quotationRepository.findById(id);
  if (!quotation) notFound();

  const project = quotation.project;
  const customer = project.customer;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs tracking-wider text-slate-500 uppercase">Quotation</p>
          <h1 className="text-inox-700 font-mono text-2xl font-bold">{quotation.reference}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Issued {new Date(quotation.createdAt).toLocaleDateString("en-NG")} · Valid until{" "}
            {new Date(quotation.validUntil).toLocaleDateString("en-NG")}
          </p>
        </div>
        <QuotationActions
          quotationId={quotation.id}
          pdfUrl={quotation.pdfUrl}
          emailedAt={quotation.emailedAt?.toISOString() ?? null}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold text-slate-900">{customer.name}</p>
            {customer.phone && (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4" />
                {customer.phone}
              </p>
            )}
            {customer.email && (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4" />
                {customer.email}
              </p>
            )}
            {customer.address && (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                {customer.address}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
              Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-semibold text-slate-900">{project.projectType}</p>
            <p className="text-sm text-slate-600 capitalize">
              Complexity: <span className="font-medium">{project.complexity}</span>
            </p>
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
            Cost Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="ml-auto max-w-sm space-y-2 text-sm">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Labour</span>
              <span>{formatNaira(project.labourCostKobo)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600">
              <span>Transport</span>
              <span>{formatNaira(project.transportCostKobo)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600">
              <span>Profit margin</span>
              <span>{project.profitMarginPct}%</span>
            </div>
            <Separator />
            <div className="flex justify-between py-2 text-xl font-bold text-slate-900">
              <span>Total</span>
              <span className="text-inox-700">{formatNaira(quotation.totalAmountKobo)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
