/**
 * Applications domain service — public apply, HR list/detail/status, analytics.
 * Implementation is split by concern; this barrel keeps import paths stable.
 */

export type {
  Application,
  HrApplicationDetail,
  HrApplicationEducation,
  HrApplicationFilterOptions,
  HrApplicationListItem,
  HrApplicationListResult,
  HrApplicationNote,
  HrApplicationsFilters,
  HrApplicationSkill,
  HrApplicationStatusEvent,
  HrApplicationTableRow,
} from "@/services/applications/types";

export { getApplicationById } from "@/services/applications/get-by-id";
export {
  countApplicationsGroupedByStatus,
  countApplicationsOverTime,
  getHrApplicationFilterOptions,
  listApplicationsForHr,
  listRecentApplicationsForHr,
  toHrApplicationTableRows,
} from "@/services/applications/list";
export {
  addApplicationNote,
  assignApplication,
  deleteApplication,
  getApplicationDetailForHr,
  getApplicationResumeDownloadUrl,
  setApplicationArchived,
  updateApplicationStatus,
} from "@/services/applications/detail";
export { submitApplication } from "@/services/applications/submit";
export {
  countApplicationsByJob,
  type ApplicationsByJobCount,
} from "@/services/applications/analytics";
