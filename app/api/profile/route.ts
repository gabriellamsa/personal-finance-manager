import { updateProfileSchema } from "@/features/profile/profile.schemas";
import { updateProfile } from "@/features/profile/profile.service";
import { requireApiUser } from "@/lib/auth/session";
import { handleRouteError, jsonSuccess } from "@/lib/http/response";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const payload = updateProfileSchema.parse(await request.json());
    const updatedUser = await updateProfile(user.id, payload);

    return jsonSuccess({
      user: updatedUser,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
