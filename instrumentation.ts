import type { Instrumentation } from "next";

import { isExpectedClientDisconnect } from "@/lib/observability/error-classification";
import { logEvent } from "@/lib/observability/logger";
import {
  isValidRequestId,
  resolveRequestId,
} from "@/lib/observability/request-id";

function getHeaderValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPathname(path: string) {
  try {
    return new URL(path, "http://localhost").pathname;
  } catch {
    return "/unknown";
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (isExpectedClientDisconnect(error)) {
    return;
  }

  const incomingRequestId = getHeaderValue(
    request.headers["x-request-id"] ?? request.headers["X-Request-Id"],
  );
  const requestId = isValidRequestId(incomingRequestId)
    ? incomingRequestId
    : resolveRequestId(null);

  logEvent({
    error,
    event: "application.unhandled_error",
    level: "error",
    message: "Unhandled server error",
    method: request.method,
    path: getPathname(request.path),
    requestId,
    route: context.routePath,
  });
};
