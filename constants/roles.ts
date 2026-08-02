export const ROLES = {
  CANDIDATE: "candidate",
  HR: "hr",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const HR_ROLES: Role[] = [ROLES.HR, ROLES.ADMIN];
