import { Container } from "@/components/layouts/container";
import { PublicSiteShell } from "@/features/careers/components/public-site-shell";

export default function ApplyLoading() {
  return (
    <PublicSiteShell active="careers">
      <main>
        <Container className="py-10 sm:py-14">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-8 w-72 max-w-full animate-pulse rounded-md bg-muted" />
            <div className="h-[28rem] animate-pulse rounded-xl border border-border bg-card" />
            <span className="sr-only">Loading application form</span>
          </div>
        </Container>
      </main>
    </PublicSiteShell>
  );
}
