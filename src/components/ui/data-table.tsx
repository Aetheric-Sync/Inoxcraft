import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface Column<T> {
  key:        string;
  header:     string;
  cell:       (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns:   Column<T>[];
  data:      T[];
  emptyMessage?: string;
  isLoading?: boolean;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_: any, i: number) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-3/4 rounded-md shimmer" />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  emptyMessage = "No records found.",
  isLoading    = false,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col: any) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading
              ? Array.from({ length: 5 }).map((_: any, i: number) => (
                  <SkeletonRow key={i} cols={columns.length} />
                ))
              : data.length === 0
              ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 text-center text-sm text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xl">📂</span>
                      </div>
                      {emptyMessage}
                    </div>
                  </td>
                </tr>
              )
              : data.map((row: any, i: number) => (
                <tr
                  key={row.id ?? i}
                  className="group transition-colors hover:bg-muted/30"
                >
                  {columns.map((col: any) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3 align-middle", col.className)}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
