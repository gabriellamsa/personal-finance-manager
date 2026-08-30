import { clearSessionCookie } from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/http/response";
import { withRouteObservability } from "@/lib/observability/route-observability";

export const runtime = "nodejs";

async function POSTHandler() {
  await clearSessionCookie();

  return jsonSuccess({
    loggedOut: true,
  });
}

export const POST = withRouteObservability("/api/auth/logout", POSTHandler);
