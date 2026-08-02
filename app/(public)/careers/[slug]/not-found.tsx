import Link from "next/link";

import { ButtonLink } from "@/components/layouts/button-link";
import { Container } from "@/components/layouts/container";
import { PublicSiteShell } from "@/features/careers/components/public-site-shell";
import { ROUTES } from "@/constants/routes";

export default function JobNotFound() {
  return (
    <PublicSiteShell active="careers">
      <main>
        <Container className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-primary">404</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Role not found
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            This opening may be unpublished, closed, or the link is incorrect.
          </p>
          <div className="mt-6">
            <ButtonLink href={ROUTES.careers}>Browse open roles</ButtonLink>
          </div>
          <Link
            href={ROUTES.home}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Back home
          </Link>
        </Container>
      </main>
    </PublicSiteShell>
  );
}
