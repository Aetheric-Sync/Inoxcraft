import type { Metadata } from "next";
import { Phone, Mail, ArrowRight, FolderOpen } from "lucide-react";
import Link from "next/link";

import { requireSession } from "@/lib/session";
import { customerRepository } from "@/repositories/customer.repository";
import { CustomersToolbar } from "@/components/features/customers/customers-toolbar";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

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
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Customers"
        description={`${total} total customers`}
      />

      <CustomersToolbar />

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-3xl shadow-inner-sm">
            👥
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {search ? `No customers match "${search}"` : "No customers yet"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Customers will appear here when you create projects for them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => {
            const initials = customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Link
                key={customer.id}
                href={`/customers/${customer.id}`}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-md"
              >
                <div className="mb-4 flex items-start gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-border group-hover:ring-inox-200/60 transition-colors">
                    <AvatarFallback className="bg-inox-50 text-inox-700 font-semibold dark:bg-inox-900/30 dark:text-inox-300">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-foreground group-hover:text-inox-600 transition-colors">
                      {customer.name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 mt-auto">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                </div>

                <div className="absolute right-5 top-5">
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-inox-600" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button
                render={
                  <Link
                    href={`/customers?page=${page - 1}${
                      search ? `&search=${search}` : ""
                    }`}
                  />
                }
                variant="outline"
                size="sm"
                className="transition-colors hover:bg-muted/50"
              >
                Previous
              </Button>
            )}
            {page < totalPages && (
              <Button
                render={
                  <Link
                    href={`/customers?page=${page + 1}${
                      search ? `&search=${search}` : ""
                    }`}
                  />
                }
                variant="outline"
                size="sm"
                className="transition-colors hover:bg-muted/50"
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
