import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";

/** Shared Next.js Data Cache tags for HR + careers reads. */
export const CACHE_TAGS = {
  jobs: "jobs",
  applications: "applications",
  ai: "ai-analyses",
  dashboard: "hr-dashboard",
  careers: "careers",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export function revalidateCacheTags(...tags: CacheTag[]) {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

/** After job mutations — lists, overview, careers. */
export function revalidateAfterJobChange(jobId?: string) {
  revalidateCacheTags(
    CACHE_TAGS.jobs,
    CACHE_TAGS.dashboard,
    CACHE_TAGS.careers,
  );
  revalidatePath(ROUTES.dashboard.jobs);
  revalidatePath(ROUTES.dashboard.root);
  revalidatePath(ROUTES.dashboard.statistics);
  revalidatePath(ROUTES.careers);
  if (jobId) {
    revalidatePath(`${ROUTES.dashboard.jobs}/${jobId}/edit`);
  }
}

/** After application / status / note changes. */
export function revalidateAfterApplicationChange(applicationId?: string) {
  revalidateCacheTags(
    CACHE_TAGS.applications,
    CACHE_TAGS.dashboard,
    CACHE_TAGS.careers,
  );
  revalidatePath(ROUTES.dashboard.applications);
  revalidatePath(ROUTES.dashboard.root);
  revalidatePath(ROUTES.dashboard.statistics);
  if (applicationId) {
    revalidatePath(`${ROUTES.dashboard.applications}/${applicationId}`);
  }
}

/** After AI shortlist run. */
export function revalidateAfterAiShortlist(applicationId: string) {
  revalidateCacheTags(
    CACHE_TAGS.ai,
    CACHE_TAGS.applications,
    CACHE_TAGS.dashboard,
  );
  revalidatePath(`${ROUTES.dashboard.applications}/${applicationId}`);
  revalidatePath(ROUTES.dashboard.applications);
  revalidatePath(ROUTES.dashboard.root);
  revalidatePath(ROUTES.dashboard.statistics);
}
