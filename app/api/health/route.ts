import { jsonSuccess } from "@/lib/http/response";
import { withRouteObservability } from "@/lib/observability/route-observability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function GETHandler() {
  return jsonSuccess({
    status: "ok",
    timestamp: new Date().toISOString(),
  }, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export const GET = withRouteObservability("/api/health", GETHandler);
