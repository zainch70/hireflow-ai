export const ROUTES = {
  home: "/",
  careers: "/careers",
  login: "/login",
  register: "/register",
  auth: {
    signOut: "/auth/signout",
  },
  dashboard: {
    root: "/hr",
    jobs: "/hr/jobs",
    applications: "/hr/applications",
    candidates: "/hr/candidates",
    settings: "/hr/settings",
  },
} as const;

export type AppRoute =
  | (typeof ROUTES)[Exclude<keyof typeof ROUTES, "dashboard" | "auth">]
  | (typeof ROUTES.dashboard)[keyof typeof ROUTES.dashboard]
  | (typeof ROUTES.auth)[keyof typeof ROUTES.auth];
