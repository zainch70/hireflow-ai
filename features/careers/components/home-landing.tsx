import { ButtonLink } from "@/components/layouts/button-link";
import { Container } from "@/components/layouts/container";
import { ROUTES } from "@/constants/routes";

const STEPS = [
  {
    title: "Browse open roles",
    body: "Filter by team, location, and type. Only live openings show up.",
  },
  {
    title: "Apply with your résumé",
    body: "One form, one PDF. We extract the details our team needs to review you fairly.",
  },
  {
    title: "Get a clear outcome",
    body: "Recruiters move faster with structured screening — strong fits rise sooner.",
  },
] as const;

/**
 * Candidate landing — static Server Component (no client JS, no DB).
 * Brand-first hero; careers CTA only (HR stays private at /login).
 */
export function HomeLanding({ displayClassName }: { displayClassName: string }) {
  return (
    <main>
      <section
        aria-labelledby="home-brand"
        className="home-hero relative isolate min-h-[min(100svh,52rem)] overflow-hidden border-b border-border"
      >
        <div className="home-hero-atmosphere pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="home-hero-grain pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden="true" />

        <Container className="relative grid min-h-[min(100svh,52rem)] items-end gap-10 pb-14 pt-16 sm:pb-20 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-8">
          <div className="home-hero-copy max-w-xl space-y-6 lg:pb-6">
            <p
              id="home-brand"
              className={`${displayClassName} home-hero-brand text-[clamp(2.75rem,8vw,4.75rem)] leading-[0.95] tracking-tight text-foreground`}
            >
              HireFlow AI
            </p>
            <h1 className="home-hero-headline max-w-[18ch] text-xl font-medium leading-snug tracking-tight text-foreground/90 sm:text-2xl">
              Open roles. A straightforward apply. Real follow-through.
            </h1>
            <p className="home-hero-support max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Browse published openings and apply in minutes — built for
              candidates, not a maze of portals.
            </p>
            <div className="home-hero-cta flex flex-wrap items-center gap-3 pt-1">
              <ButtonLink href={ROUTES.careers} size="lg">
                View open roles
              </ButtonLink>
            </div>
          </div>

          <div
            className="home-hero-visual relative -mx-4 min-h-[16rem] sm:-mx-6 sm:min-h-[20rem] lg:mx-0 lg:min-h-[28rem] lg:justify-self-stretch"
            aria-hidden="true"
          >
            <CareersAtmosphereVisual />
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="how-heading"
        className="border-b border-border bg-card/40"
      >
        <Container className="space-y-10 py-16 sm:py-20">
          <div className="max-w-xl space-y-3">
            <h2
              id="how-heading"
              className={`${displayClassName} text-3xl tracking-tight text-foreground sm:text-4xl`}
            >
              How applying works
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Three steps from listing to submission — no account required.
            </p>
          </div>

          <ol className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step, index) => (
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

      <section aria-labelledby="next-heading" className="bg-background">
        <Container className="flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-end sm:py-20">
          <div className="max-w-lg space-y-3">
            <h2
              id="next-heading"
              className={`${displayClassName} text-3xl tracking-tight text-foreground sm:text-4xl`}
            >
              Ready when you are
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              See what’s hiring now and start an application when a role fits.
            </p>
          </div>
          <ButtonLink href={ROUTES.careers} size="lg" variant="outline">
            Explore careers
          </ButtonLink>
        </Container>
      </section>
    </main>
  );
}

/** Static decorative plane — evokes a roles board / hiring flow without stock photos. */
function CareersAtmosphereVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden lg:rounded-none">
      <div className="home-visual-panel absolute inset-y-0 right-0 w-full bg-gradient-to-br from-[oklch(0.32_0.06_255)] via-[oklch(0.28_0.05_240)] to-[oklch(0.22_0.03_250)] lg:left-8 lg:w-auto lg:rounded-tl-[2rem]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,oklch(0.55_0.12_220_/_0.35),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(oklch(1_0_0_/_0.5)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.5)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 sm:p-8 lg:p-10">
          <RoleRow title="Product Engineer" meta="Remote · Full-time" delay="0ms" />
          <RoleRow title="People Operations" meta="Karachi · Hybrid" delay="120ms" />
          <RoleRow title="Design Systems" meta="Remote · Contract" delay="240ms" />
        </div>
      </div>
    </div>
  );
}

function RoleRow({
  title,
  meta,
  delay,
}: {
  title: string;
  meta: string;
  delay: string;
}) {
  return (
    <div
      className="home-role-row flex items-baseline justify-between gap-4 border-t border-white/15 pt-3 text-white"
      style={{ animationDelay: delay }}
    >
      <span className="text-sm font-medium tracking-tight sm:text-base">
        {title}
      </span>
      <span className="shrink-0 text-xs text-white/55 sm:text-sm">{meta}</span>
    </div>
  );
}
