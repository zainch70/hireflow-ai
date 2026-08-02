import { ButtonLink } from "@/components/layouts/button-link";
import { Container } from "@/components/layouts/container";
import { ROUTES } from "@/constants/routes";

/** Team domains — company focus areas, not hiring-process hints. */
const DOMAINS = [
  {
    title: "Engineering",
    body: "Product platforms, APIs, and reliable systems that teams depend on every day.",
  },
  {
    title: "Product & Design",
    body: "Clear interfaces and workflows — built with the people who use them.",
  },
  {
    title: "Operations",
    body: "Delivery, support, and the processes that keep projects moving.",
  },
  {
    title: "Partnerships",
    body: "Working with customers and partners where technology meets real operations.",
  },
] as const;

const APPLY_STEPS = [
  {
    title: "Browse open roles",
    body: "See what’s published — filter by team, location, and employment type.",
  },
  {
    title: "Submit your application",
    body: "Share your background and upload a PDF résumé. No account required.",
  },
  {
    title: "We’ll follow up",
    body: "Our team reviews applications and contacts you by email with next steps.",
  },
] as const;

/**
 * Candidate landing — static Server Component.
 * Theme via CSS tokens / `.dark` only (no client JS for appearance).
 */
export function HomeLanding({ displayClassName }: { displayClassName: string }) {
  return (
    <main>
      <section
        aria-labelledby="home-brand"
        className="home-hero relative isolate min-h-[min(100svh,48rem)] overflow-hidden border-b border-border"
      >
        <div className="home-hero-atmosphere pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="home-hero-grain pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30 dark:from-black/50 dark:via-transparent dark:to-black/20"
          aria-hidden="true"
        />

        <Container className="relative flex min-h-[min(100svh,48rem)] flex-col justify-end pb-16 pt-24 sm:justify-center sm:pb-24 sm:pt-28">
          <div className="home-hero-copy max-w-3xl space-y-6 text-foreground dark:text-white">
            <p className="home-hero-eyebrow text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase dark:text-white/55">
              Careers
            </p>
            <p
              id="home-brand"
              className={`${displayClassName} home-hero-brand text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.95] tracking-tight`}
            >
              HireFlow AI
            </p>
            <h1 className="home-hero-headline max-w-[22ch] text-2xl font-medium leading-snug tracking-tight text-foreground/90 sm:text-3xl sm:leading-snug dark:text-white/90">
              Technology careers for people who ship real work
            </h1>
            <p className="home-hero-support max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg dark:text-white/65">
              We build software for modern teams across engineering, product, and
              operations. Explore open roles and apply when a position fits.
            </p>
            <div className="home-hero-cta flex flex-wrap items-center gap-3 pt-2">
              <ButtonLink href={ROUTES.careers} size="lg">
                View open roles
              </ButtonLink>
              <ButtonLink href="#domains" size="lg" variant="outline">
                Explore what we do
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="domains"
        aria-labelledby="domains-heading"
        className="border-b border-border bg-muted/40 dark:bg-[oklch(0.14_0.02_250)] dark:text-white"
      >
        <Container className="space-y-12 py-16 sm:py-20">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase dark:text-teal-400/90">
              What we work on
            </p>
            <h2
              id="domains-heading"
              className={`${displayClassName} text-3xl tracking-tight text-foreground sm:text-4xl dark:text-white`}
            >
              Built around real teams and real delivery
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground dark:text-white/60">
              Not every project needs more tools. It needs the right people —
              focused on outcomes that hold up in production.
            </p>
          </div>

          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {DOMAINS.map((domain, index) => (
              <li
                key={domain.title}
                className="space-y-3 border-t border-border pt-5 dark:border-white/15"
              >
                <p className="font-mono text-xs font-medium tracking-[0.14em] text-primary uppercase dark:text-teal-400/90">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-lg font-semibold tracking-tight text-foreground dark:text-white">
                  {domain.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground dark:text-white/55">
                  {domain.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section
        aria-labelledby="apply-heading"
        className="border-b border-border bg-background"
      >
        <Container className="space-y-10 py-16 sm:py-20">
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
              Applications
            </p>
            <h2
              id="apply-heading"
              className={`${displayClassName} text-3xl tracking-tight text-foreground sm:text-4xl`}
            >
              How to apply
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              A short path from listing to submission — then we take it from there.
            </p>
          </div>

          <ol className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {APPLY_STEPS.map((step, index) => (
              <li key={step.title} className="space-y-3">
                <p className="font-mono text-xs font-medium tracking-[0.14em] text-primary uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="next-heading" className="bg-card/50">
        <Container className="flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-end sm:py-20">
          <div className="max-w-lg space-y-3">
            <h2
              id="next-heading"
              className={`${displayClassName} text-3xl tracking-tight text-foreground sm:text-4xl`}
            >
              See what’s open
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Browse current openings and start an application when a role is the
              right fit.
            </p>
          </div>
          <ButtonLink href={ROUTES.careers} size="lg">
            View open roles
          </ButtonLink>
        </Container>
      </section>
    </main>
  );
}
