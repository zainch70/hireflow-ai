"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type LogoutSubmitProps = {
  className?: string;
  label: string;
};

export function LogoutSubmit({ className, label }: LogoutSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      className={className}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? "Signing out…" : label}
    </Button>
  );
}
