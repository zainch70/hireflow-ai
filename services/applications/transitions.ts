import {
  APPLICATION_STATUS,
  type ApplicationStatus,
} from "@/constants/application-status";

/**
 * Allowed HR status transitions for the hiring pipeline.
 * `withdrawn` is candidate-driven and not set via HR actions here.
 */
const TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  [APPLICATION_STATUS.SUBMITTED]: [
    APPLICATION_STATUS.UNDER_REVIEW,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.ON_HOLD,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.UNDER_REVIEW]: [
    APPLICATION_STATUS.ON_HOLD,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.ON_HOLD]: [
    APPLICATION_STATUS.UNDER_REVIEW,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.SHORTLISTED]: [
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.OFFERED,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.INTERVIEW]: [
    APPLICATION_STATUS.OFFERED,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.OFFERED]: [
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.HIRED]: [],
  [APPLICATION_STATUS.REJECTED]: [APPLICATION_STATUS.UNDER_REVIEW],
  [APPLICATION_STATUS.WITHDRAWN]: [],
};

export function getAllowedStatusTransitions(
  from: ApplicationStatus,
): ApplicationStatus[] {
  return [...(TRANSITIONS[from] ?? [])];
}

export function canTransitionApplicationStatus(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  if (from === to) {
    return false;
  }
  return getAllowedStatusTransitions(from).includes(to);
}
