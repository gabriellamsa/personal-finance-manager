import { authenticateUser } from "@/features/auth/auth.service";
import { signInSchema } from "@/features/auth/auth.schemas";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { handleRouteError, jsonSuccess } from "@/lib/http/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = signInSchema.parse(await request.json());
    const user = await authenticateUser(payload);
    const token = await createSessionToken(user);

    await setSessionCookie(token);

    return jsonSuccess({
      user,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
