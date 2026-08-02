export const ROUTES = {
  home: "/",
  careers: "/careers",
  login: "/login",
  register: "/register",
  dashboard: {
    root: "/hr",
    jobs: "/hr/jobs",
    applications: "/hr/applications",
    candidates: "/hr/candidates",
    settings: "/hr/settings",
  },
} as const;

export type AppRoute =
  | (typeof ROUTES)[Exclude<keyof typeof ROUTES, "dashboard">]
  | (typeof ROUTES.dashboard)[keyof typeof ROUTES.dashboard];
