import { Container } from "@/components/layouts/container";

/** Content-only skeleton — marketing layout keeps the header mounted. */
export default function CareersLoading() {
  return (
    <main>
      <Container className="space-y-8 py-10 sm:py-14">
        <div className="space-y-2">
          <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-40 animate-pulse rounded-xl border border-border bg-card" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
        <span className="sr-only">Loading careers</span>
      </Container>
    </main>
  );
}
