import type { Metadata } from "next";
import { Eye } from "lucide-react";
import Link from "next/link";

import { requireSession } from "@/lib/session";
import { customerRepository } from "@/repositories/customer.repository";
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
import { CustomersToolbar } from "@/components/features/customers/customers-toolbar";

export const metadata: Metadata = { title: "Customers" };

interface SearchParams {
  search?: string;
  page?: string;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireSession();
  const sp = await searchParams;
  const search = sp.search ?? "";
  const page = parseInt(sp.page ?? "1", 10);
  const limit = 20;

  const customers = await customerRepository.findAll(search, page, limit);
  const total = await customerRepository.count(search);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">{total} total customers</p>
        </div>
      </div>

      <CustomersToolbar />

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-slate-400">
                    {search ? `No customers match "${search}"` : "No customers yet."}
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-slate-500">{customer.phone ?? "—"}</TableCell>
                    <TableCell className="text-slate-500">{customer.email ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        render={<Link href={`/customers/${customer.id}`} />}
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
                  <Link href={`/customers?page=${page - 1}${search ? `&search=${search}` : ""}`} />
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
                  <Link href={`/customers?page=${page + 1}${search ? `&search=${search}` : ""}`} />
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
