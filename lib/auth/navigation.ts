import { AUTH_ROUTES } from "@/lib/constants/auth";

const protectedRoutePrefixes = [
  AUTH_ROUTES.dashboard,
  AUTH_ROUTES.settings,
  "/transactions",
  "/categories",
] as const;

const publicRoutePrefixes = [
  "/",
  AUTH_ROUTES.signIn,
  AUTH_ROUTES.signUp,
] as const;

type AuthFeedbackTone = "info" | "success";

export type AuthFeedback = {
  description: string;
  title: string;
  tone: AuthFeedbackTone;
};

function matchesRoutePrefix(pathname: string, routePrefix: string) {
  if (routePrefix === "/") {
    return pathname === "/";
  }

  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

function getRouteLabel(pathname: string) {
  if (matchesRoutePrefix(pathname, "/transactions")) {
    return "your transactions";
  }

  if (matchesRoutePrefix(pathname, "/categories")) {
    return "your categories";
  }

  if (matchesRoutePrefix(pathname, AUTH_ROUTES.dashboard)) {
    return "your dashboard";
  }

  if (matchesRoutePrefix(pathname, AUTH_ROUTES.settings)) {
    return "your settings";
  }

  return "the requested page";
}

export function isProtectedAppPath(pathname: string) {
  return protectedRoutePrefixes.some((routePrefix) =>
    matchesRoutePrefix(pathname, routePrefix),
  );
}

export function isPublicAuthPath(pathname: string) {
  return publicRoutePrefixes.some((routePrefix) =>
    matchesRoutePrefix(pathname, routePrefix),
  );
}

export function isSafeRedirectPath(
  value: string | null | undefined,
): value is string {
  if (!value) {
    return false;
  }

  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/api") &&
    !value.startsWith("/_next")
  );
}

export function resolveAuthRedirectPath(value: string | null | undefined) {
  if (!isSafeRedirectPath(value)) {
    return AUTH_ROUTES.dashboard;
  }

  const pathname = value.split("?")[0];

  if (isPublicAuthPath(pathname)) {
    return AUTH_ROUTES.dashboard;
  }

  return value;
}

export function buildAuthRouteHref(
  pathname: string,
  redirectTo?: string | null,
) {
  if (!isSafeRedirectPath(redirectTo)) {
    return pathname;
  }

  const searchParams = new URLSearchParams({
    redirectTo,
  });

  return `${pathname}?${searchParams.toString()}`;
}

export function getAuthFeedback(options: {
  message?: string | null;
  reason?: string | null;
  redirectTo?: string | null;
}) {
  if (options.message === "signed-out") {
    return {
      description: "Your session has been closed successfully on this device.",
      title: "Signed out successfully",
      tone: "success",
    } satisfies AuthFeedback;
  }

  if (options.reason === "session-required") {
    return {
      description: options.redirectTo
        ? `Sign in to continue to ${getRouteLabel(
            resolveAuthRedirectPath(options.redirectTo),
          )}.`
        : "Sign in to access the protected area of the application.",
      title: "Sign in required",
      tone: "info",
    } satisfies AuthFeedback;
  }

  return null;
}
