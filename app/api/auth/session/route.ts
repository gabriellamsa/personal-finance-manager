import { getCurrentSession } from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/http/response";
import { withRouteObservability } from "@/lib/observability/route-observability";

export const runtime = "nodejs";

async function GETHandler() {
  const session = await getCurrentSession();

  return jsonSuccess({
    user: session?.user ?? null,
  });
}

export const GET = withRouteObservability("/api/auth/session", GETHandler);
