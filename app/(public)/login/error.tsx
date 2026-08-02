"use client";

import { useEffect } from "react";

import { ButtonLink } from "@/components/layouts/button-link";
import { RouteMessage } from "@/components/layouts/route-message";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

type LoginErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Public login segment has no site chrome — keep a simple centered panel without a second brand strip.
 */
export default function LoginError({ error, reset }: LoginErrorProps) {
  useEffect(() => {
    console.error("Login route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <RouteMessage
        tone="error"
        eyebrow="Error"
        title="Sign-in unavailable"
        description="We couldn’t load the sign-in page. Try again, or return home."
        actions={
          <>
            <Button type="button" onClick={reset}>
              Try again
            </Button>
            <ButtonLink href={ROUTES.home} variant="outline">
              Back home
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
