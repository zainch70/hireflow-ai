"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getApplicationStatusActionLabel,
  getApplicationStatusLabel,
  type ApplicationStatus,
} from "@/constants/application-status";
import { updateApplicationStatusAction } from "@/features/applications/actions/management.actions";
import {
  ApplicationStatusBadge,
  getApplicationStatusActionStyle,
  getApplicationStatusStyle,
} from "@/features/applications/components/application-status-badge";
import { cn } from "@/lib/utils";

type ApplicationStatusActionsProps = {
  applicationId: string;
  currentStatus: ApplicationStatus;
  allowedTransitions: ApplicationStatus[];
};

export function ApplicationStatusActions({
  applicationId,
  currentStatus,
  allowedTransitions,
}: ApplicationStatusActionsProps) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function handleTransition(toStatus: ApplicationStatus) {
    startTransition(async () => {
      const result = await updateApplicationStatusAction({
        applicationId,
        status: toStatus,
        note: note.trim() || undefined,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.fieldErrors) {
        const first = Object.values(result.fieldErrors).flat().find(Boolean);
        toast.error(first ?? "Invalid status update");
        return;
      }

      toast.success(
        `Status updated to ${getApplicationStatusLabel(toStatus)}`,
      );
      setNote("");
    });
  }

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "rounded-xl border px-3.5 py-3",
          getApplicationStatusStyle(currentStatus),
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">
          Current status
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <ApplicationStatusBadge
            status={currentStatus}
            className="border-transparent bg-white/70 dark:bg-black/25"
          />
        </div>
      </div>

      {allowedTransitions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No further status changes are available for this application.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="status-note">Note (optional)</Label>
            <Textarea
              id="status-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add context for this status change…"
              rows={3}
              disabled={pending}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Move to
            </p>
            <div className="flex flex-wrap gap-2">
              {allowedTransitions.map((status) => (
                <Button
                  key={status}
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => handleTransition(status)}
                  className={cn(
                    "border font-medium",
                    getApplicationStatusActionStyle(status),
                  )}
                >
                  {getApplicationStatusActionLabel(status)}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
