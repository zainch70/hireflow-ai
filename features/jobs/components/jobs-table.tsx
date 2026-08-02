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
import { BriefcaseBusiness } from "lucide-react";

import {
  DataTable,
  DataTableColumnHeader,
  DataTableToolbar,
} from "@/components/data-table";
import { EmptyState } from "@/components/layouts/empty-state";
import { ButtonLink } from "@/components/layouts/button-link";
import { ROUTES } from "@/constants/routes";
import { JOB_STATUS, type JobStatus } from "@/constants/job-status";
import type { EmploymentType } from "@/constants/employment-type";
import { JobStatusBadge } from "@/features/jobs/components/job-status-badge";
import { JobRowActions } from "@/features/jobs/components/job-row-actions";
import {
  formatSalaryRange,
  getEmploymentTypeLabel,
  getJobStatusLabel,
} from "@/features/jobs/lib/job-labels";

export type JobTableRow = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  experience: string | null;
  employmentType: string;
  status: JobStatus;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  updatedAt: string;
};

type JobsTableProps = {
  jobs: JobTableRow[];
};

function formatUpdatedAt(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export function JobsTable({ jobs }: JobsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<JobTableRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => {
          const job = row.original;
          const salary = formatSalaryRange(job);

          return (
            <div className="space-y-1 whitespace-normal">
              <Link
                href={`${ROUTES.dashboard.jobs}/${job.id}/edit`}
                className="font-medium text-foreground hover:underline"
              >
                {job.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {job.location ?? "Remote / TBD"}
                {job.experience ? ` · ${job.experience}` : ""}
                {salary ? ` · ${salary}` : ""}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "department",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Department" />
        ),
        cell: ({ row }) => row.original.department ?? "—",
      },
      {
        accessorKey: "employmentType",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) =>
          getEmploymentTypeLabel(
            row.original.employmentType as EmploymentType,
          ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => <JobStatusBadge status={row.original.status} />,
        filterFn: (row, id, value) => {
          if (!value || value === "all") {
            return true;
          }
          return row.getValue(id) === value;
        },
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Updated" />
        ),
        cell: ({ row }) => formatUpdatedAt(row.original.updatedAt),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <JobRowActions
            jobId={row.original.id}
            status={row.original.status}
          />
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: jobs,
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
      const job = row.original;
      return [job.title, job.department, job.location, job.experience]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<BriefcaseBusiness className="size-5" aria-hidden="true" />}
        title="No job openings yet"
        description="Create your first role to start collecting applications later."
        action={
          <ButtonLink href={`${ROUTES.dashboard.jobs}/new`}>
            Create job
          </ButtonLink>
        }
      />
    );
  }

  const statusFilter = String(
    table.getColumn("status")?.getFilterValue() ?? "all",
  );

  return (
    <DataTable
      table={table}
      columns={columns}
      emptyMessage="No jobs match your filters."
      toolbar={
        <DataTableToolbar
          table={table}
          searchPlaceholder="Search title, department, location…"
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
              {(Object.values(JOB_STATUS) as JobStatus[]).map((status) => (
                <option key={status} value={status}>
                  {getJobStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </DataTableToolbar>
      }
      mobileRow={(job) => {
        const salary = formatSalaryRange(job);

        return (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <Link
                  href={`${ROUTES.dashboard.jobs}/${job.id}/edit`}
                  className="font-medium text-foreground hover:underline"
                >
                  {job.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {job.department ?? "No department"}
                  {" · "}
                  {getEmploymentTypeLabel(
                    job.employmentType as EmploymentType,
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.location}
                  {job.experience ? ` · ${job.experience}` : ""}
                  {salary ? ` · ${salary}` : ""}
                </p>
              </div>
              <JobRowActions jobId={job.id} status={job.status} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <JobStatusBadge status={job.status} />
              <span className="text-xs text-muted-foreground">
                Updated {formatUpdatedAt(job.updatedAt)}
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}
