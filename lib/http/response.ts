import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError } from "@/lib/http/errors";

export type ApiSuccess<T> = {
  data: T;
  success: true;
};

export type ApiFailure = {
  error: {
    code: string;
    fieldErrors?: Record<string, string[] | undefined>;
    message: string;
  };
  success: false;
};

export function jsonSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      data,
      success: true,
    },
    init,
  );
}

export function jsonError(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[] | undefined>,
) {
  return NextResponse.json<ApiFailure>(
    {
      error: {
        code,
        fieldErrors,
        message,
      },
      success: false,
    },
    {
      status,
    },
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(
      "VALIDATION_ERROR",
      "The submitted data is invalid.",
      400,
      error.flatten().fieldErrors,
    );
  }

  if (error instanceof AppError) {
    return jsonError(
      error.code,
      error.message,
      error.statusCode,
      error.fieldErrors,
    );
  }

  console.error("Unhandled route error.", error);

  return jsonError(
    "INTERNAL_SERVER_ERROR",
    "Something went wrong while processing the request.",
    500,
  );
}
