import { AuthCentered } from "@/components/layouts/auth-centered";
import { BrandMark } from "@/components/layouts/brand-mark";
import { Container } from "@/components/layouts/container";
import { SurfaceCard } from "@/components/layouts/surface-card";

export function LoginFormSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-muted" />
    </div>
  );
}

export function LoginPageSkeleton() {
  return (
    <AuthCentered>
      <div className="flex flex-col items-center gap-6">
        <BrandMark href={null} />
        <div className="space-y-2 text-center">
          <div className="mx-auto h-8 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mx-auto h-4 w-64 max-w-full animate-pulse rounded-md bg-muted" />
        </div>
      </div>
      <SurfaceCard>
        <LoginFormSkeleton />
      </SurfaceCard>
    </AuthCentered>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between">
        <div className="h-7 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-24 animate-pulse rounded-xl bg-muted" />
      </Container>
    </header>
  );
}

export function DashboardShellSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeaderSkeleton />
      <div className="py-8 sm:py-10">
        <Container className="space-y-8">
          <PageHeaderSkeleton />
          <div className="h-56 w-full animate-pulse rounded-xl border border-border bg-card" />
        </Container>
      </div>
    </div>
  );
}

export function HrHomeSkeleton() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <div className="h-56 w-full animate-pulse rounded-xl border border-dashed border-border bg-card" />
    </div>
  );
}
