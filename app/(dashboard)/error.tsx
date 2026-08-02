"use client";

import { useEffect } from "react";

import { ButtonLink } from "@/components/layouts/button-link";
import { RouteMessage } from "@/components/layouts/route-message";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Renders inside DashboardShell — no second header / BrandMark.
 */
export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <RouteMessage
      tone="error"
      eyebrow="Error"
      title="Something went wrong"
      description="We couldn’t load this page. Try again, or go back to Overview. Your session is still active."
      actions={
        <>
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href={ROUTES.dashboard.root} variant="outline">
            Back to Overview
          </ButtonLink>
        </>
      }
    />
  );
}
