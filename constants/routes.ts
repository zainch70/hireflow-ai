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
    statistics: "/hr/statistics",
    candidates: "/hr/candidates",
    settings: "/hr/settings",
  },
} as const;

export function careersJobPath(slug: string) {
  return `${ROUTES.careers}/${slug}` as const;
}

export function careersApplyPath(slug: string) {
  return `${ROUTES.careers}/${slug}/apply` as const;
}

export function careersApplySuccessPath(slug: string) {
  return `${ROUTES.careers}/${slug}/apply/success` as const;
}

export function hrApplicationPath(applicationId: string) {
  return `${ROUTES.dashboard.applications}/${applicationId}` as const;
}

export type AppRoute =
  | (typeof ROUTES)[Exclude<keyof typeof ROUTES, "dashboard" | "auth">]
  | (typeof ROUTES.dashboard)[keyof typeof ROUTES.dashboard]
  | (typeof ROUTES.auth)[keyof typeof ROUTES.auth]
  | ReturnType<typeof careersJobPath>
  | ReturnType<typeof careersApplyPath>
  | ReturnType<typeof careersApplySuccessPath>
  | ReturnType<typeof hrApplicationPath>;
