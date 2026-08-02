"use client";

import type { ReactNode } from "react";
import {
  flexRender,
  type ColumnDef,
  type Table as TanStackTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { cn } from "@/lib/utils";

type DataTableProps<TData, TValue> = {
  table: TanStackTable<TData>;
  columns: ColumnDef<TData, TValue>[];
  toolbar?: ReactNode;
  mobileRow?: (row: TData) => ReactNode;
  emptyMessage?: string;
  className?: string;
  /** Hide built-in client pagination (use when paging on the server). */
  hidePagination?: boolean;
};

export function DataTable<TData, TValue>({
  table,
  columns,
  toolbar,
  mobileRow,
  emptyMessage = "No results.",
  className,
  hidePagination = false,
}: DataTableProps<TData, TValue>) {
  const rows = table.getRowModel().rows;

  return (
    <div className={cn("space-y-4", className)}>
      {toolbar}

      {mobileRow ? (
        <ul className="space-y-3 md:hidden">
          {rows.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </li>
          ) : (
            rows.map((row) => (
              <li key={row.id}>{mobileRow(row.original)}</li>
            ))
          )}
        </ul>
      ) : null}

      <SurfaceCard
        contentClassName="p-0 pt-0"
        className={cn(
          "overflow-hidden",
          mobileRow ? "hidden md:block" : "block",
        )}
      >
        <Table className="min-w-[720px]">
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === "actions" && "text-right",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </SurfaceCard>

      {hidePagination ? null : <DataTablePagination table={table} />}
    </div>
  );
}
