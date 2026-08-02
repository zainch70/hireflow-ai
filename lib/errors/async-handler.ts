import { toErrorMessage } from "./app-error";

export type AsyncResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Wraps an async function and returns a typed result instead of throwing.
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
): Promise<AsyncResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

/**
 * Higher-order wrapper for route handlers / server actions.
 */
export function asyncHandler<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  return async (...args: TArgs): Promise<AsyncResult<TResult>> => {
    return tryCatch(() => fn(...args));
  };
}
