import {
  authenticateUser,
  toAuthenticatedUser,
} from "@/features/auth/auth.service";
import { signInSchema } from "@/features/auth/auth.schemas";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/http/response";
import { withRouteObservability } from "@/lib/observability/route-observability";
import {
  consumeAuthRateLimit,
  resetAuthRateLimit,
} from "@/lib/security/auth-rate-limit";
import { getClientIp } from "@/lib/security/request";

export const runtime = "nodejs";

async function POSTHandler(request: Request) {
  const payload = signInSchema.parse(await request.json());
  const rateLimitKey = `${getClientIp(request)}:${payload.email}`;

  consumeAuthRateLimit("login", rateLimitKey);

  const user = await authenticateUser(payload);
  const token = await createSessionToken(user);
  const publicUser = toAuthenticatedUser(user);

  await setSessionCookie(token);
  resetAuthRateLimit("login", rateLimitKey);

  return jsonSuccess({
    user: publicUser,
  });
}

export const POST = withRouteObservability("/api/auth/login", POSTHandler);
