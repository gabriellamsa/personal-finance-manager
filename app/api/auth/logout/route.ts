import { clearSessionCookie } from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/http/response";

export const runtime = "nodejs";

export async function POST() {
  await clearSessionCookie();

  return jsonSuccess({
    loggedOut: true,
  });
}
