import { registerUser } from "@/features/auth/auth.service";
import { signUpSchema } from "@/features/auth/auth.schemas";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { handleRouteError, jsonSuccess } from "@/lib/http/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = signUpSchema.parse(await request.json());
    const user = await registerUser(payload);
    const token = await createSessionToken(user);

    await setSessionCookie(token);

    return jsonSuccess(
      {
        user,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
