"use client";

import { useEffect } from "react";

import { AuthCentered } from "@/components/layouts/auth-centered";
import { BrandMark } from "@/components/layouts/brand-mark";
import { SurfaceCard } from "@/components/layouts/surface-card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

type LoginErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LoginError({ error, reset }: LoginErrorProps) {
  useEffect(() => {
    console.error("Login route error:", error);
  }, [error]);

  return (
    <AuthCentered>
      <div className="flex justify-center">
        <BrandMark href={ROUTES.home} />
      </div>
      <SurfaceCard
        title="Something went wrong"
        description="We couldn’t load the sign-in page. Please try again."
      >
        <Button type="button" className="w-full" onClick={reset}>
          Try again
        </Button>
      </SurfaceCard>
    </AuthCentered>
  );
}
