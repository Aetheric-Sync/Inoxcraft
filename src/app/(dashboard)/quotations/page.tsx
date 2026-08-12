import Link from "next/link";
import type { Metadata } from "next";
import { Eye, FileDown, FileText } from "lucide-react";

import { requireSession } from "@/lib/session";
import { quotationRepository } from "@/repositories/quotation.repository";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Quotations" };

export default async function QuotationsPage() {
  await requireSession();
  const quotations = await quotationRepository.findAll();

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Quotations" description="All generated quotations" />

      <DataTable
        data={quotations}
        emptyMessage="No quotations yet. Generate one from a project page."
        columns={[
          {
            key: "reference",
            header: "Reference",
            cell: (row) => (
              <div className="flex items-center gap-2">
                <FileText className="text-inox-600 h-4 w-4" />
                <span className="text-inox-600 font-mono text-xs font-semibold">
                  {row.reference}
                </span>
              </div>
            ),
          },
          {
            key: "customer",
            header: "Customer",
            cell: (row) => <span className="text-foreground">{row.project.customer.name}</span>,
          },
          {
            key: "projectType",
            header: "Project",
            cell: (row) => <span className="text-muted-foreground">{row.project.projectType}</span>,
          },
          {
            key: "total",
            header: "Amount",
            className: "text-right",
            cell: (row) => (
              <span className="text-foreground font-mono font-semibold">
                {formatNaira(row.totalAmountKobo)}
              </span>
            ),
          },
          {
            key: "issued",
            header: "Issued",
            className: "hidden md:table-cell",
            cell: (row) => (
              <span className="text-muted-foreground text-xs">
                {new Date(row.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            ),
          },
          {
            key: "validUntil",
            header: "Valid until",
            className: "hidden md:table-cell",
            cell: (row) => {
              const isExpired = new Date(row.validUntil) < new Date();
              return (
                <span
                  className={cn(
                    "text-xs font-medium",
                    isExpired ? "text-red-500 dark:text-red-400" : "text-muted-foreground",
                  )}
                >
                  {new Date(row.validUntil).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              );
            },
          },
          {
            key: "email",
            header: "Email",
            cell: (row) =>
              row.emailedAt ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-700/40">
                  Sent
                </span>
              ) : (
                <span className="bg-muted/50 text-muted-foreground ring-border inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1">
                  Not sent
                </span>
              ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            cell: (row) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  render={<Link href={`/quotations/${row.id}`} />}
                  nativeButton={false}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-inox-600 h-8 w-8 transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
                {row.pdfUrl ? (
                  <Button
                    render={
                      <a
                        href={row.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Download PDF"
                      />
                    }
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-inox-600 h-8 w-8 transition-colors"
                    title="Download PDF"
                  >
                    <FileDown className="h-4 w-4" />
                    <span className="sr-only">PDF</span>
                  </Button>
                ) : (
                  <Button
                    render={
                      <a
                        href={`/api/quotations/${row.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Download PDF"
                      />
                    }
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-inox-600 h-8 w-8 transition-colors"
                    title="Download PDF"
                  >
                    <FileDown className="h-4 w-4" />
                    <span className="sr-only">PDF</span>
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
