import Link from "next/link";
import type { Metadata } from "next";
import { Eye, FileDown } from "lucide-react";

import { requireSession } from "@/lib/session";
import { quotationRepository } from "@/repositories/quotation.repository";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Quotations" };

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

export default async function QuotationsPage() {
  await requireSession();
  const quotations = await quotationRepository.findAll();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quotations</h1>
        <p className="text-sm text-slate-500">{quotations.length} total quotations</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Project Type</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400">
                    No quotations yet. Generate one from a project page.
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((q) => (
                  <TableRow key={q.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-inox-700 font-mono font-medium">
                      {q.reference}
                    </TableCell>
                    <TableCell>{q.project.customer.name}</TableCell>
                    <TableCell className="text-slate-600">{q.project.projectType}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNaira(q.totalAmountKobo)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(q.createdAt).toLocaleDateString("en-NG")}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(q.validUntil).toLocaleDateString("en-NG")}
                    </TableCell>
                    <TableCell>
                      {q.emailedAt ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          Not sent
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          render={
                            <Link href={`/quotations/${q.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          }
                          variant="ghost"
                          size="sm"
                        />
                        {q.pdfUrl && (
                          <Button
                            render={
                              <a href={q.pdfUrl} target="_blank" rel="noreferrer">
                                <FileDown className="h-4 w-4" />
                              </a>
                            }
                            variant="ghost"
                            size="sm"
                          />
                        )}
                      </div>
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
