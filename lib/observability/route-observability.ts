import "server-only";

import { handleRouteError } from "@/lib/http/response";
import { logEvent, type LogLevel } from "@/lib/observability/logger";
import {
  resolveRequestId,
  runWithRequestContext,
} from "@/lib/observability/request-context";

type StaticRouteHandler = (request: Request) => Promise<Response> | Response;
type DynamicRouteHandler<TContext> = (
  request: Request,
  context: TContext,
) => Promise<Response> | Response;

function getPathname(request: Request) {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "/api/unknown";
  }
}

function getCompletionLevel(statusCode: number): LogLevel {
  if (statusCode >= 500) {
    return "error";
  }

  if (statusCode >= 400) {
    return "warn";
  }

  return "info";
}

function roundDuration(value: number) {
  return Math.round(value * 100) / 100;
}

function appendOperationalHeaders(
  response: Response,
  requestId: string,
  durationMs: number,
) {
  response.headers.set("X-Request-Id", requestId);

  const timingValue = `app;dur=${durationMs.toFixed(2)}`;
  const existingTiming = response.headers.get("Server-Timing");

  response.headers.set(
    "Server-Timing",
    existingTiming ? `${existingTiming}, ${timingValue}` : timingValue,
  );
}

export function withRouteObservability(
  route: string,
  handler: StaticRouteHandler,
): StaticRouteHandler;
export function withRouteObservability<TContext>(
  route: string,
  handler: DynamicRouteHandler<TContext>,
): DynamicRouteHandler<TContext>;
export function withRouteObservability<TContext>(
  route: string,
  handler:
    | StaticRouteHandler
    | DynamicRouteHandler<TContext>,
) {
  return async (request: Request, context?: TContext) => {
    const requestId = resolveRequestId(request.headers.get("x-request-id"));
    const requestContext = {
      method: request.method,
      path: getPathname(request),
      requestId,
      route,
    };

    return runWithRequestContext(requestContext, async () => {
      const startedAt = performance.now();
      let response: Response;

      try {
        response = await (
          handler as DynamicRouteHandler<TContext | undefined>
        )(request, context);
      } catch (error) {
        response = handleRouteError(error);
      }

      const durationMs = roundDuration(performance.now() - startedAt);
      appendOperationalHeaders(response, requestId, durationMs);

      logEvent({
        durationMs,
        event: "http.request.completed",
        level: getCompletionLevel(response.status),
        message: "HTTP request completed",
        method: requestContext.method,
        path: requestContext.path,
        requestId: requestContext.requestId,
        route: requestContext.route,
        statusCode: response.status,
      });

      return response;
    });
  };
}
