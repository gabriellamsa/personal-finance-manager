import { createCategorySchema } from "@/features/categories/categories.schemas";
import { createCategory, listAvailableCategories } from "@/features/categories/categories.service";
import { requireApiUser } from "@/lib/auth/session";
import { jsonSuccess } from "@/lib/http/response";
import { withRouteObservability } from "@/lib/observability/route-observability";

export const runtime = "nodejs";

async function GETHandler() {
  const user = await requireApiUser();
  const categories = await listAvailableCategories(user.id);

  return jsonSuccess({
    categories,
  });
}

async function POSTHandler(request: Request) {
  const user = await requireApiUser();
  const payload = createCategorySchema.parse(await request.json());
  const category = await createCategory(user.id, payload);

  return jsonSuccess(
    {
      category,
    },
    { status: 201 },
  );
}

export const GET = withRouteObservability("/api/categories", GETHandler);
export const POST = withRouteObservability("/api/categories", POSTHandler);
