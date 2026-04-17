import { jsonSuccess } from "@/lib/http/response";

export async function GET() {
  return jsonSuccess({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
