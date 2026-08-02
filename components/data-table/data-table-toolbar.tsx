"use client";

import type { ReactNode } from "react";
import type { Table } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  children?: ReactNode;
};

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Search…",
  children,
}: DataTableToolbarProps<TData>) {
  const searchColumn = searchKey ? table.getColumn(searchKey) : undefined;
  const globalFilter = table.getState().globalFilter;
  const searchValue = searchColumn
    ? String(searchColumn.getFilterValue() ?? "")
    : typeof globalFilter === "string"
      ? globalFilter
      : "";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input
        value={searchValue}
        onChange={(event) => {
          const value = event.target.value;
          if (searchColumn) {
            searchColumn.setFilterValue(value);
            return;
          }
          table.setGlobalFilter(value);
        }}
        placeholder={searchPlaceholder}
        className="h-9 max-w-sm"
        aria-label="Search"
      />
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
