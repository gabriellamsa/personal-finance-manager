import {
  authenticateUser,
  toAuthenticatedUser,
} from "@/features/auth/auth.service";
import { signInSchema } from "@/features/auth/auth.schemas";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { handleRouteError, jsonSuccess } from "@/lib/http/response";
import {
  consumeAuthRateLimit,
  resetAuthRateLimit,
} from "@/lib/security/auth-rate-limit";
import { getClientIp } from "@/lib/security/request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    return handleRouteError(error);
  }
}
