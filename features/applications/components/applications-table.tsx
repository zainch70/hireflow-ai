"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Inbox } from "lucide-react";

import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/data-table";
import { EmptyState } from "@/components/layouts/empty-state";
import { hrApplicationPath } from "@/constants/routes";
import { ApplicationStatusBadge } from "@/features/applications/components/application-status-badge";
import { ResumeDownloadButton } from "@/features/applications/components/resume-download-button";
import type { HrApplicationTableRow } from "@/services/applications";

type ApplicationsTableProps = {
  applications: HrApplicationTableRow[];
  emptyTitle?: string;
  emptyDescription?: string;
};

function formatSubmittedAt(iso: string) {
  return new Date(iso).toLocaleDateString();
}

function formatScore(score: number | null) {
  if (score == null) {
    return "—";
  }
  return String(Math.round(score));
}

export function ApplicationsTable({
  applications,
  emptyTitle = "No applications yet",
  emptyDescription = "When candidates apply from Careers, they’ll show up here.",
}: ApplicationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

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
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <ApplicationStatusBadge status={row.original.status} />
        ),
      },
      {
        accessorKey: "aiScore",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="AI score" />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {formatScore(row.original.aiScore)}
          </span>
        ),
        sortingFn: (a, b) =>
          (a.original.aiScore ?? -1) - (b.original.aiScore ?? -1),
      },
      {
        accessorKey: "yearsOfExperience",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Exp." />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.original.yearsOfExperience ?? "—"}
          </span>
        ),
        sortingFn: (a, b) =>
          (a.original.yearsOfExperience ?? -1) -
          (b.original.yearsOfExperience ?? -1),
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
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="size-5" aria-hidden="true" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <DataTable
      table={table}
      columns={columns}
      emptyMessage="No applications match your filters."
      hidePagination
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
                AI {formatScore(application.aiScore)}
              </span>
              <span className="text-xs text-muted-foreground">
                {application.yearsOfExperience != null
                  ? `${application.yearsOfExperience} yrs`
                  : "Exp. —"}
              </span>
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
