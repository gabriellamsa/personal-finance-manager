import {
  changePassword,
  toAuthenticatedUser,
} from "@/features/auth/auth.service";
import { changePasswordSchema } from "@/features/auth/auth.schemas";
import {
  createSessionToken,
  requireApiUser,
  setSessionCookie,
} from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/http/response";
import { withRouteObservability } from "@/lib/observability/route-observability";
import {
  consumeAuthRateLimit,
  resetAuthRateLimit,
} from "@/lib/security/auth-rate-limit";
import { getClientIp } from "@/lib/security/request";

export const runtime = "nodejs";

async function POSTHandler(request: Request) {
  const user = await requireApiUser();
  const payload = changePasswordSchema.parse(await request.json());
  const rateLimitKey = `${getClientIp(request)}:${user.id}`;

  consumeAuthRateLimit("change-password", rateLimitKey);

  const updatedUser = await changePassword(user.id, payload);
  const token = await createSessionToken(updatedUser);

  await setSessionCookie(token);
  resetAuthRateLimit("change-password", rateLimitKey);

  return jsonSuccess({
    user: toAuthenticatedUser(updatedUser),
  });
}

export const POST = withRouteObservability(
  "/api/auth/change-password",
  POSTHandler,
);
