import { ButtonLink } from "@/components/layouts/button-link";
import { Container } from "@/components/layouts/container";
import { PublicSiteShell } from "@/features/careers/components/public-site-shell";
import { ROUTES } from "@/constants/routes";

/**
 * Public landing — no HR portal entry points.
 * HR access is private at /login (provisioned accounts only).
 */
export default function HomePage() {
  return (
    <PublicSiteShell active="home">
      <main>
        <Container className="flex min-h-[calc(100vh-8.5rem)] flex-col justify-center py-16 sm:py-24">
          <div className="max-w-2xl space-y-6">
            <p className="text-sm font-medium text-primary">Careers</p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
              HireFlow AI
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Find open roles and apply with confidence. Browse published
              openings and learn what we’re building next.
            </p>
            <ButtonLink href={ROUTES.careers} size="lg">
              View open roles
            </ButtonLink>
          </div>
        </Container>
      </main>
    </PublicSiteShell>
  );
}
