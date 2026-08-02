import { ButtonLink } from "@/components/layouts/button-link";
import { RouteMessage } from "@/components/layouts/route-message";
import { ROUTES } from "@/constants/routes";

export default function ApplicationNotFound() {
  return (
    <RouteMessage
      eyebrow="404"
      title="Application not found"
      description="This candidate application may have been removed, or the link is incorrect."
      actions={
        <>
          <ButtonLink href={ROUTES.dashboard.applications}>
            All applications
          </ButtonLink>
          <ButtonLink href={ROUTES.dashboard.root} variant="outline">
            Overview
          </ButtonLink>
        </>
      }
    />
  );
}
