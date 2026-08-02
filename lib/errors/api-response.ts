import { NextResponse } from "next/server";

import { AppError, isAppError, toErrorMessage } from "./app-error";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data } satisfies ApiSuccess<T>, {
    status,
  });
}

export function apiError(
  error: unknown,
  fallbackStatus = 500,
) {
  if (isAppError(error)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      } satisfies ApiFailure,
      { status: error.statusCode },
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        message: toErrorMessage(error),
        code: "INTERNAL_ERROR",
      },
    } satisfies ApiFailure,
    { status: fallbackStatus },
  );
}

export function fromAppError(
  message: string,
  statusCode = 400,
  code = "BAD_REQUEST",
  details?: unknown,
) {
  return new AppError(message, { statusCode, code, details });
}
