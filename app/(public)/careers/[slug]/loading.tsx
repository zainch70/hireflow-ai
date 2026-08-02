import { Container } from "@/components/layouts/container";
import { PublicSiteShell } from "@/features/careers/components/public-site-shell";

export default function JobDetailLoading() {
  return (
    <PublicSiteShell active="careers">
      <main>
        <Container className="py-10 sm:py-14">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-3/4 max-w-md animate-pulse rounded-md bg-muted" />
              <div className="flex gap-2">
                <div className="h-7 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-7 w-20 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
            <div className="h-40 animate-pulse rounded-xl bg-muted/60" />
            <div className="h-40 animate-pulse rounded-xl bg-muted/60" />
            <span className="sr-only">Loading job details</span>
          </div>
        </Container>
      </main>
    </PublicSiteShell>
  );
}
