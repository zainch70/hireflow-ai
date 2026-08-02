"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getApplicationResumeUrlAction } from "@/features/applications/actions/resume.actions";

type ResumeDownloadButtonProps = {
  applicationId: string;
  fileName?: string | null;
  className?: string;
};

export function ResumeDownloadButton({
  applicationId,
  fileName,
  className,
}: ResumeDownloadButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await getApplicationResumeUrlAction(applicationId);

          if (result.error || !result.url) {
            toast.error(result.error ?? "Could not open resume");
            return;
          }

          window.open(result.url, "_blank", "noopener,noreferrer");
          toast.success("Opening resume", {
            description: fileName ?? result.fileName ?? "PDF",
          });
        });
      }}
    >
      <FileText className="size-4" aria-hidden="true" />
      {isPending ? "Opening…" : "View PDF"}
    </Button>
  );
}
