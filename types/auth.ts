import type { Role } from "@/constants/roles";

export type AuthUser = {
  id: string;
  email: string | null;
  role?: Role;
  fullName?: string;
};

export type SessionContext = {
  user: AuthUser | null;
  isAuthenticated: boolean;
};

export type AuthActionResult = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};
