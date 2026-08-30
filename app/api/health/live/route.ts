import { NextResponse } from "next/server";

import { createLivenessResponse } from "@/lib/health/health-service";
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

  const response = createLivenessResponse(requestId);

  logEvent({
    event: "health.check.completed",
    level: "info",
    message: "Liveness check completed",
    requestId,
    statusCode: 200,
    details: {
      check: "liveness",
      status: response.status,
    },
  });

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store",
    },
    status: 200,
  });
};

export const GET = withRouteObservability(
  "/api/health/live",
  GETHandler,
);
