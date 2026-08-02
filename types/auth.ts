import type { Role } from "@/constants/roles";

export type AuthUser = {
  id: string;
  email: string | null;
  role?: Role;
};

export type SessionContext = {
  user: AuthUser | null;
  isAuthenticated: boolean;
};
