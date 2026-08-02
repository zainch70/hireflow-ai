import { ButtonLink } from "@/components/layouts/button-link";
import { RouteMessage } from "@/components/layouts/route-message";
import { ROUTES } from "@/constants/routes";

export default function JobNotFound() {
  return (
    <main>
      <RouteMessage
        eyebrow="404"
        title="Role not found"
        description="This opening may be unpublished, closed, or the link is incorrect."
        actions={
          <>
            <ButtonLink href={ROUTES.careers}>Browse open roles</ButtonLink>
            <ButtonLink href={ROUTES.home} variant="outline">
              Back home
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
