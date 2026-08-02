"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { Inbox } from "lucide-react";

import {
  DataTable,
  DataTableColumnHeader,
  DataTableToolbar,
} from "@/components/data-table";
import { EmptyState } from "@/components/layouts/empty-state";
import { APPLICATION_STATUS, getApplicationStatusLabel } from "@/constants/application-status";
import { hrApplicationPath } from "@/constants/routes";
import { ApplicationStatusBadge } from "@/features/applications/components/application-status-badge";
import { ResumeDownloadButton } from "@/features/applications/components/resume-download-button";
import type { HrApplicationTableRow } from "@/services/applications";

type ApplicationsTableProps = {
  applications: HrApplicationTableRow[];
};

function formatSubmittedAt(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const jobOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of applications) {
      map.set(row.jobId, row.jobTitle);
    }
    return [...map.entries()]
      .map(([jobId, jobTitle]) => ({ jobId, jobTitle }))
      .sort((a, b) => a.jobTitle.localeCompare(b.jobTitle));
  }, [applications]);

  const columns = useMemo<ColumnDef<HrApplicationTableRow>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Candidate" />
        ),
        cell: ({ row }) => (
          <div className="space-y-0.5 whitespace-normal">
            <Link
              href={hrApplicationPath(row.original.id)}
              className="font-medium text-foreground hover:underline"
            >
              {row.original.fullName}
            </Link>
            <p className="text-xs text-muted-foreground md:hidden">
              {row.original.email}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "jobTitle",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => (
          <span className="whitespace-normal text-muted-foreground">
            {row.original.jobTitle}
          </span>
        ),
      },
      {
        accessorKey: "jobId",
        header: () => null,
        enableHiding: true,
        filterFn: (row, id, value) => {
          if (!value || value === "all") {
            return true;
          }
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <ApplicationStatusBadge status={row.original.status} />
        ),
        filterFn: (row, id, value) => {
          if (!value || value === "all") {
            return true;
          }
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Submitted" />
        ),
        cell: ({ row }) => formatSubmittedAt(row.original.createdAt),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Resume</span>,
        cell: ({ row }) =>
          row.original.resumePath ? (
            <ResumeDownloadButton
              applicationId={row.original.id}
              fileName={row.original.resumeFileName}
            />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: applications,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue).trim().toLowerCase();
      if (!q) {
        return true;
      }
      const app = row.original;
      return [app.fullName, app.email, app.jobTitle]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
      columnVisibility: { jobId: false },
    },
  });

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="size-5" aria-hidden="true" />}
        title="No applications yet"
        description="When candidates apply from Careers, they’ll show up here."
      />
    );
  }

  const statusFilter = String(
    table.getColumn("status")?.getFilterValue() ?? "all",
  );
  const jobFilter = String(table.getColumn("jobId")?.getFilterValue() ?? "all");

  return (
    <DataTable
      table={table}
      columns={columns}
      emptyMessage="No applications match your filters."
      toolbar={
        <DataTableToolbar
          table={table}
          searchPlaceholder="Search name, email, or role…"
        >
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="sr-only sm:not-sr-only">Status</span>
            <select
              className="h-9 rounded-xl border border-input bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
              value={statusFilter}
              onChange={(event) => {
                const value = event.target.value;
                table
                  .getColumn("status")
                  ?.setFilterValue(value === "all" ? undefined : value);
              }}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {Object.values(APPLICATION_STATUS).map((status) => (
                <option key={status} value={status}>
                  {getApplicationStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="sr-only sm:not-sr-only">Job</span>
            <select
              className="h-9 max-w-[12rem] rounded-xl border border-input bg-card px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
              value={jobFilter}
              onChange={(event) => {
                const value = event.target.value;
                table
                  .getColumn("jobId")
                  ?.setFilterValue(value === "all" ? undefined : value);
              }}
              aria-label="Filter by job"
            >
              <option value="all">All jobs</option>
              {jobOptions.map((job) => (
                <option key={job.jobId} value={job.jobId}>
                  {job.jobTitle}
                </option>
              ))}
            </select>
          </label>
        </DataTableToolbar>
      }
      mobileRow={(application) => (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="min-w-0 space-y-1">
            <Link
              href={hrApplicationPath(application.id)}
              className="font-medium text-foreground hover:underline"
            >
              {application.fullName}
            </Link>
            <p className="text-xs text-muted-foreground">
              {application.jobTitle}
            </p>
            <p className="text-xs text-muted-foreground">{application.email}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <ApplicationStatusBadge status={application.status} />
              <span className="text-xs text-muted-foreground">
                {formatSubmittedAt(application.createdAt)}
              </span>
            </div>
          </div>
          {application.resumePath ? (
            <ResumeDownloadButton
              applicationId={application.id}
              fileName={application.resumeFileName}
            />
          ) : (
            <p className="text-xs text-muted-foreground">No resume</p>
          )}
        </div>
      )}
    />
  );
}
