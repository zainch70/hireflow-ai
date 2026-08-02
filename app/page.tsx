import { BrandMark } from "@/components/layouts/brand-mark";
import { Container } from "@/components/layouts/container";

/**
 * Public landing — no HR portal entry points.
 * HR access is private at /login (provisioned accounts only).
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80">
        <Container className="flex h-14 items-center">
          <BrandMark />
        </Container>
      </header>

      <main>
        <Container className="flex min-h-[calc(100vh-3.5rem)] flex-col justify-center py-16 sm:py-24">
          <div className="max-w-2xl space-y-6">
            <p className="text-sm font-medium text-primary">Careers</p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
              HireFlow AI
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Find open roles and apply with confidence. The public careers
              experience will live here next.
            </p>
          </div>
        </Container>
      </main>
    </div>
  );
}
