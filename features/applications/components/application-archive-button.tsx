"use client";

import { useTransition } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setApplicationArchivedAction } from "@/features/applications/actions/management.actions";

type ApplicationArchiveButtonProps = {
  applicationId: string;
  archivedAt: string | Date | null;
};

export function ApplicationArchiveButton({
  applicationId,
  archivedAt,
}: ApplicationArchiveButtonProps) {
  const [pending, startTransition] = useTransition();
  const isArchived = Boolean(archivedAt);

  function handleToggle() {
    startTransition(async () => {
      const result = await setApplicationArchivedAction({
        applicationId,
        archived: !isArchived,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isArchived ? "Application restored" : "Application archived");
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={handleToggle}
    >
      {isArchived ? (
        <ArchiveRestore className="size-4" aria-hidden="true" />
      ) : (
        <Archive className="size-4" aria-hidden="true" />
      )}
      {pending
        ? "Saving…"
        : isArchived
          ? "Restore"
          : "Archive"}
    </Button>
  );
}
