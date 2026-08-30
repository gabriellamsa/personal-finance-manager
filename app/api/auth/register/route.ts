import {
  registerUser,
  toAuthenticatedUser,
} from "@/features/auth/auth.service";
import { signUpSchema } from "@/features/auth/auth.schemas";
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
  const payload = signUpSchema.parse(await request.json());
  const rateLimitKey = `${getClientIp(request)}:${payload.email}`;

  consumeAuthRateLimit("register", rateLimitKey);

  const user = await registerUser(payload);
  const token = await createSessionToken(user);
  const publicUser = toAuthenticatedUser(user);

  await setSessionCookie(token);
  resetAuthRateLimit("register", rateLimitKey);

  return jsonSuccess(
    {
      user: publicUser,
    },
    {
      status: 201,
    },
  );
}

export const POST = withRouteObservability("/api/auth/register", POSTHandler);
