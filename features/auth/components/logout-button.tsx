import { logoutAction } from "@/features/auth/actions/auth.actions";
import { LogoutSubmit } from "@/features/auth/components/logout-submit";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

/**
 * Server Component form + tiny client submit for pending state.
 */
export function LogoutButton({
  className,
  label = "Sign out",
}: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <LogoutSubmit className={className} label={label} />
    </form>
  );
}
