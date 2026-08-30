import { NextResponse } from "next/server";

import { runReadinessChecks } from "@/lib/health/health-service";
import { logEvent } from "@/lib/observability/logger";
import { getRequestContext } from "@/lib/observability/request-context";
import { withRouteObservability } from "@/lib/observability/route-observability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GETHandler = async () => {
  const requestId = getRequestContext()?.requestId;

  if (!requestId) {
    throw new Error("Request context is unavailable.");
  }

  const result = await runReadinessChecks(requestId);

  logEvent({
    event:
      result.statusCode === 200
        ? "health.check.completed"
        : "health.check.failed",
    level: result.statusCode === 200 ? "info" : "error",
    message:
      result.statusCode === 200
        ? "Readiness check completed"
        : "Readiness check failed",
    requestId,
    statusCode: result.statusCode,
    error: result.failure?.error,
    details: {
      check: "readiness",
      failedComponent: result.failure?.component,
      status: result.response.status,
    },
  });

  return NextResponse.json(result.response, {
    headers: {
      "Cache-Control": "no-store",
      ...(result.statusCode === 503 ? { "Retry-After": "5" } : {}),
    },
    status: result.statusCode,
  });
};

export const GET = withRouteObservability(
  "/api/health/ready",
  GETHandler,
);
