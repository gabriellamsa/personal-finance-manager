import { updateProfileSchema } from "@/features/profile/profile.schemas";
import { updateProfile } from "@/features/profile/profile.service";
import { requireApiUser } from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/http/response";
import { withRouteObservability } from "@/lib/observability/route-observability";

export const runtime = "nodejs";

async function PATCHHandler(request: Request) {
  const user = await requireApiUser();
  const payload = updateProfileSchema.parse(await request.json());
  const updatedUser = await updateProfile(user.id, payload);

  return jsonSuccess({
    user: updatedUser,
  });
}

export const PATCH = withRouteObservability("/api/profile", PATCHHandler);
