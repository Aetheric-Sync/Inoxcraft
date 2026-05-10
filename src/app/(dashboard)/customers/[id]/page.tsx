import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Phone, Mail, MapPin, ArrowLeft, Eye } from "lucide-react";

import { requireSession } from "@/lib/session";
import { customerRepository } from "@/repositories/customer.repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerEditForm } from "@/components/features/customers/customer-edit-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Customer Detail" };

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

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const customer = await customerRepository.findById(id);
  if (!customer) notFound();

  const totalRevenue = customer.projects
    .filter((p) => p.status === "accepted" || p.status === "completed")
    .reduce((sum, p) => sum + p.totalCostKobo, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button render={<Link href="/customers" />} nativeButton={false} variant="ghost" size="sm">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Customers
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
          <p className="text-sm text-slate-500">
            {customer.projects.length} project(s) · {formatNaira(totalRevenue)} total revenue
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
              Contact Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customer.phone && (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                {customer.phone}
              </p>
            )}
            {customer.email && (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                {customer.email}
              </p>
            )}
            {customer.address && (
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                {customer.address}
              </p>
            )}
            {!customer.phone && !customer.email && !customer.address && (
              <p className="text-sm text-slate-400">No contact details recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
              Edit Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerEditForm
              customer={{
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Project Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-slate-400">
                    No projects yet.
                  </TableCell>
                </TableRow>
              ) : (
                customer.projects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">{project.projectType}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[project.status] ?? ""}`}
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
                    <TableCell className="text-right">
                      <Button
                        render={<Link href={`/projects/${project.id}`} />}
                        nativeButton={false}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-inox-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
