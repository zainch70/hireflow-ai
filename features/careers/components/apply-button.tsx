"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type ApplyButtonProps = {
  jobTitle: string;
  className?: string;
};

/** Apply CTA — application form ships in a later phase. */
export function ApplyButton({ jobTitle, className }: ApplyButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      className={className}
      onClick={() =>
        toast.message("Applications coming soon", {
          description: `The form for ${jobTitle} isn’t open yet. Check back shortly.`,
        })
      }
    >
      Apply for this role
    </Button>
  );
}
