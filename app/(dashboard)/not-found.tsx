import { ButtonLink } from "@/components/layouts/button-link";
import { RouteMessage } from "@/components/layouts/route-message";
import { ROUTES } from "@/constants/routes";

/**
 * Renders inside DashboardShell — no duplicate header.
 */
export default function DashboardNotFound() {
  return (
    <RouteMessage
      eyebrow="404"
      title="Page not found"
      description="This HR page doesn’t exist, or the link is outdated. Pick a section from the nav, or return to Overview."
      actions={
        <>
          <ButtonLink href={ROUTES.dashboard.root}>Back to Overview</ButtonLink>
          <ButtonLink href={ROUTES.dashboard.applications} variant="outline">
            Applications
          </ButtonLink>
        </>
      }
    />
  );
}
