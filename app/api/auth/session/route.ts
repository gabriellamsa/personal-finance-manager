import { getCurrentSession } from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/http/response";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();

  return jsonSuccess({
    user: session?.user ?? null,
  });
}
