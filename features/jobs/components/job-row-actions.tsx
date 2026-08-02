"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROUTES } from "@/constants/routes";
import type { JobStatus } from "@/constants/job-status";
import {
  closeJobAction,
  deleteJobAction,
  publishJobAction,
  unpublishJobAction,
} from "@/features/jobs/actions/job.actions";
import {
  canClose,
  canPublish,
  canUnpublish,
} from "@/features/jobs/lib/job-labels";
import Link from "next/link";

type JobRowActionsProps = {
  jobId: string;
  status: JobStatus;
};

export function JobRowActions({ jobId, status }: JobRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  function runAction(
    action: () => Promise<{ error?: string }>,
    successMessage: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Job actions"
              disabled={isPending}
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem
            render={<Link href={`${ROUTES.dashboard.jobs}/${jobId}/edit`} />}
          >
            Edit
          </DropdownMenuItem>

          {canPublish(status) ? (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() =>
                runAction(() => publishJobAction(jobId), "Job published")
              }
            >
              Publish
            </DropdownMenuItem>
          ) : null}

          {canUnpublish(status) ? (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() =>
                runAction(() => unpublishJobAction(jobId), "Job unpublished")
              }
            >
              Unpublish
            </DropdownMenuItem>
          ) : null}

          {canClose(status) ? (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() =>
                runAction(() => closeJobAction(jobId), "Job closed")
              }
            >
              Close
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={isPending}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the job opening. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                runAction(async () => {
                  const result = await deleteJobAction(jobId);
                  if (!result.error) {
                    setDeleteOpen(false);
                  }
                  return result;
                }, "Job deleted");
              }}
            >
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
