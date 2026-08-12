import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  isLoading?: boolean;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="shimmer h-4 w-3/4 rounded-md" />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  emptyMessage = "No records found.",
  isLoading = false,
}: DataTableProps<T>) {
  return (
    <div className="border-border bg-card shadow-card overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border bg-muted/40 border-b">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-muted-foreground py-16 text-center text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                      <span className="text-xl">📂</span>
                    </div>
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id ?? i} className="group hover:bg-muted/30 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
