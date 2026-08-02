export const AUTH_MESSAGES = {
  invalidCredentials: "Invalid email or password",
  inactive:
    "This account is inactive. Contact an administrator.",
  forbidden: "You do not have permission to access the HR portal.",
  noHrAccess: "This account does not have HR access.",
} as const;

export function mapLoginQueryError(error?: string): string | null {
  switch (error) {
    case "forbidden":
      return AUTH_MESSAGES.forbidden;
    case "inactive":
      return AUTH_MESSAGES.inactive;
    default:
      return null;
  }
}
