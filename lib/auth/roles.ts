import { HR_ROLES, ROLES, type Role } from "@/constants/roles";

export function isRole(value: unknown): value is Role {
  return (
    typeof value === "string" &&
    Object.values(ROLES).includes(value as Role)
  );
}

export function isHrRole(role: Role | null | undefined): boolean {
  if (!role) {
    return false;
  }

  return HR_ROLES.includes(role);
}

export function parseRole(
  value: unknown,
  fallback: Role = ROLES.CANDIDATE,
): Role {
  return isRole(value) ? value : fallback;
}
