import { NextResponse, type NextRequest } from "next/server";

import {
  isProtectedAppPath,
} from "@/lib/auth/navigation";
import { AUTH_ROUTES, SESSION_COOKIE_NAME } from "@/lib/constants/auth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (isProtectedAppPath(pathname) && !hasSessionCookie) {
    const signInUrl = new URL(AUTH_ROUTES.signIn, request.url);
    const redirectTo = `${pathname}${request.nextUrl.search}`;

    signInUrl.searchParams.set("reason", "session-required");
    signInUrl.searchParams.set("redirectTo", redirectTo);

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
