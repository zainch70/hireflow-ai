"use client";

import { useEffect } from "react";

import { BrandMark } from "@/components/layouts/brand-mark";
import { ButtonLink } from "@/components/layouts/button-link";
import { Container } from "@/components/layouts/container";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/90">
        <Container className="flex h-14 items-center">
          <BrandMark href={ROUTES.dashboard.root} />
        </Container>
      </header>
      <Container className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <SurfaceCard
            title="Dashboard unavailable"
            description="Something went wrong while loading the HR area."
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" className="flex-1" onClick={reset}>
                Try again
              </Button>
              <ButtonLink
                href={ROUTES.login}
                variant="outline"
                className="flex-1"
              >
                Back to sign in
              </ButtonLink>
            </div>
          </SurfaceCard>
        </div>
      </Container>
    </div>
  );
}
