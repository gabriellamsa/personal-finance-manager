import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const targets = Array.isArray(error.meta?.target)
        ? error.meta.target
        : typeof error.meta?.target === "string"
          ? [error.meta.target]
          : [];

      if (targets.includes("email")) {
        return jsonError(
          "RESOURCE_CONFLICT",
          "An account with this email already exists.",
          409,
          {
            email: ["An account with this email already exists."],
          },
        );
      }

      return jsonError("RESOURCE_CONFLICT", "The resource already exists.", 409);
    }

    if (error.code === "P2021" || error.code === "P2022") {
      return jsonError(
        "DATABASE_SCHEMA_NOT_READY",
        process.env.NODE_ENV === "development"
          ? "Database schema is not ready. Start PostgreSQL and run npm run db:migrate."
          : "Service is temporarily unavailable.",
        503,
      );
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return jsonError(
      "DATABASE_UNAVAILABLE",
      process.env.NODE_ENV === "development"
        ? "Database connection is unavailable. Start PostgreSQL on localhost:5432 and run npm run db:migrate."
        : "Service is temporarily unavailable.",
      503,
    );
  }

  console.error("Unhandled route error.", error);

  return jsonError(
    "INTERNAL_SERVER_ERROR",
    "Something went wrong while processing the request.",
    500,
  );
}
