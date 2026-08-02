import { ButtonLink } from "@/components/layouts/button-link";
import { careersApplyPath } from "@/constants/routes";

type ApplyButtonProps = {
  jobSlug: string;
  className?: string;
};

/** Links to the public application form for a published role. */
export function ApplyButton({ jobSlug, className }: ApplyButtonProps) {
  return (
    <ButtonLink
      href={careersApplyPath(jobSlug)}
      size="lg"
      className={className}
    >
      Apply for this role
    </ButtonLink>
  );
}
