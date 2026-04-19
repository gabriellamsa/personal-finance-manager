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
import { handleRouteError, jsonSuccess } from "@/lib/http/response";
import {
  consumeAuthRateLimit,
  resetAuthRateLimit,
} from "@/lib/security/auth-rate-limit";
import { getClientIp } from "@/lib/security/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    return handleRouteError(error);
  }
}
